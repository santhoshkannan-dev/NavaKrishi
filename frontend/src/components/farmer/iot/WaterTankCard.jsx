import { FiDroplet } from "react-icons/fi";

const WaterTankCard = ({ title = "Water Tank", value = "45% Capacity", level = 45, note = "Refill recommended in the next 10-12 hours." }) => {
  const resolvedLevel = Number.isFinite(Number(level)) ? Number(level) : 0;

  return (
    <article className="rounded-3xl border border-[#dfe8d8] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#5c6f62]">{title}</p>
          <h3 className="mt-1 text-xl font-bold text-[#012d1d]">{value}</h3>
        </div>
        <div className="rounded-2xl bg-[#e7f1ff] p-3 text-[#1d4ed8]">
          <FiDroplet />
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#edf3ea]">
        <div className="h-full rounded-full bg-linear-to-r from-[#1d4ed8] to-[#22c55e]" style={{ width: `${resolvedLevel}%` }} />
      </div>

      <p className="mt-3 text-sm text-[#5c6f62]">{note}</p>
    </article>
  );
};

export default WaterTankCard;
