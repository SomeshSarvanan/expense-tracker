import { useMemo, useState } from 'react'
import { ChevronIcon } from '../../../../../../common-components/icons/ChevronIcon'
import { PERSISTED_UI_KEYS } from '../../../../../../constants/GeneralConstants'
import { formatCurrency } from '../../../../../../utils/format'
import { t } from '../../../../../../utils/i18n'
import { usePersistedState } from '../../../../../../utils/usePersistedState'
import type {
  Expense,
  ReimbursementRow,
} from '../../../../Expenses.types'
import { ReimbursementItem } from './components/ReimbursementItem'
import {
  ReimbursementsFilters,
  type PendingKindFilter,
  type PendingPersonFilter,
} from './components/ReimbursementsFilters'

type Props = {
  rows: ReimbursementRow[]
  expensesById: Map<string, Expense>
  currency: string
  onToggleStatus: (expenseId: string) => void
}

export function ReimbursementsList({
  rows,
  expensesById,
  currency,
  onToggleStatus,
}: Props) {
  const [kindFilter, setKindFilter] = useState<PendingKindFilter>('all')
  const [personFilter, setPersonFilter] = useState<PendingPersonFilter>('all')

  const { pending, received } = useMemo(() => {
    const p: ReimbursementRow[] = []
    const r: ReimbursementRow[] = []
    for (const row of rows) {
      if (row.status === 'pending') p.push(row)
      else r.push(row)
    }
    p.sort((a, b) => b.date.localeCompare(a.date))
    r.sort((a, b) => {
      const aTime = a.receivedAt ?? a.date
      const bTime = b.receivedAt ?? b.date
      return bTime.localeCompare(aTime)
    })
    return { pending: p, received: r }
  }, [rows])

  const pendingPeople = useMemo(() => {
    const byKey = new Map<string, string>()
    for (const row of pending) {
      const key = row.personName.toLowerCase()
      const existing = byKey.get(key)
      if (!existing) {
        byKey.set(key, row.personName)
        continue
      }
      const existingStartsUpper = existing[0] !== existing[0].toLowerCase()
      const candidateStartsUpper =
        row.personName[0] !== row.personName[0].toLowerCase()
      if (!existingStartsUpper && candidateStartsUpper) {
        byKey.set(key, row.personName)
      }
    }
    return Array.from(byKey.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    )
  }, [pending])

  const filteredPending = useMemo(() => {
    const personFilterLower =
      personFilter === 'all' ? null : personFilter.toLowerCase()
    return pending.filter((row) => {
      const total = expensesById.get(row.expenseId)?.amount ?? row.amount
      const isPaidFor = row.amount >= total
      if (kindFilter === 'split' && isPaidFor) return false
      if (kindFilter === 'paid-for' && !isPaidFor) return false
      if (
        personFilterLower !== null &&
        row.personName.toLowerCase() !== personFilterLower
      )
        return false
      return true
    })
  }, [pending, kindFilter, personFilter, expensesById])

  const filteredPendingTotal = useMemo(
    () => filteredPending.reduce((sum, r) => sum + r.amount, 0),
    [filteredPending],
  )

  const [showReceived, setShowReceived] = usePersistedState<boolean>(
    PERSISTED_UI_KEYS.RECEIVED_LIST_OPEN,
    false,
  )

  if (rows.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
        <p className="text-sm text-slate-400">
          {t('reimbursements.emptyTitle')}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {t('reimbursements.emptyHint')}
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="flex flex-col gap-3 border-b border-white/10 p-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                {t('reimbursements.sectionPending')}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {t('reimbursements.pendingSectionSummary', {
                  count: filteredPending.length,
                  total: formatCurrency(filteredPendingTotal, currency),
                })}
              </p>
            </div>

            <ReimbursementsFilters
              kind={kindFilter}
              onKindChange={setKindFilter}
              person={personFilter}
              onPersonChange={setPersonFilter}
              people={pendingPeople}
            />
          </div>

          {filteredPending.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-400">
                {t('reimbursements.pendingEmptyForFilter')}
              </p>
            </div>
          ) : (
            <ul className="max-h-[520px] divide-y divide-white/5 overflow-y-auto scheme-dark">
              {filteredPending.map((row) => (
                <ReimbursementItem
                  key={row.expenseId}
                  row={row}
                  currency={currency}
                  totalAmount={
                    expensesById.get(row.expenseId)?.amount ?? row.amount
                  }
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {received.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          <button
            type="button"
            onClick={() => setShowReceived((v) => !v)}
            aria-expanded={showReceived}
            className="flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left transition hover:bg-white/5"
          >
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                {t('reimbursements.sectionReceived')}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {t('reimbursements.sectionReceivedCount', {
                  count: received.length,
                })}
              </p>
            </div>
            <ChevronIcon
              className={
                'h-5 w-5 shrink-0 text-slate-400 transition-transform ' +
                (showReceived ? 'rotate-90' : '')
              }
            />
          </button>
          {showReceived && (
            <ul className="divide-y divide-white/5 border-t border-white/10">
              {received.map((row) => (
                <ReimbursementItem
                  key={row.expenseId}
                  row={row}
                  currency={currency}
                  totalAmount={
                    expensesById.get(row.expenseId)?.amount ?? row.amount
                  }
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
