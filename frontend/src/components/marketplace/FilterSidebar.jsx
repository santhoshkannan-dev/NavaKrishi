import { useEffect, useState } from "react";
import { categoriesAPI, productsAPI } from "../../api/marketplace";

const fallbackCategories = [
  { id: 1, name: "Vegetables", icon: "🥬" },
  { id: 2, name: "Fruits", icon: "🍎" },
  { id: 3, name: "Grains & Pulses", icon: "🌾" },
  { id: 4, name: "Organic Honey", icon: "🍯" },
  { id: 5, name: "Spices", icon: "🌶️" },
  { id: 6, name: "Organic Farm Items", icon: "🚜" },
];

const FilterSidebar = ({ filters, onFiltersChange }) => {
  const [categories, setCategories] = useState(fallbackCategories);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  const [minLocal, setMinLocal] = useState('');
  const [maxLocal, setMaxLocal] = useState('');
  // Debounce price inputs before emitting to parent
  useEffect(() => {
    const id = setTimeout(() => {
      onFiltersChange({ min_price: minLocal || '', max_price: maxLocal || '' });
    }, 400);
    return () => clearTimeout(id);
  }, [minLocal, maxLocal]);

  // Keep local inputs in sync when parent filters change (e.g., URL load)
  useEffect(() => {
    setMinLocal(filters.min_price || '');
    setMaxLocal(filters.max_price || '');
  }, [filters.min_price, filters.max_price]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesAPI.getAllCategories();
        setCategories(data.length ? data : fallbackCategories);
      } catch (error) {
        console.error("Failed to load marketplace categories", error);
        setCategories(fallbackCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Load farmers by fetching a product list and extracting unique farmers
  useEffect(() => {
    let isMounted = true;
    const loadFarmers = async () => {
      try {
        setLoadingFarmers(true);
        const data = await productsAPI.getAllProducts();
        const arr = Array.isArray(data) ? data : (data.results || []);
        if (!isMounted) return;
        const unique = {};
        arr.forEach((p) => {
          const f = p.farmer;
          if (f && f.id && !unique[f.id]) {
            unique[f.id] = { id: f.id, name: f.username || f.first_name || `Farmer ${f.id}` };
          }
        });
        setFarmers(Object.values(unique));
      } catch (err) {
        console.error('Failed to load farmers for filters', err);
        setFarmers([]);
      } finally {
        if (isMounted) setLoadingFarmers(false);
      }
    };

    loadFarmers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategorySelect = (categoryId) => {
    onFiltersChange({
      category: filters.category === String(categoryId) ? "" : String(categoryId),
    });
  };

  const handlePriceChange = (event) => {
    onFiltersChange({ max_price: event.target.value });
  };

  const handleMinPriceChange = (event) => {
    onFiltersChange({ min_price: event.target.value });
  };

  const handleSortChange = (event) => {
    onFiltersChange({ sort: event.target.value });
  };

  const handleFarmerChange = (event) => {
    onFiltersChange({ farmer: event.target.value });
  };

  const handleToggle = (key) => (event) => {
    onFiltersChange({ [key]: event.target.checked ? '1' : '' });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      category: "",
      min_price: "",
      max_price: "",
      farmer: "",
    });
  };

  const activeCategory = filters.category ? String(filters.category) : "";

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-[#f5f5f3] border-r border-gray-200 min-h-0 lg:min-h-screen p-8">
      
      <div className="space-y-14">

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-[#012d1d]">
              Categories
            </h3>

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-medium text-[#1f6d1a] hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-4 text-lg">
            {loadingCategories ? (
              <p className="text-gray-500 text-base">Loading categories...</p>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    activeCategory === String(category.id)
                      ? "border-[#1f6d1a] bg-[#e8f4e6] text-[#012d1d]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-[#c4d9bf] hover:bg-[#fafcf9]"
                  }`}
                >
                  <span className="text-xl leading-none">{category.icon || "•"}</span>
                  <span>{category.name}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Price */}
        <div>
          <h3 className="text-xl font-bold text-[#012d1d] mb-6">
            Price Range
          </h3>

          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minLocal}
              onChange={(e) => setMinLocal(e.target.value)}
              className="w-1/2 border rounded px-3 py-2"
            />

            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxLocal}
              onChange={(e) => setMaxLocal(e.target.value)}
              className="w-1/2 border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Sort & Certifications */}
        <div>
          <h3 className="text-xl font-bold text-[#012d1d] mb-6">Sort & Filters</h3>

          <div className="space-y-3">
            <select
              value={filters.sort || ''}
              onChange={handleSortChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
            </select>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!filters.organic}
                onChange={handleToggle('organic')}
              />
              Organic
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!filters.top_rated}
                onChange={handleToggle('top_rated')}
              />
              Top rated (4+)
            </label>
          </div>
        </div>

        {/* Farmer selector */}
        <div>
          <h3 className="text-xl font-bold text-[#012d1d] mb-6">Farmer</h3>

          <select
            value={filters.farmer || ''}
            onChange={handleFarmerChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All farmers</option>
            {loadingFarmers ? (
              <option disabled>Loading...</option>
            ) : (
              farmers.map((f) => (
                <option key={f.id} value={String(f.id)}>
                  {f.name}
                </option>
              ))
            )}
          </select>
        </div>
        {/* Farmers */}
        <div>
          <h3 className="text-xl font-bold text-[#012d1d] mb-6">
            Top Farmers
          </h3>

          <div className="space-y-5 text-lg">
            
            <label className="flex items-center gap-3">
              <input type="checkbox" disabled />
              Green Valley Farms
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" disabled />
              Earthly Delights
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;