import { formatCurrency, formatDate } from '../../../../../../../../utils/format'
import { t } from '../../../../../../../../utils/i18n'
import type { ReimbursementRow } from '../../../../../../Expenses.types'

type Props = {
  row: ReimbursementRow
  currency: string
  totalAmount: number
  onToggleStatus: (expenseId: string) => void
}

export function ReimbursementItem({
  row,
  currency,
  totalAmount,
  onToggleStatus,
}: Props) {
  const isReceived = row.status === 'received'
  const isPaidFor = row.amount >= totalAmount

  return (
    <li className="group flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-white/5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-200">
            {row.personName}
          </span>
          <span
            className={
              'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ' +
              (isPaidFor
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-amber-500/15 text-amber-300')
            }
          >
            {isPaidFor
              ? t('reimbursements.kindPaidFor')
              : t('reimbursements.kindSplit')}
          </span>
          <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-300">
            {row.category}
          </span>
          {row.note && (
            <span className="truncate text-sm text-white">{row.note}</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatDate(row.date)}
          {isReceived && row.receivedAt && (
            <>
              {' · '}
              <span className="text-emerald-300/80">
                {t('reimbursements.receivedOn', {
                  date: formatDate(row.receivedAt.slice(0, 10)),
                })}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span
            className={`whitespace-nowrap text-base font-semibold tabular-nums ${
              isReceived ? 'text-emerald-300' : 'text-white'
            }`}
          >
            {formatCurrency(row.amount, currency)}
          </span>
          {!isPaidFor && (
            <span className="text-[10px] tabular-nums text-slate-500">
              {t('reimbursements.originalAmount', {
                total: formatCurrency(totalAmount, currency),
              })}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggleStatus(row.expenseId)}
          className={
            'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ' +
            (isReceived
              ? 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-400')
          }
        >
          {isReceived
            ? t('reimbursements.markPending')
            : t('reimbursements.markReceived')}
        </button>
      </div>
    </li>
  )
}
