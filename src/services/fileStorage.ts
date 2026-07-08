import { LEGACY_STORAGE_KEYS } from '../constants/GeneralConstants'
import type { Expense } from '../pages/Expenses/Expenses.types'

export function readLegacyLocalStorage(): {
  expenses: Expense[]
  currency: string | null
} {
  let expenses: Expense[] = []
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEYS.EXPENSES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        expenses = parsed.filter(isValidExpense)
      }
    }
  } catch {
    /* ignore */
  }
  const currency = localStorage.getItem(LEGACY_STORAGE_KEYS.CURRENCY)
  return { expenses, currency }
}

export function clearLegacyLocalStorage(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEYS.EXPENSES)
    localStorage.removeItem(LEGACY_STORAGE_KEYS.CURRENCY)
  } catch {
    /* ignore */
  }
}

function isValidExpense(x: unknown): x is Expense {
  if (typeof x !== 'object' || x === null) return false
  const e = x as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.amount === 'number' &&
    Number.isFinite(e.amount) &&
    typeof e.category === 'string' &&
    typeof e.date === 'string' &&
    typeof e.createdAt === 'string'
  )
}
