import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Building2,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  X,
  Check,
  Stethoscope
} from 'lucide-react';
import { UserAccount, UserSession, RoleType, UserStatus } from '../types';
import { authService, INITIAL_USER_ACCOUNTS } from '../services/authService';

interface UserManagementViewProps {
  currentUser: UserSession;
  onOpenLoginModal: () => void;
}

const ROLE_LABELS: Record<RoleType, { label: string; group: string; color: string; icon: string }> = {
  admin: { label: 'ผู้ดูแลระบบกลาง (Admin)', group: 'บริหารระบบ', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '👑' },
  head_epi: { label: 'หัวหน้างานระบาดวิทยา', group: 'ระบาดวิทยา/SRRT', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🛡️' },
  srrt_officer: { label: 'เจ้าหน้าที่ SRRT / ระบาดวิทยา', group: 'ระบาดวิทยา/SRRT', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '🔍' },
  pcu_nakaeo: { label: 'รพ.สต.นาแก้ว (ต.นาแก้ว)', group: 'รพ.สต. 5 ตำบล', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🏡' },
  pcu_natong: { label: 'รพ.สต.นาตงวัฒนา (ต.นาตงวัฒนา)', group: 'รพ.สต. 5 ตำบล', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🏡' },
  pcu_banpaen: { label: 'รพ.สต.บ้านแป้น (ต.บ้านแป้น)', group: 'รพ.สต. 5 ตำบล', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🏡' },
  pcu_banphon: { label: 'รพ.สต.บ้านโพน (ต.บ้านโพน)', group: 'รพ.สต. 5 ตำบล', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🏡' },
  pcu_chiang_sue: { label: 'รพ.สต.เชียงสือ (ต.เชียงสือ)', group: 'รพ.สต. 5 ตำบล', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🏡' },
  pcu_bankaeng: { label: 'รพ.สต.บ้านแก้ง', group: 'รพ.สต. 5 ตำบล', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🏡' },
  pcu_natom: { label: 'รพ.สต.นาทม', group: 'รพ.สต. 5 ตำบล', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🏡' },
  er_opd: { label: 'แผนก OPD / ER', group: 'แผนก รพ.', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🏥' },
  ipd: { label: 'หอผู้ป่วยใน (IPD)', group: 'แผนก รพ.', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: '🛏️' },
  lab: { label: 'ห้องปฏิบัติการ (LAB)', group: 'แผนก รพ.', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: '🔬' },
  executive: { label: 'ผู้บริหาร / ผอ.รพ.', group: 'บริหาร', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: '👔' },
};

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onOpenLoginModal
}) => {
  const [accounts, setAccounts] = useState<UserAccount[]>(() => authService.getAccounts());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    password: string;
    role: RoleType;
    department: string;
    hospital: string;
    assignedSubdistrict: string;
    pcuName: string;
    phone: string;
    status: UserStatus;
    canDelete: boolean;
  }>({
    name: '',
    username: '',
    password: '',
    role: 'pcu_nakaeo',
    department: 'หน่วยบริการปฐมภูมิ ตำบลนาแก้ว',
    hospital: 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาแก้ว',
    assignedSubdistrict: 'ตำบลนาแก้ว',
    pcuName: 'รพ.สต.นาแก้ว',
    phone: '',
    status: 'active',
    canDelete: false
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  // Refresh accounts list
  const refreshAccounts = () => {
    setAccounts(authService.getAccounts());
  };

  // Quick auto-populate based on role
  const handleRoleChange = (selectedRole: RoleType) => {
    let dept = formData.department;
    let hosp = formData.hospital;
    let subdist = formData.assignedSubdistrict;
    let pcu = formData.pcuName;

    if (selectedRole === 'admin') {
      dept = 'ศูนย์เทคโนโลยีสารสนเทศและบริหารจัดการข้อมูล';
      hosp = 'โรงพยาบาลโพนนาแก้ว';
      subdist = '';
      pcu = '';
    } else if (selectedRole === 'head_epi') {
      dept = 'กลุ่มงานบริการด้านปฐมภูมิและองค์รวม (งานระบาดวิทยา & SRRT)';
      hosp = 'โรงพยาบาลโพนนาแก้ว';
      subdist = '';
      pcu = '';
    } else if (selectedRole === 'srrt_officer') {
      dept = 'ทีมเฝ้าระวังสอบสวนโรคเคลื่อนที่เร็ว (SRRT)';
      hosp = 'โรงพยาบาลโพนนาแก้ว';
      subdist = '';
      pcu = '';
    } else if (selectedRole === 'pcu_nakaeo') {
      dept = 'หน่วยบริการปฐมภูมิ ตำบลนาแก้ว';
      hosp = 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาแก้ว';
      subdist = 'ตำบลนาแก้ว';
      pcu = 'รพ.สต.นาแก้ว';
    } else if (selectedRole === 'pcu_natong') {
      dept = 'หน่วยบริการปฐมภูมิ ตำบลนาตงวัฒนา';
      hosp = 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาตงวัฒนา';
      subdist = 'ตำบลนาตงวัฒนา';
      pcu = 'รพ.สต.นาตงวัฒนา';
    } else if (selectedRole === 'pcu_banpaen') {
      dept = 'หน่วยบริการปฐมภูมิ ตำบลบ้านแป้น';
      hosp = 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านแป้น';
      subdist = 'ตำบลบ้านแป้น';
      pcu = 'รพ.สต.บ้านแป้น';
    } else if (selectedRole === 'pcu_banphon') {
      dept = 'หน่วยบริการปฐมภูมิ ตำบลบ้านโพน';
      hosp = 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านโพน';
      subdist = 'ตำบลบ้านโพน';
      pcu = 'รพ.สต.บ้านโพน';
    } else if (selectedRole === 'pcu_chiang_sue') {
      dept = 'หน่วยบริการปฐมภูมิ ตำบลเชียงสือ';
      hosp = 'โรงพยาบาลส่งเสริมสุขภาพตำบลเชียงสือ';
      subdist = 'ตำบลเชียงสือ';
      pcu = 'รพ.สต.เชียงสือ';
    } else if (selectedRole === 'er_opd') {
      dept = 'แผนกผู้ป่วยนอกและอุบัติเหตุฉุกเฉิน (OPD/ER)';
      hosp = 'โรงพยาบาลโพนนาแก้ว';
      subdist = '';
      pcu = '';
    } else if (selectedRole === 'ipd') {
      dept = 'หอผู้ป่วยใน (IPD Ward)';
      hosp = 'โรงพยาบาลโพนนาแก้ว';
      subdist = '';
      pcu = '';
    } else if (selectedRole === 'lab') {
      dept = 'กลุ่มงานเทคนิคการแพทย์และชันสูตร (LAB)';
      hosp = 'โรงพยาบาลโพนนาแก้ว';
      subdist = '';
      pcu = '';
    } else if (selectedRole === 'executive') {
      dept = 'คณะกรรมการบริหารโรงพยาบาลโพนนาแก้ว';
      hosp = 'โรงพยาบาลโพนนาแก้ว';
      subdist = '';
      pcu = '';
    }

    setFormData(prev => ({
      ...prev,
      role: selectedRole,
      department: dept,
      hospital: hosp,
      assignedSubdistrict: subdist,
      pcuName: pcu,
      canDelete: selectedRole === 'admin'
    }));
  };

  // Open Create Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'pcu_nakaeo',
      department: 'หน่วยบริการปฐมภูมิ ตำบลนาแก้ว',
      hospital: 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาแก้ว',
      assignedSubdistrict: 'ตำบลนาแก้ว',
      pcuName: 'รพ.สต.นาแก้ว',
      phone: '',
      status: 'active',
      canDelete: false
    });
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (acc: UserAccount) => {
    setEditingUser(acc);
    setFormData({
      name: acc.name,
      username: acc.username,
      password: acc.password,
      role: acc.role,
      department: acc.department || '',
      hospital: acc.hospital || '',
      assignedSubdistrict: acc.assignedSubdistrict || '',
      pcuName: acc.pcuName || '',
      phone: acc.phone || '',
      status: acc.status || 'active',
      canDelete: acc.role === 'admin' ? true : !!acc.canDelete
    });
    setFormError('');
    setFormSuccess('');
  };

  // Save new user
  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim()) {
      setFormError('กรุณาระบุชื่อ-นามสกุล');
      return;
    }
    if (!formData.username.trim()) {
      setFormError('กรุณาระบุชื่อผู้ใช้งาน (Username)');
      return;
    }
    if (!formData.password) {
      setFormError('กรุณากำหนดรหัสผ่าน');
      return;
    }

    const res = authService.addAccount(formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }

    refreshAccounts();
    setFormSuccess(res.message);
    setTimeout(() => {
      setIsAddModalOpen(false);
    }, 600);
  };

  // Save edited user
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim()) {
      setFormError('กรุณาระบุชื่อ-นามสกุล');
      return;
    }
    if (!formData.username.trim()) {
      setFormError('กรุณาระบุชื่อผู้ใช้งาน (Username)');
      return;
    }

    const res = authService.updateAccount(editingUser.id, formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }

    refreshAccounts();
    setFormSuccess(res.message);
    setTimeout(() => {
      setEditingUser(null);
    }, 600);
  };

  // Quick Approve user
  const handleQuickApprove = (acc: UserAccount) => {
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถอนุมัติการใช้งานได้');
      return;
    }
    const res = authService.approveAccount(acc.id, currentUser.name);
    if (res.success) {
      refreshAccounts();
    }
  };

  // Change user status (Active / Pending / Suspended)
  const handleChangeStatus = (acc: UserAccount, status: UserStatus) => {
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเปลี่ยนสถานะได้');
      return;
    }
    const res = authService.setAccountStatus(acc.id, status, currentUser.name);
    if (res.success) {
      refreshAccounts();
    } else {
      alert(res.message);
    }
  };

  // Confirm Delete user
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    const res = authService.deleteAccount(deletingUser.id, currentUser.userId);
    if (res.success) {
      refreshAccounts();
      setDeletingUser(null);
    } else {
      alert(res.message);
    }
  };

  // Reset to default accounts
  const handleResetToDefaults = () => {
    if (confirm('คุณต้องการคืนค่าบัญชีผู้ใช้ทั้งหมดกลับเป็นค่าเริ่มต้นของระบบหรือไม่? ข้อมูลผู้ใช้ที่เพิ่มใหม่จะถูกรีเซ็ต')) {
      authService.resetAccounts();
      refreshAccounts();
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.department && acc.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (acc.pcuName && acc.pcuName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (acc.assignedSubdistrict && acc.assignedSubdistrict.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === 'all' || acc.role === filterRole;
    const matchesStatus = filterStatus === 'all' || (acc.status || 'active') === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = accounts.length;
  const activeUsers = accounts.filter(a => (a.status || 'active') === 'active').length;
  const pendingUsers = accounts.filter(a => a.status === 'pending').length;
  const suspendedUsers = accounts.filter(a => a.status === 'suspended').length;
  const pcuUsers = accounts.filter(a => a.role.startsWith('pcu_')).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">จัดการผู้ใช้งานและสิทธิ์ระบบ (User Management)</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ศูนย์บริหารจัดการบัญชีผู้ใช้งาน เพิ่ม แก้ไข อนุมัติการเข้าถึง และควบคุมสิทธิ์ระบาดวิทยา
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isAdmin ? (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-purple-600/20 transition transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ เพิ่มผู้ใช้งานใหม่</span>
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-2xl shadow-md shadow-amber-500/20 transition"
              title="เข้าสู่ระบบเป็น Admin เพื่อจัดการผู้ใช้"
            >
              <Crown className="w-4 h-4" />
              <span>เข้าสู่ระบบเป็น Admin</span>
            </button>
          )}

          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 transition"
            title="รีเซ็ตบัญชีผู้ใช้เริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">รีเซ็ตบัญชีเริ่มต้น</span>
          </button>
        </div>
      </div>

      {/* Admin Status Notice */}
      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">⚠️ คุณกำลังเข้าใช้งานด้วยสิทธิ์ทั่วไป ({currentUser.name})</p>
            <p className="text-amber-700 mt-0.5 leading-relaxed">
              ฟังก์ชันเพิ่มชื่อผู้ใช้ แก้ไขข้อมูล จัดการอนุมัติการใช้งาน และลบบัญชีผู้ใช้สงวนสิทธิ์เฉพาะ <strong>ผู้ดูแลระบบ (Admin)</strong> เท่านั้น
            </p>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 transition"
          >
            เข้าสู่ระบบ Admin
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400">ผู้ใช้ทั้งหมด</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{totalUsers}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">ในฐานข้อมูลระบบ</p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-700">อนุมัติแล้ว (Active)</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeUsers}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">เข้าใช้งานได้ทันที</p>
        </div>

        <div className={`bg-white border rounded-2xl p-4 shadow-xs ${
          pendingUsers > 0 ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-700">รออนุมัติ (Pending)</p>
            <Clock className={`w-4 h-4 ${pendingUsers > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">{pendingUsers}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">ต้องได้รับการอนุมัติ</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-red-700">ระงับการใช้งาน</p>
            <Ban className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-700 mt-1">{suspendedUsers}</p>
          <p className="text-[10px] text-red-500 mt-0.5">ล็อกอินไม่ได้</p>
        </div>

        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-blue-700">รพ.สต. 5 ตำบล</p>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-1">{pcuUsers}</p>
          <p className="text-[10px] text-blue-600 mt-0.5">เจ้าหน้าที่ภาคสนาม</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, Username, แผนก, รพ.สต..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'all' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({totalUsers})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>รออนุมัติ</span>
              {pendingUsers > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-amber-700 rounded-full text-[10px] font-bold">
                  {pendingUsers}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'active' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ใช้งานปกติ ({activeUsers})
            </button>
            <button
              onClick={() => setFilterStatus('suspended')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'suspended' ? 'bg-red-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ถูกระงับ ({suspendedUsers})
            </button>
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">ทุกบทบาท/สิทธิ์</option>
            <option value="admin">👑 Admin</option>
            <option value="head_epi">🛡️ หัวหน้างานระบาด</option>
            <option value="srrt_officer">🔍 เจ้าหน้าที่ SRRT</option>
            <option value="pcu_nakaeo">🏡 รพ.สต.นาแก้ว</option>
            <option value="pcu_natong">🏡 รพ.สต.นาตงวัฒนา</option>
            <option value="pcu_banpaen">🏡 รพ.สต.บ้านแป้น</option>
            <option value="pcu_banphon">🏡 รพ.สต.บ้านโพน</option>
            <option value="pcu_chiang_sue">🏡 รพ.สต.เชียงสือ</option>
            <option value="er_opd">🏥 OPD / ER</option>
            <option value="ipd">🛏️ หอผู้ป่วยใน (IPD)</option>
            <option value="lab">🔬 ห้อง LAB</option>
            <option value="executive">👔 ผู้บริหาร</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ผู้ใช้งาน (User Profile)</th>
                <th className="py-3.5 px-4">Username & สิทธิ์</th>
                <th className="py-3.5 px-4">หน่วยงาน / พื้นที่รับผิดชอบ</th>
                <th className="py-3.5 px-4">สถานะการอนุมัติ</th>
                <th className="py-3.5 px-4">สิทธิ์ลบข้อมูล</th>
                <th className="py-3.5 px-4 text-center">การจัดการ (Admin Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <p className="text-sm font-semibold">ไม่พบบัญชีผู้ใช้งานตามเงื่อนไขการค้นหา</p>
                    <p className="text-xs mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองบทบาท</p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const roleMeta = ROLE_LABELS[acc.role] || { label: acc.role, color: 'bg-slate-100 text-slate-700', icon: '👤' };
                  const isCurrentSessionUser = currentUser.userId === acc.id;
                  const isSuperAdmin = acc.id === 'usr_admin' || acc.username === 'admin';
                  const userStatus = acc.status || 'active';

                  return (
                    <tr 
                      key={acc.id}
                      className={`hover:bg-slate-50/80 transition ${
                        userStatus === 'pending' ? 'bg-amber-50/30' : userStatus === 'suspended' ? 'bg-red-50/20 opacity-80' : ''
                      }`}
                    >
                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            acc.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : acc.role.startsWith('pcu_')
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {roleMeta.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">{acc.name}</span>
                              {isCurrentSessionUser && (
                                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 font-bold rounded-md text-[9px]">
                                  คุณ (Active Session)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              {acc.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{acc.phone}</span>
                                </span>
                              )}
                              {acc.createdAt && (
                                <span className="text-[10px] text-slate-400">
                                  สร้างเมื่อ: {new Date(acc.createdAt).toLocaleDateString('th-TH')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username & Role */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-800">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                              {acc.username}
                            </span>
                          </div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${roleMeta.color}`}>
                            {roleMeta.label}
                          </span>
                        </div>
                      </td>

                      {/* Hospital & Assigned Area */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-800 text-xs">{acc.department}</p>
                          <p className="text-[11px] text-slate-500">{acc.hospital}</p>
                          {acc.assignedSubdistrict && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-semibold">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              <span>พื้นที่: {acc.assignedSubdistrict} ({acc.pcuName})</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {userStatus === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>อนุมัติแล้ว (Active)</span>
                            </span>
                          )}
                          {userStatus === 'pending' && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] animate-pulse">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>รออนุมัติ (Pending)</span>
                              </span>
                              {isAdmin && (
                                <div>
                                  <button
                                    onClick={() => handleQuickApprove(acc)}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition"
                                  >
                                    ✓ อนุมัติทันที
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {userStatus === 'suspended' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-100 text-red-800 border border-red-200 font-bold text-[11px]">
                              <Ban className="w-3.5 h-3.5 text-red-600" />
                              <span>ถูกระงับการใช้งาน</span>
                            </span>
                          )}
                          {acc.approvedBy && userStatus === 'active' && (
                            <p className="text-[9px] text-slate-400">
                              อนุมัติโดย: {acc.approvedBy}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Deletion Permission */}
                      <td className="py-3.5 px-4">
                        {acc.canDelete ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] border border-purple-200">
                            <Crown className="w-3 h-3 text-purple-600" />
                            <span>👑 มีสิทธิ์ลบข้อมูล</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">ไม่มีสิทธิ์</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isAdmin ? (
                            <>
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEditModal(acc)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition border border-transparent hover:border-blue-200"
                                title="แก้ไขข้อมูลผู้ใช้และรหัสผ่าน"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Toggle Status Dropdown or Button */}
                              {userStatus === 'active' ? (
                                <button
                                  onClick={() => handleChangeStatus(acc, 'suspended')}
                                  disabled={isSuperAdmin}
                                  className={`p-2 rounded-xl transition ${
                                    isSuperAdmin 
                                      ? 'text-slate-300 cursor-not-allowed' 
                                      : 'text-amber-600 hover:bg-amber-50 hover:border-amber-200'
                                  }`}
                                  title={isSuperAdmin ? 'ไม่สามารถระงับ Super Admin ได้' : 'ระงับการใช้งานชั่วคราว'}
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleChangeStatus(acc, 'active')}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                                  title="อนุมัติ / เปิดใช้งาน"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => setDeletingUser(acc)}
                                disabled={isSuperAdmin || isCurrentSessionUser}
                                className={`p-2 rounded-xl transition ${
                                  isSuperAdmin || isCurrentSessionUser
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-red-500 hover:bg-red-50 hover:border-red-200'
                                }`}
                                title={
                                  isSuperAdmin 
                                    ? 'ไม่อนุญาตให้ลบ Super Admin' 
                                    : isCurrentSessionUser 
                                    ? 'ไม่สามารถลบบัญชีที่กำลังล็อกอินอยู่ได้' 
                                    : 'ลบบัญชีผู้ใช้งาน'
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">ต้องการสิทธิ์ Admin</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white relative">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-5 right-5 p-1 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">เพิ่มผู้ใช้งานใหม่ (Add User)</h2>
                  <p className="text-xs text-purple-100 mt-0.5">
                    สร้างบัญชี กำหนดบทบาท และสิทธิ์การเข้าถึงระบบระบาดวิทยา
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveAddUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล และตำแหน่ง (Full Name): <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น นวก.สธ. สุชาติ ดวงจันทร์ (รพ.สต.นาแก้ว)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                  required
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username): <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="เช่น suchart_nk"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รหัสผ่าน (Password): <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="กำหนดรหัสผ่าน"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-3.5 pr-10 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  บทบาท / สิทธิ์การเข้าถึง (Role): <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                >
                  <optgroup label="ผู้ดูแลและทีมระบาดวิทยา">
                    <option value="admin">👑 ผู้ดูแลระบบกลาง (Admin) - มีสิทธิ์ลบข้อมูล</option>
                    <option value="head_epi">🛡️ หัวหน้างานระบาดวิทยา (โรงพยาบาลโพนนาแก้ว)</option>
                    <option value="srrt_officer">🔍 ทีมเฝ้าระวังสอบสวนโรค SRRT</option>
                  </optgroup>
                  <optgroup label="รพ.สต. 5 ตำบล (อำเภอโพนนาแก้ว)">
                    <option value="pcu_nakaeo">🏡 รพ.สต.นาแก้ว (ตำบลนาแก้ว)</option>
                    <option value="pcu_natong">🏡 รพ.สต.นาตงวัฒนา (ตำบลนาตงวัฒนา)</option>
                    <option value="pcu_banpaen">🏡 รพ.สต.บ้านแป้น (ตำบลบ้านแป้น)</option>
                    <option value="pcu_banphon">🏡 รพ.สต.บ้านโพน (ตำบลบ้านโพน)</option>
                    <option value="pcu_chiang_sue">🏡 รพ.สต.เชียงสือ (ตำบลเชียงสือ)</option>
                  </optgroup>
                  <optgroup label="แผนกในโรงพยาบาล">
                    <option value="er_opd">🏥 แผนก OPD / ER</option>
                    <option value="ipd">🛏️ หอผู้ป่วยใน (IPD)</option>
                    <option value="lab">🔬 กลุ่มงานเทคนิคการแพทย์ (LAB)</option>
                    <option value="executive">👔 คณะกรรมการบริหาร / ผู้อำนวยการ</option>
                  </optgroup>
                </select>
              </div>

              {/* Department & Hospital */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">กลุ่มงาน / แผนก (Department):</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">โรงพยาบาล / รพ.สต.:</label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Subdistrict Assignment (If PCU) */}
              {formData.role.startsWith('pcu_') && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>การมอบหมายพื้นที่ตำบลและ รพ.สต.:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-emerald-800 font-semibold">ตำบลที่รับผิดชอบ:</label>
                      <input
                        type="text"
                        value={formData.assignedSubdistrict}
                        onChange={(e) => setFormData({ ...formData, assignedSubdistrict: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-emerald-800 font-semibold">ชื่อ รพ.สต.:</label>
                      <input
                        type="text"
                        value={formData.pcuName}
                        onChange={(e) => setFormData({ ...formData, pcuName: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Phone & Initial Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="เช่น 081-2345678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สถานะการอนุมัติแรกเริ่ม:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option value="active">🟢 อนุมัติใช้งานได้ทันที (Active)</option>
                    <option value="pending">🟡 รอการอนุมัติ (Pending Approval)</option>
                    <option value="suspended">🔴 ระงับการใช้งาน (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Can Delete Data Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-100 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canDelete}
                    disabled={formData.role === 'admin'}
                    onChange={(e) => setFormData({ ...formData, canDelete: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <div>
                    <p className="font-bold text-purple-900">อนุญาตให้ลบข้อมูลผู้ป่วยและรายงานได้ (canDelete)</p>
                    <p className="text-[10px] text-purple-700">โดยมาตรฐานจะอนุญาตเฉพาะบทบาท Admin</p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกผู้ใช้งานใหม่</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white relative">
              <button
                onClick={() => setEditingUser(null)}
                className="absolute top-5 right-5 p-1 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">แก้ไขข้อมูลผู้ใช้งาน (Edit User)</h2>
                  <p className="text-xs text-blue-100 mt-0.5">
                    ปรับปรุงข้อมูลส่วนตัว รหัสผ่าน และสิทธิ์การใช้งาน
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล (Full Name): <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username): <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รหัสผ่าน (Password):
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="เปลี่ยนรหัสผ่าน"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-3.5 pr-10 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  บทบาท / สิทธิ์การเข้าถึง (Role):
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as RoleType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <optgroup label="ผู้ดูแลและทีมระบาดวิทยา">
                    <option value="admin">👑 ผู้ดูแลระบบกลาง (Admin)</option>
                    <option value="head_epi">🛡️ หัวหน้างานระบาดวิทยา</option>
                    <option value="srrt_officer">🔍 ทีมเฝ้าระวังสอบสวนโรค SRRT</option>
                  </optgroup>
                  <optgroup label="รพ.สต. 5 ตำบล">
                    <option value="pcu_nakaeo">🏡 รพ.สต.นาแก้ว (ตำบลนาแก้ว)</option>
                    <option value="pcu_natong">🏡 รพ.สต.นาตงวัฒนา (ตำบลนาตงวัฒนา)</option>
                    <option value="pcu_banpaen">🏡 รพ.สต.บ้านแป้น (ตำบลบ้านแป้น)</option>
                    <option value="pcu_banphon">🏡 รพ.สต.บ้านโพน (ตำบลบ้านโพน)</option>
                    <option value="pcu_chiang_sue">🏡 รพ.สต.เชียงสือ (ตำบลเชียงสือ)</option>
                  </optgroup>
                  <optgroup label="แผนกในโรงพยาบาล">
                    <option value="er_opd">🏥 แผนก OPD / ER</option>
                    <option value="ipd">🛏️ หอผู้ป่วยใน (IPD)</option>
                    <option value="lab">🔬 กลุ่มงานเทคนิคการแพทย์ (LAB)</option>
                    <option value="executive">👔 คณะกรรมการบริหาร / ผู้อำนวยการ</option>
                  </optgroup>
                </select>
              </div>

              {/* Status Management */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  สถานะการอนุมัติการใช้งาน (Activation Status):
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold"
                >
                  <option value="active">🟢 อนุมัติแล้ว (Active - ใช้งานได้ปกติ)</option>
                  <option value="pending">🟡 รอการอนุมัติ (Pending Approval - ล็อกอินไม่ได้)</option>
                  <option value="suspended">🔴 ระงับการใช้งาน (Suspended - ล็อกอินไม่ได้)</option>
                </select>
              </div>

              {/* Department & Hospital */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">แผนก / สังกัด:</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Subdistrict Assignment (If PCU) */}
              {formData.role.startsWith('pcu_') && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>ตำบลและ รพ.สต. ที่รับผิดชอบ:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-emerald-800 font-semibold">ตำบล:</label>
                      <input
                        type="text"
                        value={formData.assignedSubdistrict}
                        onChange={(e) => setFormData({ ...formData, assignedSubdistrict: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-emerald-800 font-semibold">รพ.สต.:</label>
                      <input
                        type="text"
                        value={formData.pcuName}
                        onChange={(e) => setFormData({ ...formData, pcuName: e.target.value })}
                        className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 p-6 space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-800">ยืนยันการลบบัญชีผู้ใช้งาน</h3>
              <p className="text-xs text-slate-500">
                คุณกำลังจะลบบัญชีของ <strong>{deletingUser.name}</strong> (Username: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{deletingUser.username}</code>)
              </p>
            </div>

            <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-[11px] text-red-800">
              ⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้ บัญชีนี้จะไม่สามารถเข้าสู่ระบบหรือปฏิบัติงานได้อีก
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-red-600/20 transition"
              >
                ยืนยันลบผู้ใช้งาน
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
