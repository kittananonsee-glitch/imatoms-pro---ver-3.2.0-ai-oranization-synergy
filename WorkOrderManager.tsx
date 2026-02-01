
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WorkOrder, MasterData, Staff } from '../types';

interface WorkOrderManagerProps {
  onBack: () => void;
  lang: string;
}

const WorkOrderManager: React.FC<WorkOrderManagerProps> = ({ onBack, lang }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [editingModal, setEditingModal] = useState<{ type: string; item: any } | null>(null);
  const [closureModal, setClosureModal] = useState<WorkOrder | null>(null);
  const chartRefs = useRef<Record<string, any | null>>({});

  // ---------------------------------------------------------
  // INITIAL DATA & SYNC
  // ---------------------------------------------------------
  const [orders, setOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('imatoms_wo_orders');
    return saved ? JSON.parse(saved) : [
      {
        work_request_no: 'RM24-00125', date: '2024-05-20', notification_time: '10:30',
        building_name: 'ViMUT Hospital', main_floor: '2', main_area: 'ที่จอดรถB4', main_department: 'Security',
        type_area: 'Carparking', room_no: 'B4-01', job_detail: 'ไฟส่องสว่างทางเดินไม่ติด 2 จุด',
        code_emergency: 'No Code', priority_work: 'High<5min',
        staff_notification_name: 'สมชาย สายตรวจ', phone_number: '3832', work_progress: 'Pending',
        created_at: new Date().toISOString()
      }
    ];
  });

  const [masterData, setMasterData] = useState<MasterData>(() => {
    const saved = localStorage.getItem('imatoms_master_data');
    return saved ? JSON.parse(saved) : {
      floors: ['B4', 'B3', 'B2', 'B1', 'G', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      typeAreas: ['Clinic-IPD', 'Clinic-OPD', 'Toilet', 'Common Area', 'Office', 'Technical Room', 'Carparking', 'Storage'],
      staff: [
        { id: 'st-1', name: 'นางสาวศิริลักษณ์ มาคำ', status: 'available', mttr: 1.2, jobsCompleted: 15 },
        { id: 'st-2', name: 'นายสุทธิพงศ์ ทุมภา', status: 'busy', mttr: 1.5, jobsCompleted: 22 },
        { id: 'st-3', name: 'นายวิชัย สมบูรณ์', status: 'available', mttr: 0.8, jobsCompleted: 10 }
      ],
      workGroups: ['RM', 'PM', 'OM', 'MA'],
      systemWorks: ['AC', 'SN', 'EL', 'FP', 'BMS', 'EE', 'OTH'],
      emergencyCodes: [{ code: 'No Code', desc: 'ปกติ', color: 'emerald' }],
      separateDetails: ['Replacement', 'Adjustment', 'Lubricant'],
      targetTimes: [
        { id: 't-1', system: 'HVAC', value: 1.5 },
        { id: 't-2', system: 'Electrical', value: 1.0 }
      ],
      departments: [{ id: 'dep-1', mainArea: 'ที่จอดรถB4', name: 'Security', floor: 'B4', typeArea: 'Carparking', internalNo: '3832', mobileNo: '02-079-0187' }],
      equipment: [{ id: 'eq-1', name: 'AHU-01', floor: '1', department: 'Engineering', subArea: 'Hall', system: 'AC', subSystem: 'HVAC', group: 'Mech', code: 'VMH-1-AC-001' }]
    };
  });

  useEffect(() => {
    localStorage.setItem('imatoms_wo_orders', JSON.stringify(orders));
    localStorage.setItem('imatoms_master_data', JSON.stringify(masterData));
  }, [orders, masterData]);

  // MTTR / MTBF Simulation logic
  const systemMetrics = useMemo(() => {
    return [
      { system: 'HVAC', mttr: 1.4, mtbf: 450 },
      { system: 'Electrical', mttr: 0.8, mtbf: 1200 },
      { system: 'Sanitary', mttr: 2.5, mtbf: 320 },
      { system: 'Medical Gas', mttr: 0.3, mtbf: 2500 }
    ];
  }, []);

  const calculateMaintainability = (mttr: number, targetTime: number) => {
    return (1 - Math.exp(-(targetTime / mttr))) * 100;
  };

  // ---------------------------------------------------------
  // CHART EFFECT
  // ---------------------------------------------------------
  useEffect(() => {
    if (activePage === 'dashboard') {
      // Fix: Casting c to any inside Object.values loop to prevent TypeScript 'unknown' type error when calling .destroy()
      Object.values(chartRefs.current).forEach((c: any) => c?.destroy());
      const ctx = (document.getElementById('dashStatusChart') as HTMLCanvasElement)?.getContext('2d');
      if (ctx) {
        const pending = orders.filter(o => o.work_progress === 'Pending').length;
        const process = orders.filter(o => o.work_progress === 'On Process').length;
        const complete = orders.filter(o => o.work_progress === 'Complete').length;
        // @ts-ignore
        chartRefs.current.dash = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Pending', 'On Process', 'Complete'],
            datasets: [{ data: [pending, process, complete], backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'], borderWidth: 0 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }
        });
      }
    }
  }, [activePage, orders]);

  // ---------------------------------------------------------
  // WORK ORDER OPERATIONS
  // ---------------------------------------------------------
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const newOrder: WorkOrder = {
      work_request_no: `RM${new Date().getFullYear().toString().slice(-2)}-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0],
      notification_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      building_name: 'ViMUT Hospital',
      main_floor: fd.get('floor') as string,
      main_area: fd.get('area') as string,
      main_department: fd.get('department') as string,
      type_area: fd.get('type_area') as string,
      room_no: fd.get('room') as string,
      job_detail: fd.get('detail') as string,
      code_emergency: fd.get('emergency') as string,
      priority_work: fd.get('priority') as string,
      staff_notification_name: fd.get('reporter') as string,
      phone_number: fd.get('phone') as string,
      work_progress: 'Pending',
      created_at: new Date().toISOString()
    };
    setOrders([newOrder, ...orders]);
    alert("Work Order Created Successfully!");
    setActivePage('dashboard');
  };

  const assignOrder = (orderId: string, staffName: string) => {
    const updated = orders.map(o => o.work_request_no === orderId ? { ...o, work_progress: 'On Process' as const, technician_name: staffName, work_date_actual_start: new Date().toISOString() } : o);
    setOrders(updated);
    alert(`Assigned to ${staffName}`);
  };

  const handleCloseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureModal) return;

    const fd = new FormData(e.target as HTMLFormElement);
    const updatedOrder: WorkOrder = {
      ...closureModal,
      work_progress: 'Complete',
      work_date_actual_start: fd.get('start_time') as string,
      work_date_actual_finish: fd.get('finish_time') as string,
      work_system: fd.get('work_system') as any,
      work_type: fd.get('work_type') as any,
      closure_type: fd.get('closure_type') as any,
      problem_desc: fd.get('problem') as string,
      cause_desc: fd.get('cause') as string,
      solution_desc: fd.get('solution') as string,
      prevention_desc: fd.get('prevention') as string,
      repair_duration_hrs: parseFloat(fd.get('repair_duration') as string) || 0,
      lead_time_hrs: parseFloat(fd.get('lead_time') as string) || 0,
      summarizer_name: fd.get('summarizer') as string,
      customer_name: fd.get('customer') as string,
      customer_satisfy: parseInt(fd.get('satisfaction') as string) || 5,
      satisfy_feedback: fd.get('feedback') as string,
      approver_name: fd.get('approver') as string
    };

    const newOrders = orders.map(o => o.work_request_no === closureModal.work_request_no ? updatedOrder : o);
    setOrders(newOrders);
    setClosureModal(null);
    alert("Work Order Successfully Closed!");
  };

  const deleteOrder = (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this Work Order?")) return;
    setOrders(orders.filter(o => o.work_request_no !== orderId));
  };

  // ---------------------------------------------------------
  // MASTER DATA LOGIC
  // ---------------------------------------------------------
  const exportToExcel = (data: any[], filename: string) => {
    // @ts-ignore
    const ws = XLSX.utils.json_to_sheet(data);
    // @ts-ignore
    const wb = XLSX.utils.book_new();
    // @ts-ignore
    XLSX.utils.book_append_sheet(wb, ws, "MasterData");
    // @ts-ignore
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModal) return;

    const fd = new FormData(e.target as HTMLFormElement);
    const dataObj: any = {};
    fd.forEach((value, key) => { dataObj[key] = value; });

    const { type, item } = editingModal;
    const isEdit = !!item.id;
    const newId = item.id || `${type}-${Date.now()}`;

    let updatedMaster = { ...masterData };

    if (type === 'department') {
      const entry = { ...dataObj, id: newId };
      updatedMaster.departments = isEdit 
        ? masterData.departments.map(d => d.id === newId ? entry : d)
        : [...masterData.departments, entry];
    } else if (type === 'equipment') {
      const entry = { ...dataObj, id: newId };
      updatedMaster.equipment = isEdit 
        ? masterData.equipment.map(e => e.id === newId ? entry : e)
        : [...masterData.equipment, entry];
    } else if (type === 'target') {
      const entry = { id: newId, system: dataObj.system, value: parseFloat(dataObj.value) };
      updatedMaster.targetTimes = isEdit
        ? masterData.targetTimes.map(t => t.id === newId ? entry : t)
        : [...masterData.targetTimes, entry];
    } else if (type === 'staff') {
      const entry: Staff = { id: newId, name: dataObj.name, status: 'available' as const, mttr: parseFloat(dataObj.mttr), jobsCompleted: 0 };
      updatedMaster.staff = isEdit 
        ? masterData.staff.map(s => s.id === newId ? entry : s)
        : [...masterData.staff, entry];
    } else if (['floors', 'typeAreas', 'workGroups', 'systemWorks', 'separateDetails'].includes(type)) {
      const newVal = dataObj.value;
      const listKey = type as keyof MasterData;
      // @ts-ignore
      updatedMaster[listKey] = [...masterData[listKey], newVal];
    }

    setMasterData(updatedMaster);
    setEditingModal(null);
  };

  const deleteItem = (type: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    let updated = { ...masterData };
    if (type === 'department') updated.departments = masterData.departments.filter(d => d.id !== id);
    if (type === 'equipment') updated.equipment = masterData.equipment.filter(e => e.id !== id);
    if (type === 'target') updated.targetTimes = masterData.targetTimes.filter(t => t.id !== id);
    if (type === 'staff') updated.staff = masterData.staff.filter(s => s.id !== id);
    setMasterData(updated);
  };

  // ---------------------------------------------------------
  // RENDER SECTIONS
  // ---------------------------------------------------------

  const renderMaintainability = () => (
    <div className="space-y-10 animate-fadeIn">
      <div className="cyber-card p-10 rounded-[3rem] border-purple-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><i className="fa-solid fa-calculator text-9xl"></i></div>
        <div className="flex items-center gap-6 mb-12 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-2xl text-purple-400 border border-purple-400/30">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div>
            <h3 className="font-display text-2xl font-black text-white uppercase italic tracking-tighter">Maintainability Modeling</h3>
            <p className="text-[10px] text-cyan-400/60 font-bold uppercase tracking-widest mt-1">Mathematical Predictive Engine M(t)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="space-y-6">
              <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5">
                 <p className="text-white/70 text-sm italic border-l-4 border-purple-500 pl-4 mb-6">
                   M(t) = 1 - e<sup>-(TargetTime / MTTR)</sup>
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                       <p className="text-[9px] font-black text-white/30 uppercase mb-2">SLA Threshold</p>
                       <p className="text-2xl font-display font-black text-emerald-400">90.0%</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                       <p className="text-[9px] font-black text-white/30 uppercase mb-2">Engine Status</p>
                       <p className="text-2xl font-display font-black text-cyan-400">SYNCED</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 italic ml-2">Live Probability Analysis</h4>
              {systemMetrics.map(sys => {
                const target = masterData.targetTimes.find(t => t.system === sys.system);
                const tValue = target ? target.value : 1.0;
                const mProb = calculateMaintainability(sys.mttr, tValue);
                const isCritical = mProb < 90;

                return (
                  <div key={sys.system} className={`p-6 rounded-[2rem] transition-all relative border-2 ${isCritical ? 'animate-critical-blink bg-red-500/5 border-red-500/40' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h5 className="font-bold text-white text-lg">{sys.system}</h5>
                        <p className="text-[9px] text-white/40 uppercase font-black mt-1">MTTR: {sys.mttr}h | Target: {tValue}h</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-display font-black leading-none ${isCritical ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-cyan-400'}`}>
                          {mProb.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-cyan-400'}`} style={{ width: `${mProb}%` }}></div>
                    </div>
                    {isCritical && (
                       <div className="absolute top-4 right-24 px-2 py-0.5 rounded bg-red-600 text-[8px] font-black text-white uppercase animate-pulse">
                         Critical Alarm
                       </div>
                    )}
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-[#0a0e17] overflow-hidden">
      {/* SIDEBAR SUB-PROGRAM */}
      <nav className="w-64 border-r border-white/10 bg-black/40 flex flex-col p-4 shrink-0">
        <div className="mb-10 px-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xl text-cyan-400 border border-cyan-400/30">
            <i className="fa-solid fa-wrench"></i>
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-white leading-none">iMATOMs Pro</h1>
            <p className="text-[8px] text-cyan-400/60 font-bold uppercase tracking-widest mt-1">Work Orders 3.1.2</p>
          </div>
        </div>
        
        <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          <SideItem icon="fa-chart-pie" label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <div className="pt-2 pb-1 px-4 text-[9px] font-black text-white/20 uppercase tracking-widest">Operations</div>
          <SideItem icon="fa-plus-circle" label="แจ้งซ่อม" active={activePage === 'request'} onClick={() => setActivePage('request')} />
          <SideItem icon="fa-headset" label="มอบหมายงาน" active={activePage === 'helpdesk'} onClick={() => setActivePage('helpdesk')} />
          <SideItem icon="fa-screwdriver-wrench" label="ปิดงานซ่อม" active={activePage === 'technician'} onClick={() => setActivePage('technician')} />
          
          <div className="pt-2 pb-1 px-4 text-[9px] font-black text-white/20 uppercase tracking-widest">Analytics</div>
          <SideItem icon="fa-calculator" label="Maintainability" active={activePage === 'maintainability'} onClick={() => setActivePage('maintainability')} />
          <SideItem icon="fa-database" label="Master Data" active={activePage === 'master'} onClick={() => setActivePage('master')} />
        </div>

        <button onClick={onBack} className="mt-auto flex items-center gap-3 p-4 text-white/40 hover:text-white transition-all font-bold uppercase text-[10px] border-t border-white/5 group">
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          <span>Exit Module</span>
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto p-8 lg:p-12 no-scrollbar bg-gradient-to-br from-[#0a0e17] to-[#0f172a]">
        <header className="mb-10">
           <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mb-1">iMATOMs Pro - Ver 3.1.2_Work Orders Management</p>
           <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
             {activePage.replace('-', ' ')}
           </h2>
        </header>

        {activePage === 'dashboard' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
              <div className="lg:col-span-4 cyber-card p-6 flex flex-col items-center">
                 <h3 className="font-display text-xs text-cyan-400 uppercase tracking-widest mb-6 italic">Status Overview</h3>
                 <div className="h-64 w-full relative"><canvas id="dashStatusChart"></canvas></div>
              </div>
              <div className="lg:col-span-8 cyber-card p-6">
                 <h3 className="font-display text-xs text-cyan-400 uppercase tracking-widest mb-6">Recent Activities</h3>
                 <div className="space-y-4">
                    {orders.slice(0, 5).map(o => (
                       <div key={o.work_request_no} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:border-cyan-400/30 transition-all">
                          <div>
                             <p className="font-mono text-[10px] text-cyan-400">{o.work_request_no}</p>
                             <p className="text-sm font-bold text-white mt-1">{o.job_detail}</p>
                             <p className="text-[9px] text-white/20 uppercase mt-1">{o.main_area} | {o.main_floor}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${o.work_progress === 'Pending' ? 'text-yellow-400' : o.work_progress === 'On Process' ? 'text-blue-400' : 'text-emerald-400'}`}>{o.work_progress}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {activePage === 'request' && (
           <div className="animate-fadeIn max-w-4xl mx-auto">
              <div className="cyber-card p-10 rounded-[2.5rem] border-cyan-500/20">
                 <h3 className="font-display text-xl font-black text-cyan-400 uppercase italic mb-8">New Maintenance Request</h3>
                 <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect label="Floor" name="floor" options={masterData.floors} required />
                    <FormInput label="Area / Room" name="area" required placeholder="e.g. Room 402, Hallway B" />
                    <FormInput label="Department" name="department" required placeholder="Security, Nursing, etc." />
                    <FormSelect label="Area Type" name="type_area" options={masterData.typeAreas} required />
                    <div className="col-span-2">
                      <FormInput label="Job Detail" name="detail" required placeholder="Describe the problem in detail..." />
                    </div>
                    <FormSelect label="Emergency Code" name="emergency" options={masterData.emergencyCodes.map(c => c.code)} required />
                    <FormSelect label="Priority" name="priority" options={['Normal', 'Urgent', 'Emergency', 'High<5min']} required />
                    <FormInput label="Reporter Name" name="reporter" required />
                    <FormInput label="Phone Number" name="phone" required />
                    <div className="col-span-2 pt-6">
                       <button type="submit" className="w-full py-4 bg-cyan-600 text-black font-black uppercase text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all">Submit Request</button>
                    </div>
                 </form>
              </div>
           </div>
        )}

        {activePage === 'helpdesk' && (
           <div className="animate-fadeIn">
              <MasterTableSection 
                title="Pending Assignments" 
                data={orders.filter(o => o.work_progress === 'Pending')}
                onAdd={() => setActivePage('request')}
                columns={[
                  { key: 'work_request_no', label: 'ID' },
                  { key: 'job_detail', label: 'Detail' },
                  { key: 'main_area', label: 'Area' },
                  { key: 'code_emergency', label: 'Code' }
                ]}
                customAction={(order: WorkOrder) => (
                  <div className="flex gap-2 items-center">
                    <select 
                      onChange={(e) => assignOrder(order.work_request_no, e.target.value)}
                      className="bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 rounded p-1 outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>Assign To...</option>
                      {masterData.staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <button onClick={() => deleteOrder(order.work_request_no)} className="text-red-400 hover:text-white transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                )}
              />
           </div>
        )}

        {activePage === 'technician' && (
           <div className="animate-fadeIn space-y-8">
              <MasterTableSection 
                title="Active Jobs in Field" 
                data={orders.filter(o => o.work_progress === 'On Process')}
                onAdd={() => setActivePage('request')}
                columns={[
                  { key: 'work_request_no', label: 'ID' },
                  { key: 'job_detail', label: 'Detail' },
                  { key: 'technician_name', label: 'Technician' },
                  { key: 'priority_work', label: 'Priority' }
                ]}
                customAction={(order: WorkOrder) => (
                  <button 
                    onClick={() => setClosureModal(order)}
                    className="px-4 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded shadow hover:bg-emerald-400 transition-all"
                  >
                    Manage / Close
                  </button>
                )}
              />

              <MasterTableSection 
                title="Recently Completed Jobs" 
                data={orders.filter(o => o.work_progress === 'Complete')}
                columns={[
                  { key: 'work_request_no', label: 'ID' },
                  { key: 'job_detail', label: 'Detail' },
                  { key: 'closure_type', label: 'Result' },
                  { key: 'customer_satisfy', label: 'Rating' }
                ]}
                customAction={(order: WorkOrder) => (
                  <button onClick={() => setClosureModal(order)} className="text-cyan-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-eye mr-1"></i> View Details
                  </button>
                )}
              />
           </div>
        )}

        {activePage === 'maintainability' && renderMaintainability()}

        {activePage === 'master' && (
          <div className="space-y-12 animate-fadeIn pb-24">
             <div className="cyber-card p-8 rounded-[2rem] border-purple-500/30">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="font-display text-xl font-black text-purple-400 uppercase italic">Target Time Settings</h3>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Configure (t) for Maintainability Modeling</p>
                   </div>
                   <button onClick={() => setEditingModal({ type: 'target', item: {} })} className="px-6 py-2 bg-purple-600 text-white font-black uppercase text-[10px] rounded-lg shadow-lg hover:bg-purple-400 transition-all">
                      <i className="fa-solid fa-plus mr-2"></i> Add Target
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {masterData.targetTimes.map(t => (
                      <div key={t.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 group relative">
                         <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-black text-white/30 uppercase">{t.system}</p>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingModal({ type: 'target', item: t })} className="text-cyan-400"><i className="fa-solid fa-pen text-[10px]"></i></button>
                              <button onClick={() => deleteItem('target', t.id)} className="text-red-400"><i className="fa-solid fa-trash text-[10px]"></i></button>
                            </div>
                         </div>
                         <p className="text-3xl font-display font-black text-white">{t.value}<span className="text-[10px] ml-1 text-cyan-400">Hr</span></p>
                      </div>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <MasterTableSection 
                  title="Staff Management" 
                  data={masterData.staff} 
                  onAdd={() => setEditingModal({ type: 'staff', item: {} })} 
                  onEdit={(s: Staff) => setEditingModal({ type: 'staff', item: s })} 
                  onDelete={(id: string) => deleteItem('staff', id)}
                  onExport={() => exportToExcel(masterData.staff, "Staff_Data")}
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'mttr', label: 'MTTR (Hr)' },
                    { key: 'status', label: 'Status' }
                  ]}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <BasicListSection title="Floors" data={masterData.floors} onAdd={() => setEditingModal({ type: 'floors', item: {} })} />
                  <BasicListSection title="Type Areas" data={masterData.typeAreas} onAdd={() => setEditingModal({ type: 'typeAreas', item: {} })} />
                  <BasicListSection title="Work Groups" data={masterData.workGroups} onAdd={() => setEditingModal({ type: 'workGroups', item: {} })} />
                  <BasicListSection title="System Works" data={masterData.systemWorks} onAdd={() => setEditingModal({ type: 'systemWorks', item: {} })} />
                </div>
             </div>

             <MasterTableSection 
               title="Department Directory" 
               data={masterData.departments} 
               onAdd={() => setEditingModal({ type: 'department', item: {} })} 
               onEdit={(d: any) => setEditingModal({ type: 'department', item: d })} 
               onDelete={(id: string) => deleteItem('department', id)}
               onExport={() => exportToExcel(masterData.departments, "Department_Directory")}
               columns={[
                 { key: 'mainArea', label: 'Main Area' },
                 { key: 'name', label: 'Department' },
                 { key: 'floor', label: 'Floor' },
                 { key: 'internalNo', label: 'Internal No.' }
               ]}
             />
          </div>
        )}

        {/* Closure / Detail Modal */}
        {closureModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
             <div className="cyber-card w-full max-w-5xl p-10 rounded-[3rem] border-cyan-500/30 my-auto shadow-2xl">
                <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                   <div>
                      <h3 className="font-display text-2xl font-black text-cyan-400 uppercase italic">Work Order Completion</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Ref No: {closureModal.work_request_no} | Original: {closureModal.date}</p>
                   </div>
                   <button onClick={() => setClosureModal(null)} className="text-white/40 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
                </div>

                <form onSubmit={handleCloseOrder} className="space-y-10">
                   {/* Part 1: Timeline & Classification */}
                   <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-cyan-400/60 uppercase tracking-widest pl-1">1. Timeline & Effort</h4>
                        <FormInput label="Actual Start" name="start_time" type="datetime-local" defaultValue={closureModal.work_date_actual_start?.slice(0, 16) || new Date().toISOString().slice(0, 16)} required />
                        <FormInput label="Actual Finish" name="finish_time" type="datetime-local" defaultValue={closureModal.work_date_actual_finish?.slice(0, 16) || new Date().toISOString().slice(0, 16)} required />
                        <div className="grid grid-cols-2 gap-3">
                           <FormInput label="Repair Duration (Hr)" name="repair_duration" type="number" step="0.1" placeholder="e.g. 1.5" defaultValue={closureModal.repair_duration_hrs} />
                           <FormInput label="Total Lead Time (Hr)" name="lead_time" type="number" step="0.1" placeholder="e.g. 24" defaultValue={closureModal.lead_time_hrs} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-cyan-400/60 uppercase tracking-widest pl-1">2. Classification</h4>
                        <FormSelect label="Work System" name="work_system" options={['RM', 'PM', 'OM', 'MA']} defaultValue={closureModal.work_system} required />
                        <FormSelect label="Work Type" name="work_type" options={['EE', 'SN', 'ER', 'FA', 'BS', 'OTH']} defaultValue={closureModal.work_type} required />
                        <FormSelect label="Closure Type" name="closure_type" options={['Permanent', 'Temporary', 'Follow-up', 'Waiting for Parts']} defaultValue={closureModal.closure_type} required />
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-cyan-400/60 uppercase tracking-widest pl-1">3. Verification</h4>
                        <FormInput label="Summarized By (Tech)" name="summarizer" defaultValue={closureModal.summarizer_name || closureModal.technician_name} required />
                        <FormInput label="Inspected By (Owner)" name="customer" defaultValue={closureModal.customer_name || closureModal.staff_notification_name} required />
                        <FormInput label="Approved By (Supervisor)" name="approver" defaultValue={closureModal.approver_name} required />
                      </div>
                   </section>

                   {/* Part 2: Technical Details */}
                   <section className="space-y-4">
                      <h4 className="text-[9px] font-black text-cyan-400/60 uppercase tracking-widest pl-1">4. Technical Root Cause & Action</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormTextArea label="Problem Description (ปัญหา)" name="problem" placeholder="Describe what exactly happened..." defaultValue={closureModal.problem_desc} required />
                        <FormTextArea label="Cause Analysis (สาเหตุ)" name="cause" placeholder="Root cause of the failure..." defaultValue={closureModal.cause_desc} required />
                        <FormTextArea label="Corrective Action (การแก้ไข)" name="solution" placeholder="How was it fixed?" defaultValue={closureModal.solution_desc} required />
                        <FormTextArea label="Preventive Measure (การป้องกัน)" name="prevention" placeholder="Actions to prevent recurrence..." defaultValue={closureModal.prevention_desc} />
                      </div>
                   </section>

                   {/* Part 3: Satisfaction */}
                   <section className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div>
                            <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-widest pl-1">5. Customer Satisfaction Survey</h4>
                            <p className="text-[10px] text-white/30 italic mt-1">Rate the service quality (1-5)</p>
                         </div>
                         <div className="flex gap-4">
                            {[1, 2, 3, 4, 5].map(num => (
                              <label key={num} className="cursor-pointer group">
                                <input type="radio" name="satisfaction" value={num} className="hidden peer" defaultChecked={closureModal.customer_satisfy === num || (num === 5 && !closureModal.customer_satisfy)} />
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-white/5 text-white/40 peer-checked:bg-cyan-500 peer-checked:text-black peer-checked:border-cyan-400 transition-all font-display font-black text-xl hover:border-cyan-400/40">
                                   {num}
                                </div>
                              </label>
                            ))}
                         </div>
                      </div>
                      <FormTextArea label="Feedback / Improvement Notes (ข้อมูลที่ควรปรับปรุง)" name="feedback" placeholder="Additional comments from customer..." defaultValue={closureModal.satisfy_feedback} rows={2} />
                   </section>

                   <div className="flex gap-4 pt-6 border-t border-white/10">
                      <button type="submit" className="flex-1 py-5 bg-emerald-600 text-white font-black uppercase text-sm rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all transform hover:scale-[1.01] active:scale-[0.99]">
                         <i className="fa-solid fa-cloud-arrow-up mr-2"></i> Record & Close Order
                      </button>
                      <button type="button" onClick={() => setClosureModal(null)} className="px-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                         Cancel
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {/* Generic Master Data Modal */}
        {editingModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
             <div className="cyber-card w-full max-w-2xl p-8 rounded-[2rem] border-cyan-500/30">
                <h3 className="font-display text-xl font-black text-cyan-400 uppercase italic mb-8">Manage {editingModal.type}</h3>
                <form onSubmit={handleSaveItem} className="grid grid-cols-2 gap-6">
                   {editingModal.type === 'target' && (
                     <>
                        <FormInput label="System Name" name="system" defaultValue={editingModal.item.system} required />
                        <FormInput label="Target Time (Hr)" name="value" type="number" step="0.1" defaultValue={editingModal.item.value} required />
                     </>
                   )}
                   {editingModal.type === 'staff' && (
                     <>
                        <FormInput label="Full Name" name="name" defaultValue={editingModal.item.name} required />
                        <FormInput label="MTTR Target" name="mttr" type="number" step="0.1" defaultValue={editingModal.item.mttr} required />
                     </>
                   )}
                   {['floors', 'typeAreas', 'workGroups', 'systemWorks', 'separateDetails'].includes(editingModal.type) && (
                      <FormInput label="Value" name="value" className="col-span-2" required />
                   )}
                   <div className="col-span-2 flex gap-4 pt-6">
                      <button type="submit" className="flex-1 py-4 bg-cyan-600 text-black font-black uppercase text-xs rounded-xl shadow-lg">Save Data</button>
                      <button type="button" onClick={() => setEditingModal(null)} className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase">Cancel</button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes critical-blink { 0%, 100% { border-color: rgba(239, 68, 68, 0.4); } 50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); } }
        .animate-critical-blink { animation: critical-blink 1.5s infinite ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-text-flash { animation: text-flash 1s infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes text-flash { 0%, 100% { color: #ef4444; } 50% { color: #ffffff; } }
      `}} />
    </div>
  );
};

// ---------------------------------------------------------
// REUSABLE UI COMPONENTS
// ---------------------------------------------------------

const MasterTableSection = ({ title, data, onAdd, onEdit, onDelete, onExport, columns, customAction }: any) => (
  <div className="cyber-card p-8 rounded-[2rem] border-white/5 space-y-6">
     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h4 className="font-display text-lg font-black text-cyan-400 uppercase italic tracking-tighter">{title}</h4>
        </div>
        <div className="flex gap-2">
           {onExport && <button onClick={onExport} className="px-4 py-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase rounded-lg">Export</button>}
           {onAdd && <button onClick={onAdd} className="px-4 py-2 bg-cyan-600 text-black text-[9px] font-black uppercase rounded-lg">Add Item</button>}
        </div>
     </div>
     <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
        <table className="w-full text-left border-collapse">
           <thead>
              <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 border-b border-white/10">
                 {columns.map((col: any) => <th key={col.key} className="px-5 py-4">{col.label}</th>)}
                 <th className="px-5 py-4 text-right">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
              {data.map((row: any) => (
                 <tr key={row.id || row.work_request_no} className="hover:bg-white/5 transition-colors group">
                    {columns.map((col: any) => <td key={col.key} className="px-5 py-3 text-[11px] text-white/70">{row[col.key]}</td>)}
                    <td className="px-5 py-3 text-right">
                       {customAction ? customAction(row) : (
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEdit && <button onClick={() => onEdit(row)} className="text-cyan-400"><i className="fa-solid fa-pen"></i></button>}
                            {onDelete && <button onClick={() => onDelete(row.id)} className="text-red-400"><i className="fa-solid fa-trash"></i></button>}
                         </div>
                       )}
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
     </div>
  </div>
);

const BasicListSection = ({ title, data, onAdd }: any) => (
  <div className="cyber-card p-6 rounded-2xl border-white/5">
     <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <h5 className="text-[10px] font-black uppercase text-white/40 tracking-widest">{title}</h5>
        <button onClick={onAdd} className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center hover:bg-cyan-500 transition-all"><i className="fa-solid fa-plus text-[10px]"></i></button>
     </div>
     <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar">
        {data.map((it: string, idx: number) => <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] text-white/60 font-bold">{it}</span>)}
     </div>
  </div>
);

const FormInput = ({ label, className = "", ...props }: any) => (
  <div className={className}>
    <label className="block text-[10px] uppercase font-black text-white/30 mb-2 tracking-widest pl-1">{label}</label>
    <input className="w-full cyber-input p-4 rounded-xl text-xs" {...props} />
  </div>
);

const FormTextArea = ({ label, className = "", rows = 4, ...props }: any) => (
  <div className={className}>
    <label className="block text-[10px] uppercase font-black text-white/30 mb-2 tracking-widest pl-1">{label}</label>
    <textarea rows={rows} className="w-full cyber-input p-4 rounded-xl text-xs resize-none" {...props}></textarea>
  </div>
);

const FormSelect = ({ label, options, className = "", ...props }: any) => (
  <div className={className}>
    <label className="block text-[10px] uppercase font-black text-white/30 mb-2 tracking-widest pl-1">{label}</label>
    <select className="w-full cyber-input p-4 rounded-xl text-xs appearance-none" {...props}>
      <option value="">Select Option</option>
      {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const SideItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${active ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-400/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,245,255,0.4)]' : 'bg-white/5'}`}><i className={`fa-solid ${icon} text-sm`}></i></div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default WorkOrderManager;
