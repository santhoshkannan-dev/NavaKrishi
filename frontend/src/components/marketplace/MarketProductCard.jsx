import { Link } from "react-router-dom";
import {
  FiPlus,
} from "react-icons/fi";


const MarketProductCard = ({
  image,
  title,
  farmer,
  price,
  rating,
  reviews,
  badge,
  badgeColor,
  id,
}) => {
  return (
    <Link to={`/product/${id}`}>
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group h-full flex flex-col">

        {/* Image */}
        <div className="relative h-64 overflow-hidden">

          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />

          {badge && (
            <span
              className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold ${badgeColor}`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col justify-between">

          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#012d1d] leading-tight line-clamp-2">
              {title}
            </h3>

            <p className="text-gray-500 mt-2 text-sm truncate">
              Farmer: {farmer}
            </p>
          </div>

          <div className="flex items-center justify-between mt-6">
            <span className="text-[#1f6d1a] text-2xl md:text-3xl font-bold">
              {price}
            </span>

            {/* <button className="w-12 h-12 rounded-full bg-[#012d1d] text-white flex items-center justify-center hover:bg-[#1f6d1a] transition active:scale-90">
              <FiPlus size={22} />
            </button> */}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MarketProductCard;