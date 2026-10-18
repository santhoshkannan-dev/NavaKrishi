const RevenueTrend = ({ trend = [] }) => {
  // normalize values to heights
  const max = Math.max(...trend.map((t) => t.value), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 h-full">

      <div className="flex items-center justify-between">

        <h2 className="text-4xl font-bold text-[#012d1d]">Monthly Revenue Trend</h2>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1f6d1a]" />
            Revenue
          </div>
        </div>
      </div>

      <div className="h-[360px] flex items-end justify-between mt-16 px-4">
        {trend.length === 0 ? (
          <div className="text-gray-500">No data</div>
        ) : (
          trend.map((t, index) => {
            const height = Math.max(20, Math.round((t.value / max) * 320));
            return (
              <div key={index} className="flex flex-col items-center gap-5">
                <div style={{ height }} className="w-12 rounded-t-3xl bg-gradient-to-t from-[#1f6d1a] to-[#a4f792]" />
                <span className="text-gray-500 text-sm">{t.label}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RevenueTrend;