import fs from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'

type ReimbursementStatus = 'pending' | 'received'

type ExpenseSplit = {
  withPerson: string
  theirShare: number
  status: ReimbursementStatus
  receivedAt?: string
}

type Expense = {
  id: string
  amount: number
  category: string
  note?: string
  date: string
  createdAt: string
  split?: ExpenseSplit
}

type AppData = {
  expenses: Expense[]
  currency: string
}

const DEFAULT_DATA: AppData = { expenses: [], currency: '₹' }

type ReadResult =
  | { kind: 'ok'; data: AppData }
  | { kind: 'missing' }
  | { kind: 'corrupt'; message: string }

async function ensureDir(file: string): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true })
}

async function readData(file: string): Promise<ReadResult> {
  let text: string
  try {
    text = await fs.readFile(file, 'utf8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { kind: 'missing' }
    }
    throw err
  }
  try {
    const parsed = JSON.parse(text) as Partial<AppData>
    return {
      kind: 'ok',
      data: {
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        currency: typeof parsed.currency === 'string' ? parsed.currency : '₹',
      },
    }
  } catch (err) {
    return {
      kind: 'corrupt',
      message: err instanceof Error ? err.message : 'Invalid JSON',
    }
  }
}

function createWriteQueue(file: string) {
  let chain: Promise<void> = Promise.resolve()
  return (data: AppData): Promise<void> => {
    const next = chain.then(async () => {
      const tmp = `${file}.tmp`
      await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
      await fs.rename(tmp, file)
    })
    chain = next.catch(() => {})
    return next
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk as Buffer))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(body === undefined ? '' : JSON.stringify(body))
}

function isValidSplit(x: unknown): x is ExpenseSplit {
  if (typeof x !== 'object' || x === null) return false
  const s = x as Record<string, unknown>
  if (typeof s.withPerson !== 'string' || s.withPerson.trim() === '') return false
  if (typeof s.theirShare !== 'number' || !Number.isFinite(s.theirShare)) return false
  if (s.status !== 'pending' && s.status !== 'received') return false
  if (s.receivedAt !== undefined && typeof s.receivedAt !== 'string') return false
  return true
}

function isValidExpense(x: unknown): x is Expense {
  if (typeof x !== 'object' || x === null) return false
  const e = x as Record<string, unknown>
  const baseValid =
    typeof e.id === 'string' &&
    typeof e.amount === 'number' &&
    Number.isFinite(e.amount) &&
    typeof e.category === 'string' &&
    typeof e.date === 'string' &&
    typeof e.createdAt === 'string'
  if (!baseValid) return false
  if (e.split !== undefined && !isValidSplit(e.split)) return false
  return true
}

function isValidPayload(x: unknown): x is AppData {
  if (typeof x !== 'object' || x === null) return false
  const d = x as Record<string, unknown>
  if (!Array.isArray(d.expenses)) return false
  if (typeof d.currency !== 'string') return false
  return d.expenses.every(isValidExpense)
}

function createHandler(dataFile: string): Connect.NextHandleFunction {
  const queueWrite = createWriteQueue(dataFile)

  return async (req, res, next) => {
    if (!req.url) return next()
    if (!req.url.startsWith('/api/data')) return next()

    try {
      if (req.method === 'GET') {
        const result = await readData(dataFile)
        if (result.kind === 'missing') {
          return sendJson(res, 200, {
            ...DEFAULT_DATA,
            dataFileMissing: true,
          })
        }
        if (result.kind === 'corrupt') {
          return sendJson(res, 500, {
            error: `Data file is corrupt: ${result.message}`,
            dataFileCorrupt: true,
          })
        }
        return sendJson(res, 200, { ...result.data, dataFileMissing: false })
      }

      if (req.method === 'PUT') {
        const body = await readBody(req)
        let parsed: unknown
        try {
          parsed = JSON.parse(body)
        } catch {
          return sendJson(res, 400, { error: 'Invalid JSON body' })
        }
        if (!isValidPayload(parsed)) {
          return sendJson(res, 400, { error: 'Invalid payload shape' })
        }
        await ensureDir(dataFile)
        await queueWrite(parsed)
        return sendJson(res, 200, { ok: true })
      }

      sendJson(res, 405, { error: 'Method not allowed' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Server error'
      console.error('[expenses-api]', err)
      sendJson(res, 500, { error: message })
    }
  }
}

export function expensesApi(options?: { dataFile?: string }): Plugin {
  const dataFile = path.resolve(
    options?.dataFile ?? path.join(process.cwd(), 'data', 'expenses.json'),
  )

  return {
    name: 'expenses-api',
    async configureServer(server) {
      await ensureDir(dataFile)
      server.config.logger.info(
        `\n  📁 expenses API → ${path.relative(process.cwd(), dataFile)}\n`,
      )
      server.middlewares.use(createHandler(dataFile))
    },
    async configurePreviewServer(server) {
      await ensureDir(dataFile)
      server.middlewares.use(createHandler(dataFile))
    },
  }
}
