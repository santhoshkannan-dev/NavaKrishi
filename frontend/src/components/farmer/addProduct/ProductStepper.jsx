const ProductStepper = () => {
  return (
    <div className="flex items-center justify-between max-w-3xl mx-auto">

      {/* Step 1 */}
      <div className="flex flex-col items-center gap-3">

        <div className="w-14 h-14 rounded-full bg-[#012d1d] text-white flex items-center justify-center font-bold">
          1
        </div>

        <p className="font-semibold text-[#012d1d]">
          Basic Info
        </p>
      </div>

      <div className="flex-1 h-[2px] bg-gray-200 mx-5" />

      {/* Step 2 */}
      <div className="flex flex-col items-center gap-3">

        <div className="w-14 h-14 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
          2
        </div>

        <p className="text-gray-500">
          Pricing & Inventory
        </p>
      </div>

      <div className="flex-1 h-[2px] bg-gray-200 mx-5" />

      {/* Step 3 */}
      <div className="flex flex-col items-center gap-3">

        <div className="w-14 h-14 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
          3
        </div>

        <p className="text-gray-500">
          Sustainability
        </p>
      </div>
    </div>
  );
};

export default ProductStepper;