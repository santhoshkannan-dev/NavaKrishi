import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductStepper from "../../components/farmer/addProduct/ProductStepper";
import ProductDetailsForm from "../../components/farmer/addProduct/ProductDetailsForm";
import PricingInventoryForm from "../../components/farmer/addProduct/PricingInventoryForm";
import SustainabilityMedia from "../../components/farmer/addProduct/SustainabilityMedia";
import AIListingAssistant from "../../components/farmer/addProduct/AIListingAssistant";
import MarketplacePreview from "../../components/farmer/addProduct/MarketplacePreview";
import ProductActions from "../../components/farmer/addProduct/ProductActions";
import billingAPI from "../../api/billing";
import showToast from "../../utils/toast";

const AddProduct = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingSubs(true);
      try {
        const resp = await billingAPI.mySubscriptions();
        const data = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
        if (!mounted) return;
        setSubscriptions(data);
        const nonCancelled = data.filter((s) => (s.status || '').toLowerCase() !== 'cancelled');
        const activeSubs = nonCancelled.filter((s) => (s.status || '').toLowerCase() === 'active');
        const pendingSubs = nonCancelled.filter((s) => (s.status || '').toLowerCase() === 'created');
        const current = activeSubs[0] || pendingSubs[0] || nonCancelled[0] || data[0] || null;

        if (!current) {
          // block adding products when no subscription exists
          setBlocked(true);
          showToast('You must purchase a subscription before adding products.');
        } else {
          setBlocked(false);
        }
      } catch (e) {
        setSubscriptions([]);
        setBlocked(true);
      } finally {
        if (mounted) setLoadingSubs(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-5xl font-bold text-[#012d1d] mb-10">
        List New Product
      </h1>

      {blocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#012d1d]">Subscription Required</h2>
            <p className="mt-3 text-sm text-gray-600">You need an active subscription before you can list products on NavaKrishi.</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/farmer/subscriptions')}
                className="px-4 py-2 bg-[#1f6d1a] text-white rounded-xl"
              >
                View Plans
              </button>
              <button
                type="button"
                onClick={() => navigate('/farmer/inventory')}
                className="px-4 py-2 border rounded-xl"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductStepper />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-10">

        {/* Left */}
        <div className="xl:col-span-8 space-y-8">

          <ProductDetailsForm />

          <PricingInventoryForm />

          <SustainabilityMedia />

          <ProductActions />
        </div>

        {/* Right */}
        <div className="xl:col-span-4 space-y-8">

          <AIListingAssistant />

          <MarketplacePreview />
        </div>
      </div>
    </div>
  );
};

export default AddProduct;