const AnalyticsFooter = () => {
  return (
    <footer className="border-t border-gray-200 pt-10 mt-10">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

        <div>

          <h2 className="text-3xl font-bold text-[#012d1d]">
            NavaKrishi
          </h2>

          <p className="text-gray-500 mt-4 leading-relaxed">
            Cultivating trust through AI.
          </p>
        </div>

        <div>

          <h3 className="font-bold text-[#012d1d] mb-4">
            Product
          </h3>

          <div className="space-y-3 text-gray-500">

            <p>Marketplace</p>
            <p>AI Recommendations</p>
            <p>Impact Tracking</p>
          </div>
        </div>

        <div>

          <h3 className="font-bold text-[#012d1d] mb-4">
            Support
          </h3>

          <div className="space-y-3 text-gray-500">

            <p>Farmer FAQ</p>
            <p>Help Center</p>
            <p>Privacy Policy</p>
          </div>
        </div>

        <div>

          <h3 className="font-bold text-[#012d1d] mb-4">
            Sustainability Goal
          </h3>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

            <div className="w-[85%] h-full bg-[#1f6d1a]" />
          </div>

          <p className="text-gray-500 mt-4">
            85% Organic efficiency reached this quarter.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AnalyticsFooter;