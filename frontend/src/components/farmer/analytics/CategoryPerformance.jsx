const defaultCats = [
  { name: 'Leafy Vegetables', value: '42%', width: '42%' },
  { name: 'Seasonal Fruits', value: '28%', width: '28%' },
  { name: 'Root Crops', value: '18%', width: '18%' },
  { name: 'Herbs & Microgreens', value: '12%', width: '12%' },
];

const CategoryPerformance = ({ categories = defaultCats }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 h-full">

      <h2 className="text-4xl font-bold text-[#012d1d]">Category Performance</h2>

      <div className="space-y-8 mt-10">
        {categories.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-3">
              <p className="truncate max-w-[220px]">{item.name}</p>
              <p className="font-semibold">{item.value}</p>
            </div>

            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <div style={{ width: item.width }} className="h-full rounded-full bg-[#012d1d]" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#f5f5f3] rounded-2xl p-5 mt-12">
        <p className="text-[#012d1d] font-semibold">AI Suggestion:</p>
        <p className="text-gray-600 mt-2">Increase stock for top performing SKUs based on demand.</p>
      </div>
    </div>
  );
};

export default CategoryPerformance;