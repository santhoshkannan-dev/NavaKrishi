const CropRecommendations = ({ recommendations = [] }) => (
  <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
    <div className="mb-10"><h2 className="text-4xl font-bold text-[#012d1d]">Crop Recommendations</h2><p className="mt-2 text-gray-500">Ranked by configured climate and soil-pH rules. Scores are not probabilities.</p></div>
    {recommendations.length === 0 ? <p className="text-gray-500">Run an analysis to see recommendations.</p> : <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{recommendations.map((crop) => <div key={crop.name} className="overflow-hidden rounded-3xl border border-gray-200"><div className="relative h-40"><img src={`https://source.unsplash.com/600x400/?${encodeURIComponent(crop.name)}`} alt={`${crop.name} crop`} className="h-full w-full object-cover" /><div className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 font-bold text-[#1f6d1a]">{crop.suitability_score} / 100</div></div><div className="p-6"><h3 className="text-2xl font-bold text-[#012d1d]">{crop.name}</h3><div className="mt-5 flex flex-wrap gap-3"><span className="rounded-full bg-[#dff5d8] px-3 py-1 text-sm text-[#1f6d1a]">{crop.category}</span><span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{crop.water_requirement} water</span></div><p className="mt-4 text-sm text-gray-600">{crop.explanation}</p></div></div>)}</div>}
  </section>
);

export default CropRecommendations;
