import { useState } from "react";
import { formatINR } from "../../utils/currency";
import { useCart } from "../../context/CartContext";
import {
  FiShoppingCart,
  FiPlus,
  FiMinus,
} from "react-icons/fi";


const ProductInfo = ({ product }) => {

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [showFarmDetails, setShowFarmDetails] = useState(false);
  const { addItem } = useCart();

  const unitPrice = Number(product?.price || 0);
  const available = Number(product?.quantity_available ?? 0);
  const farmer = product?.farmer || {};
  const farmName = farmer?.farm_name || "Unknown Farm";
  const farmLocation = farmer?.farm_location || "Location not available";
  const farmerName =
    farmer?.first_name || farmer?.last_name
      ? [farmer?.first_name, farmer?.last_name].filter(Boolean).join(" ")
      : farmer?.username || "Unknown Farmer";
  const farmImage =
    farmer?.farm_logo_url ||
    farmer?.avatar_url ||
    farmer?.farm_logo ||
    farmer?.avatar ||
    "https://i.pravatar.cc/160";

  const handleAddToCart = async () => {
    if (!product?.id) return;
    if (available <= 0) {
      setCartMessage('Out of stock.');
      return;
    }
    if (quantity > available) {
      setCartMessage(`Only ${available} item(s) available.`);
      return;
    }
    try {
      setAdding(true);
      setCartMessage("");
      await addItem(product.id, quantity);
      setCartMessage("Added to cart successfully.");
    } catch (error) {
      const detail = error?.response?.data?.detail || "Unable to add to cart. Please sign in and try again.";
      setCartMessage(detail);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>

        <div className="flex items-center justify-between">

          <span className="bg-[#dff5d8] text-[#267320] px-4 py-2 rounded-full text-sm font-semibold">
            {product?.badge || 'Organic Certified'}
          </span>

          <div className="flex items-center gap-1 text-[#1f6d1a]">
            <span className="ml-2 text-gray-500">
              ({product?.rating ?? '—'} / {product?.reviews ?? 0} reviews)
            </span>
          </div>
        </div>

        <h1 className="text-6xl font-bold text-[#012d1d] mt-6">
          {product?.title || 'Product'}
        </h1>

        <p className="text-4xl text-[#1f6d1a] font-bold mt-4">
          {formatINR(unitPrice)}/{product?.unit || ''}
        </p>
      </div>

      {/* Cart */}
      <div className="bg-[#f5f5f3] border border-gray-200 rounded-3xl p-8">

        <div className="flex items-center gap-6">
          
          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
            
            <button 
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <FiMinus />
            </button>

            <span className="px-6 font-bold">
              {quantity}
            </span>

            <button 
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                setQuantity((prev) => Math.min(prev + 1, available))
              }
            >
              <FiPlus />
            </button>
          </div>

          <p className="text-gray-500 text-lg">
            Subtotal:
            <span className="text-[#012d1d] font-bold ml-2">
              {formatINR(quantity * unitPrice)}
            </span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {available > 0 ? (
              <span className="text-[#1f6d1a]">In stock: {available}</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>
        </div>

        <button
          className="w-full mt-8 bg-[#1f6d1a] hover:bg-[#165412] disabled:opacity-70 text-white py-5 rounded-2xl font-semibold flex items-center justify-center gap-3 transition cursor-pointer"
          onClick={handleAddToCart}
          disabled={adding || !product?.id || available <= 0}
        >
          
          <FiShoppingCart />

          {adding ? "Adding..." : "Add to Cart"}
        </button>

        {cartMessage && (
          <p className="mt-4 text-sm text-[#1f6d1a]">{cartMessage}</p>
        )}
      </div>

      {/* Farmer */}
      <div className="border-t border-gray-200 pt-8">

        <h3 className="uppercase tracking-[2px] text-gray-500 text-sm font-semibold">
          Grown By
        </h3>

        <button
          type="button"
          onClick={() => setShowFarmDetails(true)}
          className="w-full flex items-center gap-5 mt-6 hover:bg-[#f5f5f3] p-4 rounded-2xl transition text-left cursor-pointer"
        >
          
          <img
            src={farmImage}
            alt={farmName}
            className="w-16 h-16 rounded-full object-cover"
          />

          <div>
            <h4 className="text-2xl font-bold text-[#012d1d]">
              {farmName}
            </h4>

            <p className="text-gray-500 mt-1">
              {farmLocation}
            </p>
            <p className="text-gray-400 mt-1 text-sm">
              {farmerName}
            </p>
          </div>
        </button>
      </div>

      {showFarmDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowFarmDetails(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Farm details"
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={farmImage}
                  alt={farmName}
                  className="w-18 h-18 rounded-2xl object-cover border border-gray-200"
                />

                <div>
                  <p className="text-sm uppercase tracking-[2px] text-gray-500 font-semibold">
                    Farm Profile
                  </p>
                  <h3 className="text-3xl font-bold text-[#012d1d] mt-2">
                    {farmName}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {farmLocation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="text-gray-500 hover:text-[#012d1d] text-2xl leading-none"
                onClick={() => setShowFarmDetails(false)}
                aria-label="Close farm details"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-[#f5f5f3] p-5 space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Farmer name</p>
                <p className="text-xl font-semibold text-[#012d1d] mt-1">
                  {farmerName}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Farm name</p>
                <p className="text-xl font-semibold text-[#012d1d] mt-1">
                  {farmName}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Location</p>
                <p className="text-xl font-semibold text-[#012d1d] mt-1">
                  {farmLocation}
                </p>
              </div>

              {farmer?.farm_bio && (
                <div>
                  <p className="text-gray-500 text-sm">About the farm</p>
                  <p className="text-gray-700 mt-1 leading-relaxed">
                    {farmer.farm_bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div>

        <h3 className="uppercase tracking-[2px] text-gray-500 text-sm font-semibold">
          Description
        </h3>

        <p className="text-gray-600 text-lg leading-relaxed mt-6">
          {product?.description || "No description available for this product."}
        </p>

        <div className="flex gap-6 mt-6 flex-wrap">
          
          <span className="text-[#1f6d1a] font-semibold">
            🌱 Pesticide Free
          </span>

          <span className="text-[#1f6d1a] font-semibold">
            💧 Rainwater Harvested
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;