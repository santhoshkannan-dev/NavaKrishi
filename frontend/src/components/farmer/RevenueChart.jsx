const defaultRevenuePoints = [
  { month: "Jan", value: 42 },
  { month: "Feb", value: 48 },
  { month: "Mar", value: 53 },
  { month: "Apr", value: 61 },
  { month: "May", value: 58 },
  { month: "Jun", value: 72 },
  { month: "Jul", value: 79 },
  { month: "Aug", value: 85 },
  { month: "Sep", value: 82 },
  { month: "Oct", value: 91 },
  { month: "Nov", value: 96 },
  { month: "Dec", value: 104 },
];

const RevenueChart = ({
  points = defaultRevenuePoints,
  heading = "Monthly Revenue Growth",
  eyebrow = "Revenue performance",
  summaryLabel = "Projected quarter",
  summaryValue = "$18.4k",
  metricCards = [],
}) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2f6b23]">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#012d1d] md:text-4xl">
            {heading}
          </h2>
        </div>

        <div className="rounded-2xl bg-[#eef8e8] px-4 py-3 text-right">
          <p className="text-sm text-[#2f6b23]">{summaryLabel}</p>
          <p className="text-2xl font-bold text-[#012d1d]">{summaryValue}</p>
        </div>
      </div>

      <div className="mt-8 grid h-[280px] grid-cols-12 items-end gap-3 rounded-3xl border border-dashed border-[#d9e6d0] bg-[#fbfdf8] p-5">
        {points.map((point) => (
          <div
            key={point.month}
            className="flex h-full flex-col items-center justify-end gap-3"
          >
            <div className="flex h-full w-full items-end justify-center">
              <div
                className="w-full max-w-[24px] rounded-t-2xl bg-gradient-to-t from-[#1f6d1a] to-[#a4f792] shadow-[0_10px_24px_rgba(31,109,26,0.18)]"
                style={{ height: `${point.value}%` }}
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-[#012d1d]">{point.value}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                {point.month}
              </p>
            </div>
          </div>
        ))}
      </div>

      {metricCards.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl p-4 ${card.className || "bg-[#f5f5f3]"}`}
            >
              <p className={`text-sm ${card.labelClassName || "text-gray-500"}`}>
                {card.label}
              </p>
              <p className={`mt-1 text-2xl font-bold ${card.valueClassName || "text-[#012d1d]"}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RevenueChart;