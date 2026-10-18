const RecentTransactions = ({ transactions = [] }) => {
  const tx = transactions.length ? transactions : [
    { product: '—', customer: '—', date: '-', amount: '-', status: '—' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">

      <div className="flex items-center justify-between p-8 border-b border-gray-200">

        <h2 className="text-4xl font-bold text-[#012d1d]">
          Recent Transactions
        </h2>

        <button className="text-[#1f6d1a] font-semibold">
          View All History
        </button>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-[#fafafa]">

            <tr className="text-left text-gray-500">

              <th className="px-8 py-5">Product</th>
              <th className="px-8 py-5">Customer</th>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Amount</th>
              <th className="px-8 py-5">Status</th>
            </tr>
          </thead>

          <tbody>

            {tx.map((item, index) => (
              <tr
                key={index}
                className="border-t border-gray-100"
              >

                <td className="px-8 py-6 font-semibold">
                  {item.product}
                </td>

                <td className="px-8 py-6">
                  {item.customer}
                </td>

                <td className="px-8 py-6 text-gray-500">
                  {item.date}
                </td>

                <td className="px-8 py-6 font-bold">
                  {item.amount}
                </td>

                <td className="px-8 py-6">

                  <span className="bg-[#dff5d8] text-[#1f6d1a] px-4 py-2 rounded-full text-sm font-semibold">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;