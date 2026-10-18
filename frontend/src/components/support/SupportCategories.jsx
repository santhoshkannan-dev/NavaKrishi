import { useEffect, useRef } from "react";
import { FiShoppingBag, FiTruck, FiUsers, FiCpu } from "react-icons/fi";
import { animate, utils } from "animejs";

const SupportCategories = ({ onSelectTopic }) => {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(cardRefs.current.filter(Boolean), {
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.95, 1],
            delay: utils.stagger(120),
            duration: 1000,
            ease: "outExpo",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSelect = (topic) => {
    if (onSelectTopic) {
      onSelectTopic(topic);
    }
  };

  return (
    <section ref={sectionRef} className="max-w-360 mx-auto px-6 py-24">
      <div className="mb-14">
        <span className="text-emerald-700 font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
          Guided Learning
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#012d1d] mt-3 font-['Devil_Breeze']">
          Browse by Category
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Explore detailed agronomy and marketplace guides curated for every stage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <button
          ref={(el) => (cardRefs.current[0] = el)}
          type="button"
          onClick={() => handleSelect("Orders & Marketplace")}
          className="text-left md:col-span-8 bg-white rounded-3xl border border-emerald-100 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 group opacity-0 hover:-translate-y-1 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FiShoppingBag className="text-[#1f6d1a] text-3xl" />
          </div>

          <h3 className="text-3xl font-bold text-[#012d1d] mt-8 group-hover:text-[#1f6d1a] transition-colors">
            Orders & Marketplace
          </h3>

          <p className="text-gray-500 mt-3 text-base">
            Managing produce listings, verified buyer transactions, and order fulfillment.
          </p>
        </button>

        <button
          ref={(el) => (cardRefs.current[1] = el)}
          type="button"
          onClick={() => handleSelect("AI Recommendations")}
          className="text-left md:col-span-4 bg-gradient-to-br from-[#012d1d] to-[#02402b] text-white rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 group opacity-0 hover:-translate-y-1 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-800/80 border border-emerald-600/50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FiCpu className="text-emerald-300 text-3xl" />
          </div>

          <h3 className="mt-8 text-3xl font-bold font-['Devil_Breeze'] tracking-wide">
            AI Recommendations
          </h3>

          <p className="mt-3 text-emerald-100/80 text-sm">
            Predictive analytics for crop health, pest prevention, and weather risk.
          </p>

          <span className="mt-8 inline-block rounded-2xl bg-emerald-500 text-emerald-950 px-5 py-3 font-bold text-xs uppercase tracking-wider group-hover:bg-[#a4f792] transition-colors">
            Explore AI Guides →
          </span>
        </button>

        <button
          ref={(el) => (cardRefs.current[2] = el)}
          type="button"
          onClick={() => handleSelect("Farmers Community")}
          className="text-left md:col-span-4 bg-white rounded-3xl border border-emerald-100 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 group opacity-0 hover:-translate-y-1 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FiUsers className="text-[#1f6d1a] text-3xl" />
          </div>

          <h3 className="text-3xl font-bold mt-6 text-[#012d1d] group-hover:text-[#1f6d1a] transition-colors">
            Farmers Community
          </h3>
          <p className="text-gray-500 mt-3 text-sm">
            Engage directly with regional organic growers and agronomist specialists.
          </p>
        </button>

        <button
          ref={(el) => (cardRefs.current[3] = el)}
          type="button"
          onClick={() => handleSelect("Shipping & Logistics")}
          className="text-left md:col-span-8 bg-white rounded-3xl border border-emerald-100 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8 items-center group opacity-0 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex-1">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiTruck className="text-[#1f6d1a] text-3xl" />
            </div>

            <h3 className="text-3xl font-bold mt-6 text-[#012d1d] group-hover:text-[#1f6d1a] transition-colors">
              Shipping & Logistics
            </h3>

            <p className="text-gray-500 mt-3 text-sm">
              Real-time cold-chain tracking, low food miles, and regional distribution nodes.
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
            alt="Delivery and logistics"
            className="w-full md:w-64 h-44 rounded-2xl object-cover group-hover:scale-105 transition-transform duration-500 shadow"
          />
        </button>
      </div>
    </section>
  );
};

export default SupportCategories;