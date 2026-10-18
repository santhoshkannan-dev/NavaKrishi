import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { animate, utils } from "animejs";

const HeroSection = () => {
  const containerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const btnRef = useRef(null);

  // Framer Motion Parallax setup for high performance scroll zoom
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const scale = useSpring(rawScale, { stiffness: 100, damping: 30 });

  const rawY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y = useSpring(rawY, { stiffness: 100, damping: 30 });

  const rawOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const opacity = useSpring(rawOpacity, { stiffness: 100, damping: 30 });

  useEffect(() => {
    animate([badgeRef.current, titleRef.current, descRef.current, btnRef.current].filter(Boolean), {
      opacity: [0, 1],
      translateY: [40, 0],
      delay: utils.stagger(120),
      duration: 1200,
      ease: "outExpo",
    });
  }, []);

  return (
    <section ref={containerRef} className="relative h-150 md:h-160 rounded-4xl overflow-hidden shadow-2xl">
      {/* Background Image with Zoom Parallax */}
      <motion.img
        src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80"
        alt="Fresh organic harvest field"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ scale }}
      />

      {/* Dark overlay fading on scroll */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#012d1d]/90 via-[#012d1d]/60 to-transparent"
        style={{ opacity }}
      />

      {/* Text Content translating and fading on scroll */}
      <motion.div 
        className="absolute inset-0 flex items-center px-8 md:px-16 z-10"
        style={{ y, opacity }}
      >
        <div className="max-w-2xl text-white">
          <span
            ref={badgeRef}
            className="inline-block bg-[#a4f792] text-[#134e15] px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-md opacity-0"
          >
            🌱 DIRECT FROM SOIL TO TABLE
          </span>

          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl font-extrabold leading-tight mt-6 font-['Devil_Breeze'] tracking-wide opacity-0"
          >
            Cultivating Trust, Delivering Freshness.
          </h1>

          <p
            ref={descRef}
            className="mt-6 text-base md:text-lg text-emerald-100/90 leading-relaxed max-w-xl opacity-0"
          >
            Empowering sustainable agriculture through AI-driven telemetry insights. Connect directly with verified local farmers and experience truly organic harvests.
          </p>

          <div ref={btnRef} className="flex flex-wrap gap-4 md:gap-5 mt-8 md:mt-10 opacity-0">
            <Link to="/marketplace">
              <button className="bg-[#1f6d1a] hover:bg-[#165412] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-bold transition shadow-lg shadow-emerald-950/50 hover:scale-105 active:scale-95 cursor-pointer">
                Shop All Fresh ➔
              </button>
            </Link>

            <Link to="/about">
              <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-semibold hover:bg-white/20 transition hover:scale-105 active:scale-95 cursor-pointer">
                Our Story
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;