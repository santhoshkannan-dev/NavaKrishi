import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Thermometer, CloudRain, BarChart3 } from 'lucide-react';

export default function SensorChart({ 
  history = [], 
  activeRange = '24H', 
  onRangeChange, 
  loading = false 
}) {
  const [activeMetric, setActiveMetric] = useState('soil');
  const ranges = ['1H', '6H', '24H', '7D'];

  // Transform raw history into chronological points formatted for chart
  const formattedData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    // Sort chronological (oldest to newest)
    const sorted = [...history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return sorted.map((item) => {
      const d = new Date(item.created_at);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        time: timeStr,
        timestamp: item.created_at,
        soil: Number(item.soil_moisture),
        temp: Number(item.temperature),
        humidity: Number(item.humidity),
        isRaining: Boolean(item.rain_detected),
      };
    });
  }, [history]);

  // Compute live statistics for current selection
  const stats = useMemo(() => {
    if (formattedData.length === 0) {
      return { current: '--', avg: '--', min: '--', max: '--' };
    }

    const key = activeMetric === 'soil' ? 'soil' : activeMetric === 'temp' ? 'temp' : 'humidity';
    const values = formattedData.map((d) => d[key]).filter((v) => !isNaN(v));

    if (values.length === 0) return { current: '--', avg: '--', min: '--', max: '--' };

    const currentVal = values[values.length - 1];
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avgVal = (sum / values.length).toFixed(1);

    const unit = activeMetric === 'temp' ? '°C' : '%';

    return {
      current: `${currentVal}${unit}`,
      avg: `${avgVal}${unit}`,
      min: `${minVal}${unit}`,
      max: `${maxVal}${unit}`,
    };
  }, [formattedData, activeMetric]);

  const metricsConfig = {
    soil: {
      label: 'Soil Moisture',
      unit: '%',
      color: '#10b981',
      gradientId: 'soilGrad',
      icon: Droplets,
    },
    temp: {
      label: 'Temperature',
      unit: '°C',
      color: '#f59e0b',
      gradientId: 'tempGrad',
      icon: Thermometer,
    },
    humidity: {
      label: 'Humidity',
      unit: '%',
      color: '#0ea5e9',
      gradientId: 'humGrad',
      icon: CloudRain,
    },
  };

  const currentConfig = metricsConfig[activeMetric];

  return (
    <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.03)]">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/50">
          {Object.entries(metricsConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isSelected = activeMetric === key;
            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? config.color : undefined }} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => onRangeChange && onRangeChange(range)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                activeRange === range
                  ? 'bg-emerald-500/10 text-emerald-800 font-semibold border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Statistics Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/40">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current</span>
          <p className="text-base font-semibold text-slate-800">{stats.current}</p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Average</span>
          <p className="text-base font-semibold text-slate-800">{stats.avg}</p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Minimum</span>
          <p className="text-base font-semibold text-slate-800">{stats.min}</p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Maximum</span>
          <p className="text-base font-semibold text-slate-800">{stats.max}</p>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-64 mt-6">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            <span className="animate-pulse">Loading telemetry history...</span>
          </div>
        ) : formattedData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
            <BarChart3 className="w-8 h-8 text-slate-300" />
            <span>No historical readings available for the selected period.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(12px)',
                  fontSize: '12px',
                  padding: '8px 12px',
                }}
                formatter={(val) => [`${val} ${currentConfig.unit}`, currentConfig.label]}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={currentConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${currentConfig.gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
