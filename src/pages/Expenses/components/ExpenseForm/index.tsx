import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CATEGORIES } from '../../../../constants/GeneralConstants'
import { t } from '../../../../utils/i18n'
import { formatCurrency, todayISO } from '../../../../utils/format'
import {
  computeTheirShare,
  getSplitKind,
  type SplitKind,
} from '../../../../utils/expenseHelpers'
import type { Expense, ExpenseFormPayload } from '../../Expenses.types'

type Props = {
  editing: Expense | null
  currency: string
  onSubmit: (payload: ExpenseFormPayload) => void
  onCancelEdit: () => void
}

const MODE_OPTIONS: { id: SplitKind; labelKey: 'expenseForm.modeMe' | 'expenseForm.modeSplit' | 'expenseForm.modePaidFor' }[] = [
  { id: 'none', labelKey: 'expenseForm.modeMe' },
  { id: 'split', labelKey: 'expenseForm.modeSplit' },
  { id: 'paid-for', labelKey: 'expenseForm.modePaidFor' },
]

export function ExpenseForm({
  editing,
  currency,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [mode, setMode] = useState<SplitKind>('none')
  const [personName, setPersonName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setAmount(String(editing.amount))
      setCategory(editing.category)
      setNote(editing.note ?? '')
      setDate(editing.date)
      setMode(getSplitKind(editing))
      setPersonName(editing.split?.withPerson ?? '')
      setError(null)
    } else {
      resetForm()
    }
  }, [editing])

  function resetForm() {
    setAmount('')
    setCategory(CATEGORIES[0])
    setNote('')
    setDate(todayISO())
    setMode('none')
    setPersonName('')
    setError(null)
  }

  const parsedAmount = Number(amount)
  const validPreviewAmount =
    Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0
  const previewTheirShare = useMemo(
    () => computeTheirShare(validPreviewAmount, mode),
    [validPreviewAmount, mode],
  )
  const previewMyShare = Number(
    (validPreviewAmount - previewTheirShare).toFixed(2),
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t('expenseForm.errorAmount'))
      return
    }
    if (!date) {
      setError(t('expenseForm.errorDate'))
      return
    }

    const trimmedName = personName.trim()
    const involvesSomeoneElse = mode !== 'none'
    if (involvesSomeoneElse && trimmedName === '') {
      setError(t('expenseForm.errorPerson'))
      return
    }

    const rounded = Number(parsedAmount.toFixed(2))
    const payload: ExpenseFormPayload = {
      id: editing?.id,
      amount: rounded,
      category,
      note: note.trim() || undefined,
      date,
    }

    if (involvesSomeoneElse) {
      const previousStatus = editing?.split?.status
      const previousReceivedAt = editing?.split?.receivedAt
      const stillSamePerson =
        editing?.split?.withPerson === trimmedName
      payload.split = {
        withPerson: trimmedName,
        theirShare: computeTheirShare(rounded, mode),
        status: stillSamePerson && previousStatus ? previousStatus : 'pending',
        receivedAt:
          stillSamePerson && previousStatus === 'received'
            ? previousReceivedAt
            : undefined,
      }
    }

    onSubmit(payload)

    if (!editing) resetForm()
  }

  const isEditing = editing !== null
  const showPersonSection = mode !== 'none'
  const displayName = personName.trim() || t('expenseForm.labelPerson')

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          {isEditing ? t('expenseForm.titleEdit') : t('expenseForm.titleAdd')}
        </h2>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-400 transition hover:text-white"
          >
            {t('expenseForm.cancel')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            {t('expenseForm.labelAmount')}
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder={t('expenseForm.placeholderAmount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-lg font-semibold text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              {t('expenseForm.labelCategory')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              {t('expenseForm.labelDate')}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={todayISO()}
              className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 scheme-dark"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            {t('expenseForm.labelNote')}
          </label>
          <input
            type="text"
            placeholder={t('expenseForm.placeholderNote')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
          <p className="mb-2 text-xs font-medium text-slate-400">
            {t('expenseForm.sectionInvolvement')}
          </p>
          <div
            role="radiogroup"
            aria-label={t('expenseForm.sectionInvolvement')}
            className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-slate-900/60 p-1"
          >
            {MODE_OPTIONS.map((opt) => {
              const isActive = mode === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setMode(opt.id)}
                  className={
                    'rounded-md px-2 py-1.5 text-xs font-semibold transition ' +
                    (isActive
                      ? 'bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white')
                  }
                >
                  {t(opt.labelKey)}
                </button>
              )
            })}
          </div>

          {showPersonSection && (
            <div className="mt-3 space-y-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  {t('expenseForm.labelPerson')}
                </label>
                <input
                  type="text"
                  placeholder={t('expenseForm.placeholderPerson')}
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              {validPreviewAmount > 0 && mode === 'split' && (
                <p className="text-xs text-slate-400">
                  {t('expenseForm.splitPreview', {
                    myShare: formatCurrency(previewMyShare, currency),
                    theirShare: formatCurrency(previewTheirShare, currency),
                    name: displayName,
                  })}
                </p>
              )}
              {validPreviewAmount > 0 && mode === 'paid-for' && (
                <p className="text-xs text-emerald-300/90">
                  {t('expenseForm.paidForPreview', {
                    name: displayName,
                    total: formatCurrency(validPreviewAmount, currency),
                  })}
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 hover:shadow-indigo-500/50 active:scale-[0.98]"
        >
          {isEditing
            ? t('expenseForm.submitEdit')
            : t('expenseForm.submitAdd')}
        </button>
      </div>
    </form>
  )
}
