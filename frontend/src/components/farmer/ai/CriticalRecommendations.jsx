import {
  FiActivity,
  FiCalendar,
} from "react-icons/fi";

const defaultRecommendations = [
  {
    type: "soil",
    title: "Increase nitrogen by 15%",
    description: "Detected depletion in Sector B-4 within last 48hrs.",
    ctaLabel: "Apply Now",
  },
  {
    type: "harvest",
    title: "Prepare for harvest in 4 days",
    description: "Maturity index reached 92% based on satellite imagery.",
    ctaLabel: "View Plan",
  },
];

const iconByType = {
  soil: FiActivity,
  harvest: FiCalendar,
};

const CriticalRecommendations = ({ recommendations = defaultRecommendations }) => {
  return (
    <section className="bg-[#012d1d] text-white rounded-3xl p-8 shadow-xl">

      <h2 className="text-4xl font-bold mb-8">
        ✨ Critical Recommendations
      </h2>

      <div className="space-y-6">
        {recommendations.map((recommendation, index) => {
          const Icon = iconByType[recommendation.type] || FiActivity;

          return (
            <div key={`${recommendation.title}-${index}`} className="bg-white/10 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-5">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-[#1f6d1a] flex items-center justify-center">
                  <Icon className="text-2xl" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold">
                    {recommendation.title}
                  </h3>

                  <p className="text-gray-300 mt-1">
                    {recommendation.description}
                  </p>
                </div>
              </div>

              <button className={`px-6 py-3 rounded-full font-semibold transition ${index === 0 ? "bg-[#1f6d1a] hover:bg-[#165412]" : "border border-white/30 hover:bg-white/10"}`}>
                {recommendation.ctaLabel || "Open"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CriticalRecommendations;