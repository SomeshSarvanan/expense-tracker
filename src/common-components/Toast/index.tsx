import { useEffect } from 'react'
import { TIMING } from '../../constants/GeneralConstants'

export type ToastKind = 'ok' | 'error'

export type ToastState = {
  kind: ToastKind
  text: string
} | null

type Props = {
  toast: ToastState
  onDismiss: () => void
  durationMs?: number
}

export function Toast({ toast, onDismiss, durationMs = TIMING.TOAST_DURATION_MS }: Props) {
  useEffect(() => {
    if (!toast) return
    const timeoutId = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timeoutId)
  }, [toast, onDismiss, durationMs])

  if (!toast) return null

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur ${
        toast.kind === 'ok'
          ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
          : 'border-rose-400/30 bg-rose-500/15 text-rose-200'
      }`}
    >
      {toast.text}
    </div>
  )
}
