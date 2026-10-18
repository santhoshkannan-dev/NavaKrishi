const AccuracyCard = () => {
  return (
    <div className="bg-[#dff5d8] border border-[#b7e6aa] rounded-3xl p-6">

      <h3 className="text-2xl font-bold text-[#1f6d1a]">
        Prediction Accuracy: 94%
      </h3>

      <p className="text-[#267320] mt-3 leading-relaxed">
        Based on historical satellite data and weather
        patterns from the past 10 years.
      </p>
    </div>
  );
};

export default AccuracyCard;