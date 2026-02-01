
import React, { useState, useEffect, useCallback } from 'react';
import { User, Language } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

type LoginStep = 'gateway' | 'identity' | 'register';

const Login: React.FC<LoginProps> = ({ onLogin, lang, setLang }) => {
  const [step, setStep] = useState<LoginStep>('gateway');
  const [showQR, setShowQR] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [isQrLoading, setIsQrLoading] = useState(false);
  
  // Custom URL to override blob: references
  const [manualUrl, setManualUrl] = useState('');
  
  // Step 1: Gateway Credentials
  const [gatewayUser, setGatewayUser] = useState('');
  const [gatewayPass, setGatewayPass] = useState('');
  
  // Step 2: Individual Identity
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regBuilding, setRegBuilding] = useState('ViMUT');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const APP_VERSION = "3.2.0";

  // Initial URL detection
  useEffect(() => {
    let currentUrl = window.location.href;
    // Strip blob prefix if accidentally used as a base
    if (currentUrl.startsWith('blob:')) {
      currentUrl = currentUrl.replace('blob:', '');
    }
    setManualUrl(currentUrl);
  }, []);

  useEffect(() => {
    const usersStr = localStorage.getItem('imatoms_users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    if (users.length === 0) {
      const defaultAdmin: User = {
        id: 'u-admin-root',
        username: 'admin',
        email: 'admin@imatoms.pro',
        password: 'admin1234',
        building: 'all',
        role: 'admin',
        status: 'approved',
        created_at: new Date().toISOString()
      };
      users.push(defaultAdmin);
      localStorage.setItem('imatoms_users', JSON.stringify(users));
    }
  }, []);

  const generateQR = useCallback(async (targetUrl: string) => {
    const QRCodeLib = (window as any).QRCode;
    
    if (!QRCodeLib) {
      console.warn("QRCode library not loaded yet.");
      return;
    }

    setIsQrLoading(true);
    try {
      // Version 40 + Error Correction H for maximum reliability on all screens
      const url = await QRCodeLib.toDataURL(targetUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        scale: 12,
        version: 40,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrImageUrl(url);
    } catch (err) {
      console.error('QR Error:', err);
      // Fallback to simpler QR if URL is extremely long
      try {
        const fallback = await QRCodeLib.toDataURL(targetUrl, { scale: 8 });
        setQrImageUrl(fallback);
      } catch (e) {
        setQrImageUrl('');
      }
    } finally {
      setIsQrLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (showQR) {
      if (manualUrl) generateQR(manualUrl);
      
      if (!qrImageUrl) {
        interval = setInterval(() => {
          if ((window as any).QRCode && manualUrl) {
            generateQR(manualUrl);
            clearInterval(interval);
          }
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [showQR, generateQR, manualUrl, qrImageUrl]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(manualUrl);
    alert(lang === 'TH' ? 'คัดลอกลิงก์สำเร็จ!' : 'URL Copied to Clipboard!');
  };

  const getGatewayConfig = () => {
    const saved = localStorage.getItem('imatoms_gateway_config');
    if (saved) return JSON.parse(saved);
    return { user: 'fmsdatamonitor', pass: 'fms2026' };
  };

  const t = {
    step1_title: lang === 'TH' ? 'ขั้นตอน 1: ยืนยันสิทธิ์องค์กร' : 'Step 1: Organization Gateway',
    step2_title: lang === 'TH' ? 'ขั้นตอน 2: ยืนยันตัวบุคคล' : 'Step 2: Personal Identity',
    gateway_hint: lang === 'TH' ? 'ใช้สำหรับบุคลากรของเครือวิมุตโฮลดิ้งเท่านั้น' : 'Use for Organization of ViMUT HOLDING ONLY',
    login: lang === 'TH' ? 'เข้าสู่ระบบ' : 'Login',
    register: lang === 'TH' ? 'ลงทะเบียน' : 'Register',
    subtitle: lang === 'TH' ? `ระบบ iMATOMs Ver${APP_VERSION} (+AI Analysis)` : `SMART BUILDING AI ANALYTICS Ver${APP_VERSION}`,
    user: lang === 'TH' ? 'ชื่อผู้ใช้งาน' : 'Username',
    pass: lang === 'TH' ? 'รหัสผ่าน' : 'Password',
    email: lang === 'TH' ? 'อีเมล' : 'Email',
    building: lang === 'TH' ? 'อาคารที่รับผิดชอบ' : 'Assigned Building',
    btn_gateway: lang === 'TH' ? 'ตรวจสอบสิทธิ์องค์กร' : 'Verify Organization',
    btn_login: lang === 'TH' ? 'เข้าใช้งานระบบ' : 'Access System',
    btn_reg: lang === 'TH' ? 'ส่งคำขอลงทะเบียน' : 'Submit Registration',
    auth_only: lang === 'TH' ? 'เฉพาะผู้ที่ได้รับอนุญาตเท่านั้น' : '|| Authorized Personnel for ViMUT HOLDING Only || Copyright©: Mr.Kittanan ONSEE',
    need_acc: lang === 'TH' ? 'ลงทะเบียนผู้ใช้ใหม่' : "Register New User",
    have_acc: lang === 'TH' ? 'กลับไปหน้าเข้าสู่ระบบ' : "Back to Login",
    pending: lang === 'TH' ? 'บัญชีนี้รอการอนุมัติจาก Admin' : 'Account awaiting Admin approval',
    denied: lang === 'TH' ? 'บัญชีนี้ถูกระงับการเข้าถึง' : 'Access Denied',
    reg_success: lang === 'TH' ? 'ส่งคำขอสำเร็จ! โปรดรอการอนุมัติ' : 'Registration Successful! Waiting for approval.',
    wrong_gateway: lang === 'TH' ? 'รหัสองค์กรไม่ถูกต้อง' : 'Invalid Organization Credentials',
    wrong_identity: lang === 'TH' ? 'Username หรือ Password ผิดพลาด' : 'Invalid Username or Password',
    share_app: lang === 'TH' ? 'สร้างลิงก์เข้าใช้ผ่านมือถือ' : 'Generate Mobile Access Link'
  };

  const handleGatewaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const config = getGatewayConfig();
    if (gatewayUser === config.user && gatewayPass === config.pass) {
      setStep('identity');
      setGatewayUser('');
      setGatewayPass('');
    } else {
      setError(t.wrong_gateway);
    }
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const usersStr = localStorage.getItem('imatoms_users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];

    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      if (foundUser.status === 'approved') {
        onLogin(foundUser);
      } else if (foundUser.status === 'pending') {
        setError(t.pending);
      } else {
        setError(t.denied);
      }
    } else {
      setError(t.wrong_identity);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const usersStr = localStorage.getItem('imatoms_users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.some(u => u.username === regName || u.email === regEmail)) {
      setError('User or Email already exists');
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      username: regName,
      email: regEmail,
      password: regPass,
      building: regBuilding,
      role: regBuilding === 'all' ? 'admin' : 'user',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('imatoms_users', JSON.stringify(users));
    setSuccess(t.reg_success);
    setTimeout(() => {
      setSuccess('');
      setStep('identity');
    }, 3000);
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-[#0a0e17] overflow-y-auto font-sans relative">
      <div className="w-full max-w-md cyber-card p-10 rounded-[3rem] border-white/10 shadow-2xl my-8 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mb-6 animate-pulse">
            <i className="fa-solid fa-atom text-6xl text-white"></i>
          </div>
          <h1 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">iMATOMs Pro</h1>
          <p className="text-[11px] mt-3 text-orange-400/60 font-black uppercase tracking-[0.3em]">{t.subtitle}</p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mb-8">
           <div className={`w-10 h-1.5 rounded-full transition-all duration-500 ${step === 'gateway' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(0,245,255,0.5)]' : 'bg-white/10'}`}></div>
           <div className={`w-10 h-1.5 rounded-full transition-all duration-500 ${step === 'identity' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`}></div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-[10px] text-center animate-shake font-bold uppercase tracking-widest">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-400 text-[10px] text-center font-bold uppercase tracking-widest">
            <i className="fa-solid fa-circle-check mr-2"></i>{success}
          </div>
        )}

        {step === 'gateway' && (
          <form onSubmit={handleGatewaySubmit} className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <h2 className="text-green-400/80 text-lg font-bold uppercase tracking-widest mb-1">{t.step1_title}</h2>
              <p className="text-[8px] text-black-400/10 uppercase mb-6 tracking-widest ">{t.gateway_hint}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase font-black tracking-widest mb-2 text-white/20">Organize_Name</label>
                <input type="text" className="cyber-input w-full p-4 rounded-xl text-sm" value={gatewayUser} onChange={(e) => setGatewayUser(e.target.value)} required placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-black tracking-widest mb-2 text-white/20">Organize_Password</label>
                <input type="password" className="cyber-input w-full p-4 rounded-xl text-sm" value={gatewayPass} onChange={(e) => setGatewayPass(e.target.value)} required placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-cyan-600 text-white text-[14px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-cyan-500/40 hover:bg-cyan-400 transition-all transform active:scale-95">
              {t.btn_gateway}
            </button>
          </form>
        )}

        {step === 'identity' && (
          <form onSubmit={handleIdentitySubmit} className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <h2 className="text-white text-lg font-bold uppercase tracking-widest mb-6">{t.step2_title}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase font-black tracking-widest mb-2 text-white/20">{t.user}</label>
                <input type="text" className="cyber-input w-full p-4 rounded-xl text-sm" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="********" />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-black tracking-widest mb-2 text-white/20">{t.pass}</label>
                <input type="password" className="cyber-input w-full p-4 rounded-xl text-sm" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="********" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <button type="submit" className="w-full py-4 bg-purple-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all transform active:scale-95">
                {t.btn_login}
              </button>
              <div className="flex justify-between items-center px-1">
                <button type="button" onClick={() => setStep('gateway')} className="text-[9px] text-white/30 uppercase font-black tracking-widest hover:text-cyan-400 transition-colors">
                  <i className="fa-solid fa-chevron-left mr-1"></i> Gateway
                </button>
                <button type="button" onClick={() => { setStep('register'); setError(''); }} className="text-[9px] text-white/30 uppercase font-black tracking-widest hover:text-emerald-400 transition-colors">
                  {t.need_acc}
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
            <h2 className="text-white text-lg font-bold uppercase tracking-widest mb-6 text-center">{t.register}</h2>
            <div>
              <label className="block text-[9px] uppercase font-black tracking-widest mb-2 text-white/40">{t.user}</label>
              <input type="text" className="cyber-input w-full p-4 rounded-xl text-sm" value={regName} onChange={(e) => setRegName(e.target.value)} required placeholder="Full Name" />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black tracking-widest mb-2 text-white/40">{t.email}</label>
              <input type="email" className="cyber-input w-full p-4 rounded-xl text-sm" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required placeholder="email@example.com" />
            </div>
            <div className="relative">
              <label className="block text-[9px] uppercase font-black tracking-widest mb-2 text-white/40">{t.building}</label>
              <select 
                className="w-full p-4 rounded-xl text-sm cursor-pointer appearance-none outline-none border border-white/20 bg-black text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] focus:border-cyan-400 dropdown-fix" 
                style={{ WebkitAppearance: 'none' }}
                value={regBuilding} 
                onChange={(e) => setRegBuilding(e.target.value)}
              >
                <option value="ViMUT" className="bg-[#000000] text-white">ViMUT Hospital</option>
                <option value="VTH" className="bg-[#000000] text-white">ViMUT-Theptarin (VTH)</option>
                <option value="VWG" className="bg-[#000000] text-white">ViMUT-Wellness(Gemo)-VWG</option>
                <option value="VWW" className="bg-[#000000] text-white">ViMUT-Wellness(Wacharaphol)-VWW</option>
                <option value="VWB" className="bg-[#000000] text-white">ViMUT-Wellness(Bearing)-VWB</option>
                <option value="VCB" className="bg-[#000000] text-white">ViMUT-Clinic(Bannmor)-VCB</option>
                <option value="all" className="bg-[#000000] text-white">All Buildings (Admin Hub)</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 bottom-4 text-cyan-400 pointer-events-none"></i>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-black tracking-widest mb-2 text-white/40">{t.pass}</label>
              <input type="password" className="cyber-input w-full p-4 rounded-xl text-sm" value={regPass} onChange={(e) => setRegPass(e.target.value)} required placeholder="Define Password" />
            </div>
            <button type="submit" className="w-full py-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all transform active:scale-95">
              {t.btn_reg}
            </button>
            <button type="button" onClick={() => { setStep('identity'); setError(''); }} className="w-full text-[9px] text-white/30 uppercase font-black tracking-widest hover:text-cyan-400 transition-colors mt-4">
               {t.have_acc}
            </button>
          </form>
        )}

        <div className="mt-12 flex flex-col items-center gap-4 pt-6 border-t border-white/5">
           <button 
             onClick={() => setShowQR(!showQR)}
             className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-yellow-400/60 hover:text-cyan-400 hover:border-cyan-400 transition-all"
           >
              <i className="fa-solid fa-qrcode"></i>
              {t.share_app}
           </button>
           <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed text-center">{t.auth_only}</p>
        </div>
      </div>

      {/* MOBILE DEPLOYMENT HUB MODAL */}
      {showQR && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 sm:p-6" onClick={() => setShowQR(false)}>
           <div className="cyber-card p-6 sm:p-10 rounded-[3rem] border-cyan-500/30 flex flex-col items-center text-center w-full max-w-[440px] animate-fadeIn shadow-[0_0_100px_rgba(0,245,255,0.1)]" onClick={e => e.stopPropagation()}>
              
              <div className="mb-6 w-full">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <i className="fa-solid fa-satellite-dish"></i>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white uppercase italic tracking-tighter">Connectivity Hub</h3>
                  <button onClick={() => setShowQR(false)} className="text-white/20 hover:text-white transition-all">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div className="h-px bg-white/10 w-full"></div>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 sm:p-6 rounded-[2.5rem] mb-6 shadow-[0_0_40px_rgba(0,245,255,0.3)] border-4 border-cyan-400 flex flex-col items-center justify-center overflow-hidden w-full aspect-square max-w-[300px] relative">
                {qrImageUrl ? (
                   <img 
                    src={qrImageUrl} 
                    alt="Access QR Code" 
                    className="w-full h-full object-contain animate-fadeIn"
                    style={{ imageRendering: 'auto' }}
                   />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <i className="fa-solid fa-atom fa-spin text-4xl text-cyan-500"></i>
                    <p className="text-black text-[10px] font-black uppercase tracking-[0.1em]">Syncing Neural Key...</p>
                  </div>
                )}
              </div>

              {/* URL Management & Warning System */}
              <div className="w-full space-y-4 text-left">
                {manualUrl.startsWith('blob:') && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/40 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-2 text-orange-400 mb-1">
                      <i className="fa-solid fa-triangle-exclamation text-[10px]"></i>
                      <p className="text-[9px] font-black uppercase tracking-widest">Warning: Local Blob Detected</p>
                    </div>
                    <p className="text-[8px] text-white/50 leading-relaxed uppercase">
                      ลิงก์ blob: จะใช้ได้เฉพาะเครื่องนี้เท่านั้น โปรดนำ URL จริงจาก Browser Address Bar (เช่น https://...) มาวางในช่องด้านล่างเพื่อแชร์ไปที่อื่น
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <div className="flex items-center justify-between mb-2">
                     <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Target Deployment URL</p>
                     <div className="flex gap-2">
                       <button onClick={handleCopyUrl} className="text-white/20 hover:text-cyan-400 text-[9px] font-black uppercase transition-all">
                        <i className="fa-solid fa-copy mr-1"></i> Copy
                       </button>
                       <a href={manualUrl} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-emerald-400 text-[9px] font-black uppercase transition-all">
                        <i className="fa-solid fa-up-right-from-square mr-1"></i> Test
                       </a>
                     </div>
                   </div>
                   
                   <input 
                    type="text" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[11px] text-white/70 placeholder:text-white/10 outline-none focus:border-cyan-500 font-mono"
                    placeholder="วางลิงก์ https:// จริงจาก Chrome ที่นี่..."
                    value={manualUrl}
                    onChange={(e) => {
                      setManualUrl(e.target.value);
                      setQrImageUrl(''); // Reset to regenerate
                    }}
                   />
                   <p className="text-[7px] text-white/20 mt-2 uppercase italic tracking-widest font-bold">
                     Tip: You must use the full HTTPS URL from your browser address bar.
                   </p>
                </div>
              </div>

              <div className="flex gap-3 w-full mt-6">
                <button 
                  onClick={() => { setQrImageUrl(''); generateQR(manualUrl); }}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                >
                  <i className="fa-solid fa-rotate mr-2"></i> Regenerate
                </button>
                <button 
                  onClick={() => setShowQR(false)}
                  className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-125 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Confirm & Close
                </button>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .cyber-card { backdrop-filter: blur(20px); }
        .cyber-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: white; transition: all 0.3s; }
        .cyber-input:focus { border-color: #00f5ff; outline: none; background: rgba(255,255,255,0.07); box-shadow: 0 0 15px rgba(0,245,255,0.2); }
        
        .dropdown-fix {
          background-color: #000000 !important;
          color: white !important;
        }
        .dropdown-fix option {
          background-color: #000000 !important;
          color: white !important;
          padding: 10px;
        }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default Login;
