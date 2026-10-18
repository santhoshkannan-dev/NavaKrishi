import { Link } from 'react-router-dom';

const OrdersFooter = () => {
  return (
    <footer className="border-t border-gray-200 pt-12 mt-12">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

        <div>

          <h2 className="text-3xl font-bold text-[#012d1d]">
            NavaKrishi
          </h2>

          <p className="text-gray-500 mt-4 italic">
            © 2026 NavaKrishi. Cultivating trust through AI.
          </p>
        </div>

        <div>

          <h3 className="font-bold text-[#012d1d] mb-4">
            Resources
          </h3>

          <div className="space-y-3 text-gray-500">
            <Link to="/about" className="block hover:text-[#1f6d1a]">About</Link>
            <Link to="/impact" className="block hover:text-[#1f6d1a]">Impact</Link>
          </div>
        </div>

        <div>

          <h3 className="font-bold text-[#012d1d] mb-4">
            Legal
          </h3>

          <div className="space-y-3 text-gray-500">
            <Link to="/settings#security-privacy" className="block hover:text-[#1f6d1a]">Privacy</Link>
            <Link to="/support" className="block hover:text-[#1f6d1a]">Support</Link>
          </div>
        </div>

        <div>

          <h3 className="font-bold text-[#012d1d] mb-4">
            Sustainability Badge
          </h3>

          <div className="bg-[#f5f5f3] border border-gray-200 rounded-2xl p-4 flex items-center gap-3">

            <div className="w-4 h-4 rounded-full bg-[#1f6d1a]" />

            <p className="text-gray-600">
              Carbon Neutral Operations 2024
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default OrdersFooter;