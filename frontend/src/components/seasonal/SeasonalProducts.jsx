import { useEffect, useRef } from "react";
import SeasonalProductCard from "./SeasonalProductCard";
import { animate, utils } from "animejs";

const products = [
  {
    title: "Rainbow Heirloom Carrots",
    farm: "Green Valley Farms",
    price: "₹4.50/lb",
    score: "98",
    image: "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=600&q=80",
    tags: ["Organic", "Low Carbon"],
  },
  {
    title: "Artisan Asparagus",
    farm: "Sun-Kissed Acres",
    price: "₹6.00/btl",
    score: "94",
    image: "https://images.unsplash.com/photo-1610655987682-ae34ac15e26f?auto=format&fit=crop&w=600&q=80",
    tags: ["No Pesticide", "Fresh"],
  },
  {
    title: "Early Scarlet Radishes",
    farm: "Riverside Organic",
    price: "₹3.25/bn",
    score: "92",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
    tags: ["Quick Harvest", "Local"],
  },
  {
    title: "Wildflower Honey",
    farm: "Busy Bee Apiary",
    price: "₹12.00/jr",
    score: "99",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    tags: ["Raw", "Bee Friendly"],
  },
];

const SeasonalProducts = () => {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(cardRefs.current.filter(Boolean), {
            opacity: [0, 1],
            translateY: [40, 0],
            delay: utils.stagger(120),
            duration: 1000,
            ease: "outExpo",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="space-y-10">
      <div>
        <span className="text-emerald-700 font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
          Fresh Batch
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#012d1d] mt-3 font-['Devil_Breeze']">
          What's in Season Now
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch">
        {products.map((product, idx) => (
          <div key={product.title} ref={(el) => (cardRefs.current[idx] = el)} className="opacity-0">
            <SeasonalProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SeasonalProducts;