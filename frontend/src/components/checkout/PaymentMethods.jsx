import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiCreditCard,
  FiSmartphone,
} from "react-icons/fi";

import { BsBank } from "react-icons/bs";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  GST_RATE,
  loadSavedShippingAddress,
  normalizeCartItems,
  saveOrderId,
  saveOrderSnapshot,
} from "../../utils/orderReceipt";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentMethods = ({ totalAmount = 0, promo = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();

  const [method, setMethod] =
    useState("upi");
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    loadRazorpayScript().then((loaded) => {
      if (mounted) {
        setRazorpayReady(loaded);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleRazorpayPayment = async () => {
    if (!user) {
      navigate("/sign-in");
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      setPaymentMessage("Razorpay key id is missing from the frontend environment.");
      return;
    }

    if (!razorpayReady) {
      setPaymentMessage("Razorpay checkout is still loading. Please try again.");
      return;
    }

    if (!totalPrice || totalPrice <= 0) {
      setPaymentMessage("Your cart is empty.");
      return;
    }

    setIsPaying(true);
    setPaymentMessage("");

    try {
      const orderResponse = await API.post("/payments/razorpay/create-order/", {
        promo_code: promo?.code || '',
      });
      const { order_id, amount, currency, key_id, tax_amount } = orderResponse.data;

      const subtotal = Number(totalPrice || 0);
      const normalizedItems = normalizeCartItems(items);
      const shippingAddress = loadSavedShippingAddress();

      const options = {
        key: key_id || RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "NavaKrishi",
        description: "Marketplace checkout",
        order_id,
        prefill: {
          name: user?.first_name || user?.username || "",
          email: user?.email || "",
        },
        theme: {
          color: "#1f6d1a",
        },
        handler: async (response) => {
          try {
            const verifyResponse = await API.post("/payments/razorpay/verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shipping_address: shippingAddress || {},
              customer_name: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "",
              customer_email: user?.email || "",
              customer_phone: user?.phone || "",
                  promo_code: promo?.code || '',
                  discount_amount: promo?.discount_amount || 0,
            });

            const paidOrder = verifyResponse.data;
            saveOrderId(paidOrder.id);
            saveOrderSnapshot(paidOrder);

            await clearCart();
            navigate("/order-success", { state: { orderId: paidOrder.id } });
          } catch (error) {
            setPaymentMessage(
              error?.response?.data?.detail ||
                "Payment was captured but could not be verified. Please contact support."
            );
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        setPaymentMessage("Payment failed. Please try again.");
        setIsPaying(false);
      });
      razorpay.open();
    } catch (error) {
      setPaymentMessage(
        error?.response?.data?.detail ||
          "Unable to start Razorpay checkout right now."
      );
      setIsPaying(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
      
      <h2 className="text-3xl font-bold text-[#012d1d] mb-8">
        Payment Method
      </h2>

      <div className="space-y-4">

        {/* UPI */}
        <label
          className={`border-2 rounded-2xl p-6 flex items-center gap-5 cursor-pointer transition ${
            method === "upi"
              ? "border-[#1f6d1a] bg-[#f4fff2]"
              : "border-gray-200"
          }`}
        >
          <input
            type="radio"
            checked={method === "upi"}
            onChange={() => setMethod("upi")}
          />

          <FiSmartphone
            size={28}
            className="text-[#1f6d1a]"
          />

          <div>
            <h3 className="font-bold text-lg">
              UPI (GPay, PhonePe, BHIM)
            </h3>

            <p className="text-gray-500">
              Instant & secure mobile payment
            </p>
          </div>
        </label>

        {/* Card */}
        <label
          className={`border rounded-2xl p-6 flex items-center gap-5 cursor-pointer transition ${
            method === "card"
              ? "border-[#1f6d1a]"
              : "border-gray-200"
          }`}
        >
          <input
            type="radio"
            checked={method === "card"}
            onChange={() => setMethod("card")}
          />

          <FiCreditCard size={28} />

          <div>
            <h3 className="font-bold text-lg">
              Credit / Debit Card
            </h3>

            <p className="text-gray-500">
              Visa, Mastercard, RuPay
            </p>
          </div>
        </label>

        {/* Bank */}
        <label
          className={`border rounded-2xl p-6 flex items-center gap-5 cursor-pointer transition ${
            method === "bank"
              ? "border-[#1f6d1a]"
              : "border-gray-200"
          }`}
        >
          <input
            type="radio"
            checked={method === "bank"}
            onChange={() => setMethod("bank")}
          />

          <BsBank size={28} />

          <div>
            <h3 className="font-bold text-lg">
              Net Banking
            </h3>

            <p className="text-gray-500">
              All major Indian banks supported
            </p>
          </div>
        </label>
      </div>

      {/* UPI Input */}
      {method === "upi" && (
        <div className="mt-8 bg-[#f5f5f5] rounded-2xl p-6">
          
          <label className="block mb-4 text-gray-500">
            Enter UPI ID
          </label>

          <div className="flex gap-4">
            
            <input
              type="text"
              placeholder="username@bank"
              className="flex-1 border border-gray-300 rounded-xl px-5 py-4 outline-none"
            />

            <button className="bg-[#1f6d1a] text-white px-8 rounded-xl hover:bg-[#165412] transition">
              Verify
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleRazorpayPayment}
        disabled={isPaying}
        className="mt-8 w-full bg-[#012d1d] hover:bg-[#1f6d1a] disabled:opacity-70 text-white px-8 py-4 rounded-2xl font-semibold transition"
      >
        {isPaying ? "Opening Razorpay..." : `Pay ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(totalAmount || 0))} with Razorpay`}
      </button>

      {paymentMessage && (
        <p className="mt-4 text-sm text-[#1f6d1a]">{paymentMessage}</p>
      )}
    </section>
  );
};

export default PaymentMethods;