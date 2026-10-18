import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sprout, 
  LayoutDashboard, 
  Radio, 
  LineChart, 
  Bell, 
  Bot, 
  Settings, 
  ArrowLeft 
} from 'lucide-react';

export default function IoTSidebar({ activeSection = 'overview', onSelectSection }) {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'sensors', name: 'Live Sensors', icon: Radio },
    { id: 'analytics', name: 'Analytics', icon: LineChart },
    { id: 'alerts', name: 'Alerts', icon: Bell },
    { id: 'assistant', name: 'AI Assistant', icon: Bot },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white/70 backdrop-blur-2xl border-r border-white/80 p-6 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.015)]">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-800">NavaKrishi</h1>
            <p className="text-[11px] font-medium tracking-wide uppercase text-emerald-700">Field Intelligence</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="mt-8 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection && onSelectSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600/10 text-emerald-800 shadow-sm border border-emerald-600/20'
                    : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200/50 space-y-2">
        <NavLink
          to="/farmer-dashboard"
          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Farmer Portal</span>
        </NavLink>

        <button className="w-full flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-medium text-slate-500 hover:bg-slate-100/60 hover:text-slate-800 transition">
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
