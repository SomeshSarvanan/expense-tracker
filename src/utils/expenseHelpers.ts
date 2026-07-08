import type {
  Expense,
  ReimbursementRow,
  ReimbursementStatus,
} from '../pages/Expenses/Expenses.types'

export type SplitKind = 'none' | 'split' | 'paid-for'

export function getMyShare(expense: Expense): number {
  if (!expense.split) return expense.amount
  return Number((expense.amount - expense.split.theirShare).toFixed(2))
}

export function getSplitKind(expense: Expense): SplitKind {
  if (!expense.split) return 'none'
  if (expense.split.theirShare >= expense.amount) return 'paid-for'
  return 'split'
}

export function isSplit(expense: Expense): boolean {
  return expense.split !== undefined
}

export function computeTheirShare(totalAmount: number, kind: SplitKind): number {
  if (kind === 'paid-for') return Number(totalAmount.toFixed(2))
  if (kind === 'split') return Number((totalAmount / 2).toFixed(2))
  return 0
}

export function getReimbursementRows(
  expenses: Expense[],
): ReimbursementRow[] {
  return expenses
    .filter((e): e is Expense & { split: NonNullable<Expense['split']> } =>
      Boolean(e.split),
    )
    .map((e) => ({
      expenseId: e.id,
      personName: e.split.withPerson,
      amount: e.split.theirShare,
      status: e.split.status,
      receivedAt: e.split.receivedAt,
      date: e.date,
      note: e.note,
      category: e.category,
    }))
}

export function sumByStatus(
  rows: ReimbursementRow[],
  status: ReimbursementStatus,
): number {
  return rows
    .filter((r) => r.status === status)
    .reduce((sum, r) => sum + r.amount, 0)
}

export function countByStatus(
  rows: ReimbursementRow[],
  status: ReimbursementStatus,
): number {
  return rows.filter((r) => r.status === status).length
}
