import { FiUpload, FiPackage } from "react-icons/fi";

const FarmProfile = () => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center gap-3 mb-8">

        <FiPackage className="text-[#1f6d1a] text-2xl" />

        <h2 className="text-4xl font-bold text-[#012d1d]">
          Farm Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div>
          <label className="block text-sm text-gray-500 mb-3">
            Farm Name
          </label>

          <input
            type="text"
            defaultValue="NavaKrishi Organic Gardens"
            className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#1f6d1a]"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-3">
            Location
          </label>

          <input
            type="text"
            defaultValue="Karnataka, India"
            className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#1f6d1a]"
          />
        </div>

        <div className="md:col-span-2">

          <label className="block text-sm text-gray-500 mb-4">
            Farm Logo
          </label>

          <div className="flex items-center gap-6">

            <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center">

              <FiUpload className="text-4xl text-gray-400" />
            </div>

            <div>

              <button className="bg-[#012d1d] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#021f14] transition">
                Upload New Image
              </button>

              <p className="text-gray-400 mt-3 text-sm">
                JPG, PNG or WEBP. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">

          <label className="block text-sm text-gray-500 mb-3">
            Farm Bio
          </label>

          <textarea
            rows="4"
            defaultValue="Focused on regenerative soil health and heirloom crop varieties for premium local markets."
            className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#1f6d1a]"
          />
        </div>
      </div>
    </section>
  );
};

export default FarmProfile;