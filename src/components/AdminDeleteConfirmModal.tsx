import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import { UserSession } from '../types';
import { authService } from '../services/authService';

interface AdminDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemDescription: string;
  currentUser: UserSession;
  onConfirmDelete: () => void;
}

export const AdminDeleteConfirmModal: React.FC<AdminDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  itemDescription,
  currentUser,
  onConfirmDelete,
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';

  const handleConfirm = () => {
    if (isAdmin) {
      onConfirmDelete();
      onClose();
      return;
    }

    // If not admin, require admin password
    if (!adminPassword) {
      setErrorMsg('กรุณากรอกรหัสผ่าน Admin เพื่อยืนยันการลบ');
      return;
    }

    if (authService.verifyAdminPassword(adminPassword)) {
      onConfirmDelete();
      onClose();
    } else {
      setErrorMsg('รหัสผ่าน Admin ไม่ถูกต้อง (ไม่ได้รับอนุญาตให้ลบ)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">{title}</h3>
              <p className="text-[11px] text-red-600">นโยบายความปลอดภัย: เฉพาะ Admin ที่ลบได้</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-red-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-slate-500 text-[11px]">รายการที่ต้องการลบ:</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{itemDescription}</p>
          </div>

          {!isAdmin ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-bold">คุณกำลังใช้งานด้วยสิทธิ์: {currentUser.name}</p>
                  <p className="text-[11px] mt-0.5">
                    ระบบกำหนดให้ <strong>Admin ลบข้อมูลได้แค่คนเดียว</strong> หากต้องการลบ กรุณากรอกรหัสผ่านผู้ดูแลระบบ (Admin Password) เพื่ออนุมัติ
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รหัสผ่าน Admin (Admin Password):
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="กรอกรหัสผ่าน Admin (เช่น admin1234)"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                {errorMsg && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errorMsg}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <p className="font-semibold text-xs">คุณเข้าสู่ระบบด้วยสิทธิ์ <strong>Admin</strong> ได้รับอนุญาตให้ลบข้อมูลได้</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>ยืนยันการลบ</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
