type Props = {
  label: string
  value: string
  accent?: boolean
}

export function StatCard({ label, value, accent }: Props) {
  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur ${
        accent
          ? 'border-indigo-400/30 bg-indigo-500/10'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-white">{value}</p>
    </div>
  )
}
