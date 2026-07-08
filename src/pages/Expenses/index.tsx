import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppHeader } from '../../common-components/AppHeader'
import { DataFileMissingBanner } from '../../common-components/DataFileMissingBanner'
import { TabBar } from '../../common-components/TabBar'
import { Toast, type ToastState } from '../../common-components/Toast'
import {
  DATA_FILE_RELATIVE_PATH,
  DEFAULT_CURRENCY,
  PERSISTED_UI_KEYS,
  TAB_IDS,
  type TabId,
} from '../../constants/GeneralConstants'
import { loadData, saveData } from '../../services/expensesApi'
import {
  clearLegacyLocalStorage,
  readLegacyLocalStorage,
} from '../../services/fileStorage'
import { countByStatus, getReimbursementRows } from '../../utils/expenseHelpers'
import { t } from '../../utils/i18n'
import { usePersistedState } from '../../utils/usePersistedState'
import { ExpenditureView } from './components/ExpenditureView'
import { ReimbursementsView } from './components/ReimbursementsView'
import type { Expense, ExpenseFormPayload } from './Expenses.types'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string }

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY)
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [editing, setEditing] = useState<Expense | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const [activeTab, setActiveTab] = usePersistedState<TabId>(
    PERSISTED_UI_KEYS.ACTIVE_TAB,
    TAB_IDS.EXPENDITURE,
  )
  const [dataFileMissing, setDataFileMissing] = useState(false)
  const skipSaveRef = useRef(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await loadData()

        const legacy = readLegacyLocalStorage()
        const shouldMigrate =
          data.expenses.length === 0 && legacy.expenses.length > 0
        if (shouldMigrate) {
          const migrated = {
            expenses: legacy.expenses,
            currency: legacy.currency ?? data.currency,
          }
          await saveData(migrated)
          clearLegacyLocalStorage()
          if (cancelled) return
          setExpenses(migrated.expenses)
          setCurrency(migrated.currency)
          setDataFileMissing(false)
          setToast({
            kind: 'ok',
            text: t('toast.migratedOk', { count: legacy.expenses.length }),
          })
        } else {
          if (cancelled) return
          setExpenses(data.expenses)
          setCurrency(data.currency)
          setDataFileMissing(data.dataFileMissing)
        }
        setLoadState({ status: 'ready' })
      } catch (err) {
        if (cancelled) return
        setLoadState({
          status: 'error',
          message:
            err instanceof Error ? err.message : t('toast.loadFailed'),
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loadState.status !== 'ready') return
    if (skipSaveRef.current) {
      skipSaveRef.current = false
      return
    }
    saveData({ expenses, currency })
      .then(() => {
        setDataFileMissing(false)
      })
      .catch((err) => {
        setToast({
          kind: 'error',
          text: err instanceof Error ? err.message : t('toast.saveFailed'),
        })
      })
  }, [expenses, currency, loadState.status])

  const handleSubmit = useCallback((payload: ExpenseFormPayload) => {
    if (payload.id) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === payload.id
            ? {
                ...e,
                amount: payload.amount,
                category: payload.category,
                note: payload.note,
                date: payload.date,
                split: payload.split,
              }
            : e,
        ),
      )
      setEditing(null)
      setToast({ kind: 'ok', text: t('toast.updatedOk') })
    } else {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        amount: payload.amount,
        category: payload.category,
        note: payload.note,
        date: payload.date,
        createdAt: new Date().toISOString(),
        split: payload.split,
      }
      setExpenses((prev) => [newExpense, ...prev])
      setToast({ kind: 'ok', text: t('toast.addedOk') })
    }
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      if (editing?.id === id) setEditing(null)
      setToast({ kind: 'ok', text: t('toast.deletedOk') })
    },
    [editing],
  )

  const handleCancelEdit = useCallback(() => setEditing(null), [])

  const handleDismissToast = useCallback(() => setToast(null), [])

  const handleToggleReimbursement = useCallback((expenseId: string) => {
    let markedReceivedWith: string | null = null
    let revertedToPending = false

    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== expenseId || !e.split) return e
        const isReceived = e.split.status === 'received'
        if (isReceived) {
          revertedToPending = true
          return {
            ...e,
            split: {
              ...e.split,
              status: 'pending',
              receivedAt: undefined,
            },
          }
        }
        markedReceivedWith = e.split.withPerson
        return {
          ...e,
          split: {
            ...e.split,
            status: 'received',
            receivedAt: new Date().toISOString(),
          },
        }
      }),
    )

    if (markedReceivedWith) {
      setToast({
        kind: 'ok',
        text: t('toast.reimbursementReceived', { name: markedReceivedWith }),
      })
    } else if (revertedToPending) {
      setToast({ kind: 'ok', text: t('toast.reimbursementPending') })
    }
  }, [])

  const handleEdit = useCallback((expense: Expense) => {
    setEditing(expense)
    setActiveTab(TAB_IDS.EXPENDITURE)
  }, [setActiveTab])

  const pendingCount = useMemo(() => {
    const rows = getReimbursementRows(expenses)
    return countByStatus(rows, 'pending')
  }, [expenses])

  const tabs = useMemo(
    () => [
      { id: TAB_IDS.EXPENDITURE, label: t('tabs.expenditure') },
      {
        id: TAB_IDS.REIMBURSEMENTS,
        label: t('tabs.reimbursements'),
        badgeCount: pendingCount,
      },
    ],
    [pendingCount],
  )

  const footerEntryLabel =
    expenses.length === 1
      ? t('units.entrySingular')
      : t('units.entryPlural')

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <AppHeader />

        {loadState.status === 'loading' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400 backdrop-blur">
            {t('loading.message')}
          </div>
        )}

        {loadState.status === 'error' && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-sm text-rose-200 backdrop-blur">
            <p className="font-semibold">{t('error.loadTitle')}</p>
            <p className="mt-1 text-rose-300/80">{loadState.message}</p>
            <p className="mt-3 text-xs text-rose-300/60">
              {loadState.message.toLowerCase().includes('corrupt')
                ? t('error.corruptHint', { path: DATA_FILE_RELATIVE_PATH })
                : t('error.loadHint')}
            </p>
          </div>
        )}

        {loadState.status === 'ready' && (
          <>
            {dataFileMissing && (
              <DataFileMissingBanner
                onDismiss={() => setDataFileMissing(false)}
              />
            )}

            <TabBar
              tabs={tabs}
              activeId={activeTab}
              onChange={(id) => setActiveTab(id as TabId)}
            />

            {activeTab === TAB_IDS.EXPENDITURE && (
              <ExpenditureView
                expenses={expenses}
                currency={currency}
                editing={editing}
                onSubmit={handleSubmit}
                onCancelEdit={handleCancelEdit}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}

            {activeTab === TAB_IDS.REIMBURSEMENTS && (
              <ReimbursementsView
                expenses={expenses}
                currency={currency}
                onToggleReimbursement={handleToggleReimbursement}
              />
            )}
          </>
        )}

        <footer className="mt-10 text-center text-xs text-slate-500">
          {loadState.status === 'ready' && (
            <>
              {expenses.length}
              {t('app.footerTotal')}
              {footerEntryLabel}
              {t('app.footerSavedTo')}
              <code className="rounded bg-white/5 px-1 py-0.5 font-mono">
                {DATA_FILE_RELATIVE_PATH}
              </code>
            </>
          )}
        </footer>
      </div>

      <Toast toast={toast} onDismiss={handleDismissToast} />
    </div>
  )
}
