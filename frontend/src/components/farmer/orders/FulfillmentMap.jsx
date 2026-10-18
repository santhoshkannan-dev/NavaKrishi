const FulfillmentMap = () => {
  return (
    <div className="relative h-72 rounded-3xl overflow-hidden border border-gray-200">

      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
        alt=""
        className="w-full h-full object-cover grayscale opacity-40"
      />

      <div className="absolute inset-0 flex items-center justify-center">

        <button className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-full shadow-lg font-semibold text-[#012d1d] hover:scale-105 transition">
          View Fulfillment Map
        </button>
      </div>
    </div>
  );
};

export default FulfillmentMap;