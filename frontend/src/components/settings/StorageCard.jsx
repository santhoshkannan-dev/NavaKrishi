const StorageCard = () => {
  return (
    <div className="bg-[#012d1d] text-white rounded-3xl p-8 shadow-lg">

      <p className="text-gray-300">
        Storage Limit
      </p>

      <h2 className="text-5xl font-bold mt-3">
        7.2 GB
      </h2>

      <p className="text-gray-300 mt-2">
        of 10 GB used
      </p>

      <div className="w-full h-3 bg-white/10 rounded-full mt-8 overflow-hidden">

        <div className="w-[72%] h-full bg-[#89da79] rounded-full"></div>
      </div>

      <p className="text-gray-300 mt-5">
        Using AI insights for 12 months.
      </p>
    </div>
  );
};

export default StorageCard;