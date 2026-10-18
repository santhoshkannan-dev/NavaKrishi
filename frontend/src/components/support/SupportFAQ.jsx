import { useEffect, useState } from "react";
import { supportAPI } from "../../api/marketplace";

const SupportFAQ = ({ searchQuery = "" }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await supportAPI.getArticles(
          normalizedQuery ? { search: normalizedQuery } : {}
        );
        if (isMounted) {
          setArticles(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("Unable to load support articles right now.");
          setArticles([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [normalizedQuery]);

  return (
    <section className="mx-auto max-w-360 px-6 pb-24">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#012d1d] md:text-4xl">Support Knowledge Base</h2>
            <p className="mt-2 text-gray-500">
              {normalizedQuery
                ? `Showing results for "${searchQuery}"`
                : "Browse frequently asked questions from farmers and buyers."}
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-[#f0ffe9] px-4 py-2 text-sm font-semibold text-[#1f6d1a]">
            {articles.length} articles
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center text-gray-600">
            Loading support articles...
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
            {errorMessage}
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center text-gray-600">
            No support articles match this search. Try a different keyword.
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((faq) => (
              <details key={faq.id} className="rounded-2xl border border-gray-200 px-5 py-4">
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold text-[#012d1d]">{faq.question}</h3>
                    <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {faq.category}
                    </span>
                  </div>
                </summary>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SupportFAQ;