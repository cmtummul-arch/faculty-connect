export function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/85 p-5 shadow-ambient">
      <p className="text-sm uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <div className="mt-3 flex items-end gap-3">
        <p className="font-['Outfit'] text-4xl font-semibold text-slate-900">{value}</p>
        {accent && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{accent}</span>}
      </div>
    </div>
  )
}
