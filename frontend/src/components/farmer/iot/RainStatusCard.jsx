import { FiCloudRain } from "react-icons/fi";

const RainStatusCard = ({ detected = false, updatedAt = null }) => {
  return (
    <article className="rounded-3xl border border-[#dfe8d8] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#5c6f62]">Rain Sensor</p>
        <div className="rounded-2xl bg-[#eef8ff] p-2 text-[#0369a1]">
          <FiCloudRain />
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-[#012d1d]">{detected ? "Rain Detected" : "No Rain"}</p>
      <p className="mt-2 text-sm text-[#5c6f62]">
        {detected ? "Pause irrigation until the sensor clears." : "Irrigation can continue safely."}
      </p>
      <p className="mt-2 text-xs text-[#7a8b80]">{updatedAt ? `Last update: ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(updatedAt))}` : "No timestamp available yet."}</p>
    </article>
  );
};

export default RainStatusCard;
