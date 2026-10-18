import {
  FiTrash2,
  FiArchive,
} from "react-icons/fi";

const InventoryToolbar = () => {
  return (
    <div className="bg-[#f5f5f3] border border-gray-200 rounded-2xl px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

      {/* Left */}
      <div className="flex flex-wrap items-center gap-6">

        <label className="flex items-center gap-3 cursor-pointer">

          <input type="checkbox" />

          <span className="font-medium text-gray-700">
            Select All
          </span>
        </label>

        <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition">

          <FiTrash2 />

          Bulk Delete
        </button>

        <button className="flex items-center gap-2 text-gray-600 hover:text-[#1f6d1a] transition">

          <FiArchive />

          Archive Selected
        </button>
      </div>

      {/* Right */}
      <p className="text-gray-500 text-sm">
        Showing 1–10 of 42 products
      </p>
    </div>
  );
};

export default InventoryToolbar;