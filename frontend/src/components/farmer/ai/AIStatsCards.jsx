const stats = [
  {
    title: "Overall Farm Health",
    value: "94%",
    extra: "+2.4%",
    color: "text-[#1f6d1a]",
  },

  {
    title: "Projected Yield",
    value: "12.8t",
    extra: "per hectare",
    color: "text-[#012d1d]",
  },

  {
    title: "Active Alerts",
    value: "03",
    extra: "Action Required",
    color: "text-red-600",
  },

  {
    title: "Next Harvest",
    value: "04",
    extra: "Days Left",
    color: "text-[#012d1d]",
  },
];

const AIStatsCards = ({ stats: inputStats = stats, loading = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">

      {inputStats.map((item, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm"
        >

          <p className="text-gray-500">
            {item.title}
          </p>

          <div className="flex items-end justify-between mt-5">

            <h2 className={`text-5xl font-bold ${item.color}`}>
              {loading ? "..." : item.value}
            </h2>

            <span
              className={`${
                item.title === "Active Alerts"
                  ? "bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm"
                  : "text-gray-500"
              }`}
            >
              {item.extra}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIStatsCards;