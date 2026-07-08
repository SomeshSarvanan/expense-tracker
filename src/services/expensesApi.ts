import { API_ENDPOINTS } from '../constants/GeneralConstants'
import type { AppData } from '../pages/Expenses/Expenses.types'

export type LoadResult = AppData & {
  dataFileMissing: boolean
}

export async function loadData(): Promise<LoadResult> {
  let res: Response
  try {
    res = await fetch(API_ENDPOINTS.DATA, { cache: 'no-store' })
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Network request failed',
    )
  }
  if (!res.ok) {
    let message = `Failed to load data (${res.status})`
    try {
      const body = (await res.json()) as {
        error?: string
        dataFileCorrupt?: boolean
      }
      if (body?.error) message = body.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  const body = (await res.json()) as Partial<LoadResult>
  return {
    expenses: Array.isArray(body.expenses) ? body.expenses : [],
    currency: typeof body.currency === 'string' ? body.currency : '₹',
    dataFileMissing: Boolean(body.dataFileMissing),
  }
}

export async function saveData(data: AppData): Promise<void> {
  const res = await fetch(API_ENDPOINTS.DATA, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = `Failed to save data (${res.status})`
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
}
