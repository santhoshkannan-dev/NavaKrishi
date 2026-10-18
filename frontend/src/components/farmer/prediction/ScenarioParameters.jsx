import { FiZap } from "react-icons/fi";

const ScenarioParameters = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

      <h2 className="text-3xl font-bold text-[#012d1d] mb-8">
        Scenario Parameters
      </h2>

      <div className="space-y-6">

        <div>
          <label className="block text-gray-500 mb-2">
            Target Season
          </label>

          <select className="w-full border border-gray-300 rounded-2xl px-5 py-4">
            <option>Summer</option>
            <option>Winter</option>
            <option>Monsoon</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-500 mb-2">
            Expected Rainfall
          </label>

          <input
            type="range"
            className="w-full accent-[#1f6d1a]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">

          <input
            type="number"
            placeholder="Min Temp"
            className="border border-gray-300 rounded-2xl px-5 py-4"
          />

          <input
            type="number"
            placeholder="Max Temp"
            className="border border-gray-300 rounded-2xl px-5 py-4"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Soil pH"
            className="border border-gray-300 rounded-2xl px-5 py-4"
          />

          <select className="border border-gray-300 rounded-2xl px-5 py-4">
            <option>Optimal</option>
            <option>Low</option>
            <option>High</option>
          </select>
        </div>

        <button className="w-full mt-6 bg-[#012d1d] text-white py-5 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-[#021f15] transition">

          <FiZap />

          Run AI Analysis
        </button>
      </div>
    </section>
  );
};

export default ScenarioParameters;
