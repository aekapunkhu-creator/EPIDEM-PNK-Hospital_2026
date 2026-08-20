import React, { useState } from 'react';
import {
  Lock,
  User,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X
} from 'lucide-react';
import { UserSession } from '../types';
import { authService } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้งาน (Username) และรหัสผ่าน (Password)');
      return;
    }

    setIsLoading(true);
    const res = authService.login(username, password);
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onLoginSuccess(res.user!);
        onClose();
      }, 500);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">เข้าสู่ระบบ (Login)</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                ระบบระบาดวิทยา โรงพยาบาลโพนนาแก้ว
              </p>
            </div>
          </div>
        </div>

        {/* Current User Status Banner */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">ผู้ใช้งานปัจจุบัน:</span>
            <strong className="text-slate-800 font-semibold">{currentUser.name}</strong>
          </div>
          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
            currentUser.role === 'admin' 
              ? 'bg-purple-100 text-purple-700' 
              : currentUser.role.startsWith('pcu_')
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {currentUser.role === 'admin' ? '👑 Admin' : currentUser.pcuName || currentUser.role}
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {/* Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="กรอกชื่อผู้ใช้งาน เช่น admin, pcu_nakaeo"
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

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
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
