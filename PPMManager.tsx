
import React, { useState, useEffect, useRef } from 'react';
import { User, PPMTask } from '../types';

interface PPMManagerProps {
  onBack: () => void;
  user: User;
}

const PPMManager: React.FC<PPMManagerProps> = ({ onBack, user }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [currentBuilding, setCurrentBuilding] = useState<'vimut' | 'vth'>(user.building === 'vth' ? 'vth' : 'vimut');
  const [ppmTasks, setPpmTasks] = useState<PPMTask[]>([
    {
      ppm_id: 'ppm-101', equipment_name: 'Chiller System Unit A', building: 'vimut',
      frequency: 'monthly', priority: 'high', assigned_to: 'นายพีรพัฒน์ หงษ์คงคา',
      next_maintenance: '2024-06-15', notes: 'Check oil pressure', status: 'scheduled',
      created_at: new Date().toISOString()
    },
    {
      ppm_id: 'ppm-102', equipment_name: 'Main Switchboard Level 4', building: 'vth',
      frequency: 'quarterly', priority: 'medium', assigned_to: 'นายวิชัย สมบูรณ์',
      next_maintenance: '2024-05-20', notes: 'Thermal scanning required', status: 'pending',
      created_at: new Date().toISOString()
    }
  ]);

  const [activeDataTab, setActiveDataTab] = useState('type_area');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStats = (building: 'vimut' | 'vth' | 'all') => {
    const tasks = building === 'all' ? ppmTasks : ppmTasks.filter(t => t.building === building);
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status === 'overdue').length
    };
  };

  const renderDashboard = () => {
    const vimutStats = getStats('vimut');
    const vthStats = getStats('vth');

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BuildingStatCard 
            title="ViMUT Building" 
            stats={vimutStats} 
            color="cyan" 
            icon="fa-hospital"
            active={currentBuilding === 'vimut'}
            onClick={() => setCurrentBuilding('vimut')}
          />
          <BuildingStatCard 
            title="VTH Building" 
            stats={vthStats} 
            color="emerald" 
            icon="fa-hospital-user"
            active={currentBuilding === 'vth'}
            onClick={() => setCurrentBuilding('vth')}
          />
        </div>

        <div className="cyber-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-sm uppercase text-cyan-400">Current Tasks: {currentBuilding.toUpperCase()}</h3>
            <button className="cyber-btn text-xs py-2 px-4"><i className="fa-solid fa-plus mr-2"></i>New PPM</button>
          </div>
          <div className="space-y-4">
            {ppmTasks.filter(t => t.building === currentBuilding).map(task => (
              <div key={task.ppm_id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-400/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    <i className={`fa-solid ${task.status === 'completed' ? 'fa-check' : 'fa-calendar'}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{task.equipment_name}</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest">{task.frequency} | {task.assigned_to}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                    task.status === 'completed' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                    task.status === 'overdue' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                    'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                  }`}>
                    {task.status}
                  </span>
                  <p className="text-[10px] text-white/40 mt-1">Next: {task.next_maintenance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDataSetup = () => {
    const tabs = ['type_area', 'main_area', 'staff', 'system_work', 'category_work', 'department', 'equipment_code', 'ppm_plan'];
    return (
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveDataTab(tab)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeDataTab === tab ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.3)]' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="cyber-card p-8 rounded-2xl min-h-[400px] flex flex-col items-center justify-center opacity-40">
           <i className="fa-solid fa-database text-6xl mb-4"></i>
           <p className="font-display uppercase tracking-[0.3em] text-sm">Managing {activeDataTab.replace('_', ' ')} Data</p>
           <button className="mt-8 cyber-btn text-xs"><i className="fa-solid fa-plus mr-2"></i>Add Record</button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#0a0e27]">
      {/* Sidebar */}
      <nav className="w-64 border-r border-cyan-500/20 bg-black/40 flex flex-col p-4 shrink-0">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 border border-emerald-400/40">📈</div>
            <h1 className="font-display text-xl font-bold text-cyan-400 uppercase">iMATOMs Pro</h1>
          </div>
          <p className="text-[10px] text-white/60 tracking-widest uppercase">PPM Reliability Module</p>
        </div>

        <div className="flex-1 space-y-1">
          <SideItem icon="fa-home" label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SideItem icon="fa-calendar" label="Schedule" active={activeView === 'schedule'} onClick={() => setActiveView('schedule')} />
          <SideItem icon="fa-history" label="History" active={activeView === 'history'} onClick={() => setActiveView('history')} />
          <SideItem icon="fa-chart-line" label="Analytics" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
          <div className="h-px bg-white/5 my-4"></div>
          <SideItem icon="fa-database" label="Data Setup" active={activeView === 'datasetup'} onClick={() => setActiveView('datasetup')} />
          <SideItem icon="fa-file-import" label="Master Import" active={activeView === 'import'} onClick={() => setActiveView('import')} />
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <button onClick={onBack} className="flex items-center gap-3 p-3 w-full text-white/40 hover:text-white transition-all group">
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Main</span>
          </button>
          <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/5 text-center">
            <div className="font-display text-lg text-cyan-400">{time.toLocaleTimeString()}</div>
            <div className="text-[9px] text-white/20 uppercase mt-1">{time.toLocaleDateString()}</div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8 lg:p-12">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-white">
              Preventive Maintenance
            </h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Multi-Building Management System</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
            <i className={`fa-solid ${currentBuilding === 'vimut' ? 'fa-hospital' : 'fa-hospital-user'} text-cyan-400`}></i>
            <span className="font-display text-xs text-cyan-400 font-bold uppercase">{currentBuilding === 'vimut' ? 'ViMUT Hospital' : 'VTH Hospital'}</span>
          </div>
        </header>

        {activeView === 'dashboard' ? renderDashboard() : 
         activeView === 'datasetup' ? renderDataSetup() : 
         <div className="py-20 text-center opacity-20"><i className="fa-solid fa-code text-6xl mb-4"></i><h3 className="font-display">Module View Active: {activeView.toUpperCase()}</h3></div>}
      </main>
    </div>
  );
};

const BuildingStatCard: React.FC<{ title: string, stats: any, color: string, icon: string, active: boolean, onClick: () => void }> = ({ title, stats, color, icon, active, onClick }) => {
  const colors: any = {
    cyan: 'border-cyan-400/20 bg-cyan-400/5 text-cyan-400',
    emerald: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-400'
  };

  return (
    <div 
      onClick={onClick}
      className={`cyber-card p-6 border-2 transition-all cursor-pointer hover:translate-y-[-4px] ${active ? 'border-cyan-400 ring-4 ring-cyan-400/10' : 'border-white/5 opacity-60 hover:opacity-100'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${active ? colors[color] : 'bg-white/5 text-white/40'}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Total Schedules</p>
          <p className="text-3xl font-display font-black text-white">{stats.total}</p>
        </div>
      </div>
      <h3 className="font-display text-lg font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Pending" value={stats.pending} color="text-yellow-400" />
        <MiniStat label="Done" value={stats.completed} color="text-emerald-400" />
        <MiniStat label="Alert" value={stats.overdue} color="text-red-400" />
      </div>
    </div>
  );
};

const MiniStat: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-center">
    <p className={`text-lg font-display font-black ${color}`}>{value}</p>
    <p className="text-[8px] uppercase text-white/40 font-bold">{label}</p>
  </div>
);

const SideItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,245,255,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
  >
    <i className={`fa-solid ${icon} w-5 text-center text-sm`}></i>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default PPMManager;
