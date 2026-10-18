import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import SuccessHero from "../components/order/SuccessHero";
import PurchasedItems from "../components/order/PurchasedItems";
import OrderSummaryCard from "../components/order/OrderSummaryCard";
import AddressInfo from "../components/order/AddressInfo";
import SupportWidget from "../components/order/SupportWidget";
import RecommendedProducts from "../components/order/RecommendedProducts";
import {
  downloadInvoice,
  loadOrderId,
  loadSavedOrder,
  normalizeOrderForDisplay,
  saveOrderSnapshot,
} from "../utils/orderReceipt";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchOrder = async () => {
      const orderId = location.state?.orderId || loadOrderId();

      if (!orderId) {
        navigate("/checkout", { replace: true });
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const response = await API.get(`/orders/${orderId}/`);
        if (!mounted) return;

        const normalized = normalizeOrderForDisplay(response.data);
        setOrder(normalized);
        saveOrderSnapshot(response.data);
      } catch (error) {
        if (!mounted) return;

        const savedOrder = loadSavedOrder();
        if (savedOrder) {
          setOrder(normalizeOrderForDisplay(savedOrder));
          setMessage("Showing your saved receipt while the backend order loads.");
        } else {
          navigate("/checkout", { replace: true });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      mounted = false;
    };
  }, [location.state, navigate]);

  const handleDownloadInvoice = () => {
    if (!order) return;

    downloadInvoice(order);
  };

  if (loading || !order) {
    return (
      <>
        <Navbar />
        <main className="max-w-360 mx-auto px-6 py-28">
          <div className="rounded-4xl border border-gray-200 bg-white p-10 shadow-sm">
            <h1 className="text-4xl font-bold text-[#012d1d]">Loading your order details...</h1>
            <p className="mt-4 text-gray-500">We’re retrieving the payment confirmation and invoice details.</p>
            {message && <p className="mt-3 text-sm text-[#1f6d1a]">{message}</p>}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-360 mx-auto px-6 py-28">

        {/* Hero */}
        <SuccessHero order={order} />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 mt-20">

          {/* Left */}
          <div className="lg:col-span-8 space-y-8">

            <PurchasedItems order={order} />

            <AddressInfo order={order} />
          </div>

          {/* Right */}
          <div className="lg:col-span-4 space-y-8">

            <OrderSummaryCard order={order} onDownloadInvoice={handleDownloadInvoice} />

            <SupportWidget />
          </div>
        </div>

        {/* Recommended */}
        <RecommendedProducts />
      </main>

      <Footer />
    </>
  );
};

export default OrderSuccess;