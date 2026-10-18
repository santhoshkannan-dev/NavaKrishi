const YieldEfficiency = ({ yield: yieldData = {} }) => {
  const aiAdoption = Number(yieldData.ai_adoption_percent ?? 65);
  const netProfitInc = Number(yieldData.net_profit_increase_percent ?? 24);
  const aiValue = yieldData.ai_recommended_value ?? null;
  const standardValue = yieldData.standard_value ?? null;
  const waterSavings = Number(yieldData.water_savings_percent ?? 32);
  const yieldLift = Number(yieldData.yield_increase_percent ?? 18);
  const inputReduction = Number(yieldData.input_reduction_percent ?? 21);

  const formatCurrency = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return 'N/A';
    }

    return `₹${numeric.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const compareValue = (left, right) => {
    const first = Number(left);
    const second = Number(right);

    if (!Number.isFinite(first) || !Number.isFinite(second) || second === 0) {
      return null;
    }

    return Math.round(((first - second) / second) * 100);
  };

  const profitLift = compareValue(aiValue, standardValue);
  const progress = Math.max(0, Math.min(100, aiAdoption));

  const metrics = [
    {
      label: 'Yield lift',
      value: `${yieldLift}%`,
      helper: 'Estimated output improvement',
    },
    {
      label: 'Water saved',
      value: `${waterSavings}%`,
      helper: 'Less irrigation per cycle',
    },
    {
      label: 'Input reduction',
      value: `${inputReduction}%`,
      helper: 'Lower seed and fertilizer waste',
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm h-full">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-[#012d1d]">Yield Efficiency</h2>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Compare AI-guided farming inputs against standard practice and track how much more value each crop cycle can produce.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-[#dff5d8] text-[#1f6d1a] px-5 py-2 rounded-full font-semibold">
            +{netProfitInc}% Net Profit
          </div>
          <div className="bg-[#f5f5f3] text-[#012d1d] px-5 py-2 rounded-full font-semibold">
            {aiAdoption}% AI Adoption
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-10">
        <div className="xl:col-span-4 flex items-center justify-center">
          <div className="relative w-72 h-72 rounded-full bg-gradient-to-br from-[#f5f5f3] to-white border border-gray-200 flex items-center justify-center">
            <div
              className="absolute inset-5 rounded-full"
              style={{
                background: `conic-gradient(#1f6d1a ${progress * 3.6}deg, #e5e7eb 0deg)`,
              }}
            />
            <div className="absolute inset-[1.35rem] rounded-full bg-white border border-gray-100 flex flex-col items-center justify-center text-center px-6">
              <p className="text-gray-500 text-sm uppercase tracking-[0.2em]">AI Adoption</p>
              <h3 className="text-6xl font-bold text-[#012d1d] mt-3">{aiAdoption}%</h3>
              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                Adoption score across advisory, irrigation, and crop planning decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-2xl p-6 bg-[#f5f5f3] border border-gray-100">
            <p className="text-gray-500 text-sm">AI recommended outcome</p>
            <h3 className="text-4xl font-bold text-[#012d1d] mt-3">{formatCurrency(aiValue)}</h3>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#1f6d1a] font-semibold">Better input efficiency</span>
              {profitLift !== null ? <span className="text-gray-600">+{profitLift}% vs baseline</span> : <span className="text-gray-400">No baseline</span>}
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-white border border-gray-200">
            <p className="text-gray-500 text-sm">Standard farming baseline</p>
            <h3 className="text-4xl font-bold text-[#012d1d] mt-3">{formatCurrency(standardValue)}</h3>
            <p className="text-gray-500 mt-4 text-sm leading-relaxed">
              Typical return without AI recommendations, route optimization, or demand-based planning.
            </p>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl p-5 border border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-gray-500 text-sm">{metric.label}</p>
                  <h4 className="text-3xl font-bold text-[#012d1d] mt-2">{metric.value}</h4>
                </div>
                <div className="w-3 h-3 rounded-full bg-[#1f6d1a]" />
              </div>
              <p className="text-gray-500 mt-4 text-sm">{metric.helper}</p>
            </div>
          ))}

          <div className="rounded-2xl p-5 bg-[#012d1d] text-white">
            <p className="text-white/70 text-sm">Efficiency insight</p>
            <p className="mt-3 leading-relaxed">
              AI-assisted crop planning is showing the strongest lift where water use, fertilizer dose, and timing are optimized together.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldEfficiency;