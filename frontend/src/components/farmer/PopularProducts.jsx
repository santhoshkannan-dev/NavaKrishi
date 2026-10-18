const defaultProducts = [
  {
    name: "Heirloom Tomatoes",
    percent: "84%",
  },
  {
    name: "Organic Kale",
    percent: "62%",
  },
  {
    name: "Honey Crisp Apples",
    percent: "45%",
  },
];

const PopularProducts = ({ products = defaultProducts }) => {
  const maxValue = Math.max(
    ...products.map((product) => Number(product.value) || Number(product.percent) || 0),
    1
  );

  return (
    <div className="bg-[#0f3b24] rounded-3xl p-8 text-white shadow-lg h-full flex flex-col justify-between">
      <h2 className="text-3xl font-bold">
        Popular Products
      </h2>

      <p className="text-sm text-white/80 mt-2">Top movers this month</p>

      <div className="space-y-6 mt-8">
        {products.map((product) => (
          <div key={product.name}>
            <div className="flex justify-between mb-2">
              <span>{product.name}</span>
              <span>{product.percent || `${Math.round(((Number(product.value) || 0) / maxValue) * 100)}%`}</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#a4f792] h-full rounded-full"
                style={{ width: product.percent || `${Math.round(((Number(product.value) || 0) / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-white py-3 rounded-2xl">
          View All Inventory
        </button>
      </div>
    </div>
  );
};

export default PopularProducts;