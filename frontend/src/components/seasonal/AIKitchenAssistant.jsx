import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate } from "animejs";

const AIKitchenAssistant = () => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(cardRef.current, {
            opacity: [0, 1],
            scale: [0.96, 1],
            duration: 1000,
            ease: "outExpo",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section>
      <div
        ref={cardRef}
        className="bg-gradient-to-br from-emerald-50 via-emerald-100/40 to-white rounded-[3rem] p-8 md:p-14 border border-emerald-100 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center opacity-0"
      >
        <div>
          <span className="px-4 py-1.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-mono tracking-widest uppercase border border-emerald-700">
            Smart Culinary Engine
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-[#012d1d] mt-5 leading-tight font-['Devil_Breeze']">
            Cook What's Fresh Today.
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed mt-6">
            Our AI Kitchen Assistant pairs this week's harvested peak produce with tailored gourmet recipes designed for optimal micronutrient absorption.
          </p>

          <div className="space-y-3.5 mt-8 text-[#012d1d] font-bold text-sm">
            <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100">
              <span className="text-xl">⏱️</span> 20 Minutes Farm-to-Table Prep
            </div>
            <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100">
              <span className="text-xl">🥗</span> High Fiber & Anti-inflammatory Profile
            </div>
          </div>

          <Link
            to="/marketplace?search=seasonal"
            className="inline-flex mt-10 bg-[#012d1d] hover:bg-[#1f6d1a] text-emerald-300 hover:text-white px-8 py-4 rounded-2xl font-bold transition shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          >
            Get Recipe & Order Ingredients ➔
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80"
            alt="Fresh seasonal meal"
            className="rounded-3xl h-64 w-full object-cover shadow-md hover:scale-105 transition duration-500"
          />

          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
            alt="Cooked seasonal vegetables"
            className="rounded-3xl h-64 w-full object-cover shadow-md hover:scale-105 transition duration-500"
          />

          <div className="col-span-2 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-lg">
            <h4 className="font-bold text-[#012d1d] flex items-center gap-2 text-base">
              <span>👨‍🍳</span> Chef's Agronomy Tip
            </h4>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed italic">
              "Early spring carrots are naturally high in brix sugar levels today—perfect for roasting whole without adding sweeteners."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIKitchenAssistant;