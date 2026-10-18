const defaultMetrics = [
  { label: "Nitrogen", value: 76 },
  { label: "Phosphorus", value: 68 },
  { label: "Potassium", value: 82 },
  { label: "Organic Matter", value: 64 },
  { label: "Moisture", value: 72 },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const SoilHealthRadar = ({ metrics = defaultMetrics, alignmentPercent = 88 }) => {
  const center = 50;
  const radius = 40;
  const count = Math.max(metrics.length, 3);

  const polygonPoints = metrics
    .map((metric, index) => {
      const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / count);
      const normalizedRadius = radius * (clamp(Number(metric.value) || 0, 0, 100) / 100);
      const x = center + normalizedRadius * Math.cos(angle);
      const y = center + normalizedRadius * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm h-full">

      <div className="flex items-center justify-between">

        <h2 className="text-4xl font-bold text-[#012d1d]">
          Soil Health Radar
        </h2>

        <span className="text-2xl text-gray-400">
          ⓘ
        </span>
      </div>

      <div className="relative flex items-center justify-center h-125">

        <div className="w-80 h-80 border border-gray-300 rounded-full relative flex items-center justify-center">

          <div className="w-60 h-60 border border-gray-200 rounded-full absolute" />

          <div className="w-40 h-40 border border-gray-200 rounded-full absolute" />

          <div className="w-20 h-20 border border-gray-200 rounded-full absolute" />

          <svg viewBox="0 0 100 100" className="absolute w-72 h-72">
            <polygon points={polygonPoints} fill="rgba(31,109,26,0.2)" stroke="#1f6d1a" strokeWidth="2" />

            {metrics.map((metric, index) => {
              const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / count);
              const normalizedRadius = radius * (clamp(Number(metric.value) || 0, 0, 100) / 100);
              const x = center + normalizedRadius * Math.cos(angle);
              const y = center + normalizedRadius * Math.sin(angle);
              return <circle key={`${metric.label}-${index}`} cx={x} cy={y} r="2" fill="#1f6d1a" />;
            })}
          </svg>

          {metrics.map((metric, index) => {
            const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / count);
            const labelRadius = radius + 12;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);

            return (
              <span
                key={`${metric.label}-label-${index}`}
                className="absolute text-sm font-semibold text-gray-700"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {metric.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 flex justify-between">

        <span className="text-gray-500">
          Optimal Range
        </span>

        <span className="text-[#1f6d1a] font-bold">
          {alignmentPercent}% Aligned
        </span>
      </div>
    </section>
  );
};

export default SoilHealthRadar;