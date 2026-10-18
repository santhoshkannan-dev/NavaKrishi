const ProductActions = () => {
  return (
    <div className="flex items-center justify-between">

      <button className="border border-[#1f6d1a] text-[#1f6d1a] hover:bg-[#f5fff2] px-10 py-4 rounded-full font-semibold transition">

        Save Draft
      </button>

      <div className="flex items-center gap-5">

        <button className="text-gray-500 font-medium">
          Cancel
        </button>

        <button className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-12 py-4 rounded-full font-semibold shadow-lg transition">

          Next Step
        </button>
      </div>
    </div>
  );
};

export default ProductActions;