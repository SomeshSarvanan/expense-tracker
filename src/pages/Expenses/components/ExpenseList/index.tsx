import { useMemo, useState } from 'react'
import { ChevronIcon } from '../../../../common-components/icons/ChevronIcon'
import { PERSISTED_UI_KEYS } from '../../../../constants/GeneralConstants'
import {
  formatCurrency,
  formatDate,
  formatMonth,
  monthKey,
  todayISO,
} from '../../../../utils/format'
import { getMyShare } from '../../../../utils/expenseHelpers'
import { t } from '../../../../utils/i18n'
import { usePersistedState } from '../../../../utils/usePersistedState'
import type { Expense } from '../../Expenses.types'
import {
  ExpenseListFilters,
  type CategoryFilter,
  type FilterMode,
} from './components/ExpenseListFilters'
import { ExpenseListItem } from './components/ExpenseListItem'
import { ExpenseListTotal } from './components/ExpenseListTotal'

type Props = {
  expenses: Expense[]
  currency: string
  editingId: string | null
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseList({
  expenses,
  currency,
  editingId,
  onEdit,
  onDelete,
}: Props) {
  const [isOpen, setIsOpen] = usePersistedState<boolean>(
    PERSISTED_UI_KEYS.EXPENSE_LIST_OPEN,
    false,
  )
  const [mode, setMode] = useState<FilterMode>('month')
  const [customDate, setCustomDate] = useState(todayISO())
  const [customMonth, setCustomMonth] = useState(todayISO().slice(0, 7))
  const [category, setCategory] = useState<CategoryFilter>('all')

  const filtered = useMemo(() => {
    const visible = expenses.filter((e) => getMyShare(e) > 0)
    const byCategory =
      category === 'all'
        ? visible
        : visible.filter((e) => e.category === category)
    const list = byCategory.sort((a, b) => {
      if (a.date === b.date) return b.createdAt.localeCompare(a.createdAt)
      return b.date.localeCompare(a.date)
    })
    switch (mode) {
      case 'all':
        return list
      case 'today':
        return list.filter((e) => e.date === todayISO())
      case 'day':
        return list.filter((e) => e.date === customDate)
      case 'month':
        return list.filter((e) => monthKey(e.date) === customMonth)
    }
  }, [expenses, mode, customDate, customMonth, category])

  const filteredTotal = useMemo(
    () => filtered.reduce((sum, e) => sum + getMyShare(e), 0),
    [filtered],
  )

  const dateScope = (() => {
    switch (mode) {
      case 'today':
        return t('expenseList.totalScopeToday')
      case 'day':
        return formatDate(customDate)
      case 'month':
        return formatMonth(customMonth)
      case 'all':
        return t('expenseList.totalScopeAllTime')
    }
  })()

  const totalScope =
    category === 'all' ? dateScope : `${dateScope} · ${category}`

  const entryLabel =
    filtered.length === 1
      ? t('units.entrySingular')
      : t('units.entryPlural')

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-label={t('expenseList.toggleExpand')}
          className="flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left transition hover:bg-white/5"
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              {t('expenseList.title')}
            </h2>
            <p className="mt-1 truncate text-xs text-slate-500">
              {t('expenseList.collapsedSummary', {
                scope: totalScope,
                count: filtered.length,
                entryLabel,
                total: formatCurrency(filteredTotal, currency),
              })}
            </p>
          </div>
          <ChevronIcon className="h-5 w-5 shrink-0 text-slate-400 transition-transform" />
        </button>
      ) : (
        <>
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-expanded={true}
                aria-label={t('expenseList.toggleCollapse')}
                className="mt-0.5 rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronIcon className="h-4 w-4 rotate-90 transition-transform" />
              </button>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  {t('expenseList.title')}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {t('expenseList.entryCountAndTotal', {
                    count: filtered.length,
                    entryLabel,
                    total: formatCurrency(filteredTotal, currency),
                  })}
                </p>
              </div>
            </div>

            <ExpenseListFilters
              mode={mode}
              onModeChange={setMode}
              customDate={customDate}
              onCustomDateChange={setCustomDate}
              customMonth={customMonth}
              onCustomMonthChange={setCustomMonth}
              category={category}
              onCategoryChange={setCategory}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-400">
                {t('expenseList.emptyTitle')}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t('expenseList.emptyHint')}
              </p>
            </div>
          ) : (
            <>
              <ul className="max-h-[700px] divide-y divide-white/5 overflow-y-auto scheme-dark">
                {filtered.map((e) => (
                  <ExpenseListItem
                    key={e.id}
                    expense={e}
                    currency={currency}
                    isEditing={editingId === e.id}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </ul>

              <ExpenseListTotal
                scope={totalScope}
                count={filtered.length}
                total={filteredTotal}
                currency={currency}
              />
            </>
          )}
        </>
      )}
    </section>
  )
}
