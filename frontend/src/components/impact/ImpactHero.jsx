import { useEffect, useRef } from "react";
import { animate, svg, utils } from "animejs";

const ImpactHero = () => {
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const imgRef = useRef(null);
  const morphPathRef = useRef(null);

  useEffect(() => {
    // 1. Hero Entrance Animations
    animate([badgeRef.current, titleRef.current, descRef.current].filter(Boolean), {
      opacity: [0, 1],
      translateY: [40, 0],
      delay: utils.stagger(120),
      duration: 1200,
      ease: "outExpo",
    });

    animate(imgRef.current, {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 1400,
      ease: "outCubic",
    });

    // 2. SVG Shape Morphing Loop
    if (morphPathRef.current) {
      const shape1 = "M 50,10 Q 90,20 80,60 Q 60,90 20,80 Q 0,40 50,10 Z";
      const shape2 = "M 40,0 Q 100,40 60,90 Q 20,100 0,50 Q 10,10 40,0 Z";
      const shape3 = "M 60,15 Q 80,50 70,85 Q 30,95 10,60 Q 20,20 60,15 Z";

      let current = 0;
      const shapes = [shape1, shape2, shape3];

      const morphNext = () => {
        current = (current + 1) % shapes.length;
        if (!morphPathRef.current) return;
        
        utils.set(morphPathRef.current, { d: shapes[current] });
        animate(morphPathRef.current, {
          d: svg.morphTo(morphPathRef.current),
          duration: 3000,
          ease: "inOutSine",
          onComplete: morphNext,
        });
      };
      morphNext();
    }
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-20 relative overflow-hidden">
      {/* Morphing Background Blob */}
      <svg className="absolute -top-10 -left-10 w-96 h-96 opacity-10 pointer-events-none fill-[#22c55e]" viewBox="0 0 100 100">
        <path ref={morphPathRef} d="M 50,10 Q 90,20 80,60 Q 60,90 20,80 Q 0,40 50,10 Z" />
      </svg>

      <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left */}
        <div>
          <span
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a4f792] text-[#1f6d1a] font-bold text-sm shadow-sm opacity-0"
          >
            <span>🌱</span> Sustainability Report 2026
          </span>

          <h1
            ref={titleRef}
            className="text-5xl lg:text-7xl font-extrabold text-[#012d1d] leading-tight mt-6 font-['Devil_Breeze'] tracking-wide opacity-0"
          >
            Cultivating a Greener Future with AI Precision.
          </h1>

          <p
            ref={descRef}
            className="text-xl text-gray-600 mt-8 leading-relaxed max-w-xl opacity-0"
          >
            At NavaKrishi, we're not just digitizing agriculture; we're healing the planet through AI-driven sustainable farming, zero-carbon logistics, and direct trade.
          </p>
        </div>

        {/* Right */}
        <div
          ref={imgRef}
          className="relative rounded-[40px] overflow-hidden shadow-2xl h-[500px] border border-emerald-100 group opacity-0"
        >
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80"
            alt="Sustainable Farming"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#012d1d]/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 p-6 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 text-white">
            <p className="font-bold text-lg">🌾 100% Verified Carbon Offsets</p>
            <p className="text-sm text-emerald-100 mt-1">Real-time IoT telemetry synced with satellite crop monitoring.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactHero;