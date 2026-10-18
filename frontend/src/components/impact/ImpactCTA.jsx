import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, svg, utils } from "animejs";

const ImpactCTA = () => {
  const ctaRef = useRef(null);
  const morphRef = useRef(null);

  useEffect(() => {
    // 1. Scroll Entrance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(ctaRef.current, {
            opacity: [0, 1],
            scale: [0.95, 1],
            duration: 1000,
            ease: "outExpo",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    // 2. Continuous SVG Morphing Circle
    if (morphRef.current) {
      const p1 = "M 50,0 C 80,10 100,40 90,80 C 70,100 20,90 0,60 C -10,30 20,-10 50,0 Z";
      const p2 = "M 50,0 C 100,20 80,80 60,100 C 20,90 0,70 10,30 C 20,0 30,-20 50,0 Z";
      
      let flag = false;
      const morphLoop = () => {
        flag = !flag;
        if (!morphRef.current) return;
        utils.set(morphRef.current, { d: flag ? p2 : p1 });
        animate(morphRef.current, {
          d: svg.morphTo(morphRef.current),
          duration: 4000,
          ease: "inOutSine",
          onComplete: morphLoop,
        });
      };
      morphLoop();
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-20">
      <div
        ref={ctaRef}
        className="bg-gradient-to-br from-[#012d1d] via-[#023e2a] to-[#011a11] rounded-[40px] overflow-hidden relative p-10 sm:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl border border-emerald-900/60 opacity-0"
      >
        {/* Left Info */}
        <div className="max-w-2xl relative z-10">
          <span className="px-4 py-1.5 rounded-full bg-emerald-900/80 text-emerald-300 text-xs font-mono tracking-widest uppercase border border-emerald-700/50">
            Join The Revolution
          </span>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mt-6 font-['Devil_Breeze']">
            Be Part Of The Growth.
          </h2>

          <p className="text-emerald-100/90 text-lg sm:text-xl mt-6 leading-relaxed">
            Whether you are an organic farmer seeking fair pricing or a conscious consumer demanding fresh produce, NavaKrishi is your sustainable AI-powered partner.
          </p>

          <div className="flex flex-wrap gap-5 mt-10">
            <Link
              to="/marketplace"
              className="bg-[#a4f792] text-[#012d1d] px-8 py-4 rounded-2xl font-bold hover:scale-[1.04] active:scale-95 transition shadow-lg shadow-emerald-950/60"
            >
              Get Started Now ➔
            </Link>

            <Link
              to="/about"
              className="border border-[#a4f792]/40 text-[#a4f792] px-8 py-4 rounded-2xl font-bold hover:bg-[#a4f792] hover:text-[#012d1d] transition hover:scale-[1.04] active:scale-95 backdrop-blur-sm"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right Morphing Aura */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full fill-emerald-500/20 pointer-events-none" viewBox="-20 -20 140 140">
              <path ref={morphRef} d="M 50,0 C 80,10 100,40 90,80 C 70,100 20,90 0,60 C -10,30 20,-10 50,0 Z" />
            </svg>
            <div className="w-56 h-56 rounded-full border border-white/20 flex items-center justify-center text-8xl shadow-inner bg-emerald-950/40 backdrop-blur-md">
              🌱
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>
    </section>
  );
};

export default ImpactCTA;