import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, createTimeline, stagger } from "animejs";

const impactStats = [
  { target: 150, suffix: "+", label: "Local Farms" },
  { target: 98, suffix: "%", label: "Organic Yield" },
  { target: 100, suffix: "%", label: "Direct Trade" },
];

const missionHighlights = [
  "AI crop intelligence for better season planning",
  "Direct farmer-to-customer marketplace pricing",
  "Lower food miles with local-first sourcing",
  "Smart sensor tracking for optimal soil health",
];

const farmingBadges = [
  "🌾 AI Harvest Intelligence",
  "🍏 100% Certified Organic",
  "🚜 Direct Farm Sourcing",
  "🌍 Zero Carbon Footprint",
  "💧 Smart Precision Irrigation",
  "🤖 Autonomous Drone Monitoring",
];

const farmingGallery = [
  {
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    title: "Greenhouse Tech",
    subtitle: "Automated Climate Control",
  },
  {
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
    title: "Berry Orchards",
    subtitle: "Organic Fruit Cultivation",
  },
  {
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80",
    title: "Precision Tractors",
    subtitle: "AI-Guided Soil Preparation",
  },
];

const MissionSection = () => {
  const sectionRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);
  const statsRefs = useRef([]);
  const highlightRefs = useRef([]);
  const marqueeRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);

  // Scroll Trigger & Anime.js Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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

  // Run Anime.js Timeline when section comes into view
  useEffect(() => {
    if (!isVisible) return;

    // 1. Anime.js Timeline for Cards Entrance
    const tl = createTimeline({
      defaults: { ease: "outExpo" }
    });

    tl.add(leftCardRef.current, {
      opacity: [0, 1],
      translateY: [60, 0],
      duration: 1000,
    }, 0)
    .add(rightCardRef.current, {
      opacity: [0, 1],
      translateY: [60, 0],
      duration: 1000,
    }, 200)
    .add(highlightRefs.current.filter(Boolean), {
      opacity: [0, 1],
      translateX: [-30, 0],
      delay: stagger(100),
      duration: 800,
    }, 500);

    // 2. Anime.js Counter Numbers Animation
    statsRefs.current.forEach((el, index) => {
      if (!el) return;
      const targetVal = impactStats[index].target;
      const obj = { val: 0 };

      animate(obj, {
        val: targetVal,
        duration: 2000,
        ease: "outCubic",
        onUpdate: () => {
          el.innerText = `${Math.round(obj.val)}${impactStats[index].suffix}`;
        },
      });
    });

  }, [isVisible]);

  // Infinite Ticker Animation with Anime.js
  useEffect(() => {
    if (!marqueeRef.current) return;
    animate(marqueeRef.current, {
      translateX: ["0%", "-50%"],
      duration: 25000,
      ease: "linear",
      loop: true,
    });
  }, []);

  return (
    <section
      className="space-y-12 py-6"
      id="mission-section"
      ref={sectionRef}
    >
      {/* INFINITE SCROLLING FARMING MARQUEE / TICKER */}
      <div className="overflow-hidden bg-[#012d1d] py-4 rounded-2xl border border-emerald-800/50 shadow-inner">
        <div ref={marqueeRef} className="flex whitespace-nowrap gap-8 w-max">
          {[...farmingBadges, ...farmingBadges].map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-emerald-300 font-mono text-sm uppercase tracking-widest px-4 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN MISSION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Mission & AI Tech */}
        <div
          ref={leftCardRef}
          className="lg:col-span-7 bg-gradient-to-br from-[#012d1d] via-[#023a26] to-[#012015] rounded-4xl overflow-hidden relative min-h-125 border border-emerald-900/60 shadow-2xl flex flex-col justify-between p-8 md:p-12 opacity-0"
        >
          {/* Subtle Grid Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#a5d0b9 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 text-[#a4f792] px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30">
              <span className="animate-spin-slow">🌱</span>
              <p className="uppercase tracking-[3px] text-xs font-semibold">
                AI Powered Agritech
              </p>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mt-6 font-['Devil_Breeze'] tracking-wide">
              Empowering Local Roots With Intelligence.
            </h2>

            <p className="text-[#b7d3c4] text-base md:text-lg mt-6 leading-relaxed max-w-xl">
              NavaKrishi utilizes deep-learning crop intelligence models to help farmers optimize harvest cycles, predict weather anomalies, and reduce food waste while guaranteeing 100% organic practices.
            </p>

            <ul className="mt-8 space-y-3.5">
              {missionHighlights.map((point, index) => (
                <li
                  key={point}
                  ref={(el) => (highlightRefs.current[index] = el)}
                  className="flex items-center gap-3 text-[#d0e6db] bg-emerald-950/40 px-4 py-2.5 rounded-xl border border-emerald-800/40 opacity-0"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a4f792] shadow-[0_0_8px_#a4f792] shrink-0" />
                  <span className="text-sm md:text-base font-medium">{point}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/marketplace"
                className="bg-[#a4f792] text-[#134e15] px-7 py-3.5 rounded-xl font-bold hover:brightness-110 transition shadow-lg shadow-emerald-950/50 hover:scale-105 active:scale-95"
              >
                Explore Marketplace ➔
              </Link>

              <Link
                to="/about"
                className="border border-emerald-400/40 text-emerald-100 px-7 py-3.5 rounded-xl font-semibold hover:bg-emerald-900/40 transition hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                Learn Our Story
              </Link>
            </div>
          </div>

          {/* Animated Counter Stats */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 border-t border-emerald-800/60 pt-8 mt-10">
            {impactStats.map((item, index) => (
              <div key={item.label} className="bg-emerald-950/50 p-4 rounded-2xl border border-emerald-800/30">
                <h3
                  ref={(el) => (statsRefs.current[index] = el)}
                  className="text-3xl md:text-4xl font-extrabold text-[#a4f792] font-mono"
                >
                  0{item.suffix}
                </h3>
                <p className="text-[#b7d3c4] text-sm mt-1 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Farmer Showcase & Tech Gallery */}
        <div
          ref={rightCardRef}
          className="lg:col-span-5 bg-white border border-emerald-100 rounded-4xl p-6 shadow-xl h-full flex flex-col justify-between opacity-0"
        >
          <div>
            {/* Main Featured Farmer Card */}
            <div className="relative h-60 md:h-68 rounded-3xl overflow-hidden group shadow-md">
              <img
                src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80"
                alt="Farmer in organic field"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-4 right-4 bg-[#dff5d8] text-[#267320] px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                <span>⭐</span> Farmer of the Month
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-2xl font-bold">Elena Rodriguez</h3>
                <p className="text-emerald-300 text-sm">Sun-Soaked Valley Farms • Organic Certified</p>
              </div>
            </div>

            <blockquote className="text-gray-600 italic leading-relaxed mt-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-sm">
              "Using NavaKrishi's AI insights, we've increased our berry yield by 30% while reducing water usage by half."
            </blockquote>

            {/* Scrolling / Animated Mini Farming Gallery */}
            <div className="mt-6">
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3">
                🚜 Smart Agriculture Highlights
              </p>
              <div className="grid grid-cols-3 gap-3">
                {farmingGallery.map((item, idx) => (
                  <div key={idx} className="group relative h-20 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-end p-1.5">
                      <p className="text-[10px] text-white font-bold leading-tight drop-shadow">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/support"
            className="inline-flex w-full items-center justify-center mt-6 py-4 bg-[#012d1d] text-emerald-300 rounded-xl font-bold hover:bg-[#02422b] hover:text-white transition shadow-lg hover:shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Support Elena & Local Farmers ➔
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;