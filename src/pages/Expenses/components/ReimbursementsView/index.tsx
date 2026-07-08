import { useMemo } from 'react'
import { currentMonthKey, monthKey } from '../../../../utils/format'
import {
  getReimbursementRows,
  sumByStatus,
} from '../../../../utils/expenseHelpers'
import type { Expense } from '../../Expenses.types'
import { ReimbursementsList } from './components/ReimbursementsList'
import { ReimbursementsSummary } from './components/ReimbursementsSummary'

type Props = {
  expenses: Expense[]
  currency: string
  onToggleReimbursement: (expenseId: string) => void
}

export function ReimbursementsView({
  expenses,
  currency,
  onToggleReimbursement,
}: Props) {
  const rows = useMemo(() => getReimbursementRows(expenses), [expenses])

  const pendingTotal = useMemo(() => sumByStatus(rows, 'pending'), [rows])

  const receivedThisMonthTotal = useMemo(() => {
    const thisMonth = currentMonthKey()
    return rows
      .filter(
        (r) =>
          r.status === 'received' &&
          r.receivedAt &&
          monthKey(r.receivedAt.slice(0, 10)) === thisMonth,
      )
      .reduce((sum, r) => sum + r.amount, 0)
  }, [rows])

  const expensesById = useMemo(() => {
    const map = new Map<string, Expense>()
    for (const e of expenses) map.set(e.id, e)
    return map
  }, [expenses])

  return (
    <main className="space-y-4">
      <ReimbursementsSummary
        currency={currency}
        pendingTotal={pendingTotal}
        receivedThisMonthTotal={receivedThisMonthTotal}
      />
      <ReimbursementsList
        rows={rows}
        expensesById={expensesById}
        currency={currency}
        onToggleStatus={onToggleReimbursement}
      />
    </main>
  )
}
