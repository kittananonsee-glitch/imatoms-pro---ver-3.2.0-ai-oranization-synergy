
import React, { useState, useEffect, useRef } from 'react';
import { Asset, AnnualRecord } from '../types';

interface AssetManagerProps {
  onBack: () => void;
}

const AssetManager: React.FC<AssetManagerProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  // Updated initial state to remove 'as any' since Asset interface is now fixed
  const [assets, setAssets] = useState<Asset[]>([
    { asset_class: '706', company_code: 'TH50', asset_no: '7060000003', sub_number: '0', capitalized_on: '2025-04-05', asset_description: 'เช่ารถ 2ขบ2088_สัญญาเช่าเลขที่ TCM2200007', useful_life: 1, cost_center: '50990101', cost_center_name: 'VM-Management office', code_ref: 'TH50|7060000003|0000||50990101||706||', status: 'active', asset_value: 0 },
    { asset_class: 'AUC', company_code: 'TH50', asset_no: '9010000001', sub_number: '0', capitalized_on: '2022-12-31', asset_description: 'โครงการวิมุต 2 - ปิ่นเกล้า', useful_life: 0, cost_center: '50990101', cost_center_name: 'VM-Management office', code_ref: 'TH50|9010000001|0000||50990101||AUC||', status: 'active', asset_value: 50000000 },
    { asset_class: '502', company_code: 'TH51', asset_no: '5020000823', sub_number: '0', capitalized_on: '2021-06-15', asset_description: 'Chiller System Unit A', useful_life: 15, cost_center: '51102009', cost_center_name: 'ฝ่ายวิศวกรรมอาคาร', code_ref: 'TH51|5020000823|0000||51102009||502||', status: 'active', asset_value: 8500000 },
  ]);
  const [records, setRecords] = useState<AnnualRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const chartRef1 = useRef<HTMLCanvasElement>(null);
  const chartRef2 = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize Charts
  useEffect(() => {
    if (activeTab === 'dashboard' && chartRef1.current && chartRef2.current) {
      const ctx1 = chartRef1.current.getContext('2d');
      const ctx2 = chartRef2.current.getContext('2d');
      if (ctx1 && ctx2) {
        // @ts-ignore
        new Chart(ctx1, {
          type: 'doughnut',
          data: {
            labels: ['Class 502', 'Class 501', 'Class 706', 'AUC'],
            datasets: [{
              data: [12, 19, 3, 5],
              backgroundColor: ['#00f5ff', '#a855f7', '#10b981', '#f59e0b'],
              borderWidth: 0
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'white' } } } }
        });
        // @ts-ignore
        new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: ['TH50', 'TH51'],
            datasets: [{
              label: 'Assets Count',
              data: [15, 25],
              backgroundColor: 'rgba(0, 245, 255, 0.5)',
              borderColor: '#00f5ff',
              borderWidth: 1
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }
        });
      }
    }
  }, [activeTab]);

  const generateQRCode = (text: string) => {
    if (qrRef.current) {
      // @ts-ignore
      QRCode.toCanvas(qrRef.current, text, { width: 200, margin: 2 });
    }
  };

  const exportToExcel = () => {
    // @ts-ignore
    const ws = XLSX.utils.json_to_sheet(assets);
    // @ts-ignore
    const wb = XLSX.utils.book_new();
    // @ts-ignore
    XLSX.utils.book_append_sheet(wb, ws, "Assets");
    // @ts-ignore
    XLSX.writeFile(wb, "Asset_Database.xlsx");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard icon="fa-cubes" label="Total Assets" value={assets.length.toString()} color="cyan" />
              <StatCard icon="fa-coins" label="Total Value" value="฿133.5M" color="green" />
              <StatCard icon="fa-building" label="Buildings" value="2" color="purple" />
              <StatCard icon="fa-clipboard-check" label="Audits Done" value="12" color="orange" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="cyber-card p-6 rounded-2xl h-80">
                <h3 className="font-display text-sm uppercase mb-4 text-cyan-400">Assets by Class</h3>
                <canvas ref={chartRef1}></canvas>
              </div>
              <div className="cyber-card p-6 rounded-2xl h-80">
                <h3 className="font-display text-sm uppercase mb-4 text-cyan-400">Assets by Building</h3>
                <canvas ref={chartRef2}></canvas>
              </div>
            </div>
          </div>
        );
      case 'database':
        return (
          <div className="cyber-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/40"></i>
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  className="w-full pl-12 pr-4 py-2 cyber-input rounded-xl text-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={exportToExcel} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500/30 transition-all">
                <i className="fa-solid fa-file-excel"></i> Export Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 border-b border-white/10">
                    <th className="px-6 py-4">Asset No.</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Building</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assets.filter(a => a.asset_description.toLowerCase().includes(searchQuery.toLowerCase()) || a.asset_no.includes(searchQuery)).map((asset, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-cyan-400 text-sm">{asset.asset_no}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-white/80">{asset.asset_description}</td>
                      <td className="px-6 py-4 text-xs"><span className="bg-white/10 px-2 py-1 rounded text-white/60">{asset.asset_class}</span></td>
                      <td className="px-6 py-4 text-sm">{asset.company_code}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400">฿{asset.asset_value.toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-tighter border border-cyan-500/30">{asset.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'qrcode':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="cyber-card p-8 rounded-2xl space-y-4">
              <h3 className="font-display text-lg text-cyan-400 mb-4">Generate Asset QR</h3>
              <div>
                <label className="block text-xs text-white/40 uppercase mb-2 font-bold">Select Asset</label>
                <select 
                  className="w-full cyber-input rounded-xl p-3 text-sm"
                  onChange={(e) => generateQRCode(e.target.value)}
                >
                  <option value="">-- Select Asset --</option>
                  {assets.map(a => <option key={a.asset_no} value={a.code_ref}>{a.asset_no} - {a.asset_description}</option>)}
                </select>
              </div>
              <div className="pt-4 text-xs text-white/40 italic">
                Scanning the QR will link directly to the maintenance history and record submission page for this asset.
              </div>
            </div>
            <div className="cyber-card p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="bg-white p-4 rounded-xl mb-4">
                <canvas ref={qrRef}></canvas>
              </div>
              <p className="text-xs text-white/60 font-mono mb-4 truncate w-full px-4">PREVIEW MODE</p>
              <button className="cyber-btn w-full justify-center">Download PNG</button>
            </div>
          </div>
        );
      case 'record':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="cyber-card p-6 rounded-2xl">
                <h3 className="font-display text-sm text-cyan-400 uppercase mb-4">Annual Inspection Record</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Building</label>
                    <select className="w-full cyber-input rounded-xl p-2 text-sm">
                      <option>TH50 - ViMUT</option>
                      <option>TH51 - ViMUT Phahonyothin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Floor</label>
                    <input type="text" className="w-full cyber-input rounded-xl p-2 text-sm" placeholder="e.g. 4, G, 10" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-white/40 mb-1">Room / Area Detail</label>
                    <input type="text" className="w-full cyber-input rounded-xl p-2 text-sm" placeholder="e.g. Server Room A" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Inspected By</label>
                    <input type="text" className="w-full cyber-input rounded-xl p-2 text-sm" placeholder="Name" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Tel No.</label>
                    <input type="text" className="w-full cyber-input rounded-xl p-2 text-sm" placeholder="0XX-XXX-XXXX" />
                  </div>
                </form>
              </div>
            </div>
            <div className="cyber-card p-6 rounded-2xl space-y-4">
              <h3 className="font-display text-sm text-cyan-400 uppercase">Signature</h3>
              <canvas ref={sigCanvasRef} className="w-full h-40 bg-white rounded-xl"></canvas>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-white/10 rounded-xl text-xs font-bold uppercase hover:bg-white/20 transition-all">Clear</button>
                <button className="flex-1 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20">Submit</button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Section Pending...</div>;
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#0a0e17] text-white">
      {/* Sub-Sidebar */}
      <nav className="w-64 border-r border-white/10 bg-black/40 flex flex-col p-4 shrink-0">
        <div className="mb-10 px-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 border border-emerald-400/40">🛌</div>
          <h1 className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400 uppercase">iMATOMs Pro</h1>
          </div>
          <p className="text-[10px] text-white/60 tracking-widest uppercase">Asset Management</p>
        </div>

        <div className="flex-1 space-y-2">
          <SubNavItem icon="fa-chart-pie" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SubNavItem icon="fa-database" label="Database" active={activeTab === 'database'} onClick={() => setActiveTab('database')} />
          <SubNavItem icon="fa-clipboard-check" label="Annual Record" active={activeTab === 'record'} onClick={() => setActiveTab('record')} />
          <SubNavItem icon="fa-qrcode" label="QR Generator" active={activeTab === 'qrcode'} onClick={() => setActiveTab('qrcode')} />
          
          <div className="pt-4 border-t border-white/5 mt-4">
            <button onClick={onBack} className="flex items-center gap-3 p-3 w-full text-white/60 hover:text-white hover:bg-red-500/10 rounded-xl transition-all">
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              <span className="text-xs font-bold uppercase tracking-widest">Back to Main</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-[#0a0e17] to-[#0f172a]">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">
            <i className="fa-solid fa-cube"></i>
            <span>Reliability Module / {activeTab}</span>
          </div>
          <h2 className="font-display text-4xl font-black uppercase tracking-tighter">
            {activeTab.replace('-', ' ')}
          </h2>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

const SubNavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(0,245,255,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
  >
    <i className={`fa-solid ${icon} w-5 text-center`}></i>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    {active && <div className="ml-auto w-1 h-3 bg-cyan-400 rounded-full"></div>}
  </div>
);

const StatCard: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const colorMap: any = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
  };
  return (
    <div className={`cyber-card p-6 rounded-2xl border transition-all hover:scale-[1.02] ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <i className={`fa-solid ${icon} text-lg opacity-80`}></i>
        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Real-time</span>
      </div>
      <p className="text-2xl font-display font-black mb-1">{value}</p>
      <p className="text-[10px] uppercase font-bold text-white/40">{label}</p>
    </div>
  );
};

export default AssetManager;