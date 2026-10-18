import OrderCard from "./OrderCard";

const OrdersList = ({ orders, loading, error, onViewDetails, selectedIds = [], onToggleSelect }) => {
  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-gray-500">
        Loading farmer orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-500">
        No orders found for this status.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onViewDetails={onViewDetails}
          selected={selectedIds.includes(order.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
};

export default OrdersList;