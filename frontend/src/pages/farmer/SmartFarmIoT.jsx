import { useEffect, useState } from "react";
import {
  getLatestSensorData,
  getPumpCommand,
  getSensorHistory,
  setPumpCommand,
} from "../../api/iot";
import SensorCard from "../../components/farmer/iot/SensorCard";
import WaterTankCard from "../../components/farmer/iot/WaterTankCard";
import RainStatusCard from "../../components/farmer/iot/RainStatusCard";
import AIAdvisory from "../../components/farmer/iot/AIAdvisory";
import MoistureChart from "../../components/farmer/iot/MoistureChart";
import SensorHealth from "../../components/farmer/iot/SensorHealth";
import IrrigationControl from "../../components/farmer/iot/IrrigationControl";
import AlertsPanel from "../../components/farmer/iot/AlertsPanel";

const classifyMoisture = (value) => {
  if (value == null) return "Unknown";
  if (value <= 30) return "Critical";
  if (value <= 55) return "Warning";
  return "Optimal";
};

const classifyTemperature = (value) => {
  if (value == null) return "Unknown";
  if (value >= 36) return "Critical";
  if (value >= 31) return "Warning";
  return "Optimal";
};

const classifyHumidity = (value) => {
  if (value == null) return "Unknown";
  if (value < 35) return "Critical";
  if (value < 55) return "Warning";
  return "Optimal";
};

