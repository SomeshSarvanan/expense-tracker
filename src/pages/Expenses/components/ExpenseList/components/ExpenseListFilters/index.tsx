import { FilterChip } from '../../../../../../common-components/FilterChip'
import { CATEGORIES } from '../../../../../../constants/GeneralConstants'
import { t } from '../../../../../../utils/i18n'

export type FilterMode = 'all' | 'today' | 'month' | 'day'
export type CategoryFilter = 'all' | string

type Props = {
  mode: FilterMode
  onModeChange: (mode: FilterMode) => void
  customDate: string
  onCustomDateChange: (value: string) => void
  customMonth: string
  onCustomMonthChange: (value: string) => void
  category: CategoryFilter
  onCategoryChange: (value: CategoryFilter) => void
}

export function ExpenseListFilters({
  mode,
  onModeChange,
  customDate,
  onCustomDateChange,
  customMonth,
  onCustomMonthChange,
  category,
  onCategoryChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={mode === 'today'}
          onClick={() => onModeChange('today')}
        >
          {t('expenseList.filterToday')}
        </FilterChip>
        <FilterChip
          active={mode === 'month'}
          onClick={() => onModeChange('month')}
        >
          {t('expenseList.filterMonth')}
        </FilterChip>
        <FilterChip
          active={mode === 'day'}
          onClick={() => onModeChange('day')}
        >
          {t('expenseList.filterByDay')}
        </FilterChip>
        <FilterChip
          active={mode === 'all'}
          onClick={() => onModeChange('all')}
        >
          {t('expenseList.filterAll')}
        </FilterChip>

        <select
          aria-label={t('expenseList.filterByCategoryLabel')}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={
            'ml-auto rounded-full border px-3 py-1 text-xs font-medium outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 ' +
            (category === 'all'
              ? 'border-white/10 bg-slate-950/40 text-slate-300'
              : 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200')
          }
        >
          <option value="all" className="bg-slate-900">
            {t('expenseList.filterAllCategories')}
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-slate-900">
              {c}
            </option>
          ))}
        </select>
      </div>

      {mode === 'day' && (
        <div>
          <input
            type="date"
            value={customDate}
            onChange={(e) => onCustomDateChange(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-400 scheme-dark"
          />
        </div>
      )}

      {mode === 'month' && (
        <div>
          <input
            type="month"
            value={customMonth}
            onChange={(e) => onCustomMonthChange(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-400 scheme-dark"
          />
        </div>
      )}
    </div>
  )
}
