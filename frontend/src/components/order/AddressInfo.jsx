import { formatINR } from "../../utils/currency";

const AddressInfo = ({ order }) => {
  const shipping = order?.shippingAddress || {};

  return (
    <div className="grid md:grid-cols-2 gap-8">

      {/* Shipping */}
      <div className="bg-white rounded-[28px] border border-gray-200 p-8 shadow-sm">

        <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-6">
          Shipping Address
        </h3>

        <p className="text-[#012d1d] leading-relaxed text-lg">
          {shipping.label || "-"}
          <br />
          {shipping.address_line1 || "-"}
          <br />
          {[shipping.city, shipping.state].filter(Boolean).join(", ") || "-"} {shipping.pincode ? shipping.pincode : ""}
        </p>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-[28px] border border-gray-200 p-8 shadow-sm">

        <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-6">
          Billing Info
        </h3>

          <p className="text-[#012d1d] leading-relaxed text-lg">
          Razorpay payment verified
          <br />
          Total Charged: {formatINR(order?.totalAmount || 0)}
        </p>
      </div>
    </div>
  );
};

export default AddressInfo;