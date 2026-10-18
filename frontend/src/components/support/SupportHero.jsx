import { useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { animate, utils } from "animejs";

const quickTopics = [
  "AI Yield Forecasting",
  "Order Tracking",
  "Soil Analysis",
  "Payments & Invoices",
];

const SupportHero = ({ searchQuery, onSearchChange }) => {
  const heroRef = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    animate(heroRef.current, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1000,
      ease: "outExpo",
    });

    animate(searchBoxRef.current, {
      scale: [0.9, 1],
      opacity: [0, 1],
      duration: 1200,
      delay: 200,
      ease: "outElastic(1, 0.6)",
    });
  }, []);

  return (
    <section ref={heroRef} className="bg-gradient-to-b from-[#fbf9f8] via-emerald-50/30 to-[#efeded] px-6 py-20 text-center md:py-28 relative overflow-hidden opacity-0">
      <div className="max-w-4xl mx-auto relative z-10">
        <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-widest uppercase border border-emerald-200">
          Knowledge & Assistance
        </span>
        <h1 className="mt-4 text-4xl font-extrabold text-[#012d1d] md:text-6xl font-['Devil_Breeze'] leading-tight">
          How Can We Help You Grow Today?
        </h1>

        <p className="mt-6 text-lg text-gray-600 md:text-xl max-w-2xl mx-auto leading-relaxed">
          Search our comprehensive knowledge base for instant guidance on harvests, marketplace orders, and AI-powered agronomy.
        </p>

        <div ref={searchBoxRef} className="mt-10 relative max-w-3xl mx-auto opacity-0">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 text-2xl pointer-events-none" />

          <input
            type="text"
            placeholder="Search questions, harvest guides, or telemetry..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full bg-white/95 backdrop-blur-md border-2 border-emerald-100 rounded-2xl py-5 pl-16 pr-6 shadow-xl text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition-all text-base"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {quickTopics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => onSearchChange(topic)}
              className={`rounded-full px-5 py-2.5 font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${
                searchQuery === topic
                  ? "bg-[#a4f792] text-[#1f6d1a] shadow-emerald-200"
                  : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportHero;