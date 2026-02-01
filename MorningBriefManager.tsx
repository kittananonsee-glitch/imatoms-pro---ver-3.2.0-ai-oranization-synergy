
import React, { useState, useEffect } from 'react';
import { MorningBrief, Language } from '../types';

interface MorningBriefManagerProps {
  onBack: () => void;
  lang: Language;
}

const MorningBriefManager: React.FC<MorningBriefManagerProps> = ({ onBack, lang }) => {
  const [briefs, setBriefs] = useState<MorningBrief[]>(() => {
    const saved = localStorage.getItem('imatoms_briefs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrief, setEditingBrief] = useState<MorningBrief | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const t = {
    title: lang === 'TH' ? 'ประชุมสรุปงานเช้า (Morning Brief)' : 'Morning Brief Meeting',
    report_title: lang === 'TH' ? 'รายงานสรุปภาพรวมระบบวิศวกรรมอาคาร' : 'Building Engineering Overview Report',
    add_btn: lang === 'TH' ? 'เพิ่มบันทึกรายงานใหม่' : 'Add New Daily Report',
    history: lang === 'TH' ? 'ประวัติรายงานย้อนหลัง' : 'Report History',
    save_btn: lang === 'TH' ? 'บันทึกรายงาน' : 'Save Report',
    cancel_btn: lang === 'TH' ? 'ยกเลิก' : 'Cancel',
    normal: lang === 'TH' ? 'ปกติ' : 'Normal',
    abnormal: lang === 'TH' ? 'ผิดปกติ' : 'Abnormal',
    no_data: lang === 'TH' ? 'ไม่มีข้อมูลรายงาน' : 'No report data found',
  };

  useEffect(() => {
    localStorage.setItem('imatoms_briefs', JSON.stringify(briefs));
  }, [briefs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data: any = {};
    
    fd.forEach((value, key) => {
      if (key.includes('_status') || key.startsWith('avail_') || key.startsWith('risk_') || key === 'wwtp_check_pass') {
        // We use checkboxes for toggles: checked (on) = normal, unchecked = abnormal
        data[key] = value === 'on' || value === 'normal';
      } else if (['roster_morning', 'roster_afternoon', 'roster_night', 'op_total_percent', 'cm_percent', 'cm_in', 'cm_out', 'cm_pending_month', 'pm_total', 'pm_complete', 'om_plan', 'om_actual', 'gen_fuel_level', 'gen_fuel_percent', 'gen_backup_hours', 'fire_pump_fuel', 'fire_pump_percent', 'fire_pump_hours', 'elec_kwh', 'elec_diff', 'chiller_kwh', 'chiller_diff', 'water_m3', 'water_diff', 'lox_remains', 'lox_usage', 'lox_diff', 'lpg_a_tanks', 'lpg_a_bar', 'lpg_b_tanks', 'lpg_b_bar', 'water_hosp_unit', 'water_hosp_diff', 'water_cooling_unit', 'water_cooling_diff', 'water_ro_unit', 'water_ro_diff', 'tank_total_m3', 'tank_backup_days', 'tank_a_m3', 'tank_a_percent', 'tank_b_m3', 'tank_b_percent', 'tank_fire_m3'].includes(key)) {
        data[key] = parseFloat(value as string) || 0;
      } else {
        data[key] = value;
      }
    });

    data.roster_total = (data.roster_morning || 0) + (data.roster_afternoon || 0) + (data.roster_night || 0);
    data.risk_status = data.risk_status ? 'normal' : 'abnormal';
    data.fire_safety_status = data.fire_safety_status ? 'normal' : 'abnormal';
    data.satisfaction_status = data.satisfaction_status ? 'normal' : 'abnormal';

    if (editingBrief) {
      setBriefs(briefs.map(b => b.id === editingBrief.id ? { ...editingBrief, ...data } : b));
    } else {
      const newReport: MorningBrief = {
        id: `mb-${Date.now()}`,
        ...data,
        created_at: new Date().toISOString()
      };
      setBriefs([newReport, ...briefs]);
    }
    setIsModalOpen(false);
    setEditingBrief(null);
  };

  const deleteBrief = (id: string) => {
    if (window.confirm(lang === 'TH' ? 'ต้องการลบรายงานนี้หรือไม่?' : 'Delete this report?')) {
      setBriefs(briefs.filter(b => b.id !== id));
    }
  };

  const filteredBriefs = briefs.filter(b => 
    b.date.includes(searchQuery) || b.recorder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#0a0e17] overflow-hidden">
      <nav className="w-72 border-r border-white/10 bg-black/40 flex flex-col p-6 shrink-0">
        <div className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-2xl text-purple-400">
            <i className="fa-solid fa-users-viewfinder"></i>
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-white uppercase tracking-tighter leading-tight">Reliability Hub</h1>
            <p className="text-[8px] text-cyan-400 font-black uppercase tracking-[0.2em] mt-1">Daily Briefing 3.1.2</p>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
           <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 text-center shadow-inner">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1 italic">Total Archived</p>
              <p className="text-4xl font-display font-black text-white">{briefs.length}</p>
           </div>
        </div>
        <button onClick={onBack} className="mt-auto flex items-center gap-3 p-4 text-white/40 hover:text-white transition-all font-bold uppercase text-[10px] border-t border-white/5 group">
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          <span>Exit Module</span>
        </button>
      </nav>

      <main className="flex-1 overflow-auto p-8 lg:p-12 no-scrollbar bg-gradient-to-br from-[#0a0e17] to-[#0f172a]">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Building Daily Strategic Report</p>
              <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                {t.title}
              </h2>
           </div>
           <button 
             onClick={() => { setEditingBrief(null); setIsModalOpen(true); }}
             className="px-8 py-4 bg-purple-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-purple-500/20 hover:bg-purple-500 transition-all transform active:scale-95 flex items-center gap-2"
           >
              <i className="fa-solid fa-file-circle-plus"></i>
              {t.add_btn}
           </button>
        </header>

        <div className="cyber-card rounded-[3rem] border-white/5 bg-black/40 overflow-hidden shadow-2xl">
           <div className="p-8 border-b border-white/5 flex items-center justify-between gap-6">
              <div className="relative max-w-md w-full">
                 <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-white/20"></i>
                 <input 
                   type="text" 
                   placeholder="Search by date (YYYY-MM-DD) or recorder..." 
                   className="w-full pl-12 pr-6 py-4 cyber-input rounded-2xl text-xs"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <h3 className="font-display text-xs text-white/30 uppercase tracking-[0.2em]">{t.history}</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/10">
                       <th className="px-10 py-6">Date</th>
                       <th className="px-10 py-6">Recorder</th>
                       <th className="px-10 py-6">Op Success</th>
                       <th className="px-10 py-6">Risk Status</th>
                       <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredBriefs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-10 py-24 text-center opacity-20 italic">{t.no_data}</td>
                      </tr>
                    ) : (
                      filteredBriefs.map(brief => (
                        <tr key={brief.id} className="hover:bg-white/5 transition-colors group">
                           <td className="px-10 py-6 text-xs font-mono text-cyan-400 font-bold">{brief.date}</td>
                           <td className="px-10 py-6 text-xs text-white/60 font-bold uppercase">{brief.recorder}</td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                 <span className="text-sm font-black text-white">{brief.op_total_percent}%</span>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${brief.risk_status === 'normal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {brief.risk_status}
                              </span>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => { setEditingBrief(brief); setIsModalOpen(true); }} className="text-cyan-400 hover:text-white transition-all"><i className="fa-solid fa-pen-to-square"></i></button>
                                 <button onClick={() => deleteBrief(brief.id)} className="text-red-400 hover:text-white transition-all"><i className="fa-solid fa-trash"></i></button>
                              </div>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-hidden">
             <div className="cyber-card w-full max-w-7xl h-full max-h-[90vh] p-10 rounded-[4rem] border-purple-500/30 flex flex-col shadow-[0_0_100px_rgba(168,85,247,0.1)] relative">
                <header className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 shrink-0">
                   <div>
                      <h3 className="font-display text-3xl font-black text-purple-400 uppercase italic leading-tight">
                         {editingBrief ? 'Edit Daily Report' : 'New Strategic Briefing'}
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Enterprise Facility Management Standard v3.1.2</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                      <i className="fa-solid fa-xmark text-xl"></i>
                   </button>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-12 pb-10">
                   <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <FormInput label="Report Date" name="date" type="date" defaultValue={editingBrief?.date || new Date().toISOString().split('T')[0]} required />
                      <FormInput label="Recorder Name" name="recorder" defaultValue={editingBrief?.recorder} required placeholder="Full Name or Staff ID" />
                      <FormInput label="Operation Overview (%)" name="op_total_percent" type="number" step="0.1" defaultValue={editingBrief?.op_total_percent || 100} required />
                   </section>

                   <div className="h-px bg-white/5"></div>

                   <section className="space-y-8">
                      <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-widest italic flex items-center gap-3">
                        <i className="fa-solid fa-shield-halved"></i> 1. Risk Assessment & Operations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Synchronized noteName and noteDefault for better consistency */}
                        <StatusToggle label="Overall Risk Status" name="risk_status" defaultChecked={editingBrief?.risk_status === 'normal' || !editingBrief} showNote noteName="risk_note" noteDefault={editingBrief?.risk_note} />
                        <StatusToggle label="2. Fire Safety Status" name="fire_safety_status" defaultChecked={editingBrief?.fire_safety_status === 'normal' || !editingBrief} showNote noteName="fire_notes" noteDefault={editingBrief?.fire_notes} />
                        <StatusToggle label="3. Customer Satisfaction" name="satisfaction_status" defaultChecked={editingBrief?.satisfaction_status === 'normal' || !editingBrief} showNote noteName="sat_notes" noteDefault={editingBrief?.sat_notes} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pt-4">
                         <StatusToggle label="Elec Power Failure" name="risk_elec_fail" defaultChecked={editingBrief?.risk_elec_fail} isMini />
                         <StatusToggle label="Water Loss Failure" name="risk_water_loss" defaultChecked={editingBrief?.risk_water_loss} isMini />
                         <StatusToggle label="Chiller Failure" name="risk_chiller_fail" defaultChecked={editingBrief?.risk_chiller_fail} isMini />
                         <StatusToggle label="Leak / Overflow" name="risk_water_leak" defaultChecked={editingBrief?.risk_water_leak} isMini />
                         <StatusToggle label="Elevator Failure" name="risk_elevator_fail" defaultChecked={editingBrief?.risk_elevator_fail} isMini />
                         <StatusToggle label="Gas Leak Failure" name="risk_gas_fail" defaultChecked={editingBrief?.risk_gas_fail} isMini />
                      </div>
                   </section>

                   <section className="p-8 rounded-[3rem] bg-cyan-500/5 border border-cyan-500/20 space-y-8">
                      <div className="flex items-center justify-between">
                         <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
                           <i className="fa-solid fa-users"></i> 4. Daily Roster กำลังพลประจำวัน
                         </h4>
                         <StatusToggle label="Roster Accuracy" name="roster_status" defaultChecked={true} isMini />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                         <FormInput label="Morning (เช้า)" name="roster_morning" type="number" defaultValue={editingBrief?.roster_morning} />
                         <FormInput label="Afternoon (บ่าย)" name="roster_afternoon" type="number" defaultValue={editingBrief?.roster_afternoon} />
                         <FormInput label="Night (ดึก)" name="roster_night" type="number" defaultValue={editingBrief?.roster_night} />
                      </div>
                      <FormTextArea label="Roster Notes / TOR" name="roster_note" defaultValue={editingBrief?.roster_note} rows={2} placeholder="e.g. TOR: จ-ส >= 19 อัตรา..." />
                   </section>

                   <section className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-widest italic flex items-center gap-3 border-l-4 border-purple-500 pl-4">
                           5. Operation Performance (CM / PM / OM)
                        </h4>
                        <StatusToggle label="SLA Compliance" name="op_sla_status" defaultChecked={true} isMini />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">5.1 CM งานแจ้งซ่อม</p>
                            <FormInput label="Success %" name="cm_percent" type="number" step="0.1" defaultValue={editingBrief?.cm_percent} />
                            <div className="grid grid-cols-2 gap-4">
                               <FormInput label="In (เข้า)" name="cm_in" type="number" defaultValue={editingBrief?.cm_in} />
                               <FormInput label="Out (ออก)" name="cm_out" type="number" defaultValue={editingBrief?.cm_out} />
                            </div>
                            <FormInput label="Pending Month (ค้างสะสม)" name="cm_pending_month" type="number" defaultValue={editingBrief?.cm_pending_month} />
                         </div>
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">5.2 PM งานบำรุงรักษา</p>
                            <div className="grid grid-cols-2 gap-4">
                               <FormInput label="Total (ทั้งหมด)" name="pm_total" type="number" defaultValue={editingBrief?.pm_total} />
                               <FormInput label="Complete (เสร็จ)" name="pm_complete" type="number" defaultValue={editingBrief?.pm_complete} />
                            </div>
                            <FormTextArea label="PM Pending Details (งานค้าง MA)" name="pm_pending_notes" defaultValue={editingBrief?.pm_pending_notes} rows={4} placeholder="List pending systems..." />
                         </div>
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">5.3 OM งานบริหารอาคาร</p>
                            <div className="grid grid-cols-2 gap-4">
                               <FormInput label="Plan (แผน)" name="om_plan" type="number" defaultValue={editingBrief?.om_plan} />
                               <FormInput label="Actual (จริง)" name="om_actual" type="number" defaultValue={editingBrief?.om_actual} />
                            </div>
                         </div>
                      </div>
                   </section>

                   <section className="p-8 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 space-y-8">
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest italic flex items-center gap-3">
                         <i className="fa-solid fa-screwdriver-wrench"></i> 6. Main Equipment Availability ความพร้อมการใช้งาน
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                         <StatusToggle label="Elec Power" name="avail_elec" defaultChecked={editingBrief?.avail_elec || !editingBrief} isMini />
                         <StatusToggle label="Emergency Power" name="avail_emergency" defaultChecked={editingBrief?.avail_emergency || !editingBrief} isMini />
                         <StatusToggle label="AC System" name="avail_ac" defaultChecked={editingBrief?.avail_ac || !editingBrief} isMini />
                         <StatusToggle label="Ventilation" name="avail_vent" defaultChecked={editingBrief?.avail_vent || !editingBrief} isMini />
                         <StatusToggle label="Fire Alarm" name="avail_fire_alarm" defaultChecked={editingBrief?.avail_fire_alarm || !editingBrief} isMini />
                         <StatusToggle label="Fire Protection" name="avail_fire_protection" defaultChecked={editingBrief?.avail_fire_protection || !editingBrief} isMini />
                         <StatusToggle label="Sanitary" name="avail_sanitary" defaultChecked={editingBrief?.avail_sanitary || !editingBrief} isMini />
                         <StatusToggle label="Transportation" name="avail_transp" defaultChecked={editingBrief?.avail_transp || !editingBrief} isMini />
                         <StatusToggle label="Waste Water" name="avail_waste_water" defaultChecked={editingBrief?.avail_waste_water || !editingBrief} isMini />
                         <StatusToggle label="Med Gas" name="avail_med_gas" defaultChecked={editingBrief?.avail_med_gas || !editingBrief} isMini />
                         <StatusToggle label="LPG Gas" name="avail_lpg" defaultChecked={editingBrief?.avail_lpg || !editingBrief} isMini />
                         <StatusToggle label="CCTV/Gate" name="avail_cctv" defaultChecked={editingBrief?.avail_cctv || !editingBrief} isMini />
                      </div>
                      <FormTextArea label="Failure Notes (บันทึกกรณีขัดข้อง)" name="avail_notes" defaultValue={editingBrief?.avail_notes} rows={2} placeholder="e.g. UPS No.4 Short circuit..." />
                   </section>

                   <section className="space-y-8">
                      <h4 className="text-[11px] font-black text-orange-400 uppercase tracking-widest italic flex items-center gap-3 border-l-4 border-orange-500 pl-4">
                         7. FMS Main Emergency Test (JCI Standard)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                               <p className="text-[9px] font-black text-white/30 uppercase">7.1 Generator Test</p>
                               <StatusToggle label="" name="gen_status" defaultChecked={true} isMini />
                            </div>
                            <FormInput label="Last Test Date" name="gen_test_date" type="date" defaultValue={editingBrief?.gen_test_date} />
                            <div className="grid grid-cols-2 gap-4">
                               <FormInput label="Fuel (Litres)" name="gen_fuel_level" type="number" defaultValue={editingBrief?.gen_fuel_level} />
                               <FormInput label="Fuel %" name="gen_fuel_percent" type="number" defaultValue={editingBrief?.gen_fuel_percent} />
                            </div>
                         </div>
                         <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                               <p className="text-[9px] font-black text-white/30 uppercase">7.2 Fire Pump Test</p>
                               <StatusToggle label="" name="fire_pump_status" defaultChecked={true} isMini />
                            </div>
                            <FormInput label="Last Test Date" name="fire_pump_date" type="date" defaultValue={editingBrief?.fire_pump_date} />
                            <div className="grid grid-cols-2 gap-4">
                               <FormInput label="Fuel (Litres)" name="fire_pump_fuel" type="number" defaultValue={editingBrief?.fire_pump_fuel} />
                               <FormInput label="Fire Pump %" name="fire_pump_percent" type="number" defaultValue={editingBrief?.fire_pump_percent} />
                            </div>
                         </div>
                         <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4 flex flex-col justify-center items-center text-center">
                            <p className="text-[9px] font-black text-white/30 uppercase mb-4">7.3 WWTP Daily Check</p>
                            <StatusToggle label="Check Result (DO/TDS/PH)" name="wwtp_check_pass" defaultChecked={editingBrief?.wwtp_check_pass || !editingBrief} />
                            <p className="text-[10px] text-emerald-400 font-bold mt-4 uppercase tracking-widest">5 Parameters Pass</p>
                         </div>
                      </div>
                   </section>

                   <section className="p-10 rounded-[4rem] bg-blue-500/5 border border-blue-500/20 space-y-10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest italic flex items-center gap-3">
                           <i className="fa-solid fa-bolt"></i> 8. Utility Cost & Consumption
                        </h4>
                        <StatusToggle label="Utility Thresholds" name="util_status" defaultChecked={true} isMini />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-white/20 uppercase">8.1 Electricity (kWh)</p>
                            <FormInput label="Total Usage" name="elec_kwh" type="number" defaultValue={editingBrief?.elec_kwh} />
                            <FormInput label="Diff from yesterday" name="elec_diff" type="number" defaultValue={editingBrief?.elec_diff} />
                         </div>
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-white/20 uppercase">8.2 Chiller Elec (kWh)</p>
                            <FormInput label="Chiller Usage" name="chiller_kwh" type="number" defaultValue={editingBrief?.chiller_kwh} />
                            <FormInput label="Diff from yesterday" name="chiller_diff" type="number" defaultValue={editingBrief?.chiller_diff} />
                         </div>
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-white/20 uppercase">8.3 Water Total (m3)</p>
                            <FormInput label="Total Water" name="water_m3" type="number" defaultValue={editingBrief?.water_m3} />
                            <FormInput label="Diff from yesterday" name="water_diff" type="number" defaultValue={editingBrief?.water_diff} />
                         </div>
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-white/20 uppercase">8.4 Med Gas (Litre)</p>
                            <FormInput label="LOX Remaining" name="lox_remains" type="number" defaultValue={editingBrief?.lox_remains} />
                            <FormInput label="Used" name="lox_usage" type="number" defaultValue={editingBrief?.lox_usage} />
                         </div>
                      </div>
                   </section>

                   <section className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-white/40 uppercase tracking-widest italic flex items-center gap-3">
                           <i className="fa-solid fa-handshake-angle"></i> 9. MA Contract & Vendor QC
                        </h4>
                        <StatusToggle label="Vendor Performance" name="vendor_qc_status" defaultChecked={true} isMini />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <FormTextArea label="MA Service Vendors" name="ma_vendors" defaultValue={editingBrief?.ma_vendors} rows={4} placeholder="1. Mitsubishi (Elevator)..." />
                         <FormTextArea label="Improvement / Project Vendors" name="improvement_vendors" defaultValue={editingBrief?.improvement_vendors} rows={4} placeholder="1. J8 (Signage Installation)..." />
                      </div>
                   </section>

                   <div className="flex gap-4 pt-12 sticky bottom-0 bg-black/90 pb-6 border-t border-white/10 mt-12 z-10">
                      <button type="submit" className="flex-1 py-6 bg-purple-600 text-white font-black uppercase text-sm rounded-3xl shadow-2xl shadow-purple-500/30 hover:bg-purple-500 transition-all transform active:scale-95">
                         <i className="fa-solid fa-cloud-arrow-up mr-2"></i> {t.save_btn}
                      </button>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-16 py-6 bg-white/5 border border-white/10 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                         {t.cancel_btn}
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

const FormInput = ({ label, className = "", ...props }: any) => (
  <div className={className}>
    <label className="block text-[10px] uppercase font-black text-white/80 mb-2 tracking-[0.2em] pl-1 truncate drop-shadow-sm">{label}</label>
    <input className="w-full cyber-input p-5 rounded-2xl text-[13px] border-white/30 bg-black/60 focus:border-cyan-400 text-white placeholder:text-white/20 shadow-inner" {...props} />
  </div>
);

const FormTextArea = ({ label, className = "", rows = 4, ...props }: any) => (
  <div className={className}>
    <label className="block text-[10px] uppercase font-black text-white/80 mb-2 tracking-[0.2em] pl-1 drop-shadow-sm">{label}</label>
    <textarea rows={rows} className="w-full cyber-input p-5 rounded-2xl text-[13px] resize-none border-white/30 bg-black/60 focus:border-cyan-400 text-white placeholder:text-white/20 shadow-inner" {...props}></textarea>
  </div>
);

const StatusToggle = ({ label, name, defaultChecked, isMini = false, showNote = false, noteName = "", noteDefault = "" }: any) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  return (
    <div className={`space-y-4 ${isMini ? 'flex-1' : ''}`}>
       {label && <label className="block text-[10px] uppercase font-black text-white/90 tracking-[0.2em] pl-1 drop-shadow-sm">{label}</label>}
       <div className="flex items-center gap-4">
          <label className="relative inline-block w-16 h-8 cursor-pointer shrink-0">
             <input 
               type="checkbox" 
               name={name} 
               checked={isChecked}
               onChange={(e) => setIsChecked(e.target.checked)}
               className="hidden peer" 
             />
             <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500 rounded-full transition-all peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 shadow-inner"></div>
             <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] transition-all transform peer-checked:translate-x-8 peer-checked:bg-emerald-500 peer-checked:shadow-[0_0_10px_rgba(16,185,129,0.7)]"></div>
          </label>
          {!isMini && (
            <div className="flex flex-col">
               <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isChecked ? 'text-emerald-400' : 'text-red-500'} brightness-150 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]`}>
                  {isChecked ? 'NORMAL (ปกติ)' : 'ABNORMAL (ผิดปกติ)'}
               </span>
            </div>
          )}
       </div>
       
       {showNote && !isChecked && (
         <div className="animate-fadeIn mt-4 p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/40">
           <label className="block text-[9px] uppercase font-black text-red-400 mb-2 tracking-widest pl-1">Specify Abnormal Details / บันทึกความผิดปกติ</label>
           <textarea 
             name={noteName} 
             defaultValue={noteDefault}
             className="w-full bg-black/40 border border-red-500/40 rounded-xl p-4 text-xs text-white placeholder:text-red-400/30 focus:border-red-500 outline-none resize-none" 
             rows={3}
             placeholder="Please describe the issue..."
           />
         </div>
       )}
    </div>
  );
};

export default MorningBriefManager;
