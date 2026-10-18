import { useEffect, useRef, useState } from "react";
import { animate, utils } from "animejs";

const AISection = () => {
  const sectionRef = useRef(null);
  const accuracyRef = useRef(null);
  const cardsRef = useRef([]);
  const [isVisible, setIsVisible] = useState(false);

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

  useEffect(() => {
    if (!isVisible) return;

    // Stagger Cards Entrance
    animate(cardsRef.current.filter(Boolean), {
      opacity: [0, 1],
      translateY: [40, 0],
      delay: utils.stagger(150),
      duration: 1000,
      ease: "outExpo",
    });

    // Accuracy Counter Animation (0 -> 98.4%)
    if (accuracyRef.current) {
      const obj = { val: 0 };
      animate(obj, {
        val: 98.4,
        duration: 2000,
        ease: "outCubic",
        onUpdate: () => {
          if (accuracyRef.current) {
            accuracyRef.current.innerText = `${obj.val.toFixed(1)}%`;
          }
        },
      });
    }
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="bg-gradient-to-b from-[#f5f5f5] to-emerald-50/40 py-28 px-6 overflow-hidden">
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
        {/* Left */}
        <div>
          <span className="text-emerald-700 font-bold text-sm tracking-widest uppercase px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
            Neural Agronomy
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-[#012d1d] leading-tight mt-4 font-['Devil_Breeze']">
            Precision Agronomy via Neural Intelligence
          </h2>

          <p className="text-gray-600 text-lg mt-6 leading-relaxed">
            Our AI platform fuses satellite imagery, soil sensors, local weather telemetries and farmer inputs to deliver clear, actionable recommendations in real time.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div
              ref={(el) => (cardsRef.current[0] = el)}
              className="bg-white rounded-3xl p-8 shadow-md border border-emerald-100 hover:shadow-xl transition-shadow opacity-0"
            >
              <div className="text-4xl bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center">🛰️</div>
              <h3 className="text-2xl font-bold text-[#012d1d] mt-5">Satellite Insights</h3>
              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                NDVI and multispectral analysis for crop vigor monitoring across expansive field plots.
              </p>
            </div>

            <div
              ref={(el) => (cardsRef.current[1] = el)}
              className="bg-white rounded-3xl p-8 shadow-md border border-emerald-100 hover:shadow-xl transition-shadow opacity-0"
            >
              <div className="text-4xl bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center">🌡️</div>
              <h3 className="text-2xl font-bold text-[#012d1d] mt-5">Microclimate Alerts</h3>
              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                Localized weather anomaly and pest risk alerts tailored precisely to each plot's GPS coordinates.
              </p>
            </div>
          </div>
        </div>

        {/* Right Image & Floating Counter Badge */}
        <div className="relative">
          <div className="rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?auto=format&fit=crop&w=1000&q=80"
              alt="AI Soil Testing Drone"
              className="w-full h-[600px] lg:h-[680px] object-cover"
            />
          </div>

          <div className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-emerald-100 max-w-xs">
            <h3 ref={accuracyRef} className="text-[#1f6d1a] text-4xl md:text-5xl font-extrabold font-mono">
              0.0%
            </h3>
            <p className="text-gray-700 font-semibold mt-2 text-sm">
              Soil nutrient prediction accuracy across 500+ regional plots.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;