const AIInsights = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#012d1d] text-white rounded-3xl p-10">
        <p className="text-[#a4f792] uppercase tracking-[3px] text-sm font-semibold">
          AI Recommendation
        </p>

        <h2 className="text-5xl font-bold mt-6">
          Best Fertilizer:
          Organic Nitrogen Mix
        </h2>

        <p className="mt-6 text-gray-300 text-lg leading-relaxed">
          Based on current soil moisture and climate conditions.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-sm">
        <h2 className="text-4xl font-bold text-[#012d1d]">
          Climate Prediction
        </h2>

        <p className="text-gray-500 mt-6 text-lg leading-relaxed">
          Rain expected within next 3 days. AI suggests reducing irrigation by 22%.
        </p>
      </div>
    </div>
  );
};

export default AIInsights;