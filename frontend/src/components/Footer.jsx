import {
  FiGlobe,
  FiRss,
  FiFacebook,
} from "react-icons/fi";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#e9e7e5] border-t border-gray-300 mt-32">
      
      <div className="max-w-360 mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Logo */}
        <div>
          <h2 className="text-3xl font-bold text-[#012d1d]">
            NavaKrishi
          </h2>

          <p className="text-gray-600 mt-6 leading-relaxed">
            © 2026 NavaKrishi. Cultivating trust through AI.
            Supporting sustainable and high-yield organic farming.
          </p>

          <div className="flex gap-5 mt-6 text-2xl text-[#012d1d]">
            <a href="https://facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:opacity-70">
              <FiFacebook />
            </a>
            <Link to="/about" aria-label="Website" className="hover:opacity-70">
              <FiGlobe />
            </Link>
            <Link to="/support" aria-label="RSS" className="hover:opacity-70">
              <FiRss />
            </Link>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-xl font-bold text-[#012d1d] mb-6">
            Quick Links
          </h3>

          <ul className="space-y-4 text-gray-600">
            <li>
              <Link to="/about" className="hover:text-[#1f6d1a]">About</Link>
            </li>
            <li>
              <Link to="/impact" className="hover:text-[#1f6d1a]">Impact</Link>
            </li>
            <li>
              <Link to="/settings#security-privacy" className="hover:text-[#1f6d1a]">Privacy</Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-[#1f6d1a]">Support</Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-xl font-bold text-[#012d1d] mb-6">
            Resources
          </h3>

          <ul className="space-y-4 text-gray-600">
            <li>
              <Link to="/farmer-dashboard" className="hover:text-[#1f6d1a]">Farmer Portal</Link>
            </li>

            <li>
              <Link to="/support" className="hover:text-[#1f6d1a]">Sustainability Reports</Link>
            </li>

            <li>
              <Link to="/farmer/ai-insights" className="hover:text-[#1f6d1a]">AI Insights Blog</Link>
            </li>

            <li>
              <Link to="/support" className="hover:text-[#1f6d1a]">Affiliate Program</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-bold text-[#012d1d] mb-6">
            Join the Harvest
          </h3>

          <p className="text-gray-600 leading-relaxed">
            Subscribe for weekly fresh box notifications and AI planting tips.
          </p>

          <div className="flex mt-6">
            
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-4 rounded-l-xl border border-gray-300 outline-none"
            />

            <button className="bg-[#012d1d] text-white px-6 rounded-r-xl hover:bg-[#021f14] transition">
              →
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;