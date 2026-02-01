
import React, { useState, useEffect, useRef } from 'react';
import { User, InventoryItem, InventoryTransaction } from '../types';

interface InventoryManagerProps {
  onBack: () => void;
  user: User;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ onBack, user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'transactions'>('overview');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState<InventoryItem | null>(null);
  
  const chartRef = useRef<HTMLCanvasElement>(null);

  // Load data
  useEffect(() => {
    const savedItems = localStorage.getItem('imatoms_inventory_items');
    const savedTransactions = localStorage.getItem('imatoms_inventory_transactions');
    
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      // Default items
      const defaultItems: InventoryItem[] = [
        { id: '1', sku: 'SPA-001', name: 'Chiller Filter A2', category: 'Mechanical', quantity: 15, min_level: 5, unit: 'pcs', location: 'Store-A1', unit_price: 1200 },
        { id: '2', sku: 'SPA-002', name: 'LED Panel 60x60', category: 'Electrical', quantity: 45, min_level: 20, unit: 'pcs', location: 'Store-B2', unit_price: 850 },
        { id: '3', sku: 'SPA-003', name: 'Copper Pipe 1/2"', category: 'Plumbing', quantity: 2, min_level: 10, unit: 'meters', location: 'Store-C1', unit_price: 350 },
        { id: '4', sku: 'MED-001', name: 'N95 Mask Box', category: 'Medical', quantity: 120, min_level: 50, unit: 'box', location: 'Med-Store', unit_price: 450 },
      ];
      setItems(defaultItems);
      localStorage.setItem('imatoms_inventory_items', JSON.stringify(defaultItems));
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Sync with localStorage
  useEffect(() => {
    if (items.length > 0) localStorage.setItem('imatoms_inventory_items', JSON.stringify(items));
    if (transactions.length > 0) localStorage.setItem('imatoms_inventory_transactions', JSON.stringify(transactions));
  }, [items, transactions]);

  // Chart Rendering
  useEffect(() => {
    if (activeTab === 'overview' && chartRef.current && items.length > 0) {
      const categories = ['Mechanical', 'Electrical', 'Plumbing', 'Medical', 'IT', 'General'];
      const data = categories.map(cat => items.filter(i => i.category === cat).length);
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // @ts-ignore
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: categories,
            datasets: [{
              label: 'Items by Category',
              data: data,
              backgroundColor: 'rgba(0, 245, 255, 0.4)',
              borderColor: '#00f5ff',
              borderWidth: 1,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              x: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { display: false } }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }
  }, [activeTab, items]);

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUpdatingStock) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const type = formData.get('type') as 'IN' | 'OUT';
    const qty = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as string;

    const newItems = items.map(item => {
      if (item.id === isUpdatingStock.id) {
        const finalQty = type === 'IN' ? item.quantity + qty : item.quantity - qty;
        return { ...item, quantity: Math.max(0, finalQty) };
      }
      return item;
    });

    const newTransaction: InventoryTransaction = {
      id: `trx-${Date.now()}`,
      item_id: isUpdatingStock.id,
      item_name: isUpdatingStock.name,
      type,
      quantity: qty,
      user: user.username,
      date: new Date().toISOString(),
      reference: reason
    };

    setItems(newItems);
    setTransactions([newTransaction, ...transactions]);
    setIsUpdatingStock(null);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as any,
      quantity: parseInt(formData.get('quantity') as string),
      min_level: parseInt(formData.get('min_level') as string),
      unit: formData.get('unit') as string,
      location: formData.get('location') as string,
      unit_price: parseFloat(formData.get('price') as string),
    };

    setItems([...items, newItem]);
    setIsAddingItem(false);
  };

  const lowStockCount = items.filter(i => i.quantity <= i.min_level).length;
  const totalValue = items.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0);

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full overflow-hidden bg-[#0a0e27]">
      {/* Sidebar */}
      <nav className="w-64 border-r border-emerald-500/20 bg-black/40 flex flex-col p-4 shrink-0">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 border border-emerald-400/40">
               <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <h1 className="font-display text-xl font-bold text-emerald-400 uppercase">Inventory</h1>
          </div>
          <p className="text-[10px] text-white/40 tracking-widest uppercase">Reliability Suite</p>
        </div>

        <div className="flex-1 space-y-1">
          <SideItem icon="fa-chart-simple" label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SideItem icon="fa-list-check" label="Stock List" active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} />
          <SideItem icon="fa-history" label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <button onClick={onBack} className="flex items-center gap-3 p-3 w-full text-white/40 hover:text-white transition-all group">
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Main</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 lg:p-12 no-scrollbar">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-white">
              Inventory Management
            </h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Spare Parts & Supplies</p>
          </div>
          <button 
            onClick={() => setIsAddingItem(true)}
            className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
          >
            <i className="fa-solid fa-plus mr-2"></i> Add New Item
          </button>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Total Items" value={items.length.toString()} color="cyan" />
              <StatCard label="Low Stock Alert" value={lowStockCount.toString()} color={lowStockCount > 0 ? 'red' : 'green'} pulse={lowStockCount > 0} />
              <StatCard label="Total Value" value={`฿${(totalValue / 1000).toFixed(1)}K`} color="purple" />
              <StatCard label="Monthly Activity" value={transactions.length.toString()} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="cyber-card p-8 rounded-2xl h-80">
                <h3 className="font-display text-sm text-cyan-400 uppercase mb-6 tracking-widest">Category Distribution</h3>
                <canvas ref={chartRef}></canvas>
              </div>
              <div className="cyber-card p-8 rounded-2xl h-80 overflow-y-auto custom-scroll">
                <h3 className="font-display text-sm text-red-400 uppercase mb-6 tracking-widest">Critical Stock Level</h3>
                <div className="space-y-3">
                  {items.filter(i => i.quantity <= i.min_level).length === 0 ? (
                    <p className="text-center text-white/20 italic py-10">No low stock items detected.</p>
                  ) : (
                    items.filter(i => i.quantity <= i.min_level).map(i => (
                      <div key={i.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div>
                          <p className="text-sm font-bold text-white">{i.name}</p>
                          <p className="text-[10px] text-white/40">{i.sku} | Location: {i.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-red-400">{i.quantity} / {i.min_level} {i.unit}</p>
                          <p className="text-[8px] uppercase text-white/30 font-bold">Needs Restock</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="cyber-card rounded-2xl overflow-hidden border-white/5 shadow-2xl">
              <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/20"></i>
                  <input 
                    type="text" 
                    placeholder="Search by name or SKU..." 
                    className="w-full pl-12 pr-4 py-3 cyber-input rounded-xl text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 border-b border-white/10">
                      <th className="px-6 py-4">Item SKU</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Unit Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 font-mono text-cyan-400 text-xs">{item.sku}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-white/40">{item.location}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-white/60">{item.category}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className={`text-sm font-black ${item.quantity <= item.min_level ? 'text-red-400' : 'text-emerald-400'}`}>
                               {item.quantity} {item.unit}
                             </span>
                             <span className="text-[8px] text-white/20 uppercase">Min: {item.min_level}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-white/60">฿{item.unit_price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setIsUpdatingStock(item)}
                            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                          >
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-fadeIn">
             <div className="cyber-card rounded-2xl overflow-hidden border-white/5">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 border-b border-white/10">
                      <th className="px-6 py-4">Date / Time</th>
                      <th className="px-6 py-4">Item Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Operator</th>
                      <th className="px-6 py-4">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center opacity-20 italic">No transactions found.</td>
                      </tr>
                    ) : (
                      transactions.map(trx => (
                        <tr key={trx.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-xs text-white/40 font-mono">
                            {new Date(trx.date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-white">{trx.item_name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${trx.type === 'IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {trx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-black text-sm">{trx.quantity}</td>
                          <td className="px-6 py-4 text-xs font-bold text-white/60">{trx.user}</td>
                          <td className="px-6 py-4 text-[10px] text-white/30 italic">{trx.reference || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
             </div>
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-card p-8 rounded-2xl w-full max-w-lg border-emerald-500/40">
             <h3 className="font-display text-xl text-emerald-400 mb-6 uppercase tracking-widest">Add To Inventory</h3>
             <form onSubmit={handleAddNewItem} className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                   <FormInput label="SKU / Code" name="sku" required placeholder="SPA-101" />
                </div>
                <div className="col-span-1">
                   <FormSelect label="Category" name="category" options={['Mechanical', 'Electrical', 'Plumbing', 'Medical', 'IT', 'General']} />
                </div>
                <div className="col-span-2">
                   <FormInput label="Item Name" name="name" required placeholder="Description of the item" />
                </div>
                <div className="col-span-1">
                   <FormInput label="Current Stock" name="quantity" type="number" required defaultValue="0" />
                </div>
                <div className="col-span-1">
                   <FormInput label="Alert Level (Min)" name="min_level" type="number" required defaultValue="5" />
                </div>
                <div className="col-span-1">
                   <FormInput label="Unit" name="unit" required placeholder="pcs, meters, box" />
                </div>
                <div className="col-span-1">
                   <FormInput label="Location" name="location" required placeholder="Storage Area" />
                </div>
                <div className="col-span-2">
                   <FormInput label="Unit Price (฿)" name="price" type="number" step="0.01" required placeholder="0.00" />
                </div>
                <div className="col-span-2 flex gap-4 pt-4">
                   <button type="submit" className="flex-1 py-4 bg-emerald-600 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400">Add Item</button>
                   <button type="button" onClick={() => setIsAddingItem(false)} className="px-8 py-4 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {isUpdatingStock && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="cyber-card p-8 rounded-2xl w-full max-w-md border-emerald-500/40">
              <h3 className="font-display text-lg text-emerald-400 mb-4 uppercase tracking-widest">Update Stock</h3>
              <div className="mb-6 p-4 bg-white/5 rounded-xl">
                 <p className="text-[10px] text-white/40 uppercase font-black">Item Details</p>
                 <p className="text-sm font-bold text-white">{isUpdatingStock.name}</p>
                 <p className="text-[10px] font-mono text-cyan-400">{isUpdatingStock.sku}</p>
                 <p className="text-2xl font-black text-emerald-400 mt-2">{isUpdatingStock.quantity} {isUpdatingStock.unit}</p>
              </div>
              <form onSubmit={handleUpdateStock} className="space-y-4">
                 <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/40">Action Type</label>
                    <div className="grid grid-cols-2 gap-2">
                       <label className="cursor-pointer">
                          <input type="radio" name="type" value="IN" defaultChecked className="hidden peer" />
                          <div className="p-3 text-center rounded-xl bg-white/5 border border-white/10 peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 text-[10px] font-black uppercase tracking-widest text-white/40 peer-checked:text-emerald-400">Stock In (+)</div>
                       </label>
                       <label className="cursor-pointer">
                          <input type="radio" name="type" value="OUT" className="hidden peer" />
                          <div className="p-3 text-center rounded-xl bg-white/5 border border-white/10 peer-checked:bg-red-500/20 peer-checked:border-red-500 text-[10px] font-black uppercase tracking-widest text-white/40 peer-checked:text-red-400">Stock Out (-)</div>
                       </label>
                    </div>
                 </div>
                 <FormInput label="Quantity" name="quantity" type="number" required min="1" />
                 <FormInput label="Reference / Reason" name="reason" placeholder="PO Number or Work Order ID" />
                 <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 py-4 bg-emerald-600 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400">Update Ledger</button>
                    <button type="button" onClick={() => setIsUpdatingStock(null)} className="px-6 py-4 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0, 245, 255, 0.2); border-radius: 2px; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

const SideItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
  >
    <i className={`fa-solid ${icon} w-5 text-center text-sm`}></i>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

const StatCard: React.FC<{ label: string, value: string, color: string, pulse?: boolean }> = ({ label, value, color, pulse }) => {
  const colors: any = {
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    green: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    red: 'text-red-400 border-red-500/20 bg-red-500/5',
    purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5'
  };
  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} ${pulse ? 'animate-pulse' : ''}`}>
       <p className="text-2xl font-display font-black text-white mb-1">{value}</p>
       <p className="text-[10px] uppercase font-black tracking-widest opacity-40">{label}</p>
    </div>
  );
};

const FormInput: React.FC<any> = ({ label, ...props }) => (
  <div>
    <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/40">{label}</label>
    <input className="w-full cyber-input rounded-xl p-4 text-sm" {...props} />
  </div>
);

const FormSelect: React.FC<any> = ({ label, options, ...props }) => (
  <div>
    <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/40">{label}</label>
    <select className="w-full cyber-input rounded-xl p-4 text-sm appearance-none" {...props}>
      <option value="">-- Select --</option>
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default InventoryManager;
