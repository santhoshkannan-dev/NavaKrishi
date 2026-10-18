const SeasonalProductCard = ({ product }) => {
  return (
    <div className="h-full bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-xl transition group flex flex-col">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition duration-700"
        />

        <div className="absolute top-4 left-4 bg-[#1f6d1a] text-white text-xs px-3 py-1 rounded-full">
          ⭐ {product.score}
        </div>
      </div>

      <div className="p-6 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4 min-h-[3.75rem]">
          <h3 className="text-xl font-bold text-[#012d1d]">{product.title}</h3>
          <p className="text-[#1f6d1a] font-bold whitespace-nowrap">{product.price}</p>
        </div>

        <p className="text-gray-500 mt-2">{product.farm}</p>

        <div className="flex gap-2 flex-wrap mt-5">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#f5f5f3] px-3 py-1 rounded-full text-sm text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <button className="w-full mt-auto pt-6 bg-[#012d1d] hover:bg-[#1f6d1a] text-white py-3 rounded-xl font-semibold transition">
          Add to Basket
        </button>
      </div>
    </div>
  );
};

export default SeasonalProductCard;