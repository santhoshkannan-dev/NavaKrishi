const ProductDetailsForm = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">

      <h2 className="text-4xl font-bold text-[#012d1d] mb-8">
        Product Details
      </h2>

      <div className="space-y-6">

        {/* Name */}
        <div>

          <label className="block mb-3 font-semibold text-gray-700">
            Product Name
          </label>

          <input
            type="text"
            placeholder="e.g. Organic Tomatoes"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#a4f792]"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <label className="block mb-3 font-semibold text-gray-700">
              Category
            </label>

            <select className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none">

              <option>Vegetables</option>
              <option>Fruits</option>
              <option>Spices</option>
              <option>Grains</option>
            </select>
          </div>

          <div>

            <label className="block mb-3 font-semibold text-gray-700">
              Variety
            </label>

            <input
              type="text"
              placeholder="e.g. Cherry"
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>

          <label className="block mb-3 font-semibold text-gray-700">
            Description
          </label>

          <textarea
            rows="5"
            placeholder="Describe the product..."
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsForm;