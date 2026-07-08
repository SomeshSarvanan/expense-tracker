import { DATA_FILE_RELATIVE_PATH } from '../../constants/GeneralConstants'
import { t } from '../../utils/i18n'

export function AppHeader() {
  return (
    <header className="mb-8">
      <h1 className="bg-linear-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
        {t('app.title')}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        {t('app.subtitle')}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-indigo-300">
          {DATA_FILE_RELATIVE_PATH}
        </code>
      </p>
    </header>
  )
}
