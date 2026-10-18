const AIListingAssistant = () => {
  return (
    <div className="bg-[#012d1d] text-white rounded-3xl p-8 shadow-lg sticky top-10">

      <h2 className="text-4xl font-bold leading-tight">
        AI Listing Assistant
      </h2>

      <p className="text-gray-300 mt-6 leading-relaxed">
        Products with sustainability tags perform
        24% better in NavaKrishi marketplace.
      </p>

      <div className="space-y-5 mt-10">

        <div className="flex items-center gap-3">

          <div className="w-3 h-3 rounded-full bg-[#a4f792]" />

          <p>Product Title Great</p>
        </div>

        <div className="flex items-center gap-3 text-gray-400">

          <div className="w-3 h-3 rounded-full bg-gray-500" />

          <p>Missing Images</p>
        </div>

        <div className="flex items-center gap-3 text-gray-400">

          <div className="w-3 h-3 rounded-full bg-gray-500" />

          <p>Sustainability Proof</p>
        </div>
      </div>
    </div>
  );
};

export default AIListingAssistant;