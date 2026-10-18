import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, utils } from "animejs";

const SeasonalHero = () => {
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const alertRef = useRef(null);

  useEffect(() => {
    animate([badgeRef.current, titleRef.current, descRef.current].filter(Boolean), {
      opacity: [0, 1],
      translateY: [40, 0],
      delay: utils.stagger(120),
      duration: 1200,
      ease: "outExpo",
    });

    if (alertRef.current) {
      animate(alertRef.current, {
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 1000,
        delay: 400,
        ease: "outElastic(1, 0.6)",
      });
    }
  }, []);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div>
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2.5 bg-[#dff5d8] text-[#1f6d1a] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-200 shadow-sm opacity-0"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          📍 Sacramento Valley, CA • Mid Spring Harvest
        </div>

        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl font-extrabold text-[#012d1d] mt-6 leading-tight font-['Devil_Breeze'] tracking-wide opacity-0"
        >
          Seasonal Harvest Discovery
        </h1>

        <p
          ref={descRef}
          className="text-gray-600 text-lg md:text-xl leading-relaxed mt-6 max-w-xl opacity-0"
        >
          Our neural agronomy models analyze real-time regional climate, rainfall, and soil telemetry to recommend the freshest, peak-nutrition produce available right now.
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link
            to="/marketplace?search=fresh"
            className="inline-flex bg-[#1f6d1a] hover:bg-[#165412] text-white px-8 py-4 rounded-2xl font-bold transition shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95"
          >
            View Peak Produce ➔
          </Link>

          <Link
            to="/support"
            className="inline-flex border border-[#1f6d1a] text-[#1f6d1a] px-8 py-4 rounded-2xl font-semibold hover:bg-[#dff5d8] transition hover:scale-105 active:scale-95"
          >
            Update GPS Location 📍
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="rounded-[40px] overflow-hidden shadow-2xl border-4 border-white group">
          <img
            src="https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=1000&q=80"
            alt="Seasonal produce in a field"
            className="w-full h-120 md:h-130 object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div
          ref={alertRef}
          className="absolute bottom-6 left-6 right-6 sm:right-auto bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-emerald-100 max-w-sm opacity-0"
        >
          <div className="flex items-center gap-2 text-[#1f6d1a] font-extrabold text-sm uppercase tracking-wider">
            <span>⚡</span> Peak Flavor Alert
          </div>
          <p className="text-gray-700 mt-2 text-sm leading-relaxed font-medium">
            Artisan Asparagus & Heirloom Strawberries have reached maximum nutritional density this morning.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SeasonalHero;