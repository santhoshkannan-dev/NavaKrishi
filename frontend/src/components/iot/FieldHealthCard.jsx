import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function FieldHealthCard({ 
  score = 82, 
  condition = 'GOOD', 
  explanation = 'Current environmental readings are within the configured monitoring ranges.' 
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const conditionColors = {
    GOOD: {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200/70',
      stroke: '#10b981',
    },
    WARNING: {
      text: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200/70',
      stroke: '#f59e0b',
    },
    CRITICAL: {
      text: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200/70',
      stroke: '#f43f5e',
    },
  };

  const currentTheme = conditionColors[condition] || conditionColors.GOOD;

  return (
    <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Field Health Index</h3>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${currentTheme.bg} ${currentTheme.text}`}>
          {condition}
        </span>
      </div>

      <div className="my-5 flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 -rotate-90 transform">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              className="text-slate-100"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={currentTheme.stroke}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold tracking-tight text-slate-800">{score}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Health / 100</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-sm font-semibold text-slate-800">Field Condition: {condition}</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{explanation}</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Multi-variable engineering score. Rule-based model.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
