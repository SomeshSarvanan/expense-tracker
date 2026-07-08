import type { ReactNode } from 'react'

type Props = {
  onClick: () => void
  title: string
  danger?: boolean
  children: ReactNode
}

export function IconButton({ onClick, title, danger, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`rounded-md p-1.5 transition ${
        danger
          ? 'text-slate-400 hover:bg-rose-500/15 hover:text-rose-300'
          : 'text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
