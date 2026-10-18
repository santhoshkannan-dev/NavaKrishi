import { FiTrendingUp } from "react-icons/fi";

const RevenueProjection = ({ data }) => (
  <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
    <div className="flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-[2px] text-gray-500">Estimated Revenue</h3><FiTrendingUp className="text-2xl text-[#1f6d1a]" /></div>
    <h2 className="mt-6 text-3xl font-bold text-[#012d1d]">{data?.revenue?.available ? `${data.revenue.value} ${data.revenue.currency}` : "Unavailable"}</h2>
    <p className="mt-3 text-sm text-gray-500">{data?.revenue?.reason || "Run an analysis to see the calculation status."}</p>
    <div className="mt-8 flex justify-between text-gray-500"><span>Projected yield</span><span>{data?.yield?.available ? `${data.yield.value} ${data.yield.unit}` : "Unavailable"}</span></div>
  </section>
);

export default RevenueProjection;
