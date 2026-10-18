import {
  FiFeather,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import {
  GiFruitBowl,
  GiWheat,
  GiFarmTractor,
} from "react-icons/gi";

import {
  PiPlantLight,
} from "react-icons/pi";

import {
  GiHoneycomb,
} from "react-icons/gi";

const categories = [
  {
    title: "Vegetables",
    icon: <FiFeather size={38} />,
    categoryKey: "vegetables",
  },
  {
    title: "Fruits",
    icon: <GiFruitBowl size={38} />,
    categoryKey: "fruits",
  },
  {
    title: "Spices",
    icon: <PiPlantLight size={38} />,
    categoryKey: "spices",
  },
  {
    title: "Grains & Pulses",
    icon: <GiWheat size={38} />,
    categoryKey: "grains-pulses",
  },
  {
    title: "Organic Honey",
    icon: <GiHoneycomb size={38} />,
    categoryKey: "organic-honey",
  },
  {
    title: "Organic Farm Items",
    icon: <GiFarmTractor size={38} />,
    categoryKey: "organic-farm-items",
  },
];

const marketplacePathFor = (categoryKey) => `/marketplace?category=${categoryKey}`;

const Categories = () => {
  return (
    <section className="space-y-10">
      
      <div className="flex items-end justify-between">
        
        <div>
          <h2 className="text-4xl font-bold text-[#012d1d]">
            Browse Categories
          </h2>

          <p className="text-gray-500 mt-2">
            Sourced directly from verified organic producers
          </p>
        </div>

        <button className="hidden md:flex items-center gap-2 text-[#1f6d1a] font-semibold hover:gap-3 transition-all">
          View All Categories →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {categories.map((item, index) => (
          <Link
            to={marketplacePathFor(item.categoryKey)}
            key={index}
            className="bg-white border border-gray-200 rounded-[28px] p-10 flex flex-col items-center justify-center gap-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            
            <div className="w-20 h-20 rounded-full bg-[#dff5d8] flex items-center justify-center text-[#1f6d1a] group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>

            <h3 className="text-2xl font-semibold text-[#012d1d]">
              {item.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;