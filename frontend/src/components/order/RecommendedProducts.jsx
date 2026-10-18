import {
  FiShoppingCart,
  FiArrowRight,
} from "react-icons/fi";

const products = [
  {
    id: 1,
    name: "Raw Wildflower Honey",
    farm: "Busy Bee Apiary",
    price: "$18.00",
    badge: "Organic",
    image:
      "https://images.unsplash.com/photo-1587049352851-8d4e89133924",
  },

  {
    id: 2,
    name: "Stone-Ground Sourdough",
    farm: "The Hearth Bakehouse",
    price: "$8.50",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff",
  },

  {
    id: 3,
    name: "Pasture-Raised Eggs",
    farm: "Happy Hens Farm",
    price: "$7.20",
    image:
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03",
  },

  {
    id: 4,
    name: "Organic Blueberries",
    farm: "Blue Ridge Berries",
    price: "$6.00",
    badge: "Top Choice",
    image:
      "https://images.unsplash.com/photo-1498557850523-fd3d118b962e",
  },
];

const RecommendedProducts = () => {
  return (
    <section className="mt-28">

      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

        <h2 className="text-5xl font-bold text-[#012d1d]">
          Recommended for You
        </h2>

        <button className="flex items-center gap-2 text-[#1f6d1a] font-semibold hover:gap-3 transition-all">
          
          View Marketplace

          <FiArrowRight />
        </button>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">

        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-[28px] overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >

            {/* Image */}
            <div className="relative overflow-hidden">

              <img
                src={product.image}
                alt={product.name}
                className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
              />

              {product.badge && (
                <span className="absolute top-4 right-4 bg-[#a4f792] text-[#1f6d1a] px-4 py-1 rounded-full text-sm font-semibold shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-6">

              <h3 className="text-2xl font-bold text-[#012d1d] line-clamp-2">
                {product.name}
              </h3>

              <p className="text-gray-500 mt-2">
                {product.farm}
              </p>

              {/* Bottom */}
              <div className="flex items-center justify-between mt-8">

                <span className="text-4xl font-bold text-[#1f6d1a]">
                  {product.price}
                </span>

                <button className="w-14 h-14 rounded-2xl bg-[#012d1d] hover:bg-[#1f6d1a] text-white flex items-center justify-center transition-all hover:scale-105 shadow-md">

                  <FiShoppingCart className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedProducts;