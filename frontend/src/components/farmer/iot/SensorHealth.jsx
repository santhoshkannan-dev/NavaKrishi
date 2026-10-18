const defaultRows = [
  { name: "Moisture #04", status: "Online", updated: "2m ago" },
  { name: "Humidity #09", status: "Online", updated: "4m ago" },
  { name: "Flowmeter #12", status: "Offline", updated: "27m ago" },
];

const SensorHealth = ({ rows = defaultRows }) => {
  return (
    <article className="rounded-3xl border border-[#dfe8d8] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#012d1d]">Sensor Health</h3>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.name} className="rounded-2xl border border-[#e6eee2] bg-[#fbfdf9] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#012d1d]">{row.name}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  row.status === "Online" ? "bg-[#e8f7e6] text-[#1f6d1a]" : "bg-[#fee2e2] text-[#b42318]"
                }`}
              >
                {row.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#5c6f62]">Updated {row.updated}</p>
          </div>
        ))}
      </div>
    </article>
  );
};

export default SensorHealth;
