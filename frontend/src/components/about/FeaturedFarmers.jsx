import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";

const FeaturedFarmers = () => {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(cardRefs.current.filter(Boolean), {
            opacity: [0, 1],
            translateY: [40, 0],
            delay: utils.stagger(150),
            duration: 1000,
            ease: "outExpo",
          });
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

  return (
    <section ref={sectionRef} className="max-w-[1440px] mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-emerald-700 font-bold text-sm tracking-widest uppercase px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
          Community Voices
        </span>
        <h2 className="text-4xl md:text-6xl font-extrabold text-[#012d1d] mt-4 font-['Devil_Breeze']">
          Stories from Our Farmers
        </h2>
        <p className="text-gray-600 mt-4 text-lg max-w-3xl mx-auto">
          Real results from real farms: how small localized technological improvements led to meaningful gains in yield and household income.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Main Farmer */}
        <div
          ref={(el) => (cardRefs.current[0] = el)}
          className="lg:col-span-8 relative rounded-[32px] overflow-hidden shadow-xl group min-h-[450px] opacity-0"
        >
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80"
            alt="Ananya Sharma in wheat field"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#012d1d]/90 via-[#012d1d]/30 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8 text-white max-w-lg">
            <span className="bg-[#1f6d1a] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
              Case Study • Organic Wheat
            </span>
            <h3 className="text-3xl font-extrabold mt-4">Ananya Sharma</h3>
            <p className="mt-2 text-base text-gray-200 leading-relaxed">
              Implemented targeted AI nutrient plans and saw a 40% yield improvement over two consecutive seasons while reducing fertilizer costs by 25%.
            </p>
          </div>
        </div>

        {/* Side Card */}
        <div
          ref={(el) => (cardRefs.current[1] = el)}
          className="lg:col-span-4 bg-gradient-to-b from-white to-emerald-50/50 rounded-[32px] p-8 border border-emerald-100 shadow-lg flex flex-col justify-between opacity-0"
        >
          <div>
            <div className="flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Marcus Thorne"
                className="w-16 h-16 rounded-full border-4 border-[#a4f792] shadow"
              />
              <div>
                <h3 className="text-xl font-bold text-[#012d1d]">Marcus Thorne</h3>
                <p className="text-xs font-bold text-[#1f6d1a] uppercase tracking-wider mt-0.5">Precision Irrigation Specialist</p>
              </div>
            </div>

            <blockquote className="text-gray-600 mt-6 leading-relaxed italic bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm text-sm">
              "NavaKrishi's recommendations helped me cut water usage by 30% while maintaining prime yields. The localized microclimate alerts are truly game-changing."
            </blockquote>
          </div>

          <a
            href="/support"
            className="mt-8 inline-flex items-center justify-center w-full py-4 bg-[#012d1d] text-emerald-300 rounded-2xl font-bold hover:bg-[#024a30] transition shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Read Full Success Story ➔
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedFarmers;