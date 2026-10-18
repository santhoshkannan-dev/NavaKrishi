import { useEffect, useState } from "react";
import { productsAPI } from "../../api/marketplace";
import { formatWithUnit } from "../../utils/currency";
import MarketProductCard from "./MarketProductCard";

const ProductGrid = ({ filters = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await productsAPI.getAllProducts(filters);
        let arr = Array.isArray(data) ? data : (data.results || []);

        // Apply simple client-side filters that backend doesn't support
        if (filters.organic) {
          arr = arr.filter((p) => (p.badge || '').toLowerCase().includes('organic'));
        }

        if (filters.top_rated) {
          arr = arr.filter((p) => (parseFloat(p.rating) || 0) >= 4.0);
        }

        // Client-side sorting
        if (filters.sort === 'price_asc') {
          arr = arr.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (filters.sort === 'price_desc') {
          arr = arr.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (filters.sort === 'rating_desc') {
          arr = arr.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
        }

        if (isMounted) {
          setProducts(arr);
        }
      } catch (loadError) {
        if (isMounted) {
          setError("Unable to load marketplace products.");
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
  }, [filters]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-gray-500">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-red-700">
        {error}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-gray-500">
        No products match the selected filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
      
      {products.map((product) => (
        <MarketProductCard
          key={product.id}
          id={product.id}
          image={product.image}
          title={product.title}
          farmer={product.farmer?.username || product.farmer?.first_name || "Unknown farmer"}
          price={formatWithUnit(product.price, product.unit)}
          rating={product.rating}
          reviews={product.reviews}
          badge={product.badge}
          badgeColor={product.badge_color}
        />
      ))}
    </div>
  );
};

export default ProductGrid;