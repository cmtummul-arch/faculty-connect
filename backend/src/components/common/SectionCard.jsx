export function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`glass-panel p-6 ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="section-copy mt-1">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
