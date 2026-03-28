export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-0.5 bg-gray-100 border border-gray-200 p-1 rounded-xl w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
            active === tab.value
              ? "bg-white text-gray-900 shadow-soft"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
          {tab.count != null && (
            <span className="ml-1.5 text-[10px] text-gray-400">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
