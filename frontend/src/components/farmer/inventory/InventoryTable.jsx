import {
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";

const products = [
  {
    name: "Heirloom Tomatoes",
    sku: "HT-1042",
    category: "Vegetables",
    price: "$4.50/lb",
    stock: "142 lbs remaining",
    stockWidth: "75%",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
    lowStock: false,
  },

  {
    name: "Wild Harvest Carrots",
    sku: "WHC-882",
    category: "Root Crops",
    price: "$3.20/kg",
    stock: "20 kg (Low Stock)",
    stockWidth: "15%",
    image:
      "https://images.unsplash.com/photo-1447175008436-054170c2e979",
    lowStock: true,
  },

  {
    name: "Golden Sweet Corn",
    sku: "GSC-211",
    category: "Grains",
    price: "$0.85/pc",
    stock: "850 pcs available",
    stockWidth: "92%",
    image:
      "https://images.unsplash.com/photo-1551754655-cd27e38d2076",
    lowStock: false,
  },
];

const InventoryTable = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full">

          {/* Head */}
          <thead className="bg-[#f5f5f3] border-b border-gray-200">

            <tr className="text-left">

              <th className="px-6 py-6 w-16"></th>

              <th className="px-6 py-6 text-gray-600 font-semibold">
                Product
              </th>

              <th className="px-6 py-6 text-gray-600 font-semibold">
                Category
              </th>

              <th className="px-6 py-6 text-gray-600 font-semibold">
                Price
              </th>

              <th className="px-6 py-6 text-gray-600 font-semibold">
                Stock Level
              </th>

              <th className="px-6 py-6 text-center text-gray-600 font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>

            {products.map((product, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-[#fafafa] transition"
              >

                {/* Checkbox */}
                <td className="px-6 py-8">
                  <input type="checkbox" />
                </td>

                {/* Product */}
                <td className="px-6 py-8">

                  <div className="flex items-center gap-5">

                    <img
                      src={product.image}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
                    />

                    <div>

                      <h3 className="text-2xl font-bold text-[#012d1d]">
                        {product.name}
                      </h3>

                      <p className="text-gray-400 mt-1">
                        SKU: {product.sku}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-8">

                  <span className="bg-[#e6e3d0] text-[#48473a] px-5 py-2 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="px-6 py-8 text-[#1f6d1a] text-2xl font-bold">
                  {product.price}
                </td>

                {/* Stock */}
                <td className="px-6 py-8">

                  <div className="space-y-3">

                    <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">

                      <div
                        style={{
                          width: product.stockWidth,
                        }}
                        className={`h-full rounded-full ${
                          product.lowStock
                            ? "bg-red-500"
                            : "bg-[#1f6d1a]"
                        }`}
                      />
                    </div>

                    <p
                      className={`font-medium ${
                        product.lowStock
                          ? "text-red-500"
                          : "text-gray-600"
                      }`}
                    >
                      {product.stock}
                    </p>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-8">

                  <div className="flex items-center justify-center gap-5">

                    <button className="text-[#1f6d1a] hover:scale-110 transition">

                      <FiEdit3 className="text-2xl" />
                    </button>

                    <button className="text-red-500 hover:scale-110 transition">

                      <FiTrash2 className="text-2xl" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;