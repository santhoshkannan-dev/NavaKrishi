import {
  FiBell,
  FiSettings,
} from "react-icons/fi";

const AIInsightsHeader = ({ unreadAlerts = 0 }) => {
  return (
    <div className="flex items-center justify-between">

      <h1 className="text-5xl font-bold text-[#012d1d]">
        Prithvi AI
        <span className="font-normal text-gray-500 ml-2">
          Insights
        </span>
      </h1>

      <div className="flex items-center gap-6">

        <div className="relative">
          <FiBell className="text-2xl text-gray-500" />

          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </div>

        <FiSettings className="text-2xl text-gray-500" />

        <img
          src="https://i.pravatar.cc/100"
          alt=""
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
      </div>
    </div>
  );
};

export default AIInsightsHeader;