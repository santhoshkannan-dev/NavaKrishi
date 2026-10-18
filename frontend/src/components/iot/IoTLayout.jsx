import React, { useState } from 'react';
import IoTSidebar from './IoTSidebar';
import NotificationCenter from './NotificationCenter';

export default function IoTLayout({ children, activeSection = 'overview', onSelectSection }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#F5F7F4] text-slate-800 flex overflow-x-hidden font-sans">
      {/* Ambient background blurred gradient blobs for Apple-like glassmorphism */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/30 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-teal-200/25 blur-[120px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-lime-200/25 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <div className="relative z-10 hidden md:block">
        <IoTSidebar activeSection={activeSection} onSelectSection={onSelectSection} />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Notification Drawer */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onMarkAllRead={() => {}}
      />
    </div>
  );
}
