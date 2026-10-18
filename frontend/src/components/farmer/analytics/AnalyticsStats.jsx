const AnalyticsStats = ({ data = {}, loading = false }) => {
  const totalRevenue = data.total_revenue || 0;
  const totalItems = data.total_items || 0;
  const totalOrders = data.total_orders || 0;
  const activeOrders = data.active_orders || 0;

  const avgOrder = totalOrders ? (totalRevenue / totalOrders) : 0;

  const stats = [
    { title: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}`, growth: '', positive: true },
    { title: 'Active Orders', value: String(activeOrders), growth: '', positive: true },
    { title: 'Avg. Order Value', value: `₹${avgOrder.toFixed(2)}`, growth: '', positive: true },
    { title: 'Total Items Sold', value: String(totalItems), growth: '', positive: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <p className="text-gray-500">{item.title}</p>

          <div className="flex items-end justify-between mt-4">
            <h2 className="text-4xl font-bold text-[#012d1d]">{loading ? 'Loading...' : item.value}</h2>
            <span className={`font-semibold ${item.positive ? 'text-[#1f6d1a]' : 'text-red-500'}`}>{item.growth}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsStats;