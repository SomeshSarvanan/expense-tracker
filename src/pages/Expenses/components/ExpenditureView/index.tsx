import type { Expense, ExpenseFormPayload } from '../../Expenses.types'
import { ExpenseForm } from '../ExpenseForm'
import { ExpenseList } from '../ExpenseList'
import { Summary } from '../Summary'

type Props = {
  expenses: Expense[]
  currency: string
  editing: Expense | null
  onSubmit: (payload: ExpenseFormPayload) => void
  onCancelEdit: () => void
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenditureView({
  expenses,
  currency,
  editing,
  onSubmit,
  onCancelEdit,
  onEdit,
  onDelete,
}: Props) {
  return (
    <main className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <aside className="space-y-4">
        <ExpenseForm
          editing={editing}
          currency={currency}
          onSubmit={onSubmit}
          onCancelEdit={onCancelEdit}
        />
        <Summary expenses={expenses} currency={currency} />
      </aside>

      <ExpenseList
        expenses={expenses}
        currency={currency}
        editingId={editing?.id ?? null}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </main>
  )
}
