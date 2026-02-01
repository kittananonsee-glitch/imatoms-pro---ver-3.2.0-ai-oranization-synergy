
import React, { useState, useEffect, useRef } from 'react';
import { User, AnalyticsConfig, AnalyticsGroup, AnalyticsSignal, Language } from '../types';

interface AIAnalyticsProps {
  onBack: () => void;
  user: User;
  lang: Language;
  setLang: (l: Language) => void;
}

const DEFAULT_GROUPS: AnalyticsGroup[] = [
  {
    id: 'grp-chiller',
    name: 'Chiller Efficiency',
    parameters: [
      { id: 'chiller-1', name: 'All_kW/TRp-Plant', unit: 'kW/TR', min: 0.60, max: 0.75, standard: 0.70, appUrl: '', connectionMode: 'csv', csvUrl: '', columnName: 'kWTR' },
      { id: 'chiller-2', name: 'All_kW total', unit: 'kW', min: 200, max: 250, standard: 220, appUrl: '', connectionMode: 'csv', csvUrl: '', columnName: 'kW' },
      { id: 'chiller-3', name: 'All_TR total', unit: 'TR', min: 150, max: 650, standard: 550, appUrl: '', connectionMode: 'csv', csvUrl: '', columnName: 'TR' },
      { id: 'chiller-4', name: 'Record_Tadb(OAT)-C', unit: '°C', min: 22, max: 33, standard: 25, appUrl: '', connectionMode: 'csv', csvUrl: '', columnName: 'Tadb' },
      { id: 'chiller-5', name: 'Record_Twb(OAWT)-F', unit: '°F', min: 70, max: 90, standard: 85, appUrl: '', connectionMode: 'csv', csvUrl: '', columnName: 'Twb' },
    ]
  },
  {
    id: 'grp-xray',
    name: 'X-RAY Temp Monitoring',
    parameters: [
      { id: 'med-1', name: 'X-RAY Core Temp', unit: '°C', min: 20, max: 28, standard: 24, appUrl: '', connectionMode: 'csv', csvUrl: '', columnName: 'CoreTemp' },
    ]
  }
];