const formatTimestamp = (value) => {
  if (!value) return "No readings yet";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const SmartFarmIoT = () => {
  const [latestSensor, setLatestSensor] = useState(null);
  const [history, setHistory] = useState([]);
  const [pumpCommand, setPumpCommandState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingPump, setSavingPump] = useState(false);
  const [error, setError] = useState("");

  const loadIoTData = async () => {
    setError("");

    try {
      const results = await Promise.allSettled([
        getLatestSensorData(),
        getSensorHistory(),
        getPumpCommand(),
      ]);

      const latestResult = results[0];
      const historyResult = results[1];
      const pumpResult = results[2];

      if (latestResult.status === "fulfilled") {
        setLatestSensor(latestResult.value.data);
      } else if (latestResult.reason?.response?.status !== 404) {
        throw latestResult.reason;
      } else {
        setLatestSensor(null);
      }

      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value.data || []);
      } else {
        throw historyResult.reason;
      }

      if (pumpResult.status === "fulfilled") {
        setPumpCommandState(pumpResult.value.data);
      } else {
        throw pumpResult.reason;
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || "Unable to load IoT data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIoTData();

    const intervalId = window.setInterval(() => {
      setRefreshing(true);
      loadIoTData();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const latestTemperature = latestSensor?.temperature ?? null;
  const latestHumidity = latestSensor?.humidity ?? null;
  const latestMoisture = latestSensor?.soil_moisture ?? null;
  const latestRainDetected = Boolean(latestSensor?.rain_detected);
  const latestPumpStatus = Boolean(pumpCommand?.pump ?? latestSensor?.pump_status ?? false);
  const latestManualMode = Boolean(pumpCommand?.manual_mode ?? false);

  const sensorData = [
    {
      title: "Soil Moisture",
      value: latestMoisture == null ? "--" : `${latestMoisture}%`,
      status: classifyMoisture(latestMoisture),
    },
    {
      title: "Temperature",
      value: latestTemperature == null ? "--" : `${Number(latestTemperature).toFixed(1)}°C`,
      status: classifyTemperature(latestTemperature),
    },
    {
      title: "Humidity",
      value: latestHumidity == null ? "--" : `${Number(latestHumidity).toFixed(1)}%`,
      status: classifyHumidity(latestHumidity),
    },
  ];

  const alerts = [];

  if (latestMoisture != null && latestMoisture <= 30) {
    alerts.push({ title: "Low soil moisture", detail: `Moisture is at ${latestMoisture}% and irrigation should run.` });
  }

  if (latestRainDetected) {
    alerts.push({ title: "Rain detected", detail: "Delay irrigation because the rain sensor is active." });
  }

  if (!latestPumpStatus) {
    alerts.push({ title: "Pump is off", detail: "The irrigation pump is currently not running." });
  }

  const handlePumpToggle = async () => {
    setSavingPump(true);

    try {
      const response = await setPumpCommand(!latestPumpStatus, true);
      setPumpCommandState(response.data);
      await loadIoTData();
    } finally {
      setSavingPump(false);
    }
  };

  const handleModeToggle = async (targetManualMode) => {
    setSavingPump(true);

    try {
      const response = await setPumpCommand(latestPumpStatus, targetManualMode);
      setPumpCommandState(response.data);
      await loadIoTData();
    } finally {
      setSavingPump(false);
    }
  };

  const historyPoints = history.slice(0, 7).reverse().map((entry) => entry.soil_moisture);

  const healthRows = [
    {
      name: "Soil moisture sensor",
      status: latestSensor ? "Online" : "Offline",
      updated: formatTimestamp(latestSensor?.created_at),
    },
    {
      name: "Rain sensor",
      status: latestSensor ? "Online" : "Offline",
      updated: formatTimestamp(latestSensor?.created_at),
    },
    {
      name: "Pump controller",
      status: pumpCommand ? (latestManualMode ? "Manual" : "Auto") : "Offline",
      updated: formatTimestamp(pumpCommand?.created_at),
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2f6b23]">Smart Farm IoT</p>
            <h1 className="mt-2 text-3xl font-bold text-[#012d1d] md:text-4xl">Smart Farm IoT Center</h1>
            <div className="mt-2 text-sm font-semibold text-[#2f6b23]">
              {loading ? "Loading sensor data..." : `Last reading: ${formatTimestamp(latestSensor?.created_at)}`}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setRefreshing(true);
                loadIoTData();
              }}
              className="rounded-2xl border border-[#d6e4cf] bg-[#eef8e8] px-4 py-2 text-sm font-semibold text-[#1f6d1a] transition hover:bg-[#e2f2da]"
            >
              Sync Sensor Nodes
            </button>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm font-medium text-[#b42318]">{error}</p> : null}
        {refreshing ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5c6f62]">Refreshing...</p> : null}
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="space-y-8 xl:col-span-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {sensorData.map((s) => (
              <SensorCard key={s.title} {...s} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:items-start">
            <div className="space-y-4 xl:col-span-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <WaterTankCard
                    title="Pump Status"
                    value={latestPumpStatus ? "Running" : "Stopped"}
                    level={latestPumpStatus ? 100 : 0}
                    note={
                      latestPumpStatus
                        ? latestManualMode
                          ? "Manual override is active and the relay is currently switched on."
                          : "Auto mode is active and the relay is currently switched on."
                        : latestManualMode
                          ? "Manual override is active and the relay is currently switched off."
                          : "Auto mode is active and the relay is currently switched off."
                    }
                  />
                </div>
                <div>
                  <RainStatusCard detected={latestRainDetected} updatedAt={latestSensor?.created_at} />
                </div>
              </div>

              <MoistureChart points={historyPoints} />
            </div>

            <div className="space-y-4 xl:col-span-4">
              <IrrigationControl
                pumpOn={latestPumpStatus}
                manualMode={latestManualMode}
                loading={savingPump}
                onToggle={handlePumpToggle}
                onModeToggle={handleModeToggle}
              />
              <AlertsPanel alerts={alerts} />
            </div>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <AIAdvisory
            message={
              latestMoisture == null
                ? "Waiting for the first sensor packet from your ESP device."
                : latestMoisture <= 30
                  ? "Soil moisture is low. Run the pump or extend the irrigation window for the next cycle."
                  : latestRainDetected
                    ? "Rain is detected, so the controller should pause irrigation until the sensor clears."
                    : "Conditions look stable. Keep monitoring the live sensor stream and irrigation state."
            }
          />
          <SensorHealth rows={healthRows} />
        </div>
      </div>
    </div>
  );
};

export default SmartFarmIoT;
