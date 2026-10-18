const DecisionSupport = ({ onCompare, comparison, hasPrevious }) => (
  <section className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-[#012d1d] p-10 text-white lg:flex-row">
    <div><h2 className="text-4xl font-bold">Decision Support Hub</h2><p className="mt-4 max-w-2xl text-lg text-gray-300">Compare this result with your most recent saved scenario owned by this account.</p>{comparison && <p className="mt-4 text-sm text-gray-200">Top-crop score change: {comparison.changes.top_crop_score_delta}. Risk changed: {comparison.changes.risk_changed ? "Yes" : "No"}.</p>}</div>
    <button type="button" onClick={onCompare} disabled={!hasPrevious} className="rounded-2xl bg-[#a4f792] px-8 py-5 font-bold text-[#012d1d] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50">Compare with Previous</button>
  </section>
);

export default DecisionSupport;
