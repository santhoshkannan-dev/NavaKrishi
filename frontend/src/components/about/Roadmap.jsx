import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";

const steps = [
  {
    id: "01",
    title: "Universal Access",
    desc: "Bring low-cost agronomy models and direct market inputs to smallholder farms across all regional territories.",
  },
  {
    id: "02",
    title: "Zero-Waste Chain",
    desc: "Reduce post-harvest loss through predictive demand forecasting and regional micro-fulfillment centers.",
  },
  {
    id: "03",
    title: "Carbon Sequestration",
    desc: "Support regenerative farming practices and verify soil carbon capture outcomes for direct farmer payouts.",
  },
  {
    id: "04",
    title: "Autonomous Ecology",
    desc: "Leverage IoT sensors and autonomous drones to optimize water, nutrients, and bio-diverse ecosystems.",
  },
];

const Roadmap = () => {
  const containerRef = useRef(null);
  const stepRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(stepRefs.current.filter(Boolean), {
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.9, 1],
            delay: utils.stagger(150),
            duration: 1000,
            ease: "outBack(1.4)",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="max-w-[1440px] mx-auto px-6 py-24">
      <div className="bg-gradient-to-br from-[#012d1d] via-[#023e2a] to-[#011d13] rounded-[40px] p-10 md:p-16 relative overflow-hidden shadow-2xl border border-emerald-900/60">
        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
          <span className="px-4 py-1.5 rounded-full bg-emerald-900/80 text-emerald-300 text-xs font-mono tracking-widest uppercase border border-emerald-700/50">
            Strategic Vision
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mt-4 font-['Devil_Breeze']">
            Our 2030 Roadmap
          </h2>
          <p className="text-emerald-200/80 text-base md:text-lg mt-3">
            Building the next generation of sustainable agricultural intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              ref={(el) => (stepRefs.current[idx] = el)}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-emerald-100/50 flex flex-col justify-between opacity-0 group hover:-translate-y-2 transition-transform duration-300"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#a4f792] to-emerald-400 flex items-center justify-center font-extrabold text-[#1f6d1a] text-xl shadow-md font-mono group-hover:scale-110 transition-transform">
                  {step.id}
                </div>

                <h3 className="text-2xl font-bold text-[#012d1d] mt-6">
                  {step.title}
                </h3>

                <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Background Ambient Sprout */}
        <div className="absolute -bottom-20 -right-20 text-[300px] opacity-5 pointer-events-none select-none">
          🌱
        </div>
      </div>
    </section>
  );
};

export default Roadmap;