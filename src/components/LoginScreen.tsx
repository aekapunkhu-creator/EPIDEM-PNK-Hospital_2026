import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Activity,
  ArrowRight,
  HelpCircle,
  Check
} from 'lucide-react';
import { UserSession } from '../types';
import { authService } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้งาน (Username)');
      return;
    }
    if (!password) {
      setErrorMessage('กรุณากรอกรหัสผ่าน (Password)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authService.login(username, password);
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 400);
      } else {
        setErrorMessage(res.message);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 md:p-8 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Hospital Badge */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              โรงพยาบาลโพนนาแก้ว
            </h1>
            <p className="text-[11px] text-blue-300">
              สำนักงานสาธารณสุขจังหวัดสกลนคร
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-blue-200 backdrop-blur-xs">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>ระบบรักษาความปลอดภัยและระบาดวิทยา</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-4xl mx-auto my-auto py-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          
          {/* Left Hero / Brand Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/20 mb-6">
                <Stethoscope className="w-3.5 h-3.5 text-blue-300" />
                <span>PNK-EPI Surveillance Hub</span>
              </div>

              <h2 className="text-2xl font-black tracking-tight leading-snug">
                ระบบเฝ้าระวังและสอบสวนโรคทางระบาดวิทยา
              </h2>
              <p className="text-sm text-blue-200 mt-2 font-medium">
                อำเภอโพนนาแก้ว จังหวัดสกลนคร
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-blue-100/90 leading-relaxed">
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-full bg-blue-500/30 mt-0.5">
                    <Check className="w-3 h-3 text-blue-200" />
                  </div>
                  <span>เฝ้าระวังโรคระบาด 5 ตำบล (นาแก้ว, นาตงวัฒนา, บ้านแป้น, บ้านโพน, เชียงสือ)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-full bg-blue-500/30 mt-0.5">
                    <Check className="w-3 h-3 text-blue-200" />
                  </div>
                  <span>สอบสวนโรคเคลื่อนที่เร็ว (SRRT) และแชร์พิกัด GPS ภาคสนาม</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded-full bg-blue-500/30 mt-0.5">
                    <Check className="w-3 h-3 text-blue-200" />
                  </div>
                  <span>เชื่อมโยงข้อมูลผู้ป่วย โรงพยาบาลโพนนาแก้ว และ รพ.สต. แบบ Real-time</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 text-[11px] text-blue-200/80">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-300" />
                <span>จำกัดการเข้าถึงเฉพาะเจ้าหน้าที่สาธารณสุข</span>
              </div>
              <p className="mt-1 text-[10px] text-blue-300/70">
                กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้งานและรหัสผ่านส่วนบุคคลของท่าน
              </p>
            </div>
          </div>

          {/* Right Authentication Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-white text-slate-800 flex flex-col justify-between">
            <div>
              
              {/* Header */}
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  เข้าสู่ระบบ (Sign In)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระบุชื่อผู้ใช้งานและรหัสผ่านเพื่อยืนยันตัวตน
                </p>
              </div>

              {/* Status Notifications */}
              {errorMessage && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Secure Form Login */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ชื่อผู้ใช้งาน (Username):
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="กรอกชื่อผู้ใช้งานส่วนบุคคล"
                      autoFocus
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3 py-3 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    รหัสผ่าน (Password):
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่าน"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/25 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span>กำลังตรวจสอบสิทธิ์...</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>เข้าสู่ระบบ (Sign In)</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Support info */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>ติดปัญหาการใช้งาน ติดต่อศูนย์ระบาดวิทยา รพ.โพนนาแก้ว</span>
              </div>
              <span className="font-mono font-semibold text-slate-600">042-719123</span>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center text-xs text-slate-400 py-2 z-10">
        <p>
          © 2026 ระบบสารสนเทศระบาดวิทยาและควบคุมโรค อำเภอโพนนาแก้ว จังหวัดสกลนคร • สงวนลิขสิทธิ์สำหรับเจ้าหน้าที่สาธารณสุข
        </p>
      </footer>
    </div>
  );
};
