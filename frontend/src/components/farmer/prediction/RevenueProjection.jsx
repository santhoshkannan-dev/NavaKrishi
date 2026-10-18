import { FiTrendingUp } from "react-icons/fi";

const RevenueProjection = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center justify-between">

        <h3 className="text-gray-500 uppercase tracking-[2px] text-sm font-semibold">
          Estimated Revenue
        </h3>

        <FiTrendingUp className="text-[#1f6d1a] text-2xl" />
      </div>

      <h2 className="text-6xl font-bold text-[#012d1d] mt-6">
        $42,500
      </h2>

      <p className="text-[#1f6d1a] font-semibold text-xl mt-3">
        +12% vs last year
      </p>

      <div className="mt-8">

        <div className="flex justify-between text-gray-500 mb-2">

          <span>Projected Tonnage</span>

          <span>15.2 Tons/Ha</span>
        </div>

        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">

          <div className="h-full w-4/5 bg-[#1f6d1a]" />
        </div>
      </div>
    </section>
  );
};

export default RevenueProjection;