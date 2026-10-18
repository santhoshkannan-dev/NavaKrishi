import { Link } from "react-router-dom";
import { formatWithUnit } from "../../utils/currency";

const SimilarProducts = ({ products = [] }) => {
  if (!products.length) {
    return null;
  }

  return (
    <section className="mt-28">

      <h2 className="text-5xl font-bold text-[#012d1d] border-b border-gray-200 pb-5">
        Similar Products
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
        
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-xl transition group cursor-pointer"
          >
            
            <div className="aspect-square overflow-hidden">
              
              <img
                src={product.image}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
            </div>

            <div className="p-6">
              
              <p className="text-gray-500">
                {product.farmer?.username || "Unknown Farmer"}
              </p>

              <h3 className="text-2xl font-bold text-[#012d1d] mt-2">
                {product.title}
              </h3>

              <p className="text-[#1f6d1a] text-xl font-bold mt-4">
                {formatWithUnit(product.price, product.unit)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;