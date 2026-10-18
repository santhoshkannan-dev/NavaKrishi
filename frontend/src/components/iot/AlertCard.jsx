import React from 'react';
import { AlertTriangle, CheckCircle2, CloudRain, Flame, Bell } from 'lucide-react';
import { formatRelativeTime } from '../../services/iotApi';

export default function AlertCard({ alerts = [] }) {
  const getIcon = (type) => {
    if (type.includes('RAIN')) return <CloudRain className="w-5 h-5 text-sky-600" />;
    if (type.includes('TEMP')) return <Flame className="w-5 h-5 text-amber-600" />;
    if (type.includes('CRITICAL')) return <AlertTriangle className="w-5 h-5 text-rose-600" />;
    if (type.includes('LOW')) return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
  };

  const getBorder = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-rose-200 bg-rose-50/40';
      case 'warning':
        return 'border-amber-200 bg-amber-50/40';
      default:
        return 'border-emerald-200/60 bg-emerald-50/30';
    }
  };

  const displayAlerts = alerts.length > 0 ? alerts : [
    {
      id: 'default',
      alert_type: 'NORMAL',
      severity: 'info',
      title: 'Field conditions are currently stable',
      message: 'All monitored environmental parameters are within configured normal ranges.',
      created_at: new Date().toISOString()
    }
  ];

  return (
    <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Intelligent Alerts</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Auto-Deduplicated Engine</span>
      </div>

      <div className="mt-4 space-y-3">
        {displayAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all ${getBorder(alert.severity)}`}
          >
            <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 shrink-0">
              {getIcon(alert.alert_type || 'NORMAL')}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-800">{alert.title}</h4>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {formatRelativeTime(alert.created_at)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
