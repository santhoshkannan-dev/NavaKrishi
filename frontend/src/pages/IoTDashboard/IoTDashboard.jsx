import React, { useState, useEffect, useCallback } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  CloudRain, 
  Sparkles,
  AlertCircle,
  RefreshCw,
  Cpu
} from 'lucide-react';
import IoTLayout from '../../components/iot/IoTLayout';
import IoTTopBar from '../../components/iot/IoTTopBar';
import SensorCard from '../../components/iot/SensorCard';
import FieldHealthCard from '../../components/iot/FieldHealthCard';
import SensorChart from '../../components/iot/SensorChart';
import AlertCard from '../../components/iot/AlertCard';
import AssistantCard from '../../components/iot/AssistantCard';
import NotificationCenter from '../../components/iot/NotificationCenter';
import { 
  getFieldSummary,
  getSensorHistory, 
  formatRelativeTime 
} from '../../services/iotApi';

export default function IoTDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chartRange, setChartRange] = useState('24H');

  // Summary state from Django
  const [summary, setSummary] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Unified summary fetch
  const fetchSummary = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);

    const res = await getFieldSummary();

    if (res.error) {
      setApiError(res.error?.detail || "Could not connect to Django IoT backend");
    } else if (res.data) {
      setApiError(null);
      setSummary(res.data);
      setUnreadCount(res.data.active_alert_count || 0);
    }

    if (isInitial) setLoading(false);
  }, []);

  // Fetch History for charts
  const fetchHistoryData = useCallback(async (range) => {
    setHistoryLoading(true);
    let params = { limit: 100 };
    if (range === '1H') params.hours = 1;
    else if (range === '6H') params.hours = 6;
    else if (range === '24H') params.hours = 24;
    else if (range === '7D') params.days = 7;

    const res = await getSensorHistory(params);
    if (!res.error) {
      setHistory(res.data || []);
    }
    setHistoryLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchSummary(true);
    fetchHistoryData(chartRange);
  }, [fetchSummary, fetchHistoryData, chartRange]);

  // Periodic 5s polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummary(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchSummary]);

  const latestSensor = summary?.current_reading;
  const health = summary?.field_health || { score: 0, condition: 'OFFLINE', explanation: 'Awaiting telemetry...' };
  const device = summary?.device_status || { status: 'offline', seconds_ago: null, last_seen: null };
  const alerts = summary?.latest_alerts || [];

  // Determine sensor display status
  const getSoilStatus = (val) => {
    if (val == null) return { text: 'WAITING', type: 'info' };
    if (val < 20) return { text: 'CRITICAL LOW', type: 'critical' };
    if (val < 35) return { text: 'LOW', type: 'warning' };
    if (val > 80) return { text: 'SATURATED', type: 'warning' };
    return { text: 'NORMAL', type: 'normal' };
  };

  const getTempStatus = (val) => {
    if (val == null) return { text: 'WAITING', type: 'info' };
    if (val > 35) return { text: 'HIGH', type: 'warning' };
    if (val < 10) return { text: 'LOW', type: 'warning' };
    return { text: 'NORMAL', type: 'normal' };
  };

  const getHumStatus = (val) => {
    if (val == null) return { text: 'WAITING', type: 'info' };
    if (val > 85) return { text: 'HIGH', type: 'warning' };
    if (val < 30) return { text: 'LOW', type: 'warning' };
    return { text: 'NORMAL', type: 'normal' };
  };

  const soilStatus = getSoilStatus(latestSensor?.soil_moisture);
  const tempStatus = getTempStatus(latestSensor?.temperature);
  const humStatus = getHumStatus(latestSensor?.humidity);

  return (
    <IoTLayout activeSection={activeSection} onSelectSection={setActiveSection}>
      {/* Top Bar */}
      <IoTTopBar 
        deviceStatus={device.status}
        lastSeen={formatRelativeTime(device.last_seen)}
        unreadCount={unreadCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Backend Connection Error */}
      {apiError && (
        <div className="mb-6 p-4 rounded-3xl bg-rose-50/80 backdrop-blur-xl border border-rose-200/80 shadow-sm flex items-center justify-between text-rose-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Backend Connection Issue</p>
              <p className="text-xs text-rose-600/90">{apiError}</p>
            </div>
          </div>
          <button 
            onClick={() => fetchSummary(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Empty Database State Notice */}
      {!loading && !latestSensor && !apiError && (
        <div className="mb-6 p-5 rounded-3xl bg-amber-50/70 backdrop-blur-xl border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Awaiting ESP32 Telemetry</h3>
              <p className="text-xs text-amber-800/90 mt-0.5">
                No sensor records in database yet. Send telemetry to <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">/api/iot/data/</code> to stream live data.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchSummary(false)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      )}

      {/* Welcome & Live Status Header */}
      <section className="mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Good evening, Farmer 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here is what's happening in your field right now. Environmental telemetry streaming live.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Live Field Intelligence
          </div>
        </div>
      </section>

      {/* 4 Live Sensor Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <SensorCard
          title="Soil Moisture"
          value={latestSensor ? latestSensor.soil_moisture : '--'}
          unit="%"
          status={soilStatus.text}
          statusType={soilStatus.type}
          subtitle={latestSensor?.soil_moisture < 35 ? "Soil is becoming dry" : "Optimal moisture range"}
          icon={Droplets}
          accent="emerald"
          timestamp={formatRelativeTime(latestSensor?.created_at)}
        />
        <SensorCard
          title="Temperature"
          value={latestSensor ? Number(latestSensor.temperature).toFixed(1) : '--'}
          unit="°C"
          status={tempStatus.text}
          statusType={tempStatus.type}
          subtitle="Comfortable crop environment"
          icon={Thermometer}
          accent="amber"
          timestamp={formatRelativeTime(latestSensor?.created_at)}
        />
        <SensorCard
          title="Humidity"
          value={latestSensor ? Number(latestSensor.humidity).toFixed(1) : '--'}
          unit="%"
          status={humStatus.text}
          statusType={humStatus.type}
          subtitle="Atmospheric moisture level"
          icon={Wind}
          accent="blue"
          timestamp={formatRelativeTime(latestSensor?.created_at)}
        />
        <SensorCard
          title="Precipitation"
          value={latestSensor ? (latestSensor.rain_detected ? 'Rain' : 'No Rain') : '--'}
          status={latestSensor?.rain_detected ? 'ACTIVE' : 'DRY'}
          statusType={latestSensor?.rain_detected ? 'warning' : 'info'}
          subtitle={latestSensor?.rain_detected ? 'Precipitation detected in field' : 'Field sensor dry'}
          icon={CloudRain}
          accent="purple"
          timestamp={formatRelativeTime(latestSensor?.created_at)}
        />
      </section>

      {/* Sensor Analytics & Field Health Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
        <div className="lg:col-span-8">
          <SensorChart 
            history={history}
            activeRange={chartRange}
            onRangeChange={(r) => {
              setChartRange(r);
              fetchHistoryData(r);
            }}
            loading={historyLoading}
          />
        </div>
        <div className="lg:col-span-4 flex flex-col justify-between">
          <FieldHealthCard
            score={health.score}
            condition={health.condition}
            explanation={health.explanation}
          />
        </div>
      </section>

      {/* Intelligent Alerts & NLP Assistant */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <AlertCard alerts={alerts} />
        </div>
        <div className="lg:col-span-6">
          <AssistantCard />
        </div>
      </section>

      {/* Notification Center slide-out modal */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onUpdateCount={setUnreadCount}
      />
    </IoTLayout>
  );
}
