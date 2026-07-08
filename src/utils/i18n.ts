import en from '../translation/json/en.json'

type Translations = typeof en

type NestedKeys<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends object
      ? `${K}.${NestedKeys<T[K]>}`
      : never
}[keyof T & string]

export type TranslationKey = NestedKeys<Translations>

type Params = Record<string, string | number>

export function t(key: TranslationKey, params?: Params): string {
  const raw = resolve(key)
  if (typeof raw !== 'string') return key
  if (!params) return raw
  return raw.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{{${name}}}`,
  )
}

function resolve(key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>((acc, segment) => {
      if (acc && typeof acc === 'object' && segment in acc) {
        return (acc as Record<string, unknown>)[segment]
      }
      return undefined
    }, en)
}
