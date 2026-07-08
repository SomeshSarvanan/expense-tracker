import type { Category } from '../../constants/GeneralConstants'

export type ReimbursementStatus = 'pending' | 'received'

export type ExpenseSplit = {
  withPerson: string
  theirShare: number
  status: ReimbursementStatus
  receivedAt?: string
}

export type Expense = {
  id: string
  amount: number
  category: Category | string
  note?: string
  date: string
  createdAt: string
  split?: ExpenseSplit
}

export type ExpenseFormPayload = Omit<Expense, 'id' | 'createdAt'> & {
  id?: string
}

export type AppData = {
  expenses: Expense[]
  currency: string
}

export type ReimbursementRow = {
  expenseId: string
  personName: string
  amount: number
  status: ReimbursementStatus
  receivedAt?: string
  date: string
  note?: string
  category: string
}
