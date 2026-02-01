
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AdminManagerProps {
  onBack: () => void;
}

const AdminManager: React.FC<AdminManagerProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'security'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Gateway Settings States
  const [gatewayUser, setGatewayUser] = useState('fmsdatamonitor');
  const [gatewayPass, setGatewayPass] = useState('fms2026');
  const [lastGatewayUpdate, setLastGatewayUpdate] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    const usersStr = localStorage.getItem('imatoms_users');
    if (usersStr) {
      setUsers(JSON.parse(usersStr));
    }

    const configStr = localStorage.getItem('imatoms_gateway_config');
    if (configStr) {
      const config = JSON.parse(configStr);
      setGatewayUser(config.user);
      setGatewayPass(config.pass);
      setLastGatewayUpdate(config.updatedAt);
    }
  }, []);

  const updateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('imatoms_users', JSON.stringify(newUsers));
  };

  const handleStatusChange = (userId: string, status: User['status']) => {
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    updateUsers(updated);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updated = users.filter(u => u.id !== userId);
      updateUsers(updated);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated = users.map(u => u.id === editingUser.id ? editingUser : u);
    updateUsers(updated);
    setEditingUser(null);
  };

  const saveGatewaySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      user: gatewayUser,
      pass: gatewayPass,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('imatoms_gateway_config', JSON.stringify(config));
    setLastGatewayUpdate(config.updatedAt);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const filteredUsers = filter === 'security' 
    ? [] 
    : (filter === 'all' ? users : users.filter(u => u.status === filter));

  return (
    <div className="flex h-full overflow-hidden bg-[#0a0e27]">
      {/* Sidebar */}
      <nav className="w-64 border-r border-cyan-500/20 bg-black/40 flex flex-col p-4 shrink-0">
        <div className="mb-10 px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xl text-cyan-400 border border-cyan-400/40">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <h1 className="font-display text-xl font-bold text-cyan-400 uppercase">Admin Setup</h1>
          </div>
          <p className="text-[10px] text-white/40 tracking-widest uppercase">Verify & Control Suite</p>
        </div>

        <div className="flex-1 space-y-1">
          <SideItem icon="fa-users" label="All Users" active={filter === 'all'} onClick={() => setFilter('all')} />
          <SideItem icon="fa-user-clock" label="Pending" active={filter === 'pending'} onClick={() => setFilter('pending')} />
          <SideItem icon="fa-user-check" label="Approved" active={filter === 'approved'} onClick={() => setFilter('approved')} />
          
          <div className="h-px bg-white/5 my-4 mx-2"></div>
          <SideItem icon="fa-shield-halved" label="Security Gateway" active={filter === 'security'} onClick={() => setFilter('security')} />
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <button onClick={onBack} className="flex items-center gap-3 p-3 w-full text-white/40 hover:text-white transition-all group">
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Main</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8 lg:p-12 no-scrollbar">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-white">
              {filter === 'security' ? 'Security Configuration' : 'User Management'}
            </h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
              {filter === 'security' ? 'Master Access Key Control' : 'Approval & Access Control'}
            </p>
          </div>
          {filter !== 'security' && (
            <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-xs flex gap-4">
              <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Total: {users.length}</div>
              <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span> Pending: {users.filter(u => u.status === 'pending').length}</div>
            </div>
          )}
        </header>

        {filter === 'security' ? (
          <div className="max-w-2xl animate-fadeIn">
            <div className="cyber-card p-10 rounded-[3rem] border-amber-500/20 bg-amber-500/5 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-10"><i className="fa-solid fa-key text-8xl text-amber-500"></i></div>
               
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 text-2xl">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white uppercase italic">Gateway Security Key</h3>
                    <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest mt-1">First-Level Organization Access</p>
                  </div>
               </div>

               <form onSubmit={saveGatewaySettings} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                       <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/40">Central Gateway Username</label>
                       <input 
                         type="text" 
                         className="cyber-input w-full p-5 rounded-2xl text-sm font-mono tracking-widest" 
                         value={gatewayUser}
                         onChange={(e) => setGatewayUser(e.target.value)}
                         required
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/40">Central Gateway Password</label>
                       <input 
                         type="text" 
                         className="cyber-input w-full p-5 rounded-2xl text-sm font-mono tracking-widest" 
                         value={gatewayPass}
                         onChange={(e) => setGatewayPass(e.target.value)}
                         required
                       />
                       <p className="text-[10px] text-amber-500/40 italic mt-2">Recommended: Update every 3 months to prevent unauthorized access.</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/30">Last Updated Time:</span>
                        <span className="text-cyan-400">{lastGatewayUpdate ? new Date(lastGatewayUpdate).toLocaleString() : 'Never Updated'}</span>
                     </div>
                     <button type="submit" className="w-full py-5 bg-amber-600 text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all transform active:scale-95">
                       Update System Master Key
                     </button>
                     {saveStatus && (
                       <p className="text-center text-emerald-400 text-[10px] font-bold uppercase animate-pulse">Master Access Key Updated Successfully!</p>
                     )}
                  </div>
               </form>
            </div>
          </div>
        ) : (
          <div className="cyber-card rounded-2xl overflow-hidden border-white/5 shadow-2xl animate-fadeIn">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 border-b border-white/10">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Building</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center opacity-30 italic">No users found for this filter.</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold bg-gradient-to-br ${u.role === 'admin' ? 'from-purple-500 to-pink-500' : 'from-cyan-500 to-blue-500'}`}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{u.username}</p>
                            <p className="text-[10px] text-white/40">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-white/60">{u.building}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                          u.status === 'approved' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                          u.status === 'rejected' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                          'border-yellow-500/30 text-yellow-400 bg-yellow-500/10 animate-pulse'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-white/40 font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'System'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {u.username !== 'admin' && (
                            <>
                              {u.status !== 'approved' && (
                                <button 
                                  onClick={() => handleStatusChange(u.id, 'approved')}
                                  className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                                  title="Approve"
                                >
                                  <i className="fa-solid fa-check text-xs"></i>
                                </button>
                              )}
                              {u.status !== 'rejected' && (
                                <button 
                                  onClick={() => handleStatusChange(u.id, 'rejected')}
                                  className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 transition-all"
                                  title="Reject"
                                >
                                  <i className="fa-solid fa-times text-xs"></i>
                                </button>
                              )}
                              <button 
                                onClick={() => handleEdit(u)}
                                className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
                                title="Edit"
                              >
                                <i className="fa-solid fa-pen text-xs"></i>
                              </button>
                              <button 
                                onClick={() => handleDelete(u.id)}
                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all"
                                title="Delete"
                              >
                                <i className="fa-solid fa-trash text-xs"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-card p-8 rounded-2xl w-full max-w-lg border-cyan-500/40">
            <h3 className="font-display text-lg text-cyan-400 mb-6 uppercase tracking-widest">Edit User</h3>
            <form onSubmit={saveEdit} className="space-y-4">
               <div>
                 <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/40">Username</label>
                 <input 
                  type="text" 
                  className="cyber-input w-full p-4 rounded-xl text-sm" 
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  required 
                 />
               </div>
               <div>
                 <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/40">Email</label>
                 <input 
                  type="email" 
                  className="cyber-input w-full p-4 rounded-xl text-sm" 
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  required 
                 />
               </div>
               <div>
                 <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/40">Building Response</label>
                 <select 
                  className="cyber-input w-full p-4 rounded-xl text-sm"
                  value={editingUser.building}
                  onChange={(e) => setEditingUser({...editingUser, building: e.target.value})}
                 >
                   <option value="ViMUT">ViMUT Hospital</option>
                   <option value="VTH">ViMUT-Theptarin (VTH)</option>
                   <option value="Phahonyothin">ViMUT Phahonyothin</option>
                   <option value="all">All Buildings (Admin)</option>
                 </select>
               </div>
               <div className="flex gap-4 pt-4">
                 <button type="submit" className="flex-1 py-3 bg-cyan-600 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-cyan-400 transition-all">Save Changes</button>
                 <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-3 bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10">Cancel</button>
               </div>
            </form>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

const SideItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,245,255,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
  >
    <i className={`fa-solid ${icon} w-5 text-center text-sm`}></i>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default AdminManager;
