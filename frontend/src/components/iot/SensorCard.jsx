import React from 'react';
import { motion } from 'framer-motion';

export default function SensorCard({ 
  title, 
  value, 
  unit = '', 
  status = 'Normal', 
  statusType = 'normal', 
  subtitle, 
  icon: Icon, 
  accent = 'emerald',
  timestamp = null 
}) {
  const statusStyles = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    critical: 'bg-rose-50 text-rose-700 border-rose-200/60',
    info: 'bg-sky-50 text-sky-700 border-sky-200/60',
  };

  const accentGradients = {
    emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-600 border-emerald-500/20',
    blue: 'from-sky-500/15 to-sky-500/5 text-sky-600 border-sky-500/20',
    amber: 'from-amber-500/15 to-amber-500/5 text-amber-600 border-amber-500/20',
    purple: 'from-purple-500/15 to-purple-500/5 text-purple-600 border-purple-500/20',
  };

  return (
    <motion.div 
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_22px_45px_rgba(0,0,0,0.06)] flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${accentGradients[accent] || accentGradients.emerald} border shadow-sm`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
            <span className={`inline-block mt-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${statusStyles[statusType] || statusStyles.normal}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight text-slate-800">
            {value}
          </span>
          {unit && <span className="text-xl font-medium text-slate-500">{unit}</span>}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        )}
        {timestamp && (
          <p className="mt-2 text-[11px] text-slate-400">
            Updated {timestamp}
          </p>
        )}
      </div>
    </motion.div>
  );
}
