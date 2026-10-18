import { FiActivity } from "react-icons/fi";

const statusStyles = {
  Critical: "bg-[#fee2e2] text-[#b42318]",
  Optimal: "bg-[#e8f7e6] text-[#1f6d1a]",
  Warning: "bg-[#fff4ce] text-[#9a6700]",
};

const SensorCard = ({ title, value, status }) => {
  const badgeStyle = statusStyles[status] || "bg-[#eef2ff] text-[#1e3a8a]";

  return (
    <article className="rounded-3xl border border-[#dfe8d8] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#5c6f62]">{title}</p>
          <p className="mt-2 text-2xl font-bold text-[#012d1d]">{value}</p>
        </div>

        <div className="rounded-2xl bg-[#eef8e8] p-2 text-[#1f6d1a]">
          <FiActivity />
        </div>
      </div>

      <div className="mt-4">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
          {status}
        </span>
      </div>
    </article>
  );
};

export default SensorCard;
