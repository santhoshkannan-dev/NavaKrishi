const MoistureChart = ({ points = [] }) => {
  const chartPoints = points.length > 0 ? points : [28, 32, 30, 35, 31, 29, 34];
  const max = Math.max(...chartPoints, 1);

  return (
    <article className="rounded-3xl border border-[#dfe8d8] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#012d1d]">Soil Moisture Trend</h3>
        <span className="rounded-full bg-[#eef8e8] px-3 py-1 text-xs font-semibold text-[#1f6d1a]">Last 7 readings</span>
      </div>

      <div className="mt-6 flex items-end gap-3">
        {chartPoints.map((point, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-full bg-[#eef3eb]" style={{ height: "140px" }}>
              <div
                className="mt-auto w-full rounded-full bg-linear-to-t from-[#1f6d1a] to-[#7bc96f]"
                style={{ height: `${Math.max(14, Math.round((point / max) * 100))}%` }}
              />
            </div>
            <span className="text-xs text-[#5c6f62]">D{index + 1}</span>
          </div>
        ))}
      </div>
    </article>
  );
};

export default MoistureChart;
