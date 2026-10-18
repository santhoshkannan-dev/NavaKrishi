import { FiShield } from "react-icons/fi";
import { formatINR } from "../../utils/currency";

const OrderSummary = ({
  items = [],
  subtotal = 0,
  taxAmount = 0,
  totalAmount = 0,
  discountAmount = 0,
  appliedPromo = null,
  deliveryFee = 0,
  freeShipping = false,
}) => {
  return (
    <div className="bg-white rounded-4xl border border-gray-200 p-8 shadow-md">
      <h2 className="text-3xl font-bold text-[#012d1d] mb-8">Order Summary</h2>

      {/* Products */}
      <div className="space-y-6">
        {items.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          items.map((item) => {
            const product = item.product || {};
            const image = product.image || product.images?.[0]?.image || "https://images.unsplash.com/photo-1576045057995-568f588f82fb";

            return (
              <div key={item.id} className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100">
                  <img src={image} alt={product.title || "Product"} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-[#012d1d]">{product.title || "Product"}</h3>
                  <p className="text-gray-500 mt-1">{item.quantity} × {formatINR(product.price || 0)}</p>
                </div>

                <span className="font-semibold text-lg">{formatINR((product.price || 0) * item.quantity)}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Pricing */}
      <div className="border-t border-gray-200 mt-8 pt-8 space-y-5">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-500">
          <span>Delivery Fee</span>
          <span className="text-[#1f6d1a] font-bold">{freeShipping ? 'FREE' : formatINR(deliveryFee || 0)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Discount {appliedPromo?.code ? `(${appliedPromo.code})` : ''}</span>
            <span>-{formatINR(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-500">
          <span>Tax (GST)</span>
          <span>{formatINR(taxAmount)}</span>
        </div>

        <div className="flex justify-between text-3xl font-bold text-[#012d1d] pt-3">
          <span>Total</span>
          <span>{formatINR(totalAmount)}</span>
        </div>
      </div>

      {/* Security */}
      <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm">
        <FiShield />
        <span>Secure encrypted checkout</span>
      </div>
    </div>
  );
};

export default OrderSummary;