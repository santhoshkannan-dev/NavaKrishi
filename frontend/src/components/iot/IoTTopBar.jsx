import React from 'react';
import { Bell, User } from 'lucide-react';
import DeviceStatus from './DeviceStatus';

export default function IoTTopBar({ 
  deviceStatus = 'online', 
  lastSeen = '12 seconds ago',
  unreadCount = 1,
  onOpenNotifications 
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Agro-Telemetry</span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Field Intelligence</h2>
      </div>

      <div className="flex items-center gap-3">
        <DeviceStatus status={deviceStatus} lastSeen={lastSeen} />

        <button 
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-white/80 text-slate-600 hover:text-slate-900 shadow-sm transition active:scale-95"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/60">
          <div className="w-8 h-8 rounded-full bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-700 font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">Farmer</p>
            <p className="text-[10px] text-slate-400">Green Valley Node</p>
          </div>
        </div>
      </div>
    </header>
  );
}
