import {
  FiTrash2,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { formatINR } from "../../utils/currency";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const BasketSidebar = ({ mode = "drawer" }) => {
  const {
    items,
    totalItems,
    totalPrice,
    loading,
    updateItem,
    removeItem,
    isDrawerOpen,
    closeDrawer,
  } = useCart();

  const handleDecrease = async (item) => {
    if (!item?.id) return;
    if (item.quantity <= 1) {
      await removeItem(item.id);
      return;
    }

    await updateItem(item.id, item.quantity - 1);
  };

  const handleIncrease = async (item) => {
    if (!item?.id) return;
    await updateItem(item.id, item.quantity + 1);
  };

  const getItemImage = (item) => item?.product?.image || item?.product?.images?.[0]?.image || "https://images.unsplash.com/photo-1576045057995-568f588f82fb";

  if (mode === "drawer") {
    return (
      <>
        {isDrawerOpen && (
          <button
            type="button"
            aria-label="Close basket drawer overlay"
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/40"
          />
        )}

        <aside
          className={`fixed top-0 right-0 z-50 h-screen w-full max-w-md bg-white shadow-2xl border-l border-gray-200 p-6 transform transition-transform duration-300 ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-[#012d1d]">My Basket</h2>

            <div className="flex items-center gap-3">
              <span className="bg-[#1f6d1a] text-white px-4 py-1 rounded-full text-sm">
                {totalItems} Items
              </span>

              <button
                type="button"
                onClick={closeDrawer}
                className="text-gray-500 hover:text-[#012d1d] text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 py-8 space-y-8 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-20 rounded-2xl bg-gray-100" />
                <div className="h-20 rounded-2xl bg-gray-100" />
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 p-6 text-gray-500">
                Your basket is empty. Add products from the marketplace to see them here.
              </div>
            ) : (
              items.map((item) => {
                const product = item.product || {};
                return (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={getItemImage(item)}
                      alt={product.title || "Product"}
                      className="w-20 h-20 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="font-bold text-[#012d1d] line-clamp-2">
                        {product.title || "Product"}
                      </h3>

                      <p className="text-gray-500 mt-1">
                        {item.quantity} × {formatINR(product.price || 0)}
                      </p>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          className="p-2 bg-gray-100 rounded"
                          onClick={() => handleDecrease(item)}
                        >
                          <FiMinus />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          className="p-2 bg-gray-100 rounded"
                          onClick={() => handleIncrease(item)}
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>

                    <button onClick={() => removeItem(item.id)}>
                      <FiTrash2 className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between mb-4">
              <span className="text-gray-500">Subtotal</span>

              <span className="font-bold text-xl">{formatINR(totalPrice)}</span>
            </div>

            <div className="flex justify-between mb-8">
              <span className="text-gray-500">Delivery</span>

              <span className="text-[#1f6d1a] font-semibold">FREE</span>
            </div>

            <Link
              to="/checkout"
              onClick={closeDrawer}
              className="w-full bg-[#012d1d] text-white py-5 rounded-2xl font-semibold hover:bg-[#1f6d1a] transition text-center block"
            >
              Checkout Now →
            </Link>
          </div>
        </aside>
      </>
    );
  }

  return (
    <aside className="w-80 border-l border-gray-200 bg-white min-h-screen p-6 hidden xl:flex flex-col">
      
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        
        <h2 className="text-2xl font-bold text-[#012d1d]">
          My Basket
        </h2>

        <span className="bg-[#1f6d1a] text-white px-4 py-1 rounded-full text-sm">
          {totalItems} Items
        </span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 py-8 space-y-8">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 rounded-2xl bg-gray-100" />
            <div className="h-20 rounded-2xl bg-gray-100" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 p-6 text-gray-500">
            Your basket is empty. Add products from the marketplace to see them here.
          </div>
        ) : (
          items.map((item) => {
            const product = item.product || {};
            return (
              <div
                key={item.id}
                className="flex gap-4"
              >
                <img
                  src={getItemImage(item)}
                  alt={product.title || "Product"}
                  className="w-20 h-20 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-bold text-[#012d1d] line-clamp-2">
                    {product.title || "Product"}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    {item.quantity} × {formatINR(product.price || 0)}
                  </p>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      className="p-2 bg-gray-100 rounded"
                      onClick={() => handleDecrease(item)}
                    >
                      <FiMinus />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      className="p-2 bg-gray-100 rounded"
                      onClick={() => handleIncrease(item)}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <button onClick={() => removeItem(item.id)}>
                  <FiTrash2 className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6">
        
        <div className="flex justify-between mb-4">
          <span className="text-gray-500">
            Subtotal
          </span>

          <span className="font-bold text-xl">
            {formatINR(totalPrice)}
          </span>
        </div>

        <div className="flex justify-between mb-8">
          <span className="text-gray-500">
            Delivery
          </span>

          <span className="text-[#1f6d1a] font-semibold">
            FREE
          </span>
        </div>

        <Link
          to="/checkout"
          className="w-full bg-[#012d1d] text-white py-5 rounded-2xl font-semibold hover:bg-[#1f6d1a] transition text-center block"
        >
          Checkout Now →
        </Link>
      </div>
    </aside>
  );
};

export default BasketSidebar;