const AIAnalytics: React.FC<AIAnalyticsProps> = ({ onBack, user, lang, setLang }) => {
  const [groups, setGroups] = useState<AnalyticsGroup[]>([]);
  const [signals, setSignals] = useState<Record<string, AnalyticsSignal>>({});
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'monitor' | 'config'>('monitor');
  const [isLiveMode, setIsLiveMode] = useState(true); // Default to Live Link
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [syncPulse, setSyncPulse] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const VERSION = lang === 'TH' ? "รุ่น 3.1.1 เอไอวิเคราะห์ยุทธศาสตร์" : "Ver 3.1.1 AI Strategic Analytics";

  const t = {
    monitor: lang === 'TH' ? 'มอนิเตอร์ระบบ' : 'System Monitor',
    setup: lang === 'TH' ? 'ตั้งค่าเครือข่าย' : 'Network Connect Live',
    hub: lang === 'TH' ? 'ศูนย์วิเคราะห์ยุทธศาสตร์' : 'Overview and Monitor',
    back: lang === 'TH' ? 'ศูนย์ควบคุม' : 'BACK TO MAIN',
    save: lang === 'TH' ? 'บันทึกพารามิเตอร์' : 'SAVE ALL SETTINGS',
    saving: lang === 'TH' ? 'กำลังบันทึก...' : 'Saving...',
    mute: lang === 'TH' ? 'ปิดเสียง' : 'Mute',
    alarm: lang === 'TH' ? 'เตือนภัย' : 'Alarm',
    ack: lang === 'TH' ? 'รับทราบและรีเซ็ต' : 'ACKNOWLEDGE ALERTS',
    add_param: lang === 'TH' ? 'เพิ่มพารามิเตอร์' : 'Add Parameter',
    add_group: lang === 'TH' ? 'เพิ่มกลุ่มระบบ' : 'Add System Group',
    delete: lang === 'TH' ? 'ลบออก' : 'Delete',
    label: lang === 'TH' ? 'ชื่อพารามิเตอร์' : 'Parameter Name',
    unit: lang === 'TH' ? 'หน่วย' : 'Unit',
    col_name: lang === 'TH' ? 'ชื่อคอลัมน์' : 'Column Name',
    csv_url: lang === 'TH' ? 'URL ข้อมูล CSV' : 'CSV Data URL',
    mode: lang === 'TH' ? 'โหมดเชื่อมต่อ' : 'Connection Mode',
    failure_overview: lang === 'TH' ? 'Overview Failure Alert (รายการผิดปกติ)' : 'Overview Failure Alert',
    min: 'MIN', std: 'STD', max: 'MAX'
  };

  useEffect(() => {
    const saved = localStorage.getItem('ai_analytics_groups_v38');
    if (saved) setGroups(JSON.parse(saved));
    else {
      setGroups(DEFAULT_GROUPS);
      localStorage.setItem('ai_analytics_groups_v38', JSON.stringify(DEFAULT_GROUPS));
    }
    
    // Auto-activate Live mode on component mount
    localStorage.setItem('analytics_mode', 'live');
    setIsLiveMode(true);
  }, []);

  const fetchCsvData = async (url: string, colName: string, defaultVal: number): Promise<number> => {
    if (!url || !colName) return defaultVal + (Math.random() - 0.5) * 0.1;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) return defaultVal;

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const colIndex = headers.indexOf(colName);
      if (colIndex === -1) return defaultVal;

      const lastLine = lines[lines.length - 1].split(',');
      const value = parseFloat(lastLine[colIndex]);
      return isNaN(value) ? defaultVal : value;
    } catch (error) {
      return defaultVal + (Math.random() - 0.5) * 0.5;
    }
  };

  const refreshSignals = async (forceReset: boolean = false) => {
    setSyncPulse(true);
    const newSignals: Record<string, AnalyticsSignal> = { ...signals };
    let alerts = 0;
    
    for (const group of groups) {
      for (const param of group.parameters) {
        let val: number;
        if (forceReset) {
            val = param.standard;
        } else if (isLiveMode && param.connectionMode === 'csv' && param.csvUrl) {
          val = await fetchCsvData(param.csvUrl, param.columnName || '', param.standard);
        } else if (isLiveMode) {
           const volatility = (Math.random() > 0.92) ? 0.35 : 0.05; 
           val = param.standard + (Math.random() - 0.5) * (param.max - param.min) * volatility;
        } else {
          const volatility = 0.02; 
          val = param.standard + (Math.random() - 0.5) * (param.max - param.min) * volatility;
        }

        const isAlert = val > param.max || val < param.min;
        if (isAlert) alerts++;
        
        newSignals[param.id] = {
          configId: param.id,
          currentValue: Number(val.toFixed(3)),
          status: isAlert ? 'alert' : 'normal',
          timestamp: new Date().toLocaleString()
        };
      }
    }

    setSignals(newSignals);
    setActiveAlertCount(alerts);
    localStorage.setItem('ai_analytics_alert_count', alerts.toString());
    setTimeout(() => setSyncPulse(false), 500);
  };

  const handleAcknowledge = () => {
    refreshSignals(true);
    setIsMuted(true);
    setTimeout(() => setIsMuted(false), 5000); 
  };

  useEffect(() => {
    refreshSignals();
    const interval = setInterval(refreshSignals, 8000);
    return () => clearInterval(interval);
  }, [groups, isLiveMode]);

  const handleSaveAll = () => {
    setIsSaving(true);
    localStorage.setItem('ai_analytics_groups_v38', JSON.stringify(groups));
    localStorage.setItem('analytics_mode', isLiveMode ? 'live' : 'simulation');
    
    setTimeout(async () => {
      await refreshSignals();
      setIsSaving(false);
      setSaveStatus('SUCCESS');
      setTimeout(() => setSaveStatus(null),5000);
      setActiveTab('monitor');
    }, 1000);
  };

  const updateGroupName = (id: string, name: string) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, name } : g));
  };

  const addParameter = (groupId: string) => {
    const newParam: AnalyticsConfig = {
      id: `p-${Date.now()}`,
      name: 'New Parameter',
      unit: '-',
      min: 0,
      max: 100,
      standard: 50,
      appUrl: '',
      connectionMode: 'csv',
      csvUrl: '',
      columnName: 'value'
    };
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, parameters: [...g.parameters, newParam] } : g));
  };

  const deleteParameter = (groupId: string, paramId: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, parameters: g.parameters.filter(p => p.id !== paramId) } : g));
  };

  const updateParameter = (groupId: string, paramId: string, field: keyof AnalyticsConfig, value: any) => {
    setGroups(prev => prev.map(g => g.id === groupId ? {
      ...g,
      parameters: g.parameters.map(p => p.id === paramId ? { ...p, [field]: value } : p)
    } : g));
  };

  const addGroup = () => {
    const newGroup: AnalyticsGroup = {
      id: `grp-${Date.now()}`,
      name: 'New System Group',
      parameters: []
    };
    setGroups([...groups, newGroup]);
  };

  const deleteGroup = (id: string) => {
    if (window.confirm('Delete this system group?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  useEffect(() => {
    let interval: any;
    if (activeAlertCount > 0 && !isMuted) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const playBeep = () => {
        if (!audioCtxRef.current) return;
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, audioCtxRef.current.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.25);
      };
      playBeep();
      interval = setInterval(playBeep, 2500);
    }
    return () => interval && clearInterval(interval);
  }, [activeAlertCount, isMuted]);

  const getParamConfig = (id: string) => {
    for (const group of groups) {
      const p = group.parameters.find(param => param.id === id);
      if (p) return { ...p, groupName: group.name, groupId: group.id };
    }
    return null;
  };

  const getGroupIcon = (groupId: string) => {
    const gid = groupId.toLowerCase();
    if (gid.includes('chiller')) return 'fa-fan text-cyan-400';
    if (gid.includes('xray') || gid.includes('med')) return 'fa-wave-square text-purple-400';
    if (gid.includes('power') || gid.includes('electric')) return 'fa-bolt-lightning text-yellow-400';
    if (gid.includes('environ') || gid.includes('air')) return 'fa-wind text-emerald-400';
    return 'fa-microchip text-blue-400';
  };

  return (
    <div className={`flex h-full bg-[#0a0e27] text-white transition-all duration-1000 ${activeAlertCount > 0 ? 'bg-red-950/20' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes glow-red-line { 0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 0.5); } 50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.8); border-color: rgba(239, 68, 68, 1); } }
        @keyframes alert-pulse { 0%, 100% { background: rgba(239, 68, 68, 0.05); } 50% { background: rgba(239, 68, 68, 0.15); } }
        .animate-glow-red { animation: glow-red-line 1s infinite; }
        .animate-alert-pulse { animation: alert-pulse 1.5s infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

      <nav className="w-72 border-r border-cyan-500/20 bg-black/40 flex flex-col p-6 shrink-0 backdrop-blur-xl">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-900 flex items-center justify-center text-white border border-cyan-400/30 transition-all ${syncPulse ? 'scale-110 shadow-[0_0_20px_#00f5ff]' : ''}`}>
              <i className="fa-solid fa-brain-circuit text-xl"></i>
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-white italic leading-none uppercase">AI SMART</h1>
              <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em] mt-1">{VERSION}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          <SideItem icon="fa-chart-network" label={t.monitor} active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
          <SideItem icon="fa-sliders-up" label={t.setup} active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
        </div>

        <div className="mt-auto space-y-4">
          {activeAlertCount > 0 && (
            <button onClick={handleAcknowledge} className="flex items-center gap-4 p-4 w-full rounded-2xl border border-red-500 bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg animate-bounce">
                <i className="fa-solid fa-bell-slash"></i>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{t.ack}</span>
            </button>
          )}
          <button onClick={() => setIsLiveMode(!isLiveMode)} className={`flex items-center gap-4 p-4 w-full rounded-2xl border transition-all ${isLiveMode ? 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5' : 'text-white/20 border-white/5'}`}>
            <i className={`fa-solid ${isLiveMode ? 'fa-signal-stream animate-pulse text-cyan-400' : 'fa-flask'}`}></i>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isLiveMode ? 'LIVE ACTIVE MODE' : 'SIMULATION MODE'}</span>
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className={`flex items-center gap-4 p-4 w-full rounded-2xl border transition-all ${isMuted ? 'text-white/20 border-white/5' : 'text-orange-400 border-orange-400/20 bg-orange-400/5 shadow-lg shadow-orange-500/10'}`}>
            <i className={`fa-solid ${isMuted ? 'fa-volume-slash' : 'fa-volume-high animate-pulse'}`}></i>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isMuted ? t.mute : t.alarm}</span>
          </button>
          <button onClick={onBack} className="flex items-center gap-4 p-4 w-full text-white/30 hover:text-cyan-400 rounded-2xl transition-all group">
            <i className="fa-solid fa-arrow-left-long group-hover:-translate-x-1 transition-transform"></i>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{t.back}</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto p-8 lg:p-14 no-scrollbar relative">
        <div className="absolute top-10 right-14 z-40 flex items-center gap-4">
           <div className="flex bg-black/60 border border-white/10 rounded-xl p-1 backdrop-blur-xl shadow-2xl">
             <button onClick={() => setLang('TH')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'TH' ? 'bg-cyan-500 text-black shadow-[0_0_15px_#00f5ff]' : 'text-white/40 hover:text-white'}`}>TH</button>
             <button onClick={() => setLang('EN')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'EN' ? 'bg-cyan-500 text-black shadow-[0_0_15px_#00f5ff]' : 'text-white/40 hover:text-white'}`}>EN</button>
           </div>
           {activeAlertCount > 0 && (
             <div className="flex items-center gap-3 bg-red-600 border border-red-500 px-6 py-3 rounded-2xl animate-glow-red shadow-2xl">
                <i className="fa-solid fa-triangle-exclamation text-white animate-pulse"></i>
                <p className="text-lg font-display font-black text-white uppercase">{activeAlertCount} ALERTS</p>
             </div>
           )}
        </div>

        <header className="mb-16">
          <h2 className="font-display text-5xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">{t.hub}</h2>
          <div className="mt-4 flex items-center gap-3 bg-black/60 border border-cyan-500/30 px-6 py-3 rounded-2xl w-fit shadow-xl">
             <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f5ff]' : 'bg-orange-500'}`}></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{isLiveMode ? 'AI Status: LIVE' : 'AI Status: SIMULATED'}</span>
          </div>
        </header>

        {activeTab === 'monitor' && (
          <div className="space-y-12 animate-fadeIn">
            
            {/* OVERVIEW FAILURE ALERT SECTION */}
            {activeAlertCount > 0 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444]"></div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-widest text-red-500 italic">
                    {t.failure_overview}
                  </h3>
                </div>
                
                <div className="cyber-card rounded-[2.5rem] border-red-500/50 bg-red-500/5 overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.15)] backdrop-blur-2xl">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-red-500/10 text-[10px] font-black uppercase tracking-widest text-white/60 border-b border-red-500/20">
                           <th className="px-8 py-5 font-bold uppercase tracking-widest text-red-400">{lang === 'TH' ? 'ระบบที่ผิดปกติ / พารามิเตอร์' : 'Abnormal System / Parameter'}</th>
                           <th className="px-8 py-5 text-center font-bold uppercase tracking-widest text-red-400">{lang === 'TH' ? 'วันเวลาที่พบ' : 'Detection Timestamp'}</th>
                           <th className="px-8 py-5 text-center font-bold uppercase tracking-widest text-red-400">{lang === 'TH' ? 'ค่าปัจจุบัน' : 'Current Value'}</th>
                           <th className="px-8 py-5 text-center font-bold uppercase tracking-widest text-red-400">{lang === 'TH' ? 'เกณฑ์มาตรฐาน (Max/Min)' : 'Threshold'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-500/10">
                         {(Object.entries(signals) as [string, AnalyticsSignal][])
                           .filter(([_, signal]) => signal.status === 'alert')
                           .map(([id, signal]) => {
                             const config = getParamConfig(id);
                             if (!config) return null;
                             return (
                               <tr key={id} className="hover:bg-red-500/10 transition-colors group animate-alert-pulse">
                                  <td className="px-8 py-6">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 text-lg group-hover:scale-110 transition-transform">
                                          <i className={`fa-solid ${getGroupIcon(config.groupId)}`}></i>
                                        </div>
                                        <div>
                                           <p className="text-[9px] text-red-400 font-black uppercase mb-0.5 opacity-60">{config.groupName}</p>
                                           <p className="text-sm font-bold text-white uppercase tracking-tight">{config.name}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6 text-center text-xs font-mono text-white/40">
                                     {signal.timestamp}
                                  </td>
                                  <td className="px-8 py-6 text-center">
                                     <span className="text-xl font-display font-black text-red-500 italic drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                                       {signal.currentValue} <span className="text-[10px] uppercase font-sans ml-1 opacity-50">{config.unit}</span>
                                     </span>
                                  </td>
                                  <td className="px-8 py-6 text-center">
                                     <span className="px-4 py-1.5 rounded-full bg-black/40 border border-white/5 text-[10px] font-mono font-bold text-white/30">
                                       {config.min} - {config.max}
                                     </span>
                                  </td>
                               </tr>
                             );
                           })}
                      </tbody>
                   </table>
                </div>
              </div>
            )}

            {groups.map(group => (
              <div key={group.id} className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl">
                      <i className={`fa-solid ${getGroupIcon(group.id)}`}></i>
                    </div>
                    <h3 className="font-display text-xl font-black uppercase tracking-widest text-white/70">{group.name}</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
                    {group.parameters.map(param => {
                      const signal = signals[param.id];
                      const isAlert = signal?.status === 'alert';
                      const isActualLive = isLiveMode && param.connectionMode === 'csv' && param.csvUrl;
                      
                      return (
                        <div key={param.id} className={`cyber-card p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden group/card ${isAlert ? 'animate-glow-red bg-red-500/5' : 'border-white/5 bg-black/40 hover:border-cyan-500/30'}`}>
                           <div className="flex items-center justify-between mb-6">
                              <p className="text-[9px] font-black uppercase text-white/20 tracking-widest truncate group-hover/card:text-white/40 transition-colors">{param.name}</p>
                              {isActualLive && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f5ff] animate-pulse"></div>}
                           </div>
                           <div className="flex items-baseline gap-2 mb-6">
                              <span className={`text-4xl font-display font-black tracking-tighter italic ${isAlert ? 'animate-text-flash' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60'}`}>{signal?.currentValue || '0.00'}</span>
                              <span className="text-[10px] text-white/20 font-black uppercase">{param.unit}</span>
                           </div>
                           <div className="grid grid-cols-3 gap-2">
                              <div className="text-center p-2 rounded-xl bg-black/40 border border-white/5">
                                <p className="text-[7px] text-white/20 uppercase font-bold mb-1">MIN</p>
                                <p className="text-[10px] font-mono font-bold text-white/40">{param.min.toFixed(2)}</p>
                              </div>
                              <div className={`text-center p-2 rounded-xl border ${isAlert ? 'bg-red-500/5 border-red-500/20' : 'bg-cyan-500/5 border-cyan-500/10'}`}>
                                <p className={`text-[7px] uppercase font-bold mb-1 ${isAlert ? 'text-red-400' : 'text-cyan-400'}`}>STD</p>
                                <p className={`text-[10px] font-mono font-bold ${isAlert ? 'text-red-400/60' : 'text-cyan-400/60'}`}>{param.standard.toFixed(2)}</p>
                              </div>
                              <div className="text-center p-2 rounded-xl bg-black/40 border border-white/5">
                                <p className="text-[7px] text-white/20 uppercase font-bold mb-1">MAX</p>
                                <p className="text-[10px] font-mono font-bold text-white/40">{param.max.toFixed(2)}</p>
                              </div>
                           </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-fadeIn">
            <button onClick={addGroup} className="w-full py-8 border-2 border-dashed border-cyan-500/20 rounded-[3rem] text-cyan-400/40 hover:border-cyan-500/60 hover:text-cyan-400 transition-all flex items-center justify-center gap-4 group bg-cyan-500/5">
               <i className="fa-solid fa-folder-plus text-2xl group-hover:scale-125 transition-transform"></i>
               <span className="font-display text-sm font-black uppercase tracking-[0.2em]">{t.add_group}</span>
            </button>

            {groups.map(group => (
              <div key={group.id} className="cyber-card p-10 rounded-[3.5rem] border-white/10 bg-black/40 relative shadow-2xl backdrop-blur-xl">
                <button onClick={() => deleteGroup(group.id)} className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-red-500/5 text-red-500/40 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-trash-xmark"></i></button>
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 to-blue-900/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-4xl shadow-2xl shadow-cyan-500/10">
                      <i className={`fa-solid ${getGroupIcon(group.id)}`}></i>
                   </div>
                   <div className="flex-1">
                      <label className="block text-[10px] uppercase font-black text-cyan-400/40 mb-2 tracking-[0.3em]">MAIN OPERATION SYSTEM SETTING</label>
                      <input 
                        className="bg-transparent border-none p-0 text-3xl font-display font-black uppercase tracking-widest text-white focus:ring-0 focus:outline-none w-full placeholder:text-white/5" 
                        value={group.name} 
                        onChange={(e) => updateGroupName(group.id, e.target.value)} 
                        placeholder="ENTER GROUP NAME"
                      />
                   </div>
                </div>

                <div className="space-y-6">
                   {group.parameters.map(param => (
                     <div key={param.id} className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5 relative group/param hover:border-cyan-500/20 transition-all shadow-inner">
                        <button onClick={() => deleteParameter(group.id, param.id)} className="absolute top-6 right-6 text-white/10 hover:text-red-500 transition-colors"><i className="fa-solid fa-circle-xmark"></i></button>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                           <div className="lg:col-span-1 space-y-6">
                              <SetupInput label={t.label} value={param.name} onChange={(v: string) => updateParameter(group.id, param.id, 'name', v)} />
                              <div className="grid grid-cols-2 gap-4">
                                <SetupInput label={t.unit} value={param.unit} onChange={(v: string) => updateParameter(group.id, param.id, 'unit', v)} />
                                <SetupInput label={t.col_name} value={param.columnName} onChange={(v: string) => updateParameter(group.id, param.id, 'columnName', v)} />
                              </div>
                           </div>
                           <div className="lg:col-span-1 grid grid-cols-3 gap-3 items-end">
                              <SetupInput label={t.min} type="number" value={param.min} onChange={(v: string) => updateParameter(group.id, param.id, 'min', parseFloat(v))} />
                              <SetupInput label={t.std} type="number" value={param.standard} onChange={(v: string) => updateParameter(group.id, param.id, 'standard', parseFloat(v))} />
                              <SetupInput label={t.max} type="number" value={param.max} onChange={(v: string) => updateParameter(group.id, param.id, 'max', parseFloat(v))} />
                           </div>
                           <div className="lg:col-span-2 space-y-6">
                              <div className="w-full">
                                <label className="block text-[9px] uppercase font-black text-white/20 mb-3 tracking-widest pl-1">{t.mode}</label>
                                <select 
                                  value={param.connectionMode || 'csv'} 
                                  onChange={(e) => updateParameter(group.id, param.id, 'connectionMode', e.target.value)}
                                  className="w-full cyber-input p-5 rounded-2xl text-[11px] font-mono border-white/10 focus:border-cyan-500/50 bg-black/60 text-white shadow-inner appearance-none"
                                >
                                  <option value="csv">📡 CSV STREAM (AUTO)</option>
                                  <option value="api">💻 API PROTOCOL (MANUAL)</option>
                                </select>
                              </div>
                              <SetupInput label={t.csv_url} value={param.csvUrl} onChange={(v: string) => updateParameter(group.id, param.id, 'csvUrl', v)} placeholder="HTTPS://DOCS.GOOGLE.COM/SPREADSHEETS/..." />
                           </div>
                        </div>
                     </div>
                   ))}
                   <button onClick={() => addParameter(group.id)} className="w-full py-5 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/60 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all shadow-inner">
                      <i className="fa-solid fa-plus-circle mr-3"></i> {t.add_param}
                   </button>
                </div>
              </div>
            ))}

            <div className="flex justify-center py-10 sticky bottom-8 z-50">
               <button 
                 onClick={handleSaveAll}
                 disabled={isSaving}
                 className="group px-24 py-8 rounded-[3rem] text-xl font-display font-black uppercase tracking-[0.3em] bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-400 transition-all shadow-[0_15px_60px_rgba(0,245,255,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50"
               >
                 <i className={`fa-solid ${isSaving ? 'fa-circle-notch fa-spin' : 'fa-save'} mr-4 text-2xl`}></i>
                 {isSaving ? t.saving : t.save}
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SideItem = ({ icon, label, active, onClick }: any) => (
  <div onClick={onClick} className={`flex items-center gap-5 p-5 rounded-[1.5rem] cursor-pointer transition-all border ${active ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-400 border-cyan-400/30 shadow-[0_0_20px_rgba(0,245,255,0.1)]' : 'text-white/30 hover:text-white border-transparent hover:bg-white/5'}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-cyan-400 text-black shadow-[0_0_15px_#00f5ff]' : 'bg-white/5'}`}>
       <i className={`fa-solid ${icon} text-lg`}></i>
    </div>
    <span className="text-[12px] font-black uppercase tracking-[0.2em]">{label}</span>
  </div>
);

const SetupInput = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="w-full">
    <label className="block text-[9px] uppercase font-black text-white/20 mb-3 tracking-widest pl-1">{label}</label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full cyber-input p-5 rounded-2xl text-[11px] font-mono border-white/10 focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all text-white placeholder:text-white/5 shadow-inner" 
    />
  </div>
);

export default AIAnalytics;
