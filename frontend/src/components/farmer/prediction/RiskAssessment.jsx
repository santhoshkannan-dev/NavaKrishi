const RiskAssessment = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

      <h2 className="text-3xl font-bold text-[#012d1d] mb-8">
        Risk Assessment
      </h2>

      <div className="space-y-5">

        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">

          <h3 className="font-bold text-red-600 text-xl">
            Pest Risk: High
          </h3>

          <p className="text-gray-500 mt-2">
            Due to projected humidity levels.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">

          <h3 className="font-bold text-[#012d1d] text-xl">
            Water Stress: Moderate
          </h3>

          <p className="text-gray-500 mt-2">
            Manageable with drip irrigation.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RiskAssessment;