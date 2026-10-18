import {
  FiSliders,
  FiBell,
  FiDroplet,
} from "react-icons/fi";

const PlatformPreferences = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center gap-3 mb-8">

        <FiSliders className="text-[#1f6d1a] text-2xl" />

        <h2 className="text-4xl font-bold text-[#012d1d]">
          Platform Preferences
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div>
          <label className="block text-sm text-gray-500 mb-3">
            Preferred Currency
          </label>

          <select className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#1f6d1a]">

            <option>
              INR (₹) - Indian Rupee
            </option>

            <option>
              USD ($) - US Dollar
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-3">
            Unit of Measure
          </label>

          <select className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#1f6d1a]">

            <option>
              Metric (kg, hectares)
            </option>

            <option>
              Imperial (lbs, acres)
            </option>
          </select>
        </div>
      </div>

      <div className="mt-10">

        <p className="text-gray-500 uppercase tracking-[2px] text-sm mb-8">
          AI Notifications
        </p>

        <div className="space-y-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <FiBell className="text-xl text-gray-500" />

              <p className="text-[#012d1d] font-medium">
                Yield Prediction Alerts
              </p>
            </div>

            <div className="w-14 h-8 bg-[#1f6d1a] rounded-full relative">

              <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <FiDroplet className="text-xl text-gray-500" />

              <p className="text-[#012d1d] font-medium">
                Irrigation Optimization Tips
              </p>
            </div>

            <div className="w-14 h-8 bg-[#1f6d1a] rounded-full relative">

              <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformPreferences;