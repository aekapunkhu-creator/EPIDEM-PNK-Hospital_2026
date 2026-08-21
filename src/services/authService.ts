import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UserAccount, UserSession, RoleType, UserStatus } from '../types';

const AUTH_STORAGE_KEY = 'pnk_epi_current_user_v1';
const USERS_STORAGE_KEY = 'pnk_epi_users_accounts_v2';

// Initial pre-configured user accounts with distinct roles and subdistrict assignments
export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    password: 'admin1234',
    name: 'นายอดิศักดิ์ ศรีวิชัย (ผู้ดูแลระบบกลาง)',
    role: 'admin',
    department: 'ศูนย์เทคโนโลยีสารสนเทศและบริหารจัดการข้อมูล',
    hospital: 'โรงพยาบาลโพนนาแก้ว',
    phone: '042-719123',
    canDelete: true, // Only Admin can delete data!
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
    approvedAt: '2026-01-01T08:00:00.000Z',
    approvedBy: 'System Super Admin'
  },
  {
    id: 'usr_head_epi',
    username: 'head_epi',
    password: 'epi1234',
    name: 'นวก.สธ. เอกพันธ์ ขันติ (หัวหน้างานระบาดวิทยา)',
    role: 'head_epi',
    department: 'กลุ่มงานบริการด้านปฐมภูมิและองค์รวม (งานระบาดวิทยา & SRRT)',
    hospital: 'โรงพยาบาลโพนนาแก้ว',
    phone: '081-2345678',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-02T08:30:00.000Z',
    approvedAt: '2026-01-02T09:00:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  {
    id: 'usr_srrt',
    username: 'srrt',
    password: 'srrt1234',
    name: 'พว.วาสนา จันทร์เพ็ญ (ทีมสอบสวนโรค SRRT)',
    role: 'srrt_officer',
    department: 'ทีมเฝ้าระวังสอบสวนโรคเคลื่อนที่เร็ว (SRRT)',
    hospital: 'โรงพยาบาลโพนนาแก้ว',
    phone: '089-9876543',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-05T09:00:00.000Z',
    approvedAt: '2026-01-05T09:30:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  // รพ.สต. 5 ตำบล
  {
    id: 'usr_pcu_nakaeo',
    username: 'pcu_nakaeo',
    password: 'nakaeo1234',
    name: 'จพ.สธ. สมชาย ใจมั่น (รพ.สต.นาแก้ว)',
    role: 'pcu_nakaeo',
    department: 'หน่วยบริการปฐมภูมิ ตำบลนาแก้ว',
    hospital: 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาแก้ว',
    assignedSubdistrict: 'ตำบลนาแก้ว',
    pcuName: 'รพ.สต.นาแก้ว',
    phone: '042-719201',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-10T10:00:00.000Z',
    approvedAt: '2026-01-10T10:15:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  {
    id: 'usr_pcu_natong',
    username: 'pcu_natong',
    password: 'natong1234',
    name: 'นวก.สธ. อภิชาติ ปานแก้ว (รพ.สต.นาตงวัฒนา)',
    role: 'pcu_natong',
    department: 'หน่วยบริการปฐมภูมิ ตำบลนาตงวัฒนา',
    hospital: 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาตงวัฒนา',
    assignedSubdistrict: 'ตำบลนาตงวัฒนา',
    pcuName: 'รพ.สต.นาตงวัฒนา',
    phone: '042-719202',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-10T10:30:00.000Z',
    approvedAt: '2026-01-10T10:45:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  {
    id: 'usr_pcu_banpaen',
    username: 'pcu_banpaen',
    password: 'banpaen1234',
    name: 'พว.รัตนา เกษมสุข (รพ.สต.บ้านแป้น)',
    role: 'pcu_banpaen',
    department: 'หน่วยบริการปฐมภูมิ ตำบลบ้านแป้น',
    hospital: 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านแป้น',
    assignedSubdistrict: 'ตำบลบ้านแป้น',
    pcuName: 'รพ.สต.บ้านแป้น',
    phone: '042-719203',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-11T08:00:00.000Z',
    approvedAt: '2026-01-11T08:15:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  {
    id: 'usr_pcu_banphon',
    username: 'pcu_banphon',
    password: 'banphon1234',
    name: 'จพ.สธ. สุริยา วงศ์สว่าง (รพ.สต.บ้านโพน)',
    role: 'pcu_banphon',
    department: 'หน่วยบริการปฐมภูมิ ตำบลบ้านโพน',
    hospital: 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านโพน',
    assignedSubdistrict: 'ตำบลบ้านโพน',
    pcuName: 'รพ.สต.บ้านโพน',
    phone: '042-719204',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-11T08:30:00.000Z',
    approvedAt: '2026-01-11T08:45:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  {
    id: 'usr_pcu_chiang_sue',
    username: 'pcu_chiang_sue',
    password: 'chiangsue1234',
    name: 'พว.กนกพร พรหมมา (รพ.สต.เชียงสือ)',
    role: 'pcu_chiang_sue',
    department: 'หน่วยบริการปฐมภูมิ ตำบลเชียงสือ',
    hospital: 'โรงพยาบาลส่งเสริมสุขภาพตำบลเชียงสือ',
    assignedSubdistrict: 'ตำบลเชียงสือ',
    pcuName: 'รพ.สต.เชียงสือ',
    phone: '042-719205',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-11T09:00:00.000Z',
    approvedAt: '2026-01-11T09:15:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  // แผนกในโรงพยาบาล
  {
    id: 'usr_er_opd',
    username: 'er_opd',
    password: 'opd1234',
    name: 'พญ.ชลธิชา สัตยารักษ์ (แพทย์เวร OPD & ER)',
    role: 'er_opd',
    department: 'แผนกผู้ป่วยนอกและอุบัติเหตุฉุกเฉิน (OPD/ER)',
    hospital: 'โรงพยาบาลโพนนาแก้ว',
    phone: '042-719111',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-12T08:00:00.000Z',
    approvedAt: '2026-01-12T08:30:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  {
    id: 'usr_ipd',
    username: 'ipd',
    password: 'ipd1234',
    name: 'พว.สุดารัตน์ ใจดี (พยาบาลหอผู้ป่วยใน)',
    role: 'ipd',
    department: 'หอผู้ป่วยใน (IPD Ward)',
    hospital: 'โรงพยาบาลโพนนาแก้ว',
    phone: '042-719112',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-12T08:30:00.000Z',
    approvedAt: '2026-01-12T09:00:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  {
    id: 'usr_lab',
    username: 'lab',
    password: 'lab1234',
    name: 'ทนพ.สมศักดิ์ วิจัยผล (นักเทคนิคการแพทย์)',
    role: 'lab',
    department: 'กลุ่มงานเทคนิคการแพทย์และชันสูตร (LAB)',
    hospital: 'โรงพยาบาลโพนนาแก้ว',
    phone: '042-719113',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-12T09:00:00.000Z',
    approvedAt: '2026-01-12T09:30:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  {
    id: 'usr_exec',
    username: 'exec',
    password: 'exec1234',
    name: 'นพ.ธนวัฒน์ เจนกิจ (ผู้อำนวยการโรงพยาบาล)',
    role: 'executive',
    department: 'คณะกรรมการบริหารโรงพยาบาลโพนนาแก้ว',
    hospital: 'โรงพยาบาลโพนนาแก้ว',
    phone: '042-719100',
    canDelete: false,
    status: 'active',
    createdAt: '2026-01-12T10:00:00.000Z',
    approvedAt: '2026-01-12T10:30:00.000Z',
    approvedBy: 'นายอดิศักดิ์ ศรีวิชัย (Admin)'
  },
  {
    id: 'usr_pcu_trainee_1',
    username: 'trainee_nakaeo',
    password: 'pass1234',
    name: 'นายกิตติศักดิ์ มิ่งขวัญ (นวก.สธ. บรรจุใหม่)',
    role: 'pcu_nakaeo',
    department: 'หน่วยบริการปฐมภูมิ ตำบลนาแก้ว',
    hospital: 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาแก้ว',
    assignedSubdistrict: 'ตำบลนาแก้ว',
    pcuName: 'รพ.สต.นาแก้ว',
    phone: '082-3456789',
    canDelete: false,
    status: 'pending',
    createdAt: '2026-02-18T14:20:00.000Z'
  }
];

let cachedAccounts: UserAccount[] = [];
let isAuthListenerInitialized = false;

type AuthSyncListener = () => void;
const authListeners = new Set<AuthSyncListener>();

function notifyAuthListeners() {
  authListeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Error in auth sync listener', e);
    }
  });
}

