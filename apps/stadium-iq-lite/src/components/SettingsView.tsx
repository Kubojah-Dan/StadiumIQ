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
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Globe
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
  
  // Credentials state
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
    <div className="max-w-6xl mx-auto font-sans selection:bg-stadium-neon selection:text-stadium-dark animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h2 className="text-3xl font-black tracking-tighter uppercase font-display flex items-center gap-4">
          <SettingsIcon size={32} className="text-stadium-neon" />
          {t('settings.governance')}
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Configuration Node • v2.1.4</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <div className="space-y-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px] ${activeTab === item.id ? 'bg-stadium-neon text-stadium-dark border-stadium-neon shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
            >
              {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
              {item.label}
            </button>
          ))}
          
          <div className="pt-8 mt-8 border-t border-white/5">
             <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all">
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-10 border-white/10 rounded-[2.5rem] shadow-2xl min-h-[500px]"
            >
              {activeTab === 'profile' && (
                <div className="space-y-10">
                   <div className="flex items-center gap-8">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-stadium-neon to-indigo-500 p-1 group relative cursor-pointer" onClick={() => {
                        const seeds = ['Felix', 'Luna', 'Kobi', 'Oliver', 'Milo'];
                        const nextSeed = seeds[(seeds.indexOf(userProfile.image.split('seed=')[1]) + 1) % seeds.length];
                        onUpdateProfile({ ...userProfile, image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nextSeed}` });
                        showToast("Avatar Pattern Updated");
                      }}>
                         <div className="w-full h-full rounded-[1.4rem] overflow-hidden bg-stadium-dark relative">
                            <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[8px] font-black uppercase text-white">Change</span>
                            </div>
                         </div>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black tracking-tight">{userProfile.name}</h3>
                         <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">{userProfile.role} • Level 5</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-white/5">
                      <InputGroup 
                        label={t('settings.profile')} 
                        value={userProfile.name} 
                        onChange={(val) => onUpdateProfile({ ...userProfile, name: val })} 
                      />
                      <InputGroup 
                        label="Email Node" 
                        value={email} 
                        onChange={(val) => setEmail(val)}
                      />
                      <InputGroup 
                        label="Position" 
                        value={userProfile.role} 
                        onChange={(val) => onUpdateProfile({ ...userProfile, role: val })}
                      />
                      <InputGroup label="Deployment" value="Stadium Control Center" readonly />
                   </div>

                   <div className="flex justify-between items-center pt-10 border-t border-white/5">
                        <div className="flex items-center gap-4">
                          <Globe size={16} className="text-stadium-neon" />
                          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            {['en', 'es', 'fr'].map((lng) => (
                              <button
                                key={lng}
                                onClick={() => i18n.changeLanguage(lng)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${i18n.language === lng ? 'bg-stadium-neon text-stadium-dark shadow-lg' : 'text-slate-500 hover:text-white'}`}
                              >
                                {lng}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            showToast(t('settings.sync_profile'));
                            // Persist to local storage for realism
                            localStorage.setItem('siq_profile', JSON.stringify(userProfile));
                            localStorage.setItem('siq_credentials', JSON.stringify({ email, password }));
                          }}
                          className="px-10 py-4 bg-stadium-neon text-stadium-dark font-black rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:scale-105 transition-all text-xs uppercase tracking-widest"
                        >{t('settings.sync_profile')}</button>
                    </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-12">
                   <div>
                      <h4 className="text-xl font-black uppercase tracking-tighter mb-4 text-white flex items-center gap-3">
                        <KeyRound className="text-stadium-neon" size={20} />
                        Password Hardening
                      </h4>
                      <div className="space-y-4 max-w-lg">
                        <InputGroup 
                          label="System Access Key (Password)" 
                          type="password" 
                          value={password}
                          onChange={(val) => setPassword(val)}
                        />
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest px-1">Note: Synchronize Profile to commit security changes.</p>
                      </div>
                   </div>

                   <div className="pt-12 border-t border-white/5">
                      <div className="flex items-start justify-between mb-8">
                         <div>
                            <h4 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                              <ShieldCheck className="text-stadium-neon" size={20} />
                              Multi-Factor Authentication
                            </h4>
                            <p className="text-slate-500 font-medium text-sm mt-2">Add an extra layer of security using a TOTP authenticator.</p>
                         </div>
                         <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${mfaEnabled ? 'bg-stadium-success/10 border-stadium-success/30 text-stadium-success' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {mfaEnabled ? 'Verified' : 'Vulnerable'}
                         </div>
                      </div>

                      {mfaEnabled ? (
                         <div className="bg-stadium-success/5 border border-stadium-success/20 rounded-3xl p-8 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-2xl bg-stadium-success/20 flex items-center justify-center text-stadium-success">
                                  <Shield size={24} />
                               </div>
                               <div>
                                  <p className="text-white font-black uppercase tracking-widest text-sm">2FA PROTECTION ACTIVE</p>
                                  <p className="text-slate-500 text-xs font-medium">Account is protected by RFC 6238 compliant TOTP.</p>
                               </div>
                            </div>
                            <button 
                              onClick={() => setMfaEnabled(false)}
                              className="text-red-400 font-black uppercase tracking-widest text-[10px] border-b border-red-400/30 pb-1 hover:border-red-400 transition-all"
                            >Disable MFA</button>
                         </div>
                      ) : (
                         <>
                            {!isSettingUpMfa ? (
                               <button 
                                 onClick={generateSecret}
                                 className="w-full py-8 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 font-black uppercase tracking-[0.2em] text-xs hover:border-stadium-neon/50 hover:text-white transition-all group"
                               >
                                  <div className="flex flex-col items-center gap-3">
                                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-stadium-neon group-hover:text-stadium-dark transition-all">
                                        <QrCode size={24} />
                                     </div>
                                     Initialize MFA Encryption
                                  </div>
                               </button>
                            ) : (
                               <div className="space-y-8 animate-in zoom-in-95 duration-300">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                     <div className="space-y-6">
                                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Manual Setup Key</p>
                                           <div className="flex items-center justify-between gap-4">
                                              <code className="text-stadium-neon font-mono text-lg font-bold tracking-[0.2em]">{mfaSecret}</code>
                                              <button onClick={() => showToast("Copied to Data Slate")} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                                 <Copy size={16} />
                                              </button>
                                           </div>
                                        </div>
                                        <p className="text-xs text-slate-500 italic">Enter this key into your authenticator app (e.g. Google Authenticator or Authy).</p>
                                     </div>

                                     <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl relative overflow-hidden group">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/StadiumIQ:admin@stadiumiq.demo?secret=${mfaSecret}%26issuer=StadiumIQ`} alt="MFA QR" className="relative z-10" />
                                        <div className="absolute inset-0 bg-stadium-neon/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                  </div>

                                  <div className="pt-8 border-t border-white/5">
                                     <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Verification Code</label>
                                     <div className="flex gap-4">
                                        <input 
                                          type="text" 
                                          placeholder="— — — — — —"
                                          maxLength={6}
                                          value={mfaCode}
                                          onChange={(e) => setMfaCode(e.target.value)}
                                          className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-center text-2xl font-black tracking-[1em] text-white focus:outline-none focus:border-stadium-neon transition-all"
                                        />
                                        <button 
                                          onClick={verifyAndEnableMfa}
                                          className="px-10 bg-stadium-neon text-stadium-dark font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                                        >Enable 2FA</button>
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
                <div className="space-y-10">
                   <h4 className="text-xl font-black uppercase tracking-tighter mb-8 text-white flex items-center gap-3">
                      <Bell className="text-stadium-neon" size={20} />
                      Tactical Notifications
                   </h4>
                   
                   <div className="space-y-4">
                      <ToggleSetting title="Surge Detection" desc="Push critical alerts directly to heads-up display when density thresholds are breached." active />
                      <ToggleSetting title="Queue Spike Logic" desc="Monitor gate wait times and alert when they exceed 15 minute operational targets." active />
                      <ToggleSetting title="AI Advisory Engine" desc="Allow Gemini-2.0 to broadcast real-time operational advice based on live context." active />
                      <ToggleSetting title="Automatic Triage" desc="Auto-generate mitigation pathways for high-probability surge events." />
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
            className="fixed bottom-10 right-10 z-50 px-6 py-4 glass-card border-stadium-neon/30 rounded-2xl flex items-center gap-4 shadow-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-stadium-neon/20 flex items-center justify-center text-stadium-neon">
              <Check size={20} />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-white">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, value, type = 'text', readonly = false, onChange }: { label: string, value?: string, type?: string, readonly?: boolean, onChange?: (val: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readonly}
        className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-stadium-neon/60 transition-all font-bold ${readonly ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}

function ToggleSetting({ title, desc, active = false }: { title: string, desc: string, active?: boolean }) {
  const [enabled, setEnabled] = useState(active);
  return (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`w-full p-8 rounded-[2rem] border transition-all text-left flex items-center justify-between group ${enabled ? 'bg-stadium-neon/5 border-stadium-neon/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
    >
       <div className="flex-1">
          <h4 className={`text-lg font-black uppercase tracking-tight transition-colors ${enabled ? 'text-stadium-neon' : 'text-white'}`}>{title}</h4>
          <p className="text-sm text-slate-500 font-medium mt-1 pr-10">{desc}</p>
       </div>
       <div className={`w-14 h-8 rounded-full border-2 transition-all flex items-center px-1 ${enabled ? 'bg-stadium-neon border-stadium-neon justify-end' : 'bg-stadium-dark border-white/10 justify-start'}`}>
          <motion.div layout className={`w-5 h-5 rounded-full ${enabled ? 'bg-stadium-dark shadow-lg' : 'bg-slate-700'}`} />
       </div>
    </button>
  );
}

function SettingsIcon({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
