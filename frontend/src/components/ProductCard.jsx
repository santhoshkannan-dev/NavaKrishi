import { FiShoppingCart } from "react-icons/fi";

const ProductCard = ({
  image,
  title,
  subtitle,
  price,
  badge,
}) => {
  return (
    <div className="bg-white rounded-[28px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
      
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {badge && (
          <span className="absolute top-4 left-4 bg-[#012d1d]/90 text-white text-xs uppercase tracking-wider px-4 py-2 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Product Content */}
      <div className="p-6">
        
        <div>
          <h3 className="text-2xl font-bold text-[#012d1d]">
            {title}
          </h3>

          <p className="text-gray-500 mt-2">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between mt-8">
          
          <span className="text-2xl font-bold text-[#1f6d1a]">
            {price}
          </span>

          <button className="bg-[#1f6d1a] hover:bg-[#165412] text-white w-12 h-12 rounded-xl flex items-center justify-center transition active:scale-90">
            <FiShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;