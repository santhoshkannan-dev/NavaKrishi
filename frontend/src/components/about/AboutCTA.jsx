import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate } from "animejs";

const AboutCTA = () => {
  const ctaRef = useRef(null);

  useEffect(() => {
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

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ctaRef} className="text-center py-24 px-6 opacity-0">
      <div className="max-w-4xl mx-auto bg-gradient-to-b from-emerald-50/50 to-white p-12 md:p-16 rounded-[40px] border border-emerald-100 shadow-xl">
        <span className="text-emerald-700 font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
          Get Started Today
        </span>
        <h2 className="text-4xl md:text-6xl font-extrabold text-[#012d1d] mt-4 font-['Devil_Breeze']">
          Be Part of the Growth
        </h2>

        <p className="text-gray-600 text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
          Whether you're a farmer looking to modernize yield or a buyer seeking pure organic produce, there is a place for you in the NavaKrishi ecosystem.
        </p>

        <div className="flex flex-wrap justify-center gap-5 mt-10">
          <Link
            to="/sign-up"
            className="inline-block bg-[#1f6d1a] text-white px-10 py-4 rounded-full font-bold shadow-lg hover:bg-[#165212] hover:scale-105 active:scale-95 transition"
          >
            Get Started Today ➔
          </Link>

          <a
            href="/whitepaper.pdf"
            className="inline-block border-2 border-[#012d1d] text-[#012d1d] px-10 py-4 rounded-full font-bold hover:bg-[#012d1d] hover:text-white hover:scale-105 active:scale-95 transition"
          >
            Download Whitepaper 📄
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;