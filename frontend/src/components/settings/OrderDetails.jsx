import { useEffect, useState } from "react";
import { FiDownload, FiPackage } from "react-icons/fi";
import API from "../../api/axios";
import { downloadInvoice, normalizeOrderForDisplay } from "../../utils/orderReceipt";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get("/orders/");
        if (!mounted) return;

        const raw = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setOrders(raw.map((item) => normalizeOrderForDisplay(item)));
      } catch (err) {
        if (!mounted) return;
        setError("Unable to load your orders right now.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-[#eaf8e6] text-[#1f6d1a] flex items-center justify-center">
            <FiPackage />
          </span>
          <div>
            <h3 className="text-2xl font-bold text-[#012d1d]">Order Details</h3>
            <p className="text-gray-500 text-sm mt-1">View your latest orders and download invoices.</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-[#fafafa] p-6 text-gray-500">
          Loading your order history...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-6 text-gray-500">
          You do not have any orders yet.
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-[#fcfefb] p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-[#1f6d1a] font-semibold text-sm uppercase tracking-wide">
                    {order.paymentStatus || "paid"}
                  </p>
                  <h4 className="text-lg font-bold text-[#012d1d] mt-1">
                    {order.orderNumber}
                  </h4>
                  <p className="text-gray-500 text-sm mt-1">
                    Invoice: {order.invoiceNumber}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-[#012d1d]">
                      {money.format(order.totalAmount || 0)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadInvoice(order)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-[#012d1d] hover:bg-[#1f6d1a] text-white font-semibold transition"
                  >
                    <FiDownload />
                    Download Invoice
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                {order.items?.length || 0} item(s) • Payment ID: {order.paymentId || "Razorpay verified"}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
