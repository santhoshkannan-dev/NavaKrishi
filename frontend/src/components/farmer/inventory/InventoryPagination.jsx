import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const InventoryPagination = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

      {/* Left */}
      <p className="text-gray-500">
        Showing 1 to 10 of 42 entries
      </p>

      {/* Right */}
      <div className="flex items-center gap-3">

        <button className="w-12 h-12 rounded-xl bg-[#f5f5f3] hover:bg-gray-200 flex items-center justify-center transition">

          <FiChevronLeft />
        </button>

        <button className="w-12 h-12 rounded-xl bg-[#1f6d1a] text-white font-semibold">
          1
        </button>

        <button className="w-12 h-12 rounded-xl hover:bg-[#f5f5f3] transition">
          2
        </button>

        <button className="w-12 h-12 rounded-xl hover:bg-[#f5f5f3] transition">
          3
        </button>

        <span className="px-2 text-gray-400">
          ...
        </span>

        <button className="w-12 h-12 rounded-xl hover:bg-[#f5f5f3] transition">
          5
        </button>

        <button className="w-12 h-12 rounded-xl bg-[#f5f5f3] hover:bg-gray-200 flex items-center justify-center transition">

          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default InventoryPagination;