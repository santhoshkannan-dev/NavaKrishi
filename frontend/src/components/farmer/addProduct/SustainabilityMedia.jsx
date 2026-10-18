const tags = [
  "Pesticide Free",
  "Rainwater Harvested",
  "Non-GMO",
  "Regenerative Soil",
];

const SustainabilityMedia = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">

      <h2 className="text-4xl font-bold text-[#012d1d] mb-8">
        Sustainability & Media
      </h2>

      {/* Tags */}
      <div>

        <label className="block mb-5 font-semibold text-gray-700">
          Sustainability Tags
        </label>

        <div className="flex flex-wrap gap-4">

          {tags.map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-3 bg-[#f5f5f3] border border-gray-200 px-5 py-3 rounded-full cursor-pointer"
            >

              <input type="checkbox" />

              <span>{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="mt-10">

        <label className="block mb-5 font-semibold text-gray-700">
          Product Images
        </label>

        <div className="border-2 border-dashed border-gray-300 rounded-3xl h-[240px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#fafafa] transition">

          <div className="text-6xl">
            📷
          </div>

          <p className="mt-5 text-lg font-semibold text-gray-700">
            Click or drag to upload images
          </p>

          <p className="text-gray-400 mt-2">
            PNG, JPG up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityMedia;