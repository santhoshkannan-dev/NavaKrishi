import { useMemo } from "react";
import {
  FiEye,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import { formatINR } from "../../../utils/currency";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getAddressText = (shippingAddress) => {
  if (!shippingAddress || typeof shippingAddress !== "object") {
    return "Address not available";
  }

  const parts = [
    shippingAddress.address_line1,
    shippingAddress.address_line2,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.address,
  ]
    .map((part) => (part || "").trim())
    .filter(Boolean);

  return parts.length ? parts.join(", ") : "Address not available";
};

const OrderCard = ({ order, onViewDetails, selected, onToggleSelect }) => {

  const status = String(order.payment_status || "pending").toLowerCase();
  const statusBadge = useMemo(() => {
    if (status === "paid") {
      return "bg-[#dff5d8] text-[#1f6d1a]";
    }
    if (status === "failed") {
      return "bg-red-100 text-red-700";
    }
    return "bg-amber-100 text-amber-700";
  }, [status]);

  const addressText = useMemo(() => getAddressText(order.shipping_address), [order.shipping_address]);

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    if (onToggleSelect) onToggleSelect(order.id);
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
      <div className="absolute left-4 -top-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            aria-label={`Select order ${order.order_number}`}
            checked={!!selected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
        </label>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 justify-between">
        {/* Left */}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-[#012d1d] text-xl">
              {order.order_number}
            </h3>

            <span className="w-1 h-1 rounded-full bg-gray-400" />

            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusBadge}`}>
              {status}
            </span>
          </div>

          <h2 className="text-3xl font-bold text-[#012d1d] mt-4">{order.customer_name || "Customer"}</h2>

          <p className="flex items-center gap-2 text-gray-500 mt-2">
            <FiMail />
            {order.customer_email || "No email"}
          </p>

          <p className="flex items-center gap-2 text-gray-500 mt-2">
            <FiPhone />
            {order.customer_phone || "No phone"}
          </p>

          <p className="flex items-center gap-2 text-gray-500 mt-2">
            <FiMapPin />
            {addressText}
          </p>

          {/* Products */}
          <div className="flex flex-wrap gap-4 mt-6">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-[#f5f5f3] px-4 py-3 rounded-2xl"
              >
                <img
                  src={item.product_image || "https://images.unsplash.com/photo-1518843875459-f738682238a6"}
                  alt={item.product_title || "Product"}
                  className="w-10 h-10 rounded-lg object-cover"
                />

                <span className="font-medium text-[#012d1d]">
                  {item.quantity} x {item.product_title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col justify-between items-end gap-6">
          <div className="text-right">
            <h2 className="text-3xl font-bold text-[#012d1d]">
              {formatINR(order.farmer_total_amount || order.farmer_subtotal || 0)}
            </h2>

            <p className="text-gray-500 mt-2">
              {order.farmer_total_items || 0} item(s)
            </p>
            <p className="text-gray-500 mt-1 text-sm">{formatDateTime(order.created_at)}</p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => onViewDetails(order)}
              className="bg-[#1f6d1a] hover:bg-[#165412] text-white px-6 py-4 rounded-2xl font-semibold transition inline-flex items-center gap-2"
            >
              <FiEye />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;