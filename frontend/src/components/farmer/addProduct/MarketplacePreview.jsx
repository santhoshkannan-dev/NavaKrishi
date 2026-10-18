const MarketplacePreview = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

      <h3 className="text-2xl font-bold text-[#012d1d] mb-5">
        Marketplace Preview
      </h3>

      <div className="rounded-3xl overflow-hidden border border-gray-200">

        <div className="aspect-video bg-[#f5f5f3] flex items-center justify-center text-6xl">
          🥬
        </div>

        <div className="p-5">

          <div className="h-4 bg-gray-200 rounded-full w-2/3" />

          <div className="h-3 bg-gray-100 rounded-full w-1/3 mt-3" />

          <div className="flex items-center justify-between mt-5">

            <div className="w-24 h-8 rounded-full bg-[#a4f792]" />

            <div className="w-10 h-10 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      <p className="text-center text-gray-400 text-sm mt-5">
        Preview updates as you type
      </p>
    </div>
  );
};

export default MarketplacePreview;