export const authService = {
  // Subscribe to live user account updates
  subscribe(listener: AuthSyncListener): () => void {
    authListeners.add(listener);
    return () => {
      authListeners.delete(listener);
    };
  },

  // Initialize and attach Firestore listener for accounts
  initAuthListener(): void {
    if (isAuthListenerInitialized) return;
    isAuthListenerInitialized = true;

    // Load initial local
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    cachedAccounts = raw ? JSON.parse(raw) : INITIAL_USER_ACCOUNTS;

    try {
      onSnapshot(collection(db, 'user_accounts'), async (snapshot) => {
        if (snapshot.empty) {
          // Seed accounts to Firestore
          for (const acc of INITIAL_USER_ACCOUNTS) {
            await setDoc(doc(db, 'user_accounts', acc.id), acc);
          }
          return;
        }

        const accounts: UserAccount[] = [];
        snapshot.forEach(docSnap => {
          accounts.push(docSnap.data() as UserAccount);
        });

        cachedAccounts = accounts;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
        notifyAuthListeners();
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'user_accounts');
      });
    } catch (e) {
      console.error('Error starting user accounts Firestore sync', e);
    }
  },

  // Get all user accounts
  getAccounts(): UserAccount[] {
    this.initAuthListener();
    if (cachedAccounts.length > 0) return cachedAccounts;
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USER_ACCOUNTS));
      return INITIAL_USER_ACCOUNTS;
    }
    try {
      const parsed: UserAccount[] = JSON.parse(raw);
      return parsed.map(acc => ({
        ...acc,
        status: acc.status || 'active'
      }));
    } catch {
      return INITIAL_USER_ACCOUNTS;
    }
  },

  // Save accounts
  saveAccounts(accounts: UserAccount[]): void {
    cachedAccounts = accounts;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  },

  // Add a new user account (Admin feature)
  addAccount(accountData: Omit<UserAccount, 'id'>): { success: boolean; message: string; account?: UserAccount } {
    const accounts = this.getAccounts();
    const cleanUsername = accountData.username.trim().toLowerCase();

    if (!cleanUsername) {
      return { success: false, message: 'กรุณาระบุชื่อผู้ใช้งาน (Username)' };
    }

    if (accounts.some(a => a.username.trim().toLowerCase() === cleanUsername)) {
      return { success: false, message: `ชื่อผู้ใช้งาน "${accountData.username}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น` };
    }

    const newAccount: UserAccount = {
      ...accountData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      status: accountData.status || 'active',
      createdAt: new Date().toISOString(),
      canDelete: accountData.role === 'admin' ? true : !!accountData.canDelete
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);

    // Save to Firestore asynchronously
    setDoc(doc(db, 'user_accounts', newAccount.id), newAccount).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `user_accounts/${newAccount.id}`);
    });

    return { success: true, message: `เพิ่มผู้ใช้งาน "${newAccount.name}" เรียบร้อยแล้ว (บันทึกลง Cloud Firestore)`, account: newAccount };
  },

  // Edit / Update existing user account (Admin feature)
  updateAccount(id: string, updates: Partial<UserAccount>): { success: boolean; message: string; account?: UserAccount } {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(a => a.id === id);

    if (index === -1) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้งานที่ต้องการแก้ไข' };
    }

    // Check if new username collides with another user
    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      const collision = accounts.find(a => a.id !== id && a.username.trim().toLowerCase() === cleanUsername);
      if (collision) {
        return { success: false, message: `ชื่อผู้ใช้งาน "${updates.username}" ซ้ำกับผู้ใช้อื่นในระบบ` };
      }
      updates.username = cleanUsername;
    }

    // If role is admin, ensure canDelete is true
    if (updates.role === 'admin') {
      updates.canDelete = true;
    }

    const updatedAccount = {
      ...accounts[index],
      ...updates
    };

    accounts[index] = updatedAccount;
    this.saveAccounts(accounts);

    // Save to Firestore asynchronously
    setDoc(doc(db, 'user_accounts', id), updatedAccount).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `user_accounts/${id}`);
    });

    // If updating current logged in user, refresh session
    const currentSession = this.getCurrentUser();
    if (currentSession && currentSession.userId === id) {
      const updatedSession: UserSession = {
        ...currentSession,
        name: updatedAccount.name,
        role: updatedAccount.role,
        department: updatedAccount.department,
        hospital: updatedAccount.hospital,
        assignedSubdistrict: updatedAccount.assignedSubdistrict,
        pcuName: updatedAccount.pcuName,
        username: updatedAccount.username
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
    }

    return { success: true, message: `แก้ไขข้อมูลผู้ใช้งาน "${updatedAccount.name}" สำเร็จ (ซิงค์ Cloud เรียบร้อย)`, account: updatedAccount };
  },

  // Delete user account (Admin feature)
  deleteAccount(id: string, currentUserId?: string): { success: boolean; message: string } {
    const accounts = this.getAccounts();
    const target = accounts.find(a => a.id === id);

    if (!target) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้งานที่ต้องการลบ' };
    }

    // Safety Protection: Do not allow deleting the primary super admin
    if (target.id === 'usr_admin' || target.username === 'admin') {
      return { success: false, message: 'ไม่อนุญาตให้ลบบัญชีผู้ดูแลระบบหลัก (Super Admin)' };
    }

    // Safety Protection: Do not allow deleting one's own currently active session
    if (currentUserId && target.id === currentUserId) {
      return { success: false, message: 'ไม่สามารถลบบัญชีที่คุณกำลังใช้งานอยู่ในขณะนี้ได้' };
    }

    const filtered = accounts.filter(a => a.id !== id);
    this.saveAccounts(filtered);

    deleteDoc(doc(db, 'user_accounts', id)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `user_accounts/${id}`);
    });

    return { success: true, message: `ลบบัญชีผู้ใช้งาน "${target.name}" ออกจากระบบเรียบร้อยแล้ว` };
  },

  // Approve a user account (Admin feature)
  approveAccount(id: string, adminName: string): { success: boolean; message: string; account?: UserAccount } {
    return this.setAccountStatus(id, 'active', adminName);
  },

  // Toggle or change account status (Active, Pending, Suspended)
  setAccountStatus(id: string, status: UserStatus, adminName?: string): { success: boolean; message: string; account?: UserAccount } {
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.id === id);

    if (!account) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้งาน' };
    }

    if (account.id === 'usr_admin' && status !== 'active') {
      return { success: false, message: 'ไม่สามารถระงับหรือปิดการใช้งานบัญชี Super Admin ได้' };
    }

    account.status = status;
    if (status === 'active' && !account.approvedAt) {
      account.approvedAt = new Date().toISOString();
      if (adminName) account.approvedBy = adminName;
    }

    this.saveAccounts(accounts);

    setDoc(doc(db, 'user_accounts', id), account).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `user_accounts/${id}`);
    });

    const statusText = status === 'active' ? 'อนุมัติเปิดใช้งาน' : status === 'pending' ? 'ตั้งค่ารออนุมัติ' : 'ระงับการใช้งานชั่วคราว';
    return { success: true, message: `${statusText} บัญชี "${account.name}" สำเร็จ`, account };
  },

  // Get current logged in user session (returns null if not logged in)
  getCurrentUser(): UserSession | null {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const session: UserSession = JSON.parse(raw);
        // Verify account exists and is not suspended
        const accounts = this.getAccounts();
        const account = accounts.find(a => a.id === session.userId || a.username === session.username);
        if (account && account.status !== 'suspended') {
          return session;
        }
      } catch {}
    }
    // Return null so user is prompted with the Login Screen
    return null;
  },

  // Authenticate user with username and password with status checks
  login(username: string, password: string): { success: boolean; message: string; user?: UserSession } {
    this.initAuthListener();
    const accounts = this.getAccounts();
    const account = accounts.find(
      a => a.username.trim().toLowerCase() === username.trim().toLowerCase()
    );

    if (!account) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' };
    }

    if (account.password !== password) {
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
    }

    // Check account status
    if (account.status === 'pending') {
      return { 
        success: false, 
        message: 'บัญชีนี้อยู่ระหว่าง "รอการอนุมัติการใช้งาน" จากผู้ดูแลระบบ (Admin) กรุณาติดต่อผู้ดูแลระบบ' 
      };
    }

    if (account.status === 'suspended') {
      return { 
        success: false, 
        message: 'บัญชีนี้ "ถูกระงับการใช้งานชั่วคราว" โดยผู้ดูแลระบบ กรุณาติดต่อผู้ดูแลระบบ' 
      };
    }

    const session: UserSession = {
      userId: account.id,
      name: account.name,
      role: account.role,
      department: account.department,
      hospital: account.hospital,
      district: 'โพนนาแก้ว',
      province: 'สกลนคร',
      assignedSubdistrict: account.assignedSubdistrict,
      pcuName: account.pcuName,
      username: account.username,
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return { success: true, message: 'เข้าสู่ระบบสำเร็จ', user: session };
  },

  // Quick switch (for demo / fast testing)
  quickSwitchAccount(accountId: string): UserSession | null {
    this.initAuthListener();
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.id === accountId);
    if (!account || account.status === 'suspended') return null;

    const session: UserSession = {
      userId: account.id,
      name: account.name,
      role: account.role,
      department: account.department,
      hospital: account.hospital,
      district: 'โพนนาแก้ว',
      province: 'สกลนคร',
      assignedSubdistrict: account.assignedSubdistrict,
      pcuName: account.pcuName,
      username: account.username,
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  // Logout - completely clears current session
  logout(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Check if current user has permission to delete data
  canDelete(user: UserSession | null): boolean {
    if (!user) return false;
    return user.role === 'admin';
  },

  // Verify Admin password for elevation
  verifyAdminPassword(password: string): boolean {
    const accounts = this.getAccounts();
    const admin = accounts.find(a => a.role === 'admin');
    return admin ? admin.password === password : password === 'admin1234';
  },

  // Reset accounts to default initial list
  resetAccounts(): UserAccount[] {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USER_ACCOUNTS));
    cachedAccounts = INITIAL_USER_ACCOUNTS;
    for (const acc of INITIAL_USER_ACCOUNTS) {
      setDoc(doc(db, 'user_accounts', acc.id), acc).catch(console.error);
    }
    return INITIAL_USER_ACCOUNTS;
  }
};
