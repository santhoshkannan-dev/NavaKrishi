import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";

const metrics = [
  {
    title: "Soil Biodiversity",
    desc: "89% of partner farms improved soil microbial activity within 6 months.",
    icon: "🌿",
    highlight: "89% Improved",
  },
  {
    title: "Fair Pricing",
    desc: "Direct-to-consumer marketplace model increased farmer revenue by 22%.",
    icon: "💰",
    highlight: "+22% Revenue",
  },
  {
    title: "Pesticide Reduction",
    desc: "AI precision spraying advice reduced synthetic chemical usage by 45,000kg.",
    icon: "🧪",
    highlight: "45,000kg Saved",
  },
];

const TripleBottomLine = () => {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Anime.js Stagger Pop-in
          animate(cardRefs.current.filter(Boolean), {
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.9, 1],
            delay: utils.stagger(150),
            duration: 1000,
            ease: "outBack(1.5)",
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
    <section ref={containerRef} className="bg-gradient-to-b from-emerald-50/60 to-white py-24 px-6 border-y border-emerald-100/60">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-emerald-700 font-bold text-sm tracking-widest uppercase px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
            Holistic Agriculture
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-[#012d1d] mt-4 font-['Devil_Breeze']">
            Our Triple Bottom Line
          </h2>
          <p className="text-gray-600 text-lg md:text-xl mt-4 leading-relaxed">
            We measure agrarian success far beyond financial profits—focusing equally on ecological restoration and farmer livelihoods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {metrics.map((item, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="bg-white rounded-[32px] p-8 md:p-10 border border-emerald-100 shadow-xl text-center flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-300 opacity-0 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none group-hover:bg-emerald-100 transition-colors" />

              <div>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f0ffe9] to-emerald-100 flex items-center justify-center mx-auto text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-[#012d1d] mt-6">
                  {item.title}
                </h3>

                <p className="text-gray-600 mt-4 text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-emerald-50">
                <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-900 text-emerald-300 text-xs font-bold font-mono tracking-wider">
                  {item.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TripleBottomLine;