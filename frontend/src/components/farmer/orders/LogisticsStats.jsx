import { formatINR } from "../../../utils/currency";

const LogisticsStats = ({ stats }) => {
  const totalOrders = Number(stats?.totalOrders || 0);
  const totalItems = Number(stats?.totalItems || 0);
  const totalRevenue = Number(stats?.totalRevenue || 0);
  const paidOrders = Number(stats?.paidOrders || 0);

  const paidRate = totalOrders ? Math.round((paidOrders / totalOrders) * 100) : 0;

  return (
    <div className="bg-[#f5f5f3] border border-gray-200 rounded-3xl p-8">
      <h3 className="text-2xl font-bold text-[#012d1d]">
        Farmer Order Stats
      </h3>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl p-5">
          <p className="text-gray-500">
            Paid Rate
          </p>

          <h2 className="text-3xl font-bold text-[#1f6d1a] mt-2">
            {paidRate}%
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <p className="text-gray-500">
            Total Items
          </p>

          <h2 className="text-3xl font-bold text-[#012d1d] mt-2">
            {totalItems}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mt-5">
        <p className="text-gray-500">
          Revenue from your products
        </p>

        <h2 className="text-3xl font-bold text-[#012d1d] mt-2">
          {formatINR(totalRevenue)}
        </h2>

        <p className="text-[#1f6d1a] mt-2">
          across {totalOrders} order(s)
        </p>
      </div>
    </div>
  );
};

export default LogisticsStats;