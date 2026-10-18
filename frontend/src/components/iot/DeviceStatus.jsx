import React from 'react';

export default function DeviceStatus({ status = 'online', lastSeen = '12 seconds ago', className = '' }) {
  const isOnline = status === 'online';
  const isWarning = status === 'warning';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-200 border ${
      isOnline 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' 
        : isWarning 
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-800'
          : 'bg-slate-500/10 border-slate-500/20 text-slate-700'
    } ${className}`}>
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          isOnline ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-slate-400'
        }`}></span>
      </span>
      <span className="text-xs font-semibold tracking-wide uppercase">
        {isOnline ? 'Field Online' : isWarning ? 'Signal Delay' : 'Field Offline'}
      </span>
      <span className="text-xs text-slate-400 font-normal">• {lastSeen}</span>
    </div>
  );
}
