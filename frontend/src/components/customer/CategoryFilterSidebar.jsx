import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { categoriesAPI } from "../../api/marketplace";

const marketplaceCategoryPathFor = (categoryName) => {
  const normalized = String(categoryName || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized ? `/marketplace?category=${normalized}` : "/marketplace";
};

const filterGroups = [
  {
    title: "Price Range",
    options: ["Under ₹10", "₹10 - ₹20", "₹20 - ₹50", "₹50+"],
  },
  {
    title: "Certification",
    options: ["USDA Organic", "Fair Trade", "Non-GMO", "Pesticide Free"],
  },
];

const CategoryFilterSidebar = ({ title = "Filters" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const activeCategory = useMemo(() => {
    const currentCategory = searchParams.get("category");
    return currentCategory ? currentCategory.toLowerCase() : "";
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const data = await categoriesAPI.getAllCategories();
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load customer categories", error);
        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryClick = (categoryName) => {
    const nextPath = marketplaceCategoryPathFor(categoryName);

    if (location.pathname === "/marketplace") {
      navigate(nextPath);
      return;
    }

    navigate(nextPath);
  };

  return (
    <aside className="bg-white border border-gray-200 rounded-4xl p-6 lg:sticky lg:top-28 h-fit shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#012d1d]">{title}</h2>
        <button
          type="button"
          onClick={() => navigate("/marketplace")}
          className="text-sm font-semibold text-[#1f6d1a] hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="space-y-7">
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Categories
          </h3>

          {loadingCategories ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => {
                const isActive = activeCategory === category.name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryClick(category.name)}
                    className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-[#1f6d1a] bg-[#e8f4e6] text-[#012d1d]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-[#c4d9bf] hover:bg-[#fafcf9]"
                    }`}
                  >
                    <span className="text-xl leading-none">{category.icon || "•"}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      <div className="space-y-7">
        {filterGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
              {group.title}
            </h3>

            <div className="space-y-3">
              {group.options.map((option) => (
                <label key={option} className="flex items-center gap-3 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#1f6d1a] focus:ring-[#1f6d1a]"
                  />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Sort By
          </h3>

          <div className="space-y-3">
            {[
              "Recommended",
              "Highest Rated",
              "Price: Low to High",
              "Newest First",
            ].map((option, index) => (
              <label key={option} className="flex items-center gap-3 text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="sortBy"
                  defaultChecked={index === 0}
                  className="h-4 w-4 border-gray-300 text-[#1f6d1a] focus:ring-[#1f6d1a]"
                />
                <span className="text-sm font-medium">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CategoryFilterSidebar;