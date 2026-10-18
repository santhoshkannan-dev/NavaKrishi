import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { productsAPI } from "../api/marketplace";
import { formatWithUnit } from "../utils/currency";

const VISIBLE_COUNT = 4;
const SHUFFLE_INTERVAL_MS = 8000;

const normalizeProductsResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const shuffleArray = (items) => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[randomIndex]] = [nextItems[randomIndex], nextItems[index]];
  }

  return nextItems;
};

const getWindowedProducts = (items, startIndex) => {
  if (!items.length) {
    return [];
  }

  const windowSize = Math.min(VISIBLE_COUNT, items.length);
  const windowedProducts = [];

  for (let offset = 0; offset < windowSize; offset += 1) {
    windowedProducts.push(items[(startIndex + offset) % items.length]);
  }

  return windowedProducts;
};

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await productsAPI.getAllProducts({});
        const normalizedProducts = normalizeProductsResponse(data);

        if (isMounted) {
          setProducts(shuffleArray(normalizedProducts));
          setStartIndex(0);
        }
      } catch (loadError) {
        if (isMounted) {
          setError("Unable to load fresh picks right now.");
          console.error(loadError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (products.length <= VISIBLE_COUNT) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setStartIndex((currentIndex) => (currentIndex + VISIBLE_COUNT) % products.length);
    }, SHUFFLE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [products]);

  const visibleProducts = useMemo(
    () => getWindowedProducts(products, startIndex),
    [products, startIndex]
  );

  const handleStep = (direction) => {
    if (!products.length) {
      return;
    }

    setStartIndex((currentIndex) => {
      const step = direction === "next" ? VISIBLE_COUNT : -VISIBLE_COUNT;
      return (currentIndex + step + products.length) % products.length;
    });
  };

  return (
    <section className="space-y-10">

      <div className="flex items-center justify-between">
        
        <h2 className="text-4xl font-bold text-[#012d1d]">
          Today's Fresh Picks
        </h2>

        <div className="flex gap-3">
          
          <button
            type="button"
            onClick={() => handleStep("prev")}
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => handleStep("next")}
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-dashed border-gray-300 bg-white p-10 text-gray-500">
          Loading today’s fresh picks...
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-10 text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            title={product.title}
            subtitle={
              product.badge || product.category?.name || product.farmer?.username || "Fresh from farm"
            }
            price={formatWithUnit(product.price, product.unit)}
            badge={product.badge}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;