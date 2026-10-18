const RiskAssessment = ({ risks = [] }) => (
  <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
    <h2 className="mb-8 text-3xl font-bold text-[#012d1d]">Risk Assessment</h2>
    <div className="space-y-5">{risks.length === 0 ? <p className="text-gray-500">Run an analysis to assess supported risks.</p> : risks.map((risk) => <div key={risk.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-5"><h3 className="text-xl font-bold text-[#012d1d]">{risk.name}: {risk.level}</h3><p className="mt-2 text-gray-500">{risk.reason}</p><p className="mt-2 text-sm text-gray-600">{risk.mitigation}</p></div>)}</div>
  </section>
);

export default RiskAssessment;
