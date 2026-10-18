import { useState, useRef, useEffect } from "react";
import { animate } from "animejs";

const seasons = [
  {
    name: "Early Spring",
    heroTitle: "Tender Greens & Radishes",
    heroSub: "Harvesting Now: High Folate & Vitamin C",
    heroImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80",
    activeTitle: "Heritage Strawberries",
    activeImage: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
    sideTitle: "Sweet Peas",
    sideImage: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80",
    preview: "Heirloom Tomatoes arriving in 22 days.",
  },
  {
    name: "Peak Summer",
    heroTitle: "Tomatoes & Sweet Corn",
    heroSub: "Harvesting Now: Lycopene-rich sun-ripened varieties",
    heroImage: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1000&q=80",
    activeTitle: "Stone Fruits",
    activeImage: "https://images.unsplash.com/photo-1595124245030-41448b199d6b?auto=format&fit=crop&w=800&q=80",
    sideTitle: "Fresh Basil",
    sideImage: "https://images.unsplash.com/photo-1618375531912-867984bdfd87?auto=format&fit=crop&w=600&q=80",
    preview: "Early autumn pumpkin lots in 31 days.",
  },
  {
    name: "Autumn Harvest",
    heroTitle: "Pumpkins & Root Veggies",
    heroSub: "Harvesting Now: Fiber-rich seasonal comfort produce",
    heroImage: "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1000&q=80",
    activeTitle: "Late Apples",
    activeImage: "https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?auto=format&fit=crop&w=800&q=80",
    sideTitle: "Butternut Squash",
    sideImage: "https://images.unsplash.com/photo-1662627325396-0b3f7f0d14d8?auto=format&fit=crop&w=600&q=80",
    preview: "Winter citrus arrivals expected in 18 days.",
  },
];

const HarvestCalendar = () => {
  const [index, setIndex] = useState(0);
  const gridRef = useRef(null);
  const active = seasons[index];

  const triggerTransition = (newIdx) => {
    if (gridRef.current) {
      animate(gridRef.current, {
        opacity: [1, 0.4, 1],
        scale: [1, 0.98, 1],
        duration: 400,
        ease: "inOutSine",
      });
    }
    setIndex(newIdx);
  };

  const showPrev = () => triggerTransition((index - 1 + seasons.length) % seasons.length);
  const showNext = () => triggerTransition((index + 1) % seasons.length);

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <span className="text-emerald-700 font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
            Agronomy Cycles
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#012d1d] mt-3 font-['Devil_Breeze']">
            The Harvest Calendar
          </h2>
          <p className="text-gray-600 mt-2 text-base md:text-lg">Curated produce based on optimal regional growth cycles.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:inline-flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-2xl text-xs text-[#1f6d1a] font-bold border border-emerald-200 font-mono">
            Active Window: {active.name}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={showPrev}
              className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-lg text-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 active:scale-95 cursor-pointer"
              aria-label="Previous season"
            >
              ←
            </button>
            <button
              type="button"
              onClick={showNext}
              className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-lg text-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 active:scale-95 cursor-pointer"
              aria-label="Next season"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-[220px]">
        <div className="lg:col-span-2 lg:row-span-2 rounded-[32px] overflow-hidden relative group shadow-xl">
          <img
            src={active.heroImage}
            alt={active.heroTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <span className="bg-emerald-500/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{active.name}</span>
            <h3 className="text-3xl md:text-4xl font-bold mt-4 font-['Devil_Breeze']">{active.heroTitle}</h3>
            <p className="mt-2 text-emerald-100/90 text-sm">{active.heroSub}</p>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[32px] overflow-hidden relative group shadow-lg">
          <img
            src={active.activeImage}
            alt={active.activeTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-xs uppercase tracking-widest text-emerald-300 font-mono">Active Peak Selection</p>
            <h3 className="text-2xl md:text-3xl font-bold mt-1">{active.activeTitle}</h3>
          </div>
        </div>

        <div className="rounded-[32px] overflow-hidden relative shadow-md group">
          <img
            src={active.sideImage}
            alt={active.sideTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-5 left-5 text-white font-bold text-lg">{active.sideTitle}</div>
        </div>

        <div className="bg-gradient-to-br from-[#3d3c2f] to-[#25241c] rounded-[32px] flex items-center justify-center text-center p-6 shadow-md border border-amber-950/40">
          <div>
            <div className="text-4xl opacity-60 animate-bounce">☀️</div>
            <h3 className="text-white text-xl font-bold mt-3 font-['Devil_Breeze']">Upcoming Batch</h3>
            <p className="text-amber-200/90 mt-2 text-xs leading-relaxed font-mono">{active.preview}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HarvestCalendar;