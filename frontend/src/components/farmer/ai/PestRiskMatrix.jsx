const risks = [
  {
    title: "Late Blight Detection",
    risk: "HIGH RISK",
    color: "bg-red-100 text-red-600",
    description:
      "Satellite thermal mapping indicates moisture clusters ideal for blight in Sector C.",
  },

  {
    title: "Aphid Incursion",
    risk: "MODERATE",
    color: "bg-[#dff5d8] text-[#1f6d1a]",
    description:
      "Humidity suggests potential aphid migration from East fields.",
  },

  {
    title: "Root Rot Stability",
    risk: "LOW RISK",
    color: "bg-gray-100 text-gray-600",
    description:
      "Drainage system efficiency remains optimal.",
  },
];

const riskColor = (risk) => {
  const normalized = String(risk || "").toUpperCase();
  if (normalized.includes("HIGH")) return "bg-red-100 text-red-600";
  if (normalized.includes("MODERATE")) return "bg-[#fff4db] text-[#8a5b00]";
  return "bg-gray-100 text-gray-600";
};

const PestRiskMatrix = ({ risks: inputRisks = risks }) => {
  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm mt-8">

      <h2 className="text-4xl font-bold text-[#012d1d] mb-10">
        Pest & Disease Risk Matrix
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {inputRisks.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-3xl p-6"
          >

            <div className="flex items-center justify-between mb-6">

              <div className="w-14 h-14 rounded-2xl bg-[#f5f5f3]" />

              <span className={`${item.color || riskColor(item.risk)} px-4 py-2 rounded-full text-sm font-semibold`}>
                {item.risk}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-[#012d1d]">
              {item.title}
            </h3>

            <p className="text-gray-500 mt-4 leading-relaxed">
              {item.description}
            </p>

            <div className="mt-8 flex items-center gap-4">

              <div className="w-14 h-14 rounded-xl bg-gray-100" />

              <div>

                <p className="font-bold text-[#012d1d]">
                  Confidence: {Number(item.confidence || 94)}%
                </p>

                <p className="text-gray-500 text-sm">
                  Resolution: Monitoring
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PestRiskMatrix;