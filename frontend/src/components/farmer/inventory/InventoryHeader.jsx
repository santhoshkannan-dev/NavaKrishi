import {
  FiSearch,
  FiPlusCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import billingAPI from "../../api/billing";
import showToast from "../../utils/toast";
import { useState } from "react";

const InventoryHeader = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const goToAdd = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const resp = await billingAPI.mySubscriptions();
      const data = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
      const nonCancelled = data.filter((s) => (s.status || '').toLowerCase() !== 'cancelled');
      const activeSubs = nonCancelled.filter((s) => (s.status || '').toLowerCase() === 'active');
      const pendingSubs = nonCancelled.filter((s) => (s.status || '').toLowerCase() === 'created');
      const current = activeSubs[0] || pendingSubs[0] || nonCancelled[0] || data[0] || null;

      if (!current) {
        showToast('You need an active subscription to add new products.');
        navigate('/farmer/subscriptions');
        return;
      }

      navigate('/farmer/add-product');
    } catch (e) {
      showToast('Unable to check subscription status.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

      {/* Left */}
      <div>
        <h1 className="text-6xl font-bold text-[#012d1d]">
          Manage Your Inventory
        </h1>

        <p className="text-gray-500 text-xl mt-3">
          Update stock levels and product details for your farm products.
        </p>
      </div>

      {/* Right */}
      <div className="flex flex-col sm:flex-row items-center gap-4">

        {/* Search */}
        <div className="relative">

          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

          <input
            type="text"
            placeholder="Search inventory..."
            className="w-[320px] bg-white border border-gray-200 rounded-full pl-14 pr-5 py-4 outline-none focus:ring-2 focus:ring-[#a4f792]"
          />
        </div>

        {/* Add Button */}
        <button onClick={goToAdd} className="bg-[#1f6d1a] hover:bg-[#165412] text-white px-8 py-4 rounded-full flex items-center gap-3 font-semibold shadow-md transition">

          <FiPlusCircle className="text-xl" />

          {checking ? 'Checking...' : 'Add New Product'}
        </button>
      </div>
    </div>
  );
};

export default InventoryHeader;