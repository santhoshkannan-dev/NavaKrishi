import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import CheckoutSteps from "../components/checkout/CheckoutSteps";
import ShippingForm from "../components/checkout/ShippingForm";
import PaymentMethods from "../components/checkout/PaymentMethods";
import OrderSummary from "../components/checkout/OrderSummary";
import PromoCode from "../components/checkout/PromoCode";
import { useCart } from "../context/CartContext";
import { useState } from "react";

const GST_RATE = 0.05;
const DELIVERY_FEE = 50; // match backend DELIVERY_FEE

const Checkout = () => {
  const { items, totalPrice } = useCart();
  const [appliedPromo, setAppliedPromo] = useState(null);

  const subtotal = Number(totalPrice || 0);
  const discountAmount = Number(appliedPromo?.discount_amount || 0);
  const subtotalAfter = Math.max(0, subtotal - discountAmount);
  const taxAmount = subtotalAfter * GST_RATE;
  const deliveryFee = appliedPromo?.free_shipping ? 0 : DELIVERY_FEE;
  const totalAmount = subtotalAfter + taxAmount + deliveryFee;

  return (
    <>
      <Navbar />

      <main className="max-w-360 mx-auto px-6 pt-28 pb-20">

        {/* Progress Steps */}
        <CheckoutSteps />

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">

          {/* Left Side */}
          <div className="lg:col-span-8 space-y-8">

            <ShippingForm />

            <PaymentMethods totalAmount={totalAmount} promo={appliedPromo} deliveryFee={deliveryFee} />
          </div>

          {/* Right Side */}
          <div className="lg:col-span-4">

            <div className="sticky top-28">

              <OrderSummary
                items={items}
                subtotal={subtotal}
                taxAmount={taxAmount}
                totalAmount={totalAmount}
                discountAmount={discountAmount}
                appliedPromo={appliedPromo}
                deliveryFee={deliveryFee}
                freeShipping={appliedPromo?.free_shipping}
              />

              <PromoCode
                appliedPromo={appliedPromo}
                onApply={(promoData) => setAppliedPromo(promoData)}
                onRemove={() => setAppliedPromo(null)}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Checkout;