export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
