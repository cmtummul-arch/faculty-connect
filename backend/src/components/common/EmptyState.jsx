export function EmptyState({ title, copy }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
    </div>
  )
}
