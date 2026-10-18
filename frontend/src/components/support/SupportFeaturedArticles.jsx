import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import { supportAPI } from "../../api/marketplace";

const SupportFeaturedArticles = ({ onSelectTopic }) => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedArticles = async () => {
      try {
        const data = await supportAPI.getArticles({ featured: true });
        if (isMounted) {
          const normalized = Array.isArray(data) ? data.slice(0, 3) : [];
          setFeaturedArticles(normalized);
        }
      } catch {
        if (isMounted) {
          setFeaturedArticles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && featuredArticles.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-360 px-6 pb-10">
      <div className="rounded-3xl border border-[#d9ead2] bg-[#f6fff3] p-6 md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <FiStar className="text-[#1f6d1a]" />
          <h2 className="text-2xl font-bold text-[#012d1d] md:text-3xl">Featured Articles</h2>
        </div>

        {loading ? (
          <div className="text-sm text-gray-600">Loading featured articles...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredArticles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => onSelectTopic?.(article.question)}
                className="rounded-2xl border border-[#d9ead2] bg-white p-4 text-left transition hover:border-[#a4f792]"
              >
                <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                  {article.category}
                </span>
                <h3 className="mt-3 text-base font-semibold text-[#012d1d]">{article.question}</h3>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SupportFeaturedArticles;
