export type TabItem = {
  id: string
  label: string
  badgeCount?: number
}

type Props = {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
}

export function TabBar({ tabs, activeId, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Sections"
      className="mb-6 flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ' +
              (isActive
                ? 'bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white')
            }
          >
            <span>{tab.label}</span>
            {typeof tab.badgeCount === 'number' && tab.badgeCount > 0 && (
              <span
                className={
                  'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ' +
                  (isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-indigo-500/20 text-indigo-200')
                }
              >
                {tab.badgeCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
