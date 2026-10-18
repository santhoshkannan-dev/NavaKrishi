import {
  FiCalendar,
  FiDownload,
} from "react-icons/fi";

const AnalyticsHeader = ({ onRefresh = null }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

      <div>
        <h1 className="text-5xl font-bold text-[#012d1d]">
          Sales & Analytics
        </h1>

        <p className="text-gray-500 mt-3 text-lg">
          Performance overview for Green Valley Farms • Oct 2024
        </p>
      </div>

      <div className="flex items-center gap-4">

        <button className="bg-white border border-gray-200 px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-gray-50">

          <FiCalendar />

          Last 30 Days
        </button>

        <button className="bg-[#f5f5f3] px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-gray-200" onClick={() => onRefresh && onRefresh()}>
          <FiDownload />
          Export Report
        </button>

        <button
          className="bg-white border border-gray-200 px-4 py-2 rounded-2xl flex items-center gap-2 hover:bg-gray-50"
          onClick={() => onRefresh && onRefresh()}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;