import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  User as UserIcon, 
  KeyRound, 
  QrCode, 
  Copy, 
  Check, 
  Bell, 
  Database,
  ShieldCheck,
  Globe,
  Settings as SettingsIcon,
  Zap
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'alerts';

export default function SettingsView({ userProfile, onUpdateProfile }: { userProfile: any, onUpdateProfile: any }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isSettingUpMfa, setIsSettingUpMfa] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  
  const [email, setEmail] = useState('admin@stadiumiq.demo');
  const [password, setPassword] = useState('admin');

  useEffect(() => {
    const saved = localStorage.getItem('siq_credentials');
    if (saved) {
      const { email: savedEmail, password: savedPass } = JSON.parse(saved);
      setEmail(savedEmail);
      setPassword(savedPass);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) secret += chars.charAt(Math.floor(Math.random() * chars.length));
    setMfaSecret(secret);
    setIsSettingUpMfa(true);
  };

  const verifyAndEnableMfa = () => {
    if (mfaCode.length === 6) {
      setMfaEnabled(true);
      setIsSettingUpMfa(false);
      showToast("Two-Factor Authentication Enabled Successfully");
    } else {
      showToast("Invalid Verification Code");
    }
  };

  const sidebarItems = [
    { id: 'profile', icon: <UserIcon />, label: t('settings.profile') },
    { id: 'security', icon: <Shield />, label: t('settings.security') },
    { id: 'alerts', icon: <Bell />, label: t('settings.alerts') },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight uppercase font-display flex items-center gap-3">
          <SettingsIcon size={24} className="text-stadium-neon md:w-8 md:h-8" />
          {t('settings.governance')}
        </h2>
        <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 md:mt-2 italic">Configuration Node • v2.1.5</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Settings Navigation - Responsive layout */}
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 md:gap-3 pb-2 lg:pb-0 custom-scrollbar scroll-smooth">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all font-bold uppercase tracking-widest text-[9px] md:text-[10px] whitespace-nowrap tap-target ${
                activeTab === item.id 
                  ? 'bg-stadium-neon text-stadium-dark border-stadium-neon shadow-lg shadow-cyan-500/20' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {React.cloneElement(item.icon as React.ReactElement, { size: 16, className: "md:w-[18px] md:h-[18px]" })}
              <span className="md:inline">{item.label}</span>
            </button>
          ))}
          
          <div className="hidden lg:block pt-8 mt-4 border-t border-white/5">
             <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all tap-target">
                <Database size={18} />
                Purge Data Hub
             </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6 md:p-10 border-white/10 min-h-[400px] md:min-h-[500px]"
            >
              {activeTab === 'profile' && (
                <div className="space-y-8 md:space-y-10">
                   <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-tr from-stadium-neon to-blue-500 p-0.5 group relative cursor-pointer" onClick={() => {
                        const seeds = ['Felix', 'Luna', 'Kobi', 'Oliver', 'Milo'];
                        const nextSeed = seeds[(seeds.indexOf(userProfile.image.split('seed=')[1]) + 1) % seeds.length];
                        onUpdateProfile({ ...userProfile, image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nextSeed}` });
                        showToast("Avatar Pattern Rotated");
                      }}>
                         <div className="w-full h-full rounded-[0.9rem] md:rounded-[1.4rem] overflow-hidden bg-stadium-dark relative">
                            <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[8px] font-bold uppercase text-white tracking-widest">Update</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-center sm:text-left">
                         <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">{userProfile.name}</h3>
                         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-1">{userProfile.role} • Security Lv. 5</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-8 border-t border-white/5">
                      <InputGroup 
                        label={t('settings.profile')} 
                        value={userProfile.name} 
                        onChange={(val) => onUpdateProfile({ ...userProfile, name: val })} 
                      />
                      <InputGroup 
                        label="Data Node (Email)" 
                        value={email} 
                        onChange={(val) => setEmail(val)}
                      />
                      <InputGroup 
                        label="Operational Role" 
                        value={userProfile.role} 
                        onChange={(val) => onUpdateProfile({ ...userProfile, role: val })}
                      />
                      <InputGroup label="Access Group" value="HQ Control Center" readonly />
                   </div>

                   <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <Globe size={16} className="text-stadium-neon shrink-0" />
                          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            {['en', 'es', 'fr'].map((lng) => (
                              <button
                                key={lng}
                                onClick={() => i18n.changeLanguage(lng)}
                                className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${i18n.language === lng ? 'bg-stadium-neon text-stadium-dark' : 'text-slate-500 hover:text-white'}`}
                              >
                                {lng}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            showToast("Synchronized with Hive");
                            localStorage.setItem('siq_profile', JSON.stringify(userProfile));
                            localStorage.setItem('siq_credentials', JSON.stringify({ email, password }));
                          }}
                          className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-stadium-neon text-stadium-dark font-bold rounded-xl md:rounded-2xl transition-all text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 tap-target"
                        >
                            {t('settings.sync_profile')}
                        </button>
                    </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-10 md:space-y-12">
                   <div>
                      <h4 className="text-lg md:text-xl font-bold uppercase tracking-tight mb-4 text-white flex items-center gap-3">
                        <KeyRound className="text-stadium-neon" size={20} />
                        Access Credentials
                      </h4>
                      <div className="space-y-4 max-w-lg">
                        <InputGroup 
                          label="Master Pattern (Password)" 
                          type="password" 
                          value={password}
                          onChange={(val) => setPassword(val)}
                        />
                        <p className="text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-widest px-1">Commit required to finalize pattern shift.</p>
                      </div>
                   </div>

                   <div className="pt-8 md:pt-12 border-t border-white/5">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
                         <div>
                            <h4 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                              <ShieldCheck className="text-stadium-neon" size={20} />
                              Multi-Factor Link
                            </h4>
                            <p className="text-slate-500 font-medium text-xs md:text-sm mt-1">Harden access with TOTP-based authentication layers.</p>
                         </div>
                         <div className={`px-3 py-1 rounded-full border text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${mfaEnabled ? 'bg-stadium-success/10 border-stadium-success/30 text-stadium-success' : 'bg-stadium-error/10 border-stadium-error/30 text-stadium-error'}`}>
                            {mfaEnabled ? 'ENCRYPTED' : 'UNSECURED'}
                         </div>
                      </div>

                      {mfaEnabled ? (
                         <div className="bg-stadium-success/5 border border-stadium-success/20 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 md:gap-6">
                               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-stadium-success/20 flex items-center justify-center text-stadium-success">
                                  <Shield size={20} />
                               </div>
                               <div className="text-center sm:text-left">
                                  <p className="text-white font-bold uppercase tracking-widest text-xs md:text-sm">MFA SHIELD ACTIVE</p>
                                  <p className="text-slate-500 text-[10px] md:text-xs">Account bound to RFC 6238 Protocol.</p>
                                </div>
                            </div>
                            <button 
                              onClick={() => setMfaEnabled(false)}
                              className="text-red-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] border-b border-red-400/30 pb-0.5 hover:border-red-400 transition-all tap-target"
                            >Disengage Shield</button>
                         </div>
                      ) : (
                         <>
                            {!isSettingUpMfa ? (
                               <button 
                                 onClick={generateSecret}
                                 className="w-full py-10 md:py-12 border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs hover:border-stadium-neon/50 hover:text-white transition-all group tap-target"
                               >
                                  <div className="flex flex-col items-center gap-4">
                                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-stadium-neon group-hover:text-stadium-dark transition-all">
                                        <QrCode size={24} />
                                     </div>
                                     Initialize Triage Guard
                                  </div>
                               </button>
                            ) : (
                               <div className="space-y-8 animate-in zoom-in-95 duration-300">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                                     <div className="space-y-6">
                                        <div className="p-5 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10">
                                           <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Manual Sync Code</p>
                                           <div className="flex items-center justify-between gap-4">
                                              <code className="text-stadium-neon font-mono text-base md:text-lg font-bold tracking-[0.1em] md:tracking-[0.2em]">{mfaSecret}</code>
                                              <button onClick={() => showToast("Copied to Data Node")} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all tap-target">
                                                 <Copy size={14} />
                                              </button>
                                           </div>
                                        </div>
                                        <p className="text-[10px] md:text-xs text-slate-500 italic">Input this pattern into your operational authenticator.</p>
                                     </div>

                                     <div className="flex items-center justify-center p-6 md:p-8 bg-white rounded-2xl md:rounded-3xl group max-w-[200px] mx-auto md:max-w-none">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/StadiumIQ:admin@stadiumiq.demo?secret=${mfaSecret}%26issuer=StadiumIQ`} alt="MFA QR" className="w-full max-w-[150px]" />
                                     </div>
                                  </div>

                                  <div className="pt-8 border-t border-white/5">
                                     <label className="block text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Verification Sequence</label>
                                     <div className="flex flex-col sm:flex-row gap-4">
                                        <input 
                                          type="text" 
                                          placeholder="000000"
                                          maxLength={6}
                                          value={mfaCode}
                                          onChange={(e) => setMfaCode(e.target.value)}
                                          className="flex-1 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 px-6 text-center text-xl md:text-2xl font-black tracking-[0.5em] text-white focus:outline-none focus:border-stadium-neon transition-all"
                                        />
                                        <button 
                                          onClick={verifyAndEnableMfa}
                                          className="px-8 md:px-10 py-4 bg-stadium-neon text-stadium-dark font-bold rounded-xl md:rounded-2xl uppercase tracking-widest text-[10px] md:text-xs hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/20 tap-target"
                                        >Finalize Setup</button>
                                     </div>
                                  </div>
                               </div>
                            )}
                         </>
                      )}
                   </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="space-y-6 md:space-y-10">
                   <h4 className="text-lg md:text-xl font-bold uppercase tracking-tight mb-6 md:mb-8 text-white flex items-center gap-3">
                      <Bell className="text-stadium-neon" size={20} />
                      Signal Configuration
                   </h4>
                   
                   <div className="grid grid-cols-1 gap-4">
                      <ToggleSetting title="Incursion Alerts" desc="Broadcast high-priority surge telemetry to UI headers." active />
                      <ToggleSetting title="Bottleneck Logic" desc="Flag sectors where traversal speed drops below 2m/s." active />
                      <ToggleSetting title="AI Advisory Link" desc="Enable direct neural broadcast for Gemini-2.0 observations." active />
                      <ToggleSetting title="Auto-Mitigation" desc="Allow system to propose strategy paths for incident reduction." />
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 md:bottom-10 right-4 md:right-10 z-[70] px-5 py-3 md:px-6 md:py-4 glass-card border-stadium-neon/30 rounded-xl md:rounded-2xl flex items-center gap-4 shadow-2xl"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-stadium-neon/20 flex items-center justify-center text-stadium-neon">
              <Check size={18} />
            </div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, value, type = 'text', readonly = false, onChange }: { label: string, value?: string, type?: string, readonly?: boolean, onChange?: (val: string) => void }) {
  return (
    <div className="space-y-1.5 md:space-y-2">
      <label className="block text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readonly}
        className={`w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-5 md:px-6 text-white text-xs md:text-sm focus:outline-none focus:border-stadium-neon/60 transition-all font-bold ${readonly ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}

function ToggleSetting({ title, desc, active = false }: { title: string, desc: string, active?: boolean }) {
  const [enabled, setEnabled] = useState(active);
  return (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`w-full p-6 md:p-8 rounded-2xl md:rounded-[2rem] border transition-all text-left flex items-center justify-between group tap-target ${enabled ? 'bg-stadium-neon/5 border-stadium-neon/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
    >
       <div className="flex-1 pr-4 md:pr-10">
          <h4 className={`text-sm md:text-lg font-bold uppercase tracking-tight transition-colors ${enabled ? 'text-stadium-neon' : 'text-white'}`}>{title}</h4>
          <p className="text-[9px] md:text-sm text-slate-500 font-medium mt-1 leading-relaxed md:leading-normal">{desc}</p>
       </div>
       <div className={`w-10 h-6 md:w-14 md:h-8 rounded-full border-2 transition-all flex items-center px-0.5 md:px-1 shrink-0 ${enabled ? 'bg-stadium-neon border-stadium-neon justify-end' : 'bg-stadium-dark border-white/10 justify-start'}`}>
          <motion.div layout className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${enabled ? 'bg-stadium-dark shadow-md' : 'bg-slate-700'}`} />
       </div>
    </button>
  );
}
