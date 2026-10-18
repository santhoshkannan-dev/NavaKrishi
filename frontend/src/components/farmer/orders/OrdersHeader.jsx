const OrdersHeader = ({ totalOrders, activeStatus }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
      <div>
        <h1 className="text-6xl font-bold text-[#012d1d]">
          Farmer Order Details
        </h1>

        <p className="text-gray-500 text-xl mt-3">
          Showing only the products ordered from your farm.
        </p>
      </div>

      <div className="bg-[#f5f5f3] border border-gray-200 rounded-3xl px-6 py-4 text-right">
        <p className="text-sm text-gray-500 uppercase tracking-wide">Current status</p>
        <p className="text-lg font-bold text-[#012d1d] capitalize">{activeStatus}</p>
        <p className="text-sm text-gray-500 mt-1">{totalOrders} order(s)</p>
      </div>
    </div>
  );
};

export default OrdersHeader;