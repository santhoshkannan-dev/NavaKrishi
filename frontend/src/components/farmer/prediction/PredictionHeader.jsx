import { FiSave, FiClock } from "react-icons/fi";

const PredictionHeader = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

      <div>

        <h1 className="text-6xl font-bold text-[#012d1d]">
          Prediction Lab
        </h1>

        <p className="text-gray-500 text-xl mt-4 max-w-3xl">
          Simulate environmental scenarios to discover
          profitable and sustainable crop strategies.
        </p>
      </div>

      <div className="flex gap-4">

        <button className="border border-[#012d1d] px-8 py-5 rounded-2xl flex items-center gap-3 font-semibold hover:bg-gray-50 transition">
          <FiClock />
          View History
        </button>

        <button className="bg-[#012d1d] text-white px-8 py-5 rounded-2xl flex items-center gap-3 font-semibold hover:bg-[#021f15] transition">
          <FiSave />
          Save Simulation
        </button>
      </div>
    </div>
  );
};

export default PredictionHeader;