const orders = [
  {
    id: "#NK-8291",
    customer: "Elena Rodriguez",
    date: "Oct 24, 2024",
    total: "$142.00",
    status: "Shipped",
  },
  {
    id: "#NK-8288",
    customer: "Marcus Thorne",
    date: "Oct 24, 2024",
    total: "$89.50",
    status: "Pending",
  },
  {
    id: "#NK-8285",
    customer: "Green Bistro Inc.",
    date: "Oct 23, 2024",
    total: "$1,240.00",
    status: "Delivered",
  },
  {
    id: "#NK-8284",
    customer: "Sarah Jenkins",
    date: "Oct 23, 2024",
    total: "$45.00",
    status: "Shipped",
  },
];

const RecentOrders = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold text-[#012d1d]">
            Recent Orders
          </h2>

          <button className="text-sm text-gray-500 flex items-center gap-2">
            Download Report
          </button>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-[#f5f5f3] text-left">
            <tr>
            <th className="p-5">Order</th>
            <th className="p-5">Customer</th>
            <th className="p-5">Date</th>
            <th className="p-5">Total</th>
            <th className="p-5">Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-t border-gray-100"
            >
              <td className="p-5 font-bold">
                {order.id}
              </td>

              <td className="p-5">
                {order.customer}
              </td>

              <td className="p-5 text-sm text-gray-500">
                {order.date}
              </td>

              <td className="p-5">
                {order.total}
              </td>

              <td className="p-5">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${order.status === 'Pending' ? 'bg-[#fff4db] text-[#8a5b00]' : 'bg-[#dff5d8] text-[#267320]'}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;