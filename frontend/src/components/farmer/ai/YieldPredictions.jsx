const defaultSeries = [
  { phase: "Phase 1", projected: 35, actual: 33 },
  { phase: "Phase 2", projected: 48, actual: 44 },
  { phase: "Phase 3", projected: 62, actual: 58 },
  { phase: "Phase 4", projected: 76, actual: 70 },
  { phase: "Phase 5", projected: 88, actual: 82 },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const buildPath = (points, key) => {
  if (!points.length) return "";

  return points
    .map((point, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100;
      const y = 40 - (clamp(Number(point[key]) || 0, 0, 100) / 100) * 35;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
};

const YieldPredictions = ({ series = defaultSeries }) => {
  const projectedPath = buildPath(series, "projected");
  const actualPath = buildPath(series, "actual");

  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold text-[#012d1d]">
            Crop Yield Predictions
          </h2>

          <p className="text-gray-500 mt-1">
            Projected vs. Actual Yield
          </p>
        </div>

        <div className="flex gap-5 text-sm">

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1f6d1a]" />
            Projected
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#012d1d]" />
            Actual
          </div>
        </div>
      </div>

      <div className="h-72 mt-10 relative">

        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path d={projectedPath} fill="none" stroke="#1f6d1a" strokeWidth="1.5" strokeDasharray="3,2" />

          <path d={actualPath} fill="none" stroke="#012d1d" strokeWidth="2" />
        </svg>

        <div className="flex justify-between text-gray-400 text-sm mt-4">
          {series.map((point, index) => (
            <span key={`${point.phase}-${index}`}>{point.phase}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default YieldPredictions;