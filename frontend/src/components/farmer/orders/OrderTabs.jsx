const tabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "failed", label: "Failed" },
];

const OrderTabs = ({ activeStatus, onStatusChange, counts }) => {
  return (
    <div className="flex items-center gap-8 border-b border-gray-200 pb-4 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusChange(tab.key)}
            className={`pb-4 font-bold flex items-center gap-3 border-b-2 transition ${
              isActive
                ? "text-[#1f6d1a] border-[#1f6d1a]"
                : "text-gray-500 border-transparent hover:text-[#012d1d]"
            }`}
          >
            {tab.label}
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                isActive
                  ? "bg-[#dff5d8] text-[#1f6d1a]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {String(counts?.[tab.key] ?? 0).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default OrderTabs;