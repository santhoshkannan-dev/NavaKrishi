import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";

const AboutHero = () => {
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    animate([badgeRef.current, titleRef.current, descRef.current].filter(Boolean), {
      opacity: [0, 1],
      translateY: [40, 0],
      delay: utils.stagger(120),
      duration: 1200,
      ease: "outExpo",
    });
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-10">
      <div className="relative h-[600px] md:h-[650px] rounded-[40px] overflow-hidden shadow-2xl group">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=60"
          alt="Farmer inspecting crops at sunrise"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#012d1d]/95 via-[#012d1d]/40 to-transparent" aria-hidden />

        <div className="absolute bottom-12 md:bottom-16 left-8 md:left-16 right-8 max-w-3xl text-white z-10">
          <span
            ref={badgeRef}
            className="inline-block bg-[#a4f792] text-[#1f6d1a] px-5 py-2 rounded-full font-extrabold text-sm shadow-md tracking-wider uppercase opacity-0"
          >
            🌱 EST. 2026 • AGRITECH INNOVATION
          </span>

          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-extrabold leading-tight mt-6 font-['Devil_Breeze'] tracking-wide opacity-0"
          >
            Roots in Tradition. Science for Tomorrow.
          </h1>

          <p
            ref={descRef}
            className="text-lg md:text-xl text-gray-200 mt-6 leading-relaxed max-w-xl opacity-0"
          >
            NavaKrishi combines decades of field agricultural wisdom with cutting-edge artificial intelligence to help small and medium farms maximize yield, eliminate middlemen, and protect agrarian soil.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;