const crops = [
  {
    name: "Artisan Carrots",
    fit: "98%",
    image:
      "https://images.unsplash.com/photo-1447175008436-054170c2e979",
  },

  {
    name: "Heirloom Tomatoes",
    fit: "86%",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",
  },

  {
    name: "Organic Kale",
    fit: "79%",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
  },
];

const CropRecommendations = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center justify-between mb-10">

        <div>

          <h2 className="text-4xl font-bold text-[#012d1d]">
            Crop Recommendations
          </h2>

          <p className="text-gray-500 mt-2">
            Top AI-selected crops for your land.
          </p>
        </div>

        <button className="text-[#1f6d1a] font-semibold">
          View Full Catalog →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {crops.map((crop, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl transition"
          >

            <div className="relative h-52">

              <img
                src={crop.image}
                alt=""
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full font-bold text-[#1f6d1a]">
                {crop.fit} Fit
              </div>
            </div>

            <div className="p-6">

              <h3 className="text-2xl font-bold text-[#012d1d]">
                {crop.name}
              </h3>

              <div className="flex gap-3 mt-5 flex-wrap">

                <span className="bg-[#dff5d8] text-[#1f6d1a] px-3 py-1 rounded-full text-sm">
                  Premium
                </span>

                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  Low Water
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CropRecommendations;