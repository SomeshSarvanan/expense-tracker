import { DATA_FILE_RELATIVE_PATH } from '../../constants/GeneralConstants'
import { t } from '../../utils/i18n'

type Props = {
  onDismiss: () => void
}

export function DataFileMissingBanner({ onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 backdrop-blur"
    >
      <div className="mt-0.5 shrink-0 rounded-full bg-amber-500/20 p-1.5 text-amber-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-200">
          {t('dataFileMissing.title')}
        </p>
        <p className="mt-1 text-xs text-amber-100/80">
          {t('dataFileMissing.message', { path: DATA_FILE_RELATIVE_PATH })}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20"
      >
        {t('dataFileMissing.dismiss')}
      </button>
    </div>
  )
}
