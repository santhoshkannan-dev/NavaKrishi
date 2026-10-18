import { FiCpu, FiArrowRight } from "react-icons/fi";

const AIAdvisory = ({ message = "Soil moisture is below target in Plot B. Increase irrigation duration by 12% for the next 24 hours." }) => {
  return (
    <article className="rounded-3xl border border-[#dfe8d8] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#012d1d]">AI Advisory</h3>
        <div className="rounded-2xl bg-[#eef8e8] p-2 text-[#1f6d1a]">
          <FiCpu />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#476356]">{message}</p>

      <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1f6d1a] transition hover:text-[#175515]">
        View detailed plan
        <FiArrowRight />
      </button>
    </article>
  );
};

export default AIAdvisory;
