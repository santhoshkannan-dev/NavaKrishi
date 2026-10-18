import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { productsAPI } from "../../api/marketplace";

const ReviewsSection = ({ reviews = [], onSubmitReview, isSubmittingReview = false, productId }) => {
  const { user } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [localMessage, setLocalMessage] = useState("");

  const getInitials = (name) => {
    const parts = (name || "").trim().split(" ").filter(Boolean);
    if (!parts.length) return "NA";
    return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  };

  const formatRelative = (dateString) => {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return "1 week ago";
    return `${weeks} weeks ago`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!comment.trim()) {
      setLocalMessage("Please write a short review comment.");
      return;
    }

    if (!onSubmitReview) {
      setLocalMessage("Review submission is unavailable right now.");
      return;
    }

    try {
      setLocalMessage("");
      await onSubmitReview({ rating, comment: comment.trim() });
      setComment("");
      setRating(5);
      setIsFormOpen(false);
      setIsEditMode(false);
      setLocalMessage("Review posted successfully.");
    } catch (error) {
      const detail = error?.response?.data?.detail || "Unable to submit review. Please sign in and try again.";
      setLocalMessage(detail);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsEditMode(false);
      return;
    }

    // Prefill if user has an existing review
    const myReview = reviews.find((r) => r.user_id === user.id || r.username === user.username);
    if (myReview) {
      setRating(myReview.rating || 5);
      setComment(myReview.comment || "");
      setIsEditMode(true);
    } else {
      setRating(5);
      setComment("");
      setIsEditMode(false);
    }
  }, [reviews, user]);

  const handleDelete = async () => {
    if (!productId) return;
    try {
      await productsAPI.deleteReview(productId);
      setLocalMessage("Review deleted.");
      // Ask parent to reload (if provided via onSubmitReview we rely on it)
      if (onSubmitReview) await onSubmitReview({ refreshOnly: true });
    } catch (err) {
      setLocalMessage(err?.response?.data?.detail || 'Unable to delete review.');
    }
  };

  return (
    <section className="mt-28">

      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        
        <h2 className="text-5xl font-bold text-[#012d1d]">
          Customer Reviews
        </h2>

        {user ? (
          <button
            className="text-[#1f6d1a] font-semibold"
            onClick={() => setIsFormOpen((prev) => !prev)}
          >
            {isEditMode ? 'Edit Your Review ✎' : 'Write a Review ✎'}
          </button>
        ) : (
          <a href="/sign-in" className="text-[#1f6d1a] font-semibold">Sign in to write a review</a>
        )}
      </div>

      {isFormOpen && user && (
        <form onSubmit={handleSubmit} className="mt-8 bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]"
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Average</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Very Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f6d1a]"
              placeholder="Share your experience with this product"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingReview}
            className="bg-[#1f6d1a] hover:bg-[#165412] disabled:opacity-70 text-white px-6 py-3 rounded-xl font-semibold"
          >
            {isSubmittingReview ? "Submitting..." : isEditMode ? 'Update Review' : 'Submit Review'}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold"
            >
              Delete Review
            </button>
          )}
        </form>
      )}

      {localMessage && <p className="mt-4 text-sm text-[#1f6d1a]">{localMessage}</p>}

      {reviews.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-8 text-gray-500">
          No reviews yet for this product.
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">

        {reviews.map((review) => {
          const displayName = review.user_name || review.username || "Anonymous";

          return (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm"
          >
            
            <div className="flex items-center">
              
              <div className="w-12 h-12 rounded-full bg-[#dff5d8] flex items-center justify-center font-bold text-[#1f6d1a]">
                {getInitials(displayName)}
              </div>

              <div className="ml-4">
                
                <h3 className="font-bold text-[#012d1d]">
                  {displayName}
                </h3>

                <p className="text-[#1f6d1a]">
                  {"★".repeat(review.rating || 0)}
                </p>
              </div>

              <span className="ml-auto text-gray-400 text-sm">
                {formatRelative(review.created_at)}
              </span>
            </div>

            <p className="text-gray-600 mt-6 leading-relaxed">
              "{review.comment}"
            </p>
          </div>
        )})}
      </div>
      )}
    </section>
  );
};

export default ReviewsSection;