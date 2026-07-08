import { FilterChip } from '../../../../../../../../common-components/FilterChip'
import { t } from '../../../../../../../../utils/i18n'

export type PendingKindFilter = 'all' | 'split' | 'paid-for'
export type PendingPersonFilter = 'all' | string

type Props = {
  kind: PendingKindFilter
  onKindChange: (kind: PendingKindFilter) => void
  person: PendingPersonFilter
  onPersonChange: (person: PendingPersonFilter) => void
  people: string[]
}

export function ReimbursementsFilters({
  kind,
  onKindChange,
  person,
  onPersonChange,
  people,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip active={kind === 'all'} onClick={() => onKindChange('all')}>
        {t('reimbursements.filterKindAll')}
      </FilterChip>
      <FilterChip
        active={kind === 'split'}
        onClick={() => onKindChange('split')}
      >
        {t('reimbursements.filterKindSplit')}
      </FilterChip>
      <FilterChip
        active={kind === 'paid-for'}
        onClick={() => onKindChange('paid-for')}
      >
        {t('reimbursements.filterKindPaidFor')}
      </FilterChip>

      <select
        aria-label={t('reimbursements.filterByPersonLabel')}
        value={person}
        onChange={(e) => onPersonChange(e.target.value)}
        className={
          'ml-auto rounded-full border px-3 py-1 text-xs font-medium outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 ' +
          (person === 'all'
            ? 'border-white/10 bg-slate-950/40 text-slate-300'
            : 'border-purple-400/40 bg-purple-500/15 text-purple-200')
        }
      >
        <option value="all" className="bg-slate-900">
          {t('reimbursements.filterAllPeople')}
        </option>
        {people.map((name) => (
          <option key={name} value={name} className="bg-slate-900">
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
