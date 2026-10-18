const IrrigationControl = ({ pumpOn = false, manualMode = true, loading = false, onToggle, onModeToggle }) => {
  const canSwitchToAuto = manualMode;

  return (
    <article className="rounded-3xl border border-[#dfe8d8] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#012d1d]">Irrigation Control</h3>
      <p className="mt-2 text-sm text-[#5c6f62]">
        {manualMode ? "Manual mode is active." : "Auto mode is active."} {pumpOn ? "The pump is running now." : "The pump is currently stopped."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={onToggle}
          disabled={loading}
          className="rounded-2xl bg-[#1f6d1a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#175515] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : pumpOn ? "Turn Off" : "Turn On"}
        </button>
        <button
          onClick={() => onModeToggle?.(canSwitchToAuto ? false : true)}
          disabled={loading}
          className="rounded-2xl border border-[#d6e4cf] bg-white px-4 py-2 text-sm font-semibold text-[#1f6d1a] transition hover:bg-[#f3f8ef] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {manualMode ? "Switch to Auto" : "Switch to Manual"}
        </button>
      </div>
    </article>
  );
};

export default IrrigationControl;
