import React, { useState, useEffect } from 'react';
import { X, CheckCheck, Bell, AlertTriangle, CloudRain, Flame, CheckCircle2, RefreshCw } from 'lucide-react';
import { getAlerts, markAlertAsRead, markAllAlertsAsRead, formatRelativeTime } from '../../services/iotApi';

export default function NotificationCenter({ isOpen, onClose, onUpdateCount }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = async () => {
    setLoading(true);
    const res = await getAlerts();
    if (res.data) {
      setAlerts(res.data);
      if (onUpdateCount) {
        const unread = res.data.filter((a) => !a.is_read).length;
        onUpdateCount(unread);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkOne = async (id) => {
    await markAlertAsRead(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );
    if (onUpdateCount) {
      onUpdateCount(alerts.filter((a) => a.id !== id && !a.is_read).length);
    }
  };

  const handleMarkAll = async () => {
    await markAllAlertsAsRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    if (onUpdateCount) onUpdateCount(0);
  };

  const getIcon = (type, severity) => {
    if (type.includes('RAIN')) return <CloudRain className="w-4 h-4 text-sky-600" />;
    if (type.includes('TEMP')) return <Flame className="w-4 h-4 text-amber-600" />;
    if (severity === 'critical') return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'unread') return !a.is_read;
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'warning') return a.severity === 'warning';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/15 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="w-full max-w-sm sm:max-w-md h-full bg-white/90 backdrop-blur-2xl border-l border-white/80 shadow-2xl p-6 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Field Notifications</h2>
                <p className="text-[11px] text-slate-400">Automated environmental intelligence</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 my-4">
            {['all', 'unread', 'critical', 'warning'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition ${
                  filter === f
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={fetchAlerts}
              className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 overflow-y-auto max-h-[62vh] pr-1">
            {loading && alerts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading notifications...
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                <span>No notifications in this category.</span>
              </div>
            ) : (
              filteredAlerts.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => !item.is_read && handleMarkOne(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    item.is_read 
                      ? 'bg-slate-50/60 border-slate-100 text-slate-600 opacity-75' 
                      : item.severity === 'critical'
                        ? 'bg-rose-50/60 border-rose-200 text-slate-900 shadow-sm'
                        : item.severity === 'warning'
                          ? 'bg-amber-50/60 border-amber-200 text-slate-900 shadow-sm'
                          : 'bg-white border-slate-200/80 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 shrink-0">
                      {getIcon(item.alert_type, item.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          item.severity === 'critical' ? 'text-rose-600' : item.severity === 'warning' ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {item.severity}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatRelativeTime(item.created_at)}</span>
                      </div>
                      <h4 className="text-xs font-semibold mt-0.5 text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mark all read button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleMarkAll}
            disabled={alerts.every((a) => a.is_read)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold transition"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}
