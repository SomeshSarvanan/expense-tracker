import {
  CURRENCY_DECIMALS,
  DEFAULT_CURRENCY,
  LOCALE,
} from '../constants/GeneralConstants'

export function formatCurrency(
  amount: number,
  symbol: string = DEFAULT_CURRENCY,
): string {
  return `${symbol}${amount.toLocaleString(LOCALE, {
    minimumFractionDigits: CURRENCY_DECIMALS,
    maximumFractionDigits: CURRENCY_DECIMALS,
  })}`
}

export function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function currentMonthKey(): string {
  return todayISO().slice(0, 7)
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(LOCALE, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatMonth(monthIso: string): string {
  const [y, m] = monthIso.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date.toLocaleDateString(LOCALE, {
    month: 'long',
    year: 'numeric',
  })
}
