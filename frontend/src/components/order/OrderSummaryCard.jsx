import {
  FiTarget,
  FiDownload,
} from "react-icons/fi";
import { formatINR } from "../../utils/currency";

const OrderSummaryCard = ({ order, onDownloadInvoice }) => {
  return (
    <div className="bg-[#012d1d] text-white rounded-4xl p-10 shadow-2xl">

      <h2 className="text-4xl font-bold mb-10">
        Order Summary
      </h2>

      <div className="space-y-5 border-b border-white/10 pb-8">

        <div className="flex justify-between text-lg">
          <span>Subtotal</span>
          <span>{formatINR(order?.subtotal || 0)}</span>
        </div>

        <div className="flex justify-between text-lg">
          <span>Shipping</span>
          <span className="text-[#a4f792]">
            Free
          </span>
        </div>

        <div className="flex justify-between text-lg">
          <span>Tax</span>
          <span>{formatINR(order?.taxAmount || 0)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">

        <h3 className="text-3xl font-bold">
          Total
        </h3>

        <h3 className="text-3xl font-bold">
          {formatINR(order?.totalAmount || 0)}
        </h3>
      </div>

      {/* Buttons */}
      <div className="space-y-4 mt-10">

        <button
          type="button"
          className="w-full bg-[#1f6d1a] hover:bg-[#267320] py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
        >

          <FiTarget />

          Track Order
        </button>

        <button
          type="button"
          onClick={onDownloadInvoice}
          className="w-full border border-white/20 hover:bg-white/10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
        >

          <FiDownload />

          Download Invoice
        </button>
      </div>
    </div>
  );
};

export default OrderSummaryCard;