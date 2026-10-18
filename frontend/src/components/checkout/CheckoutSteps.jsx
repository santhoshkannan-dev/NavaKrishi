import { FiCheck } from "react-icons/fi";

const CheckoutSteps = () => {
  return (
    <div className="flex items-center justify-center py-12">
      
      <div className="flex items-center">

        {/* Step 1 */}
        <div className="flex flex-col items-center">
          
          <div className="w-12 h-12 rounded-full bg-[#012d1d] text-white flex items-center justify-center">
            <FiCheck size={22} />
          </div>

          <p className="mt-3 font-semibold text-[#012d1d]">
            Shipping
          </p>
        </div>

        <div className="w-28 h-0.5 bg-[#012d1d] mx-4"></div>

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          
          <div className="w-12 h-12 rounded-full bg-[#012d1d] ring-4 ring-[#c1ecd4] text-white flex items-center justify-center font-bold">
            2
          </div>

          <p className="mt-3 font-bold text-[#012d1d]">
            Payment
          </p>
        </div>

        <div className="w-28 h-0.5 bg-gray-300 mx-4"></div>

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          
          <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
            3
          </div>

          <p className="mt-3 text-gray-500">
            Review
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;