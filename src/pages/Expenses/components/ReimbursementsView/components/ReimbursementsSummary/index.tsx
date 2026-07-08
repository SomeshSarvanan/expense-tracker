import { StatCard } from '../../../../../../common-components/StatCard'
import { formatCurrency } from '../../../../../../utils/format'
import { t } from '../../../../../../utils/i18n'

type Props = {
  currency: string
  pendingTotal: number
  receivedThisMonthTotal: number
}

export function ReimbursementsSummary({
  currency,
  pendingTotal,
  receivedThisMonthTotal,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        label={t('reimbursements.summaryPending')}
        value={formatCurrency(pendingTotal, currency)}
        accent
      />
      <StatCard
        label={t('reimbursements.summaryReceived')}
        value={formatCurrency(receivedThisMonthTotal, currency)}
      />
    </div>
  )
}
