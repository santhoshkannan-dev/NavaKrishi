import { FiMail, FiMapPin, FiPhone, FiX } from "react-icons/fi";
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

const OrderDetailsDrawer = ({ order, isOpen, onClose, onMarkShipped }) => {
  if (!isOpen || !order) return null;

  const addressText = getAddressText(order.shipping_address);

  const anyNotShipped = (order.items || []).some((it) => !it.is_shipped);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close order details overlay"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <aside role="dialog" aria-modal="true" aria-label={`Order ${order.order_number} details`} className="relative h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-sm text-gray-500">Order details</p>
            <h2 className="text-2xl font-bold text-[#012d1d]">{order.order_number}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#012d1d] flex items-center justify-center"
          >
            <FiX />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="rounded-2xl border border-gray-200 p-4 bg-[#fbf9f8]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Customer</p>
            <h3 className="text-xl font-bold text-[#012d1d] mt-1">{order.customer_name || "Customer"}</h3>

            <p className="flex items-center gap-2 text-gray-600 mt-3">
              <FiMail />
              {order.customer_email || "No email"}
            </p>
            <p className="flex items-center gap-2 text-gray-600 mt-2">
              <FiPhone />
              {order.customer_phone || "No phone"}
            </p>
            <p className="flex items-start gap-2 text-gray-600 mt-2">
              <FiMapPin className="mt-0.5" />
              <span>{addressText}</span>
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Payment</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-semibold text-[#012d1d] capitalize">{order.payment_status || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Method</p>
                <p className="font-semibold text-[#012d1d]">{order.payment_method || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Invoice</p>
                <p className="font-semibold text-[#012d1d]">{order.invoice_number || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Ordered at</p>
                <p className="font-semibold text-[#012d1d]">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-gray-500">Your products in this order</p>
              <p className="font-semibold text-[#012d1d]">{order.farmer_total_items || 0} item(s)</p>
            </div>

            <div className="space-y-3 mt-4">
              {order.items?.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-gray-100 bg-[#fcfefb] p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#012d1d] truncate">{item.product_title}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatINR(item.unit_price)} / {item.product_unit || "item"}
                    </p>
                  </div>
                  <p className="font-bold text-[#012d1d]">{formatINR(item.total_price)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 p-4 bg-[#f5f5f3]">
            <p className="text-sm text-gray-500">Total from your products</p>
            <p className="text-3xl font-bold text-[#012d1d] mt-1">
              {formatINR(order.farmer_total_amount || order.farmer_subtotal || 0)}
            </p>
            {anyNotShipped && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onClose && onClose()}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => onMarkShipped && onMarkShipped(order)}
                  aria-label="Mark your items as shipped"
                  className="px-4 py-2 rounded-xl bg-[#1f6d1a] text-white font-semibold"
                >
                  Mark as Shipped
                </button>
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
};

export default OrderDetailsDrawer;
