const PricingInventoryForm = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">

      <h2 className="text-4xl font-bold text-[#012d1d] mb-8">
        Pricing & Inventory
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>

          <label className="block mb-3 font-semibold text-gray-700">
            Price
          </label>

          <input
            type="number"
            placeholder="$0.00"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none"
          />
        </div>

        <div>

          <label className="block mb-3 font-semibold text-gray-700">
            Unit Type
          </label>

          <select className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none">

            <option>Per kg</option>
            <option>Per lb</option>
            <option>Per box</option>
          </select>
        </div>

        <div>

          <label className="block mb-3 font-semibold text-gray-700">
            Stock Quantity
          </label>

          <input
            type="number"
            placeholder="Available amount"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none"
          />
        </div>

        <div>

          <label className="block mb-3 font-semibold text-gray-700">
            Minimum Order
          </label>

          <input
            type="number"
            placeholder="1"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PricingInventoryForm;