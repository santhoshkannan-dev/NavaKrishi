import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, onScroll, utils } from "animejs";

const monthlyData = [
  { month: "Jan", height: "40%", val: "310t" },
  { month: "Feb", height: "55%", val: "420t" },
  { month: "Mar", height: "48%", val: "380t" },
  { month: "Apr", height: "72%", val: "560t" },
  { month: "May", height: "85%", val: "620t" },
  { month: "Jun", height: "100%", val: "684t", active: true },
];

const AnalyticsGrid = () => {
  const sectionRef = useRef(null);
  const chartBarsRef = useRef([]);
  const waterCounterRef = useRef(null);
  const producersCounterRef = useRef(null);
  const progressBarRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
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
    if (!hasAnimated) return;

    // 1. Chart Bars Growth Animation
    chartBarsRef.current.filter(Boolean).forEach((bar, idx) => {
      const targetHeight = monthlyData[idx].height;
      animate(bar, {
        height: ["0%", targetHeight],
        duration: 1200 + idx * 100,
        ease: "outElastic(1, 0.5)",
      });
    });

    // 2. Water Conservation Counter (0 -> 1.2M)
    if (waterCounterRef.current) {
      const obj = { val: 0 };
      animate(obj, {
        val: 1.2,
        duration: 2000,
        ease: "outCubic",
        onUpdate: () => {
          if (waterCounterRef.current) {
            waterCounterRef.current.innerText = `${obj.val.toFixed(1)}M`;
          }
        },
      });
    }

    // 3. Active Producers Counter (0 -> 4,281)
    if (producersCounterRef.current) {
      const obj = { val: 0 };
      animate(obj, {
        val: 4281,
        duration: 2200,
        ease: "outCubic",
        onUpdate: () => {
          if (producersCounterRef.current) {
            producersCounterRef.current.innerText = Math.round(obj.val).toLocaleString();
          }
        },
      });
    }

    // 4. Progress Bar Fill
    if (progressBarRef.current) {
      animate(progressBarRef.current, {
        width: ["0%", "82%"],
        duration: 1800,
        ease: "outExpo",
      });
    }
  }, [hasAnimated]);

  return (
    <section ref={sectionRef} className="max-w-[1440px] mx-auto px-6 py-16">
      <div className="mb-16">
        <span className="text-emerald-600 font-bold text-sm tracking-widest uppercase">Telemetry Insights</span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#012d1d] mt-2 font-['Devil_Breeze']">
          Real-Time Impact Analytics
        </h2>
        <p className="text-gray-500 mt-3 text-lg">
          Validated ecological data direct from our network of partner farms.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Chart Card */}
        <div className="xl:col-span-8 bg-white rounded-[32px] p-8 md:p-10 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#012d1d]">CO2 Emission Reduction</h3>
              <p className="text-gray-500 mt-1">Metric tons of carbon saved through local-first logistics</p>
            </div>
            <div className="bg-[#f0ffe9] p-4 rounded-2xl text-[#1f6d1a] text-2xl shadow-inner">
              ☁️
            </div>
          </div>

          {/* Animated Chart Bars */}
          <div className="flex items-end gap-3 sm:gap-6 h-72 pt-8 border-b border-gray-100">
            {monthlyData.map((item, idx) => (
              <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div
                  ref={(el) => (chartBarsRef.current[idx] = el)}
                  className={`w-full rounded-t-2xl relative transition-colors duration-300 ${
                    item.active ? "bg-gradient-to-t from-[#134e15] to-[#22c55e]" : "bg-emerald-100 hover:bg-emerald-200"
                  }`}
                  style={{ height: "0%" }}
                >
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#012d1d] text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.val}
                  </span>
                </div>
                <span className="mt-3 text-sm font-semibold text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Water Card */}
        <div className="xl:col-span-4 bg-gradient-to-br from-[#012d1d] via-[#023e2a] to-[#012015] text-white rounded-[32px] p-8 md:p-10 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold">Water Optimization</h3>
            <p className="text-emerald-200/80 mt-2 text-sm">Liters conserved using AI soil moisture sensors</p>

            <h2 ref={waterCounterRef} className="text-6xl md:text-7xl font-extrabold text-[#a4f792] mt-12 font-mono drop-shadow-[0_0_15px_rgba(164,247,146,0.4)]">
              0.0M
            </h2>
            <p className="text-gray-300 mt-2 font-medium">Liters saved this quarter across 150+ regions</p>
          </div>

          <button className="relative z-10 mt-10 w-full bg-[#a4f792] text-[#012d1d] py-4 rounded-2xl font-bold hover:brightness-110 transition shadow-lg hover:scale-[1.02] active:scale-[0.98]">
            View Telemetry Log →
          </button>

          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        </div>

        {/* Ecosystem */}
        <div className="xl:col-span-5 bg-emerald-50/50 rounded-[32px] p-8 md:p-10 border border-emerald-100 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#012d1d]">Farm Ecosystem Growth</h3>
            <div className="flex justify-between items-end mt-8">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase">Active Producers</p>
                <h2 ref={producersCounterRef} className="text-4xl md:text-5xl font-extrabold text-[#012d1d] mt-1 font-mono">
                  0
                </h2>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm font-semibold uppercase">Growth Rate</p>
                <h2 className="text-3xl font-bold text-[#1f6d1a] mt-1">+12.4%</h2>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full h-4 bg-emerald-200/60 rounded-full mt-8 overflow-hidden p-0.5 border border-emerald-300/40">
              <div ref={progressBarRef} className="h-full bg-gradient-to-r from-emerald-600 to-[#22c55e] rounded-full shadow-sm" style={{ width: "0%" }} />
            </div>
          </div>

          <p className="text-gray-600 italic text-sm mt-6 bg-white p-3 rounded-xl border border-emerald-100">
            💡 82% of onboarded producers are small-scale family organic farms.
          </p>
        </div>

        {/* Farmers Image Quote */}
        <div className="xl:col-span-7 relative rounded-[32px] overflow-hidden min-h-[400px] shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1000&q=80"
            alt="Farmer in field"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/40 shadow-xl">
            <p className="text-[#012d1d] text-base md:text-lg font-semibold italic">
              "NavaKrishi's AI insights helped us reduce water usage by 30% while increasing our organic harvest yield by 15%."
            </p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-emerald-800 font-bold text-sm">— Maria Silva, Family Orchards</p>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Verified Partner</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsGrid;