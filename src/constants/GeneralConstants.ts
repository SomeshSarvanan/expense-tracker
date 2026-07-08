export const CATEGORIES = [
  'Food',
  'Groceries',
  'Transport',
  'Bills',
  'Shopping',
  'Entertainment',
  'Health',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export const CURRENCIES = ['₹', '$', '€', '£', '¥'] as const

export const DEFAULT_CURRENCY: (typeof CURRENCIES)[number] = '₹'

export const DATA_FILE_RELATIVE_PATH = 'data/expenses.json'

export const LEGACY_STORAGE_KEYS = {
  EXPENSES: 'pE:expenses:v1',
  CURRENCY: 'pE:currency:v1',
} as const

export const PERSISTED_UI_KEYS = {
  EXPENSE_LIST_OPEN: 'pE:ui:expenseListOpen:v1',
  ACTIVE_TAB: 'pE:ui:activeTab:v1',
  RECEIVED_LIST_OPEN: 'pE:ui:receivedListOpen:v1',
} as const

export const TAB_IDS = {
  EXPENDITURE: 'expenditure',
  REIMBURSEMENTS: 'reimbursements',
} as const

export type TabId = (typeof TAB_IDS)[keyof typeof TAB_IDS]

export const API_ENDPOINTS = {
  DATA: '/api/data',
} as const

export const TIMING = {
  TOAST_DURATION_MS: 2500,
} as const

export const LOCALE = 'en-IN'

export const CURRENCY_DECIMALS = 2
