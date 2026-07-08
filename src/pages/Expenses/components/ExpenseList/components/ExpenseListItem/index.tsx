import { DeleteIcon } from '../../../../../../common-components/icons/DeleteIcon'
import { EditIcon } from '../../../../../../common-components/icons/EditIcon'
import { IconButton } from '../../../../../../common-components/IconButton'
import { formatCurrency, formatDate } from '../../../../../../utils/format'
import {
  getMyShare,
  getSplitKind,
} from '../../../../../../utils/expenseHelpers'
import { t } from '../../../../../../utils/i18n'
import type { Expense } from '../../../../Expenses.types'

type Props = {
  expense: Expense
  currency: string
  isEditing: boolean
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseListItem({
  expense,
  currency,
  isEditing,
  onEdit,
  onDelete,
}: Props) {
  const share = getMyShare(expense)
  const kind = getSplitKind(expense)

  return (
    <li
      className={`group flex items-center justify-between gap-4 px-5 py-3 transition ${
        isEditing ? 'bg-indigo-500/10' : 'hover:bg-white/5'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-300">
            {expense.category}
          </span>
          <span className="truncate text-sm text-white">
            {expense.note || (
              <span className="text-slate-500">
                {t('expenseList.itemNoNote')}
              </span>
            )}
          </span>
          {kind === 'split' && expense.split && (
            <span className="inline-flex items-center rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
              {t('expenseList.itemSplitBadge', {
                name: expense.split.withPerson,
              })}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatDate(expense.date)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="whitespace-nowrap text-base font-semibold tabular-nums text-white">
            {formatCurrency(share, currency)}
          </span>
          {kind === 'split' && (
            <span className="text-[10px] tabular-nums text-slate-500">
              {t('reimbursements.originalAmount', {
                total: formatCurrency(expense.amount, currency),
              })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
          <IconButton
            title={t('expenseList.itemEditTitle')}
            onClick={() => onEdit(expense)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            title={t('expenseList.itemDeleteTitle')}
            onClick={() => onDelete(expense.id)}
            danger
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
    </li>
  )
}
