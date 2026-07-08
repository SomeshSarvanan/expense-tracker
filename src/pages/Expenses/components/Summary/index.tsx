import { useMemo } from 'react'
import { StatCard } from '../../../../common-components/StatCard'
import {
  currentMonthKey,
  formatCurrency,
  formatMonth,
  monthKey,
  todayISO,
} from '../../../../utils/format'
import { t } from '../../../../utils/i18n'
import { getMyShare } from '../../../../utils/expenseHelpers'
import type { Expense } from '../../Expenses.types'

type Props = {
  expenses: Expense[]
  currency: string
}

export function Summary({ expenses, currency }: Props) {
  const stats = useMemo(() => {
    const today = todayISO()
    const thisMonth = currentMonthKey()

    let todayTotal = 0
    let monthTotal = 0
    const byCategory: Record<string, number> = {}
    const daysInMonth = new Set<string>()

    for (const e of expenses) {
      const share = getMyShare(e)
      if (share <= 0) continue
      if (e.date === today) todayTotal += share
      if (monthKey(e.date) === thisMonth) {
        monthTotal += share
        daysInMonth.add(e.date)
        byCategory[e.category] = (byCategory[e.category] ?? 0) + share
      }
    }

    const dailyAvg = daysInMonth.size > 0 ? monthTotal / daysInMonth.size : 0

    const categoryList = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([name, total]) => ({
        name,
        total,
        pct: monthTotal > 0 ? (total / monthTotal) * 100 : 0,
      }))

    return {
      thisMonth,
      todayTotal,
      monthTotal,
      dailyAvg,
      categoryList,
      daysTracked: daysInMonth.size,
    }
  }, [expenses])

  const dayLabel =
    stats.daysTracked === 1 ? t('units.daySingular') : t('units.dayPlural')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t('summary.cardToday')}
          value={formatCurrency(stats.todayTotal, currency)}
        />
        <StatCard
          label={formatMonth(stats.thisMonth)}
          value={formatCurrency(stats.monthTotal, currency)}
          accent
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {t('summary.sectionTitle')}
          </h3>
          <span className="text-xs text-slate-500">
            {t('summary.daysTracked', {
              count: stats.daysTracked,
              dayLabel,
            })}
          </span>
        </div>

        <div className="mb-4 rounded-lg bg-slate-950/40 px-3 py-2">
          <p className="text-xs text-slate-400">{t('summary.dailyAverage')}</p>
          <p className="text-lg font-semibold tabular-nums text-white">
            {formatCurrency(stats.dailyAvg, currency)}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">
            {t('summary.byCategory')}
          </p>
          {stats.categoryList.length === 0 ? (
            <p className="text-xs text-slate-500">{t('summary.empty')}</p>
          ) : (
            <ul className="space-y-2">
              {stats.categoryList.map((c) => (
                <li key={c.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="tabular-nums text-slate-400">
                      {formatCurrency(c.total, currency)}
                      <span className="ml-1 text-slate-500">
                        · {c.pct.toFixed(0)}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
