import { FiAlertTriangle } from "react-icons/fi";

const AlertsPanel = ({ alerts = [] }) => {
  return (
    <article className="rounded-3xl border border-[#f5d2d2] bg-[#fff8f8] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#7a271a]">Active Alerts</h3>
        <FiAlertTriangle className="text-[#b42318]" />
      </div>

      <div className="mt-4 space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-[#5c6f62]">No active alerts right now.</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.title} className="rounded-2xl border border-[#f4d5d5] bg-white px-4 py-3">
              <p className="text-sm font-semibold text-[#7a271a]">{alert.title}</p>
              <p className="mt-1 text-xs text-[#8a4b45]">{alert.detail}</p>
            </div>
          ))
        )}
      </div>
    </article>
  );
};

export default AlertsPanel;
