
import React, { useState } from 'react';

interface DashboardMonitorProps {
  onBack: () => void;
}

interface MonitorSource {
  id: string;
  name: string;
  url: string;
  building: string;
  icon: string;
}

const MONITOR_SOURCES: MonitorSource[] = [
  { id: 'vm-1', name: 'ViMUT SMART (VM)', url: 'https://lookerstudio.google.com/embed/reporting/4be14bed-81e8-461e-9489-4c94a63dd125/page/p_nfsx6224id', building: 'ViMUT Hospital (VM)', icon: '🏥' },
  { id: 'vm-2', name: 'VM SAFETY (VM)', url: 'https://lookerstudio.google.com/embed/reporting/b865dbca-accb-49bc-a306-614245aef600/page/S0IMF', building: 'ViMUT Hospital (VM)', icon: '🛡️' },
  { id: 'vth-1', name: 'THEPTARIN (VTH)', url: 'https://lookerstudio.google.com/embed/reporting/baa2ac8b-9f66-4276-90c6-be191812184d/page/XJvUF', building: 'ViMUT-Theptarin (VTH)', icon: '🏨' },
  { id: 'iot', name: 'Modela IoT (ALL)', url: 'https://www.modelaaiot.com/dashboard/JdIcXHOF4gG3smYXyF5V', building: 'IoT System (Global)', icon: '📡' },
  { id: 'solar', name: 'FUSION SOLAR', url: 'https://sg5.fusionsolar.huawei.com/pvmswebsite/login/build/index.html', building: 'Solar System (Global)', icon: '☀️' }
];

const DashboardMonitor: React.FC<DashboardMonitorProps> = ({ onBack }) => {
  const [selectedDashboard, setSelectedDashboard] = useState<MonitorSource | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] overflow-hidden no-select">
      {/* Dynamic Header */}
      <header className="px-4 py-4 sm:px-6 bg-black/80 border-b border-cyan-500/20 backdrop-blur-3xl sticky top-0 z-30 shadow-2xl shrink-0">
        <div className="flex items-center gap-3 mb-1">
           <button 
             onClick={selectedDashboard ? () => setSelectedDashboard(null) : onBack} 
             className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-all shadow-md"
           >
              <i className="fa-solid fa-arrow-left text-sm text-cyan-400"></i>
           </button>
           <div className="min-w-0 flex-1">
              <h1 className="font-display text-base sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 truncate uppercase">
                {selectedDashboard ? selectedDashboard.name : 'DASHBOARD MONITOR'}
              </h1>
              <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/40 font-black truncate">
                {selectedDashboard ? selectedDashboard.building : 'Integrated Analytics Hub'}
              </p>
           </div>
           {selectedDashboard && (
             <a 
               href={selectedDashboard.url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="w-10 h-10 flex items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 active:scale-90 transition-all"
               title="Open External"
             >
               <i className="fa-solid fa-up-right-from-square text-xs"></i>
             </a>
           )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {selectedDashboard ? (
          <div className="w-full h-full bg-black relative">
            <div className="absolute inset-0 flex items-center justify-center -z-10">
               <div className="flex flex-col items-center gap-4 opacity-20">
                  <i className="fa-solid fa-circle-notch fa-spin text-4xl text-cyan-400"></i>
                  <p className="font-display text-[10px] uppercase tracking-[0.2em]">Establishing Looker Connection...</p>
               </div>
            </div>
            <iframe 
              src={selectedDashboard.url} 
              className="w-full h-full border-none"
              title={selectedDashboard.name}
              allowFullScreen
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-10 no-scrollbar flex flex-col items-center">
            <div className="w-full max-w-5xl">
              <div className="flex items-center gap-3 mb-8">
                 <h3 className="font-display text-[9px] sm:text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] whitespace-nowrap">
                    AVAILABLE ANALYTICS
                 </h3>
                 <div className="flex-1 h-px bg-cyan-400/10"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {MONITOR_SOURCES.map(source => (
                  <button 
                    key={source.id} 
                    onClick={() => setSelectedDashboard(source)}
                    className="cyber-card p-6 rounded-3xl border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 active:scale-[0.98] transition-all flex items-center gap-6 group text-left"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-inner border border-white/5">
                      {source.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-[14px] sm:text-[16px] font-bold text-white mb-1 leading-tight group-hover:text-cyan-400">{source.name}</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">{source.building}</p>
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-tighter border border-cyan-500/30">
                           CONNECTED
                         </span>
                         <i className="fa-solid fa-arrow-right text-[10px] text-white/10 group-hover:text-cyan-400 transition-colors"></i>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/5 text-center opacity-40">
                 <i className="fa-solid fa-circle-info text-2xl mb-4 text-cyan-400"></i>
                 <p className="text-[10px] sm:text-xs leading-relaxed max-w-xl mx-auto italic">
                   "iMATOMs Pro provides direct embedding for real-time visualization. Performance may depend on internal network speed and Looker Studio availability."
                 </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar for Mobile (Only on Menu) */}
      {!selectedDashboard && (
        <div className="fixed bottom-4 left-4 right-4 h-16 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl flex justify-around items-center z-40 md:hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
           <button onClick={onBack} className="flex flex-col items-center gap-1 text-white/40 active:text-cyan-400 transition-colors">
              <i className="fa-solid fa-house-chimney text-lg"></i>
              <span className="text-[7px] font-black uppercase tracking-widest">Home</span>
           </button>
           
           <div className="relative -top-3">
              <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border-2 border-[#0a0e17] active:scale-90 transition-transform">
                <i className="fa-solid fa-chart-line text-white text-xl"></i>
              </div>
           </div>
           
           <button className="flex flex-col items-center gap-1 text-white/40 active:text-cyan-400 transition-colors">
              <i className="fa-solid fa-user-gear text-lg"></i>
              <span className="text-[7px] font-black uppercase tracking-widest">User</span>
           </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default DashboardMonitor;
