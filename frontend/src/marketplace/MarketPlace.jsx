import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { animate, utils } from "animejs";

import FilterSidebar from "../components/marketplace/FilterSidebar";
import ProductGrid from "../components/marketplace/ProductGrid";
import BasketSidebar from "../components/marketplace/BasketSidebar";
import { categoriesAPI } from "../api/marketplace";

const slugifyCategory = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const headerRef = useRef(null);

  const [filters, setFilters] = useState({
    category: "",
    search: "",
    min_price: "",
    max_price: "",
    farmer: "",
    sort: "",
    organic: "",
    top_rated: "",
  });
  const [categoryName, setCategoryName] = useState("");

  const handleFiltersChange = (updates) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...updates,
    }));
  };

  useEffect(() => {
    if (headerRef.current) {
      animate(headerRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
        ease: "outExpo",
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveCategoryFilter = async () => {
      const categoryParam = searchParams.get("category");
      const search = searchParams.get("search") || '';
      const min_price = searchParams.get('min_price') || '';
      const max_price = searchParams.get('max_price') || '';
      const farmer = searchParams.get('farmer') || '';
      const sort = searchParams.get('sort') || '';
      const organic = searchParams.get('organic') || '';
      const top_rated = searchParams.get('top_rated') || '';

      if (!categoryParam) {
        if (isMounted) {
          setCategoryName("");
          setFilters((cur) => ({ ...cur, search, min_price, max_price, farmer, sort, organic, top_rated }));
        }
        return;
      }

      try {
        const categories = await categoriesAPI.getAllCategories();
        const matchingCategory = categories.find((category) => {
          const normalizedName = slugifyCategory(category.name);
          return (
            String(category.id) === categoryParam ||
            normalizedName === slugifyCategory(categoryParam)
          );
        });

        if (isMounted) {
          if (matchingCategory) {
            setFilters((currentFilters) => ({
              ...currentFilters,
              category: String(matchingCategory.id),
              search,
              min_price,
              max_price,
              farmer,
              sort,
              organic,
              top_rated,
            }));
            setCategoryName(matchingCategory.name);
          } else {
            setCategoryName("");
            setFilters((cur) => ({ ...cur, min_price, max_price, farmer, sort, organic, top_rated }));
          }
        }
      } catch (error) {
        console.error("Failed to resolve marketplace category", error);
        if (isMounted) {
          setCategoryName("");
          setFilters((cur) => ({ ...cur, min_price, max_price, farmer, sort, organic, top_rated }));
        }
      }
    };

    resolveCategoryFilter();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v) !== '') {
        params.set(k, String(v));
      }
    });

    const current = searchParams.toString();
    const desired = params.toString();
    if (current !== desired) {
      setSearchParams(params);
    }
  }, [filters, searchParams, setSearchParams]);

  return (
    <>
      <Navbar />

      <main className="pt-20 flex flex-col lg:flex-row max-w-400 mx-auto">
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Main */}
        <section className="flex-1 p-6 md:p-10">
          <div ref={headerRef} className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4 opacity-0">
            <div>
              <span className="text-emerald-700 font-bold text-xs tracking-widest uppercase px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
                Fresh Produce Marketplace
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#012d1d] mt-3 font-['Devil_Breeze']">
                Organic Marketplace
              </h1>

              <p className="text-gray-600 text-base md:text-lg mt-2">
                {categoryName
                  ? `Showing ${categoryName} from verified local farmers.`
                  : "Fresh, AI-vetted produce directly from trusted local farmers."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase font-mono">Filter Mode: Active</span>
            </div>
          </div>

          <ProductGrid filters={filters} />
        </section>

        <BasketSidebar mode="inline" />
      </main>

      <Footer />
    </>
  );
};

export default Marketplace;