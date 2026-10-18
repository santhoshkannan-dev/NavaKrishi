const AIInsights = () => {
  return (
    <section className="mt-16">

      <div className="bg-gradient-to-br from-[#012d1d] to-[#1f6d1a] rounded-3xl p-10 text-white">

        <p className="uppercase tracking-[3px] text-sm text-[#a4f792] font-semibold">
          AI Harvest Insights
        </p>

        <h2 className="text-4xl font-bold mt-4">
          Best consumed within
          the next 5 days
        </h2>

        <p className="text-gray-200 mt-6 text-lg leading-relaxed">
          NavaKrishi AI predicts
          peak sweetness and
          nutrient density during
          this harvest cycle.
        </p>

        <div className="grid grid-cols-2 gap-6 mt-10">

          <div className="bg-white/10 rounded-2xl p-5">
            <p className="text-[#a4f792]">
              Vitamin C
            </p>

            <h3 className="text-3xl font-bold mt-2">
              High
            </h3>
          </div>

          <div className="bg-white/10 rounded-2xl p-5">
            <p className="text-[#a4f792]">
              Freshness Score
            </p>

            <h3 className="text-3xl font-bold mt-2">
              98%
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIInsights;