const AccuracyCard = ({ data }) => (
  <div className="rounded-3xl border border-[#b7e6aa] bg-[#dff5d8] p-6">
    <h3 className="text-2xl font-bold text-[#1f6d1a]">Prediction Accuracy</h3>
    <p className="mt-3 leading-relaxed text-[#267320]">{data?.available ? `${data.value}% validated on the configured model.` : "No evaluated ML accuracy is available. Results are transparent rule-based rankings."}</p>
  </div>
);

export default AccuracyCard;
