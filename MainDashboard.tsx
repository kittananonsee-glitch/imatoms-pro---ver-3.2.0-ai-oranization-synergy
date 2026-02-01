
import React, { useState, useEffect, useRef } from 'react';
import { AppView, User, Language, Theme } from '../types';
import { GoogleGenAI } from '@google/genai';
import AIAssistant from './AIAssistant';

interface MainDashboardProps {
  user: User;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ user, onNavigate, onLogout, lang, setLang, theme, setTheme }) => {
  const [time, setTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [aiInsight, setAiInsight] = useState<string>('Initializing neural analysis...');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const VERSION = lang === 'TH' ? "รุ่น 3.2.0 ศูนย์วิเคราะห์" : "Ver 3.2.0 Organization Synergy";

  const t = {
    dashboard: lang === 'TH' ? 'หน้าหลัก' : 'iMATOMs Centre',
    ai_analytics: lang === 'TH' ? 'เอไอ วิเคราะห์' : 'AI Analytics',
    mobile_hub: lang === 'TH' ? 'ศูนย์รวมแอป' : 'Mobile Apps',
    looker: lang === 'TH' ? 'IoT มอนิเตอร์' : 'IoT & Monitor',
    morning_brief: lang === 'TH' ? 'ประชุมสรุปงานเช้า' : 'Morning Brief Meeting',
    assets: lang === 'TH' ? 'ฐานข้อมูลพัสดุ' : 'Assets',
    work_orders: lang === 'TH' ? 'ใบแจ้งซ่อม' : 'Work Orders',
    ppm: lang === 'TH' ? 'แผนบำรุงรักษา' : 'PPM Schedule',
    inventory: lang === 'TH' ? 'คลังอะไหล่' : 'Inventory',
    admin: lang === 'TH' ? 'ตั้งค่าระบบ' : 'Admin Setup',
    command: lang === 'TH' ? 'ศูนย์ยุทธศาสตร์ iMATOMs' : 'Strategic Ops Center',
    os_hub: lang === 'TH' ? 'ระบบวิเคราะห์ความน่าเชื่อถือ' : 'Reliability Analysis Hub',
    quick_access: lang === 'TH' ? 'เข้าถึงด่วน' : 'Quick Apps',
    operational: lang === 'TH' ? 'การปฏิบัติงาน' : 'Daily Operations',
    building: lang === 'TH' ? 'อาคารปฏิบัติการ' : 'Operating Site',
    theme_sel: lang === 'TH' ? 'เลือกธีม' : 'Select Theme'
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const checkStatus = () => {
      const usersStr = localStorage.getItem('imatoms_users');
      if (usersStr) {
        const users: User[] = JSON.parse(usersStr);
        setPendingCount(users.filter(u => u.status === 'pending').length);
      }
      const storedAlerts = localStorage.getItem('ai_analytics_alert_count');
      if (storedAlerts) setActiveAlertCount(parseInt(storedAlerts));
    };
    checkStatus();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInsight = async () => {
      setIsAiLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `One sentence facility summary in ${lang === 'TH' ? 'Thai' : 'English'} for iMATOMs Ver 3.2.0 focus on Organization Synergy for user ${user.username} at building ${user.building}. Current theme is ${theme}.`,
        });
        setAiInsight(response.text || "Neural core connected.");
      } catch (err) {
        setAiInsight("AI core momentarily offline.");
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchInsight();
  }, [user.username, user.building, lang, theme]);

  return (
    <div className="flex h-full overflow-hidden bg-transparent font-sans">
      {/* Sidebar - Inlined to prevent scroll reset during clock updates */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-700 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      <nav className={`fixed inset-y-0 left-0 w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 z-[70] transform transition-transform duration-700 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/20"><i className="fa-solid fa-atom"></i></div>
              <div>
                <h1 className="font-display text-lg font-bold text-white tracking-tighter">iMATOMs</h1>
                <p className="text-[8px] text-cyan-400/60 font-bold uppercase tracking-widest">{VERSION}</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="mb-8 p-4 bg-cyan-500/5 rounded-2xl border border-cyan-400/10">
             <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-1 italic">{t.building}</p>
             <p className="text-xs font-bold text-white uppercase tracking-tighter">{user.building === 'all' ? 'CENTRAL HUB (ADMIN)' : user.building}</p>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar scroll-smooth">
            <div className="text-[14px] uppercase tracking-[0.2em] text-green-400 px-4 py-2 font-black">{t.quick_access}</div>
            <NavItem icon="fa-house" label={t.dashboard} active onClick={() => { onNavigate(AppView.MAIN); setIsSidebarOpen(false); }} />
            <NavItem icon="fa-brain" label={t.ai_analytics} onClick={() => onNavigate(AppView.AI_ANALYTICS)} alertCount={activeAlertCount} />
            <NavItem icon="fa-mobile-screen" label={t.mobile_hub} onClick={() => onNavigate(AppView.MOBILE_APPS)} />
            <NavItem icon="fa-chart-column" label={t.looker} onClick={() => onNavigate(AppView.DASHBOARD_MONITOR)} />
            
            <div className="h-px bg-Orange/5 my-4 mx-4"></div>
            <div className="text-[12px] uppercase tracking-[0.2em] text-orange-400 px-4 py-2 font-black">{t.operational}</div>
            <NavItem icon="fa-users-viewfinder" label={t.morning_brief} onClick={() => onNavigate(AppView.MORNING_BRIEF)} />
            <NavItem icon="fa-cube" label={t.assets} onClick={() => onNavigate(AppView.ASSET)} />
            <NavItem icon="fa-wrench" label={t.work_orders} onClick={() => onNavigate(AppView.WORK_ORDER)} />
            <NavItem icon="fa-calendar-check" label={t.ppm} onClick={() => onNavigate(AppView.PPM)} />
            <NavItem icon="fa-boxes-stacked" label={t.inventory} onClick={() => onNavigate(AppView.INVENTORY)} />
            
            {user.role === 'admin' && (
              <>
                <div className="h-px bg-white/5 my-4"></div>
                <NavItem icon="fa-user-shield" label={t.admin} alertCount={pendingCount} onClick={() => onNavigate(AppView.ADMIN)} />
              </>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
             <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold shadow-sm">{user.username.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate text-white">{user.username}</p>
                <p className="text-[9px] text-white/40 uppercase font-black">{user.role}</p>
              </div>
              <button onClick={onLogout} className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all"><i className="fa-solid fa-power-off"></i></button>                      
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:p-12 no-scrollbar pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-12 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(0,245,255,0.5)]"></span>
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">{t.os_hub} @ {user.building.toUpperCase()}</p>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase leading-none">{t.command}</h2>
              </div>
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-cyan-400 active:scale-95 transition-transform">
                <i className="fa-solid fa-bars-staggered"></i>
              </button>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
               <div className="flex bg-white/5 backdrop-blur border border-white/10 rounded-xl p-1 shadow-sm shrink-0">
                 <button onClick={() => setTheme('DIGITAL')} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] transition-all ${theme === 'DIGITAL' ? 'bg-cyan-500 text-black shadow-md' : 'text-white/40 hover:text-white'}`} title="Digital Theme"><i className="fa-solid fa-microchip"></i></button>
                 <button onClick={() => setTheme('BUILDING')} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] transition-all ${theme === 'BUILDING' ? 'bg-orange-500 text-black shadow-md' : 'text-white/40 hover:text-white'}`} title="Building Theme"><i className="fa-solid fa-building"></i></button>
                 <button onClick={() => setTheme('BUSINESS')} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] transition-all ${theme === 'BUSINESS' ? 'bg-blue-400 text-black shadow-md' : 'text-white/40 hover:text-white'}`} title="Business Theme"><i className="fa-solid fa-briefcase"></i></button>
               </div>

               <div className="flex bg-white/5 backdrop-blur border border-white/10 rounded-xl p-1 shadow-sm shrink-0">
                 <button onClick={() => setLang('TH')} className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'TH' ? 'bg-cyan-600 text-black shadow-md' : 'text-white/40 hover:text-white'}`}>TH</button>
                 <button onClick={() => setLang('EN')} className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'EN' ? 'bg-cyan-600 text-black shadow-md' : 'text-white/40 hover:text-white'}`}>EN</button>
               </div>
               <button onClick={() => setIsAssistantOpen(true)} className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center text-cyan-400 shadow-sm hover:border-cyan-400 transition-all group shrink-0">
                 <i className="fa-solid fa-robot group-hover:scale-110 transition-transform"></i>
               </button>
               <div className="hidden sm:block text-right">
                  <p className="text-sm font-display font-black text-white/80">{time.toLocaleTimeString()}</p>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{time.toLocaleDateString()}</p>
               </div>
            </div>
          </header>

          <div className="mb-8 sm:mb-10 p-6 sm:p-8 rounded-3xl cyber-card flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
             <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-2xl sm:text-3xl text-cyan-400 shrink-0 border border-cyan-400/20"><i className="fa-solid fa-robot"></i></div>
             <div className="flex-1 z-10">
                <h3 className="font-display text-[12px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-3">Neural Core Insight: {user.building.toUpperCase()}</h3>
                <p className={`text-xl sm:text-1xl font-black text-white/90 leading-tight tracking-tight ${isAiLoading ? 'animate-pulse' : ''}`}>{aiInsight}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4 mb-8">
             <h3 className="font-display text-[11px] font-black text-green/90 uppercase tracking-[0.5em] whitespace-nowrap italic">{lang === 'TH' ? 'ระบบย่อยทางยุทธศาสตร์' : '5-Main Strategic Systems'}</h3>
             <div className="flex-1 h-px bg-white/5"></div>
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
            <SubsystemCard icon="fa-shield-halved" title={lang === 'TH' ? 'เสถียรภาพ' : 'Reliability System'} desc={lang === 'TH' ? 'จัดการพัสดุและบำรุงรักษา' : 'Asset & PPM Management'} color="cyan" onClick={() => onNavigate(AppView.ASSET)} />
            <SubsystemCard icon="fa-clipboard-check" title={lang === 'TH' ? 'ความปลอดภัย' : 'Quality & Safety System'} desc={lang === 'TH' ? 'ตรวจสอบใบแจ้งซ่อม' : 'Work Order Compliance'} color="orange" onClick={() => onNavigate(AppView.WORK_ORDER)} />
            <SubsystemCard icon="fa-chart-pie" title={lang === 'TH' ? 'ต้นทุน' : 'Cost Efficiency System'} desc={lang === 'TH' ? 'จัดการคลังและทรัพยากร' : 'Inventory & Resource Ops'} color="emerald" onClick={() => onNavigate(AppView.INVENTORY)} />
            <SubsystemCard icon="fa-leaf" title={lang === 'TH' ? 'สิ่งแวดล้อม' : 'ESG & Environmental System'} desc={lang === 'TH' ? 'ความยั่งยืนและอากาศ' : 'Sustainability & IAQ Pulse'} color="purple" onClick={() => onNavigate(AppView.AI_ANALYTICS)} />
            <SubsystemCard icon="fa-users-gear" title={lang === 'TH' ? 'บุคลากร' : 'Staff Utilization System'} desc={lang === 'TH' ? 'ภาระงานและวิเคราะห์ข้อมูล' : 'Workload & BI Analytics'} color="blue" onClick={() => onNavigate(AppView.DASHBOARD_MONITOR)} />
          </div>
              
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
               <h3 className="font-display text-[11px] font-black text-blue/90 uppercase tracking-widest whitespace-nowrap italic">Performance Index ({user.building.toUpperCase()})</h3>
               <div className="flex-1 h-px bg-white/5"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <SnapshotCard label={lang === 'TH' ? 'สถานะวิศวกรรม' : 'Engineering_Reliability'} value="98.0" status="normal" unit="%" />
               <SnapshotCard label={lang === 'TH' ? 'อัตราความถูกต้อง' : 'ESG_Carbon credit'} value="350" status="normal" unit="tCO2" />
               <SnapshotCard label={lang === 'TH' ? 'ประหยัดพลังงาน' : 'Energy Savings_Electricity'} value="-350,000" status="normal" unit="kWh" />
               <SnapshotCard label={lang === 'TH' ? 'สภาวะแวดล้อม' : 'Environmental_PM2.5'} value="35.5" status="warning" unit="µg/m3" />
            </div>
          </section>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-black/85 backdrop-blur-3xl border-t border-white/10 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center px-1">
           <MobileNavItem icon="fa-house" label={t.dashboard} active onClick={() => onNavigate(AppView.MAIN)} />
           <MobileNavItem icon="fa-brain" label="AI" onClick={() => onNavigate(AppView.AI_ANALYTICS)} />
           <MobileNavItem icon="fa-chart-column" label="Monitor" onClick={() => onNavigate(AppView.DASHBOARD_MONITOR)} />
           
           <div className="relative -top-3 px-1">
             <button onClick={() => onNavigate(AppView.WORK_ORDER)} className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-lg shadow-lg shadow-cyan-500/20 border-2 border-[#0a0e17] active:scale-90 transition-transform">
               <i className="fa-solid fa-wrench"></i>
             </button>
           </div>
           
           <MobileNavItem icon="fa-mobile-screen" label="Apps" onClick={() => onNavigate(AppView.MOBILE_APPS)} />
           <MobileNavItem icon="fa-user-shield" label="Admin" onClick={() => onNavigate(AppView.ADMIN)} />
        </div>
      </div>

      <AIAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} systemContext={`Ver 3.1.2 - Theme: ${theme} - Building: ${user.building} - User: ${user.username}`} />
    </div>
  );
};

const MobileNavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all flex-1 min-w-[54px] ${active ? 'text-cyan-400' : 'text-white/30 hover:text-white/60'}`}>
     <i className={`fa-solid ${icon} text-[16px]`}></i>
     <span className="text-[7px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
  </button>
);

const NavItem = ({ icon, label, active, onClick, alertCount }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all relative group ${active ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-400/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,245,255,0.4)]' : 'bg-white/5 group-hover:bg-white/10'}`}>
       <i className={`fa-solid ${icon} text-sm`}></i>
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest truncate italic">{label}</span>
    {alertCount > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 text-[8px] font-black text-white flex items-center justify-center shadow-lg">{alertCount}</span>}
  </button>
);

const SubsystemCard = ({ icon, title, desc, color, onClick }: any) => {
  const colorMap: any = {
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:border-cyan-500/50',
    orange: 'border-orange-500/20 bg-orange-500/5 text-orange-400 hover:border-orange-500/50',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500/50',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400 hover:border-purple-500/50',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400 hover:border-blue-500/50'
  };
  return (
    <div onClick={onClick} className={`cyber-card p-6 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group h-52 flex flex-col justify-between ${colorMap[color]}`}>
      <div className="flex items-center justify-between"><div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl transition-all"><i className={`fa-solid ${icon}`}></i></div></div>
      <div>
        <h3 className="font-display text-[16px] font-black text-green/60 mb-2 leading-tight uppercase">{title}</h3>
        <p className="text-[10px] text-white/40 leading-relaxed font-black uppercase tracking-widest">{desc}</p>
      </div>
    </div>
  );
};

const SnapshotCard = ({ label, value, status, unit }: any) => {
  const statusColors: any = {
    normal: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5',
    warning: 'text-yellow-400 border-yellow-500/10 bg-yellow-500/5',
    danger: 'text-red-400 border-red-500/10 bg-red-500/5'
  };
  return (
    <div className={`p-6 rounded-[2rem] border ${statusColors[status]} text-center h-28 flex flex-col justify-center items-center`}>
      <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-30 mb-2 truncate w-full">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-display font-black leading-none italic">{value}</p>
        <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 italic">{unit}</span>
      </div>
    </div>
  );
};


export default MainDashboard;
