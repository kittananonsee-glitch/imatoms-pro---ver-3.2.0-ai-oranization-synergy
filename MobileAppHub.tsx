
import React, { useState, useMemo, useEffect } from 'react';
import { User, AppSheetRecord } from '../types';

interface MobileAppHubProps {
  onBack: () => void;
  user: User;
}

const APPSHEET_DATA: AppSheetRecord[] = [
  // ViMUT Hospital
  { hospital: "ViMUT Hospital", category: "Dashboards & Analytics", name: "ViMUT_Dashboard_XRAY Temp", url: "https://www.appsheet.com/start/0788eed4-99c2-4cf0-9dca-26d6f8cc077f", icon: "📊", color: "#4CAF50", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Dashboards & Analytics", name: "ViMUT_iFEMs Dashboard WR", url: "https://www.appsheet.com/start/91a7575e-feee-4aa8-bfa6-57325fa5b3e7", icon: "🖥️", color: "#00BCD4", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Dashboards & Analytics", name: "ViMUT_Daily ENERGY Monitor", url: "https://www.appsheet.com/start/629bda75-2fe2-48a0-b7e4-2834750d7483", icon: "🔋", color: "#8BC34A", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Dashboards & Analytics", name: "ViMUT_STAFF Utilization", url: "https://www.appsheet.com/start/a4842628-e483-4686-bdab-2ec567d7cf2d", icon: "👥", color: "#9C27B0", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Dashboards & Analytics", name: "ViMUT_Dashboard Security", url: "https://www.appsheet.com/start/6228d314-154f-4351-bdfd-7dda53385904", icon: "🛡️", color: "#607D8B", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Engineering Operations", name: "ViMUT_Dashboard_VSD Monitor", url: "https://www.appsheet.com/start/7cedd341-6b86-41a3-97cc-cb7ce5c995d5", icon: "🚀", color: "#E91E63", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Engineering Operations", name: "ViMUT_Waste Water System", url: "https://www.appsheet.com/start/c218dfc5-308b-40a0-b25e-7ca16160de56", icon: "♻️", color: "#43A047", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Engineering Operations", name: "ViMUT_PPM_Room_Electric", url: "https://www.appsheet.com/start/9e4c56ef-b78e-4c88-9938-fa2b4c5d0ecf", icon: "🔌", color: "#F44336", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Engineering Operations", name: "ViMUT_Daily Op Chiller", url: "https://www.appsheet.com/start/0682c57a-71aa-4b05-8349-ae5e148fdcc8", icon: "❄️", color: "#03A9F4", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Engineering Operations", name: "ViMUT_Dashboard PPM Mgmt", url: "https://www.appsheet.com/start/c671f4eb-2e8d-40a9-a393-5ba021833abd", icon: "🚐", color: "#1E88E5", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Facility & Environment", name: "ViMUT_Dashboard PM2.5_CO2", url: "https://www.appsheet.com/start/6e3db8a9-a3f0-4b54-aad4-f07424fbcf9e", icon: "♻️", color: "#43A047", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Facility & Environment", name: "ViMUT_IAQ Critical Room", url: "https://www.appsheet.com/start/8d13183e-3338-4dcc-bfb1-e276f287a7bb", icon: "🌬️", color: "#81D4FA", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Facility & Environment", name: "ViMUT_Dashboard_OR Power", url: "https://www.appsheet.com/start/82e663c2-77a0-493e-8c98-b906574f2355", icon: "🏥", color: "#EF5350", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Facility & Environment", name: "ViMUT_Availability of IPD", url: "https://www.appsheet.com/start/83578437-0d5d-4c65-8a6c-83d6b4083d88", icon: "🛌", color: "#5C6BC0", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Facility & Environment", name: "ViMUT_Availability of TOILET", url: "https://www.appsheet.com/start/0d1c9dd6-a704-43f2-b233-e3f54dd873bb", icon: "🚻", color: "#78909C", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Facility & Environment", name: "ViMUT_Availability of General", url: "https://www.appsheet.com/start/62ba4591-44bd-4313-8971-a82908f4d16d", icon: "🏢", color: "#AB47BC", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Services & Quality", name: "ViMUT_CS_PORTER Services", url: "https://www.appsheet.com/start/f2abdca8-c00f-4b23-b85d-d0b4574c61c7", icon: "🤖", color: "#2196F3", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Services & Quality", name: "VIMUT_ROUND_HANDOVER", url: "https://www.appsheet.com/start/e14f0a75-0901-4dd6-8b09-dc1dcad30844", icon: "🔄", color: "#26A69A", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Assets & Inventory", name: "ViMUT_FEM Asset Mgmt", url: "https://www.appsheet.com/start/e77a838c-a4a4-4d0b-9b50-454708c3004a", icon: "📦", color: "#795548", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Assets & Inventory", name: "ViMUT_General Asset Mgmt", url: "https://www.appsheet.com/start/ec8e9694-b804-4094-88ea-3c31fc58e7dc", icon: "🏛️", color: "#757575", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Assets & Inventory", name: "ViMUT_Holding Asset Mgmt", url: "https://www.appsheet.com/start/d9af023d-f810-4e0b-ad80-89698135f23a", icon: "📂", color: "#FFA000", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Assets & Inventory", name: "VIMUT_INVENTORY Mgmt", url: "https://www.appsheet.com/start/fbd38447-d672-47ab-b675-78b9b9b02f8b", icon: "📝", color: "#546E7A", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Assets & Inventory", name: "ViMUT_MA Contract Mgmt", url: "https://www.appsheet.com/start/0d182eaf-bc5f-488e-826c-1a1a57c6b7db", icon: "🤝", color: "#FB8C00", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Assets & Inventory", name: "ViMUT_Subcontract QC", url: "https://www.appsheet.com/start/0dcb0047-e41d-4cd7-890b-6ba12fa473e9", icon: "✅", color: "#43A047", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Predictive OM", name: "ViMUT_Predictive OM Main", url: "https://www.appsheet.com/start/4c9b60fd-b2a2-4d8f-894b-c920e956ab42", icon: "🏠", color: "#FF7043", status: "Prototype" },
  { hospital: "ViMUT Hospital", category: "Predictive OM", name: "ViMUT_BANNMOR_Predictive", url: "https://www.appsheet.com/start/88a1cd68-3f0e-47a9-91b9-4c48c9c27d04", icon: "🏘️", color: "#8D6E63", status: "Prototype" },
  
  // ViMUT-Theptarin (VTH)
  { hospital: "ViMUT-Theptarin (VTH)", category: "Energy Mgmt", name: "VTH_Daily Energy Mgmt", url: "https://www.appsheet.com/start/811802fe-2709-4d36-800e-baa3322c1f9a", icon: "⚡", color: "#FFC107", status: "Prototype" },
  { hospital: "ViMUT-Theptarin (VTH)", category: "Energy Mgmt", name: "VTH_Dashboard Record_VSD", url: "https://www.appsheet.com/start/99c26ce6-8153-4cca-baaf-747ccfdf9319", icon: "📈", color: "#3F51B5", status: "Prototype" },
  { hospital: "ViMUT-Theptarin (VTH)", category: "Main Operations", name: "VTH_A Main Operation", url: "https://www.appsheet.com/start/baf57d28-f383-4dc3-901f-0d0876b39278", icon: "⚙️", color: "#FF9800", status: "Prototype" },
  { hospital: "ViMUT-Theptarin (VTH)", category: "Main Operations", name: "VTH_B Main Operation", url: "https://www.appsheet.com/start/306a48ad-d7d8-4751-a510-34fb6d7825e9", icon: "⚙️", color: "#FF9800", status: "Prototype" },
  { hospital: "ViMUT-Theptarin (VTH)", category: "Main Operations", name: "VTH_Chiller Daily Op", url: "https://www.appsheet.com/start/fbd22fb7-5ff9-4310-b4b2-516b7fbc19cd", icon: "❄️", color: "#03A9F4", status: "Prototype" },
  { hospital: "ViMUT-Theptarin (VTH)", category: "Main Operations", name: "VTH_RCA Risk Monitor", url: "https://www.appsheet.com/start/ba8b12d6-0a09-43c6-964f-e6ebea413258", icon: "⚠️", color: "#D32F2F", status: "Prototype" }
];

const MobileAppHub: React.FC<MobileAppHubProps> = ({ onBack, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setSelectedHospital(user.building === 'VTH' ? "ViMUT-Theptarin (VTH)" : "ViMUT Hospital");
  }, [user.building]);

  const filteredApps = useMemo(() => {
    let apps = APPSHEET_DATA.filter(app => app.hospital === selectedHospital);
    if (searchQuery) apps = apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory) apps = apps.filter(app => app.category === selectedCategory);
    return apps;
  }, [selectedHospital, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = APPSHEET_DATA.filter(app => app.hospital === selectedHospital).map(app => app.category);
    return Array.from(new Set(cats));
  }, [selectedHospital]);

  const groupedApps = useMemo(() => {
    const groups: Record<string, AppSheetRecord[]> = {};
    filteredApps.forEach(app => {
      if (!groups[app.category]) groups[app.category] = [];
      groups[app.category].push(app);
    });
    return groups;
  }, [filteredApps]);

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] overflow-hidden">
      {/* Smart Mobile Header */}
      <header className="px-4 py-4 sm:px-6 sm:py-6 bg-black/80 border-b border-purple-500/20 backdrop-blur-3xl sticky top-0 z-30 shadow-2xl shrink-0">
        <div className="flex items-center gap-3 mb-5">
           <button 
             onClick={onBack} 
             className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-all shadow-md"
           >
              <i className="fa-solid fa-arrow-left text-sm text-cyan-400"></i>
           </button>
           <div className="min-w-0 flex-1">
              <h1 className="font-display text-base sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 truncate">MOBILE APPS RECORD</h1>
              <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/60 font-black truncate">AppSheet Link System</p>
           </div>
        </div>

        {/* Optimized Toggle for Tablets/Mobile */}
        <div className="flex p-1 bg-black/40 rounded-2xl mb-5 border border-white/5 max-w-2xl mx-auto shadow-inner">
          <button 
            onClick={() => setSelectedHospital("ViMUT Hospital")}
            className={`flex-1 py-2.5 rounded-xl text-[18px] sm:text-xs font-black uppercase tracking-widest transition-all truncate px-2 ${
              selectedHospital === "ViMUT Hospital" ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40'
            }`}
          >
            ViMUT HOSPITAL(VM)
          </button>
          <button 
            onClick={() => setSelectedHospital("ViMUT-Theptarin (VTH)")}
            className={`flex-1 py-2.5 rounded-xl text-[18px] sm:text-xs font-black uppercase tracking-widest transition-all truncate px-2 ${
              selectedHospital === "ViMUT-Theptarin (VTH)" ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40'
            }`}
          >
            ViMUT-Theptarin (VTH)
          </button>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto w-full">
          <div className="relative group">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs transition-colors group-focus-within:text-purple-400"></i>
            <input 
              type="text" 
              placeholder={`Search in ${selectedHospital.split(' ')[0]}...`} 
              className="w-full pl-11 pr-4 py-3 cyber-input rounded-2xl text-xs sm:text-sm border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase border whitespace-nowrap transition-all ${
                selectedCategory === null ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 text-white/40 border-white/10'
              }`}
            >
              All Types
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase border whitespace-nowrap transition-all ${
                  selectedCategory === cat ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Grid Optimized for Mobile and Tablet */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 no-scrollbar pb-28 flex flex-col items-center">
        <div className="w-full max-w-7xl">
          {/* Fix: Explicitly type 'apps' as AppSheetRecord[] by casting Object.entries result to avoid 'unknown' type error in some TS environments */}
          {(Object.entries(groupedApps) as [string, AppSheetRecord[]][]).map(([category, apps]) => (
            <section key={category} className="mb-8 animate-fadeInUp">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-display text-[9px] sm:text-[10px] text-purple-400 font-black uppercase tracking-[0.25em] whitespace-nowrap">
                  {category}
                </h3>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {apps.map(app => (
                  <a 
                    key={app.name} 
                    href={app.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="cyber-card p-5 rounded-3xl border-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 active:scale-[0.98] transition-all flex items-center gap-4 group shadow-xl"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-inner">
                      {app.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-[13px] sm:text-sm mb-1 truncate pr-2 leading-tight group-hover:text-purple-400">{app.name}</h4>
                      <div className="flex items-center justify-between">
                         <span className={`text-[8px] font-black uppercase tracking-tight ${app.status === 'Deployed' ? 'text-emerald-400' : 'text-orange-400'}`}>
                           {app.status}
                         </span>
                         <i className="fa-solid fa-arrow-right text-[10px] text-white/10 group-hover:text-cyan-400 transition-colors"></i>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <div className="fixed bottom-4 left-4 right-4 h-16 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl flex justify-around items-center z-40 md:hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
         <button onClick={onBack} className="flex flex-col items-center gap-1 text-white/40 active:text-cyan-400 transition-colors">
            <i className="fa-solid fa-house-chimney text-lg"></i>
            <span className="text-[7px] font-black uppercase tracking-widest">Home</span>
         </button>
         
         <div className="relative -top-3">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] border-2 border-[#0a0e17] active:scale-90 transition-transform">
              <i className="fa-solid fa-mobile-screen-button text-white text-xl"></i>
            </div>
         </div>
         
         <button className="flex flex-col items-center gap-1 text-white/40 active:text-cyan-400 transition-colors">
            <i className="fa-solid fa-user-gear text-lg"></i>
            <span className="text-[7px] font-black uppercase tracking-widest">User</span>
         </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default MobileAppHub;
