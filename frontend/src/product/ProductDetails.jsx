import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import ReviewsSection from "../components/product/ReviewsSection";
import SimilarProducts from "../components/product/SimilarProducts";
import AIInsights from "../components/product/AIInsights";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { productsAPI } from "../api/marketplace";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadProductData = async (productId, keepLoadingState = true) => {
    if (keepLoadingState) setLoading(true);
    const data = await productsAPI.getProduct(productId);

    let related = [];
    if (data?.category?.id) {
      const relatedData = await productsAPI.getAllProducts({ category: data.category.id });
      related = relatedData.filter((item) => item.id !== data.id).slice(0, 4);
    }

    setProduct(data);
    setSimilarProducts(related);
  };

  const handleSubmitReview = async (payload) => {
    if (!id) return;
    setIsSubmittingReview(true);
    try {
      // support a refresh-only call from child (delete flow)
      if (payload && payload.refreshOnly) {
        await loadProductData(id, false);
        return;
      }

      await productsAPI.addReview(id, payload);
      await loadProductData(id, false);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setError("");
        await loadProductData(id, true);

        if (mounted) {
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError('Unable to load product.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) load();
    return () => (mounted = false);
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-360 mx-auto px-6 pt-28 pb-20 animate-pulse">
          <div className="h-6 w-80 bg-gray-200 rounded mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <div className="h-125 lg:h-155 rounded-3xl bg-gray-200" />
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="aspect-square rounded-2xl bg-gray-200" />
                <div className="aspect-square rounded-2xl bg-gray-200" />
                <div className="aspect-square rounded-2xl bg-gray-200" />
                <div className="aspect-square rounded-2xl bg-gray-200" />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-8 w-40 bg-gray-200 rounded" />
              <div className="h-16 w-full bg-gray-200 rounded" />
              <div className="h-10 w-48 bg-gray-200 rounded" />
              <div className="h-64 w-full bg-gray-200 rounded-3xl" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <main className="max-w-360 mx-auto px-6 pt-28 pb-20">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-500 mb-10">
          <span>Marketplace</span>
          <span>›</span>
          <span>{product?.category?.name || 'Category'}</span>
          <span>›</span>
          <span className="text-[#012d1d] font-semibold">
            {product?.title}
          </span>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7">
            <ProductGallery product={product} />
          </div>

          <div className="lg:col-span-5">
            <ProductInfo product={product} />
          </div>
        </div>

        <AIInsights />

        <ReviewsSection
          reviews={product?.product_reviews || []}
          onSubmitReview={handleSubmitReview}
          isSubmittingReview={isSubmittingReview}
          productId={product?.id}
        />

        <SimilarProducts products={similarProducts} />
      </main>

      <Footer />
    </>
  );
};

export default ProductDetails;