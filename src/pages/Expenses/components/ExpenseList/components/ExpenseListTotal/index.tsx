import { formatCurrency } from '../../../../../../utils/format'
import { t } from '../../../../../../utils/i18n'

type Props = {
  scope: string
  count: number
  total: number
  currency: string
}

export function ExpenseListTotal({ scope, count, total, currency }: Props) {
  const entryLabel =
    count === 1 ? t('units.entrySingular') : t('units.entryPlural')

  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-slate-950/30 px-5 py-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {t('expenseList.totalLabel')}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {t('expenseList.totalSub', { scope, count, entryLabel })}
        </p>
      </div>
      <p className="text-2xl font-bold tabular-nums text-white">
        {formatCurrency(total, currency)}
      </p>
    </div>
  )
}
