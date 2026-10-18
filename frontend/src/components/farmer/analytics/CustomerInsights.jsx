const CustomerInsights = ({ insights = {} }) => {
  const unique = Number(insights.unique_customers ?? 0);
  const repeat = Number(insights.repeat_customers ?? 0);
  const retention = Number(insights.retention_rate_percent ?? 0);

  const hasData = unique > 0 || repeat > 0 || retention > 0;
  const repeatShare = unique > 0 ? Math.min(100, Math.round((repeat / unique) * 100)) : 0;
  const churnRisk = Math.max(0, 100 - retention);

  const metrics = [
    {
      label: 'Unique customers',
      value: hasData ? unique.toLocaleString('en-IN') : '—',
      detail: 'Distinct buyers served',
      accent: 'bg-[#1f6d1a]',
    },
    {
      label: 'Repeat customers',
      value: hasData ? repeat.toLocaleString('en-IN') : '—',
      detail: 'Returning buyers',
      accent: 'bg-[#012d1d]',
    },
    {
      label: 'Retention rate',
      value: hasData ? `${retention}%` : '—',
      detail: 'Recurring purchase share',
      accent: 'bg-[#d97706]',
    },
  ];

  const bars = [
    { label: 'Retention', value: retention, tone: 'bg-[#1f6d1a]' },
    { label: 'Repeat share', value: repeatShare, tone: 'bg-[#012d1d]' },
    { label: 'Churn risk', value: churnRisk, tone: 'bg-[#d97706]' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 h-full shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-[#012d1d]">Customer Insights</h2>
          <p className="text-gray-500 mt-2 max-w-xl">
            Real customer behavior from completed farmer orders. Use this to spot repeat buyers and retention trends early.
          </p>
        </div>

        <div className="bg-[#f5f5f3] rounded-2xl px-4 py-3 text-right min-w-[140px]">
          <p className="text-gray-500 text-sm">Retention</p>
          <p className="text-3xl font-bold text-[#012d1d] mt-1">{hasData ? `${retention}%` : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {metrics.map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-200 p-5 bg-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-500 text-sm">{item.label}</p>
                <h3 className="text-4xl font-bold text-[#012d1d] mt-2">{item.value}</h3>
              </div>
              <div className={`w-3 h-12 rounded-full ${item.accent}`} />
            </div>
            <p className="text-gray-500 mt-4 text-sm">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-[#f5f5f3] p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-[#012d1d]">Behavior snapshot</h3>
            <p className="text-gray-500 text-sm mt-1">Percent-based view of what is happening with your customers.</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Repeat share</p>
            <p className="text-xl font-bold text-[#012d1d]">{hasData ? `${repeatShare}%` : '—'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">{bar.label}</span>
                <span className="font-semibold text-[#012d1d]">{hasData ? `${bar.value}%` : '—'}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${bar.tone}`}
                  style={{ width: hasData ? `${Math.max(0, Math.min(100, bar.value))}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {!hasData && (
          <p className="text-gray-500 text-sm mt-5">
            No customer data yet. Once orders are completed, these metrics will populate automatically.
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomerInsights;