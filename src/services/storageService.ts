import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import {
  ref as rtdbRef,
  set as rtdbSet,
  remove as rtdbRemove,
  onValue as rtdbOnValue,
  get as rtdbGet
} from 'firebase/database';
import { db, rtdb, RTDB_URL, handleFirestoreError, OperationType, testFirebaseConnection } from './firebase';
import {
  DiseaseReport,
  Investigation,
  ContactPerson,
  ControlActivity,
  OutbreakEvent,
  EpiAlert,
  UserSession,
  RoleType
} from '../types';
import {
  INITIAL_USER,
  INITIAL_REPORTS,
  INITIAL_INVESTIGATIONS,
  INITIAL_CONTACTS,
  INITIAL_CONTROL_ACTIVITIES,
  INITIAL_OUTBREAKS,
  INITIAL_ALERTS
} from '../data/mockData';

const STORAGE_KEYS = {
  USER: 'pnk_epi_user',
  REPORTS: 'pnk_epi_reports',
  INVESTIGATIONS: 'pnk_epi_investigations',
  CONTACTS: 'pnk_epi_contacts',
  CONTROL_ACTIVITIES: 'pnk_epi_control_activities',
  OUTBREAKS: 'pnk_epi_outbreaks',
  ALERTS: 'pnk_epi_alerts',
  INITIALIZED: 'pnk_epi_initialized_v5',
  CLEARED_MOCK: 'pnk_cleared_mock_patient_v2',
};

function cleanForFirebase<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// In-memory synced stores
let cachedReports: DiseaseReport[] = [];
let cachedInvestigations: Investigation[] = [];
let cachedContacts: ContactPerson[] = [];
let cachedControlActivities: ControlActivity[] = [];
let cachedOutbreaks: OutbreakEvent[] = [];
let cachedAlerts: EpiAlert[] = [];

// Subscribers list
type SyncListener = () => void;
const listeners = new Set<SyncListener>();

let isFirebaseConnected = false;
let isInitialized = false;
let lastSyncTimestamp: Date = new Date();

function notifyListeners() {
  lastSyncTimestamp = new Date();
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Error in sync listener', e);
    }
  });
}

export const storageService = {
  // Subscribe to live cloud data updates
  subscribe(listener: SyncListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getCloudSyncStatus(): { isConnected: boolean; lastSync: Date; rtdbUrl: string } {
    return {
      isConnected: isFirebaseConnected,
      lastSync: lastSyncTimestamp,
      rtdbUrl: RTDB_URL
    };
  },

  // Initialize data and real-time listeners
  initData(): void {
    if (isInitialized) return;
    isInitialized = true;

    // 1. Load from local cache for instant initial render
    this.loadLocalCache();

    // 2. Fetch directly from Firebase Realtime Database on start / refresh
    this.fetchFromRealtimeDatabase();

    // 3. Verify Firebase Connection
    testFirebaseConnection().then(connected => {
      if (connected) {
        isFirebaseConnected = true;
        notifyListeners();
      }
    });

    // 4. Attach Real-time Listeners (Realtime Database + Firestore) so all users share the exact same database
    this.initRealtimeListeners();
  },

  async fetchFromRealtimeDatabase(): Promise<void> {
    try {
      const [repSnap, invSnap, conSnap, actSnap, outSnap, altSnap] = await Promise.all([
        rtdbGet(rtdbRef(rtdb, 'reports')),
        rtdbGet(rtdbRef(rtdb, 'investigations')),
        rtdbGet(rtdbRef(rtdb, 'contacts')),
        rtdbGet(rtdbRef(rtdb, 'control_activities')),
        rtdbGet(rtdbRef(rtdb, 'outbreaks')),
        rtdbGet(rtdbRef(rtdb, 'alerts'))
      ]);

      let hasRtdbData = false;

      if (repSnap.exists()) {
        hasRtdbData = true;
        const val = repSnap.val();
        const items: DiseaseReport[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
        items.sort((a, b) => new Date(b.reportDate || b.createdAt).getTime() - new Date(a.reportDate || a.createdAt).getTime());
        cachedReports = items;
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(items));
      } else if (cachedReports.length === 0) {
        // If RTDB is empty and local cache is empty, seed initial reports
        cachedReports = INITIAL_REPORTS;
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
        for (const rep of INITIAL_REPORTS) {
          rtdbSet(rtdbRef(rtdb, `reports/${rep.id}`), cleanForFirebase(rep)).catch(() => {});
          setDoc(doc(db, 'reports', rep.id), cleanForFirebase(rep)).catch(() => {});
        }
      }

      if (invSnap.exists()) {
        hasRtdbData = true;
        const val = invSnap.val();
        const items: Investigation[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
        items.sort((a, b) => new Date(b.investigationDate).getTime() - new Date(a.investigationDate).getTime());
        cachedInvestigations = items;
        localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(items));
      } else if (cachedInvestigations.length === 0) {
        cachedInvestigations = INITIAL_INVESTIGATIONS;
        localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(INITIAL_INVESTIGATIONS));
        for (const inv of INITIAL_INVESTIGATIONS) {
          rtdbSet(rtdbRef(rtdb, `investigations/${inv.id}`), cleanForFirebase(inv)).catch(() => {});
          setDoc(doc(db, 'investigations', inv.id), cleanForFirebase(inv)).catch(() => {});
        }
      }

      if (conSnap.exists()) {
        hasRtdbData = true;
        const val = conSnap.val();
        const items: ContactPerson[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
        cachedContacts = items;
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(items));
      } else if (cachedContacts.length === 0) {
        cachedContacts = INITIAL_CONTACTS;
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(INITIAL_CONTACTS));
        for (const con of INITIAL_CONTACTS) {
          rtdbSet(rtdbRef(rtdb, `contacts/${con.id}`), cleanForFirebase(con)).catch(() => {});
          setDoc(doc(db, 'contacts', con.id), cleanForFirebase(con)).catch(() => {});
        }
      }

      if (actSnap.exists()) {
        hasRtdbData = true;
        const val = actSnap.val();
        const items: ControlActivity[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
        items.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        cachedControlActivities = items;
        localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(items));
      } else if (cachedControlActivities.length === 0) {
        cachedControlActivities = INITIAL_CONTROL_ACTIVITIES;
        localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(INITIAL_CONTROL_ACTIVITIES));
        for (const act of INITIAL_CONTROL_ACTIVITIES) {
          rtdbSet(rtdbRef(rtdb, `control_activities/${act.id}`), cleanForFirebase(act)).catch(() => {});
          setDoc(doc(db, 'control_activities', act.id), cleanForFirebase(act)).catch(() => {});
        }
      }

      if (outSnap.exists()) {
        hasRtdbData = true;
        const val = outSnap.val();
        const items: OutbreakEvent[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
        cachedOutbreaks = items;
        localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify(items));
      } else if (cachedOutbreaks.length === 0) {
        cachedOutbreaks = INITIAL_OUTBREAKS;
        localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify(INITIAL_OUTBREAKS));
        for (const out of INITIAL_OUTBREAKS) {
          rtdbSet(rtdbRef(rtdb, `outbreaks/${out.id}`), cleanForFirebase(out)).catch(() => {});
          setDoc(doc(db, 'outbreaks', out.id), cleanForFirebase(out)).catch(() => {});
        }
      }

      if (altSnap.exists()) {
        hasRtdbData = true;
        const val = altSnap.val();
        const items: EpiAlert[] = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        cachedAlerts = items;
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(items));
      } else if (cachedAlerts.length === 0) {
        cachedAlerts = INITIAL_ALERTS;
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
        for (const alt of INITIAL_ALERTS) {
          rtdbSet(rtdbRef(rtdb, `alerts/${alt.id}`), cleanForFirebase(alt)).catch(() => {});
          setDoc(doc(db, 'alerts', alt.id), cleanForFirebase(alt)).catch(() => {});
        }
      }

      if (hasRtdbData || cachedReports.length > 0) {
        isFirebaseConnected = true;
        notifyListeners();
      }
    } catch (err) {
      console.warn('Initial RTDB direct fetch notice:', err);
    }
  },

  loadLocalCache(): void {
    try {
      const rep = localStorage.getItem(STORAGE_KEYS.REPORTS);
      cachedReports = rep ? JSON.parse(rep) : INITIAL_REPORTS;

      const inv = localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS);
      cachedInvestigations = inv ? JSON.parse(inv) : INITIAL_INVESTIGATIONS;

      const con = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      cachedContacts = con ? JSON.parse(con) : INITIAL_CONTACTS;

      const act = localStorage.getItem(STORAGE_KEYS.CONTROL_ACTIVITIES);
      cachedControlActivities = act ? JSON.parse(act) : INITIAL_CONTROL_ACTIVITIES;

      const out = localStorage.getItem(STORAGE_KEYS.OUTBREAKS);
      cachedOutbreaks = out ? JSON.parse(out) : INITIAL_OUTBREAKS;

      const alt = localStorage.getItem(STORAGE_KEYS.ALERTS);
      cachedAlerts = alt ? JSON.parse(alt) : INITIAL_ALERTS;
    } catch (e) {
      console.error('Error loading local cache', e);
      cachedReports = INITIAL_REPORTS;
      cachedInvestigations = INITIAL_INVESTIGATIONS;
      cachedContacts = INITIAL_CONTACTS;
      cachedControlActivities = INITIAL_CONTROL_ACTIVITIES;
      cachedOutbreaks = INITIAL_OUTBREAKS;
      cachedAlerts = INITIAL_ALERTS;
    }
  },

  async clearAllPatientData(): Promise<void> {
    try {
      console.log('Clearing all patient data and demo records from Firebase & local cache...');
      
      // 1. Delete all Firestore reports
      const reportsSnap = await getDocs(collection(db, 'reports'));
      for (const d of reportsSnap.docs) {
        await deleteDoc(doc(db, 'reports', d.id));
      }

      // 2. Delete all investigations
      const invSnap = await getDocs(collection(db, 'investigations'));
      for (const d of invSnap.docs) {
        await deleteDoc(doc(db, 'investigations', d.id));
      }

      // 3. Delete all contacts
      const conSnap = await getDocs(collection(db, 'contacts'));
      for (const d of conSnap.docs) {
        await deleteDoc(doc(db, 'contacts', d.id));
      }

      // 4. Delete all control activities
      const actSnap = await getDocs(collection(db, 'control_activities'));
      for (const d of actSnap.docs) {
        await deleteDoc(doc(db, 'control_activities', d.id));
      }

      // 5. Delete all outbreaks
      const outSnap = await getDocs(collection(db, 'outbreaks'));
      for (const d of outSnap.docs) {
        await deleteDoc(doc(db, 'outbreaks', d.id));
      }

      // 6. Delete all alerts
      const altSnap = await getDocs(collection(db, 'alerts'));
      for (const d of altSnap.docs) {
        await deleteDoc(doc(db, 'alerts', d.id));
      }

      // Clear in Firebase Realtime Database
      try {
        await rtdbRemove(rtdbRef(rtdb, 'reports'));
        await rtdbRemove(rtdbRef(rtdb, 'investigations'));
        await rtdbRemove(rtdbRef(rtdb, 'contacts'));
        await rtdbRemove(rtdbRef(rtdb, 'control_activities'));
        await rtdbRemove(rtdbRef(rtdb, 'outbreaks'));
        await rtdbRemove(rtdbRef(rtdb, 'alerts'));
      } catch (rtdbErr) {
        console.warn('RTDB clear warning:', rtdbErr);
      }

      // Clear in-memory caches
      cachedReports = [];
      cachedInvestigations = [];
      cachedContacts = [];
      cachedControlActivities = [];
      cachedOutbreaks = [];
      cachedAlerts = [];

      // Clear local storage keys
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CLEARED_MOCK, 'true');

      notifyListeners();
      console.log('All patient and demo records successfully cleared.');
    } catch (err) {
      console.error('Error clearing patient data:', err);
    }
  },

  initRealtimeListeners(): void {
    // 1. Firebase Realtime Database Listeners (Fast Sub-millisecond sync across all clients)
    try {
      rtdbOnValue(rtdbRef(rtdb, 'reports'), (snap) => {
        isFirebaseConnected = true;
        if (snap.exists()) {
          const val = snap.val();
          const items: DiseaseReport[] = Array.isArray(val)
            ? val.filter(Boolean)
            : Object.values(val);
          items.sort((a, b) => new Date(b.reportDate || b.createdAt).getTime() - new Date(a.reportDate || a.createdAt).getTime());
          cachedReports = items;
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(items));
          notifyListeners();
        }
      });

      rtdbOnValue(rtdbRef(rtdb, 'investigations'), (snap) => {
        isFirebaseConnected = true;
        if (snap.exists()) {
          const val = snap.val();
          const items: Investigation[] = Array.isArray(val)
            ? val.filter(Boolean)
            : Object.values(val);
          items.sort((a, b) => new Date(b.investigationDate).getTime() - new Date(a.investigationDate).getTime());
          cachedInvestigations = items;
          localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(items));
          notifyListeners();
        }
      });

      rtdbOnValue(rtdbRef(rtdb, 'contacts'), (snap) => {
        isFirebaseConnected = true;
        if (snap.exists()) {
          const val = snap.val();
          const items: ContactPerson[] = Array.isArray(val)
            ? val.filter(Boolean)
            : Object.values(val);
          cachedContacts = items;
          localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(items));
          notifyListeners();
        }
      });

      rtdbOnValue(rtdbRef(rtdb, 'control_activities'), (snap) => {
        isFirebaseConnected = true;
        if (snap.exists()) {
          const val = snap.val();
          const items: ControlActivity[] = Array.isArray(val)
            ? val.filter(Boolean)
            : Object.values(val);
          items.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
          cachedControlActivities = items;
          localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(items));
          notifyListeners();
        }
      });

      rtdbOnValue(rtdbRef(rtdb, 'outbreaks'), (snap) => {
        isFirebaseConnected = true;
        if (snap.exists()) {
          const val = snap.val();
          const items: OutbreakEvent[] = Array.isArray(val)
            ? val.filter(Boolean)
            : Object.values(val);
          cachedOutbreaks = items;
          localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify(items));
          notifyListeners();
        }
      });

      rtdbOnValue(rtdbRef(rtdb, 'alerts'), (snap) => {
        isFirebaseConnected = true;
        if (snap.exists()) {
          const val = snap.val();
          const items: EpiAlert[] = Array.isArray(val)
            ? val.filter(Boolean)
            : Object.values(val);
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          cachedAlerts = items;
          localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(items));
          notifyListeners();
        }
      });
    } catch (rtdbErr) {
      console.warn('Realtime Database listener registration notice:', rtdbErr);
    }

    // 2. Firestore Listeners
    try {
      // 1. Reports Listener
      onSnapshot(collection(db, 'reports'), (snapshot) => {
        isFirebaseConnected = true;
        const items: DiseaseReport[] = [];
        if (!snapshot.empty) {
          snapshot.forEach(docSnap => items.push(docSnap.data() as DiseaseReport));
          items.sort((a, b) => new Date(b.reportDate || b.createdAt).getTime() - new Date(a.reportDate || a.createdAt).getTime());
          cachedReports = items;
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(items));
          notifyListeners();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'reports');
      });

      // 2. Investigations Listener
      onSnapshot(collection(db, 'investigations'), (snapshot) => {
        isFirebaseConnected = true;
        const items: Investigation[] = [];
        if (!snapshot.empty) {
          snapshot.forEach(docSnap => items.push(docSnap.data() as Investigation));
          items.sort((a, b) => new Date(b.investigationDate).getTime() - new Date(a.investigationDate).getTime());
          cachedInvestigations = items;
          localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(items));
          notifyListeners();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'investigations');
      });

      // 3. Contacts Listener
      onSnapshot(collection(db, 'contacts'), (snapshot) => {
        isFirebaseConnected = true;
        const items: ContactPerson[] = [];
        if (!snapshot.empty) {
          snapshot.forEach(docSnap => items.push(docSnap.data() as ContactPerson));
          cachedContacts = items;
          localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(items));
          notifyListeners();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'contacts');
      });

      // 4. Control Activities Listener
      onSnapshot(collection(db, 'control_activities'), (snapshot) => {
        isFirebaseConnected = true;
        const items: ControlActivity[] = [];
        if (!snapshot.empty) {
          snapshot.forEach(docSnap => items.push(docSnap.data() as ControlActivity));
          items.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
          cachedControlActivities = items;
          localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(items));
          notifyListeners();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'control_activities');
      });

      // 5. Outbreaks Listener
      onSnapshot(collection(db, 'outbreaks'), (snapshot) => {
        isFirebaseConnected = true;
        const items: OutbreakEvent[] = [];
        if (!snapshot.empty) {
          snapshot.forEach(docSnap => items.push(docSnap.data() as OutbreakEvent));
          cachedOutbreaks = items;
          localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify(items));
          notifyListeners();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'outbreaks');
      });

      // 6. Alerts Listener
      onSnapshot(collection(db, 'alerts'), (snapshot) => {
        isFirebaseConnected = true;
        const items: EpiAlert[] = [];
        if (!snapshot.empty) {
          snapshot.forEach(docSnap => items.push(docSnap.data() as EpiAlert));
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          cachedAlerts = items;
          localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(items));
          notifyListeners();
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'alerts');
      });

    } catch (e) {
      console.error('Error starting Firestore realtime listeners', e);
    }
  },

  resetToDefaults(): void {
    this.clearAllPatientData();
  },

  // User Session Management
  getUser(): UserSession {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : INITIAL_USER;
  },

  setUser(user: UserSession): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  setRole(role: RoleType): UserSession {
    const user = this.getUser();
    user.role = role;
    
    // update friendly titles
    if (role === 'head_epi') {
      user.name = 'นวก.สธ. เอกพันธ์ ขุขันธ์ (หัวหน้างานระบาดวิทยา)';
      user.department = 'กลุ่มงานบริการด้านปฐมภูมิและองค์รวม';
    } else if (role === 'srrt_officer') {
      user.name = 'พว.วาสนา จันทร์เพ็ญ (จนท.ทีม SRRT)';
      user.department = 'ทีมสอบสวนโรคเคลื่อนที่เร็ว (SRRT)';
    } else if (role === 'er_opd') {
      user.name = 'พญ.ชลธิชา สัตยารักษ์ (แพทย์เวร OPD/ER)';
      user.department = 'แผนกผู้ป่วยนอกและฉุกเฉิน (OPD/ER)';
    } else if (role === 'ipd') {
      user.name = 'พว.สุดารัตน์ ใจดี (พยาบาลหอผู้ป่วยใน)';
      user.department = 'หอผู้ป่วยใน (IPD)';
    } else if (role === 'lab') {
      user.name = 'ทนพ.สมศักดิ์ วิจัยผล (นักเทคนิคการแพทย์)';
      user.department = 'กลุ่มงานเทคนิคการแพทย์ (LAB)';
    } else if (role === 'executive') {
      user.name = 'นพ.ธนวัฒน์ เจนกิจ (ผู้อำนวยการโรงพยาบาล)';
      user.department = 'คณะกรรมการบริหารโรงพยาบาลโพนนาแก้ว';
    } else if (role === 'pcu_nakaeo') {
      user.name = 'พว.สุมิตรา วงศ์สายตา (พยาบาลวิชาชีพ รพ.สต.นาแก้ว)';
      user.department = 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาแก้ว';
      user.pcuSubdistrict = 'ตำบลนาแก้ว';
    } else if (role === 'pcu_natong') {
      user.name = 'นวก.สธ. ณรงค์ฤทธิ์ ชนะสิทธิ์ (รพ.สต.นาตงวัฒนา)';
      user.department = 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาตงวัฒนา';
      user.pcuSubdistrict = 'ตำบลนาตงวัฒนา';
    } else if (role === 'pcu_banpaen') {
      user.name = 'พว.กมลวรรณ ดวงดี (พยาบาลวิชาชีพ รพ.สต.บ้านแป้น)';
      user.department = 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านแป้น';
      user.pcuSubdistrict = 'ตำบลบ้านแป้น';
    } else if (role === 'pcu_banphon') {
      user.name = 'นวก.สธ. อนุชา ภูมิไชยา (รพ.สต.บ้านโพน)';
      user.department = 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านโพน';
      user.pcuSubdistrict = 'ตำบลบ้านโพน';
    } else if (role === 'pcu_chiang_sue') {
      user.name = 'นวก.สธ. ชัยรัตน์ พรมวงค์ (รพ.สต.เชียงสือ)';
      user.department = 'โรงพยาบาลส่งเสริมสุขภาพตำบลเชียงสือ';
      user.pcuSubdistrict = 'ตำบลเชียงสือ';
    } else {
      user.name = 'ผู้ดูแลระบบสารสนเทศ (Admin)';
      user.department = 'ศูนย์เทคโนโลยีสารสนเทศ รพ.โพนนาแก้ว';
    }

    this.setUser(user);
    return user;
  },

  // 1. Reports (506 & Disease Intake)
  getReports(): DiseaseReport[] {
    if (cachedReports.length > 0) return cachedReports;
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return raw ? JSON.parse(raw) : INITIAL_REPORTS;
  },

  async saveReport(report: DiseaseReport): Promise<void> {
    const reports = [...this.getReports()];
    const index = reports.findIndex(r => r.id === report.id);
    const updatedReport: DiseaseReport = cleanForFirebase({
      ...report,
      updatedAt: new Date().toISOString(),
      createdAt: report.createdAt || new Date().toISOString()
    });

    if (index >= 0) {
      reports[index] = updatedReport;
    } else {
      reports.unshift(updatedReport);
    }

    cachedReports = reports;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    notifyListeners();

    // Persist directly to Firebase Realtime Database and Firestore
    try {
      await rtdbSet(rtdbRef(rtdb, `reports/${updatedReport.id}`), cleanForFirebase(updatedReport));
    } catch (rtdbErr) {
      console.error('Firebase RTDB Save Report Error:', rtdbErr);
    }

    try {
      await setDoc(doc(db, 'reports', updatedReport.id), cleanForFirebase(updatedReport));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reports/${updatedReport.id}`);
    }
  },

  async deleteReport(id: string): Promise<void> {
    const reports = this.getReports().filter(r => r.id !== id);
    cachedReports = reports;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    notifyListeners();

    try {
      await rtdbRemove(rtdbRef(rtdb, `reports/${id}`));
    } catch (rtdbErr) {
      console.error('Firebase RTDB Delete Report Error:', rtdbErr);
    }

    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${id}`);
    }
  },

  // 2. Investigations
  getInvestigations(): Investigation[] {
    if (cachedInvestigations.length > 0) return cachedInvestigations;
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS);
    return raw ? JSON.parse(raw) : INITIAL_INVESTIGATIONS;
  },

  getInvestigationById(id: string): Investigation | undefined {
    return this.getInvestigations().find(inv => inv.id === id);
  },

  getInvestigationByReportId(reportId: string): Investigation | undefined {
    return this.getInvestigations().find(inv => inv.reportId === reportId);
  },

  async saveInvestigation(investigation: Investigation): Promise<void> {
    const cleanInv: Investigation = cleanForFirebase(investigation);
    const investigations = [...this.getInvestigations()];
    const index = investigations.findIndex(inv => inv.id === cleanInv.id);
    if (index >= 0) {
      investigations[index] = cleanInv;
    } else {
      investigations.unshift(cleanInv);
    }
    cachedInvestigations = investigations;
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));

    // Update corresponding report status if needed
    const report = this.getReports().find(r => r.id === cleanInv.reportId);
    if (report) {
      report.investigationId = cleanInv.id;
      if (cleanInv.status === 'completed') {
        report.status = 'investigated';
      } else if (report.status === 'reported' || report.status === 'pending_investigation') {
        report.status = 'investigating';
      }
      await this.saveReport(report);
    }

    notifyListeners();

    try {
      await rtdbSet(rtdbRef(rtdb, `investigations/${cleanInv.id}`), cleanForFirebase(cleanInv));
    } catch (rtdbErr) {
      console.error('Firebase RTDB Save Investigation Error:', rtdbErr);
    }

    try {
      await setDoc(doc(db, 'investigations', cleanInv.id), cleanForFirebase(cleanInv));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `investigations/${cleanInv.id}`);
    }
  },

  async deleteInvestigation(id: string): Promise<void> {
    const investigations = this.getInvestigations().filter(i => i.id !== id);
    cachedInvestigations = investigations;
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
    notifyListeners();

    try {
      await rtdbRemove(rtdbRef(rtdb, `investigations/${id}`));
    } catch (rtdbErr) {
      console.error('Firebase RTDB Delete Investigation Error:', rtdbErr);
    }

    try {
      await deleteDoc(doc(db, 'investigations', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `investigations/${id}`);
    }
  },

  // 3. Contacts
  getContacts(): ContactPerson[] {
    if (cachedContacts.length > 0) return cachedContacts;
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return raw ? JSON.parse(raw) : INITIAL_CONTACTS;
  },

  async saveContact(contact: ContactPerson): Promise<void> {
    const cleanCon: ContactPerson = cleanForFirebase(contact);
    const contacts = [...this.getContacts()];
    const index = contacts.findIndex(c => c.id === cleanCon.id);
    if (index >= 0) {
      contacts[index] = cleanCon;
    } else {
      contacts.unshift(cleanCon);
    }
    cachedContacts = contacts;
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    notifyListeners();

    try {
      await rtdbSet(rtdbRef(rtdb, `contacts/${cleanCon.id}`), cleanForFirebase(cleanCon));
    } catch (rtdbErr) {
      console.error('Firebase RTDB Save Contact Error:', rtdbErr);
    }

    try {
      await setDoc(doc(db, 'contacts', cleanCon.id), cleanForFirebase(cleanCon));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `contacts/${cleanCon.id}`);
    }
  },

  async deleteContact(id: string): Promise<void> {
    const contacts = this.getContacts().filter(c => c.id !== id);
    cachedContacts = contacts;
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    notifyListeners();

    try {
      await rtdbRemove(rtdbRef(rtdb, `contacts/${id}`));
    } catch (rtdbErr) {
      console.error('Firebase RTDB Delete Contact Error:', rtdbErr);
    }

    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contacts/${id}`);
    }
  },

  // 4. Control Activities
  getControlActivities(): ControlActivity[] {
    if (cachedControlActivities.length > 0) return cachedControlActivities;
    const raw = localStorage.getItem(STORAGE_KEYS.CONTROL_ACTIVITIES);
    return raw ? JSON.parse(raw) : INITIAL_CONTROL_ACTIVITIES;
  },

  async saveControlActivity(activity: ControlActivity): Promise<void> {
    const cleanAct: ControlActivity = cleanForFirebase(activity);
    const activities = [...this.getControlActivities()];
    const index = activities.findIndex(a => a.id === cleanAct.id);
    if (index >= 0) {
      activities[index] = cleanAct;
    } else {
      activities.unshift(cleanAct);
    }
    cachedControlActivities = activities;
    localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(activities));
    notifyListeners();

    try {
      await rtdbSet(rtdbRef(rtdb, `control_activities/${cleanAct.id}`), cleanForFirebase(cleanAct));
    } catch (rtdbErr) {
      console.error('Firebase RTDB Save Control Activity Error:', rtdbErr);
    }

    try {
      await setDoc(doc(db, 'control_activities', cleanAct.id), cleanForFirebase(cleanAct));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `control_activities/${cleanAct.id}`);
    }
  },

  async toggleControlActivity(id: string): Promise<void> {
    const activities = this.getControlActivities();
    const activity = activities.find(a => a.id === id);
    if (activity) {
      activity.isCompleted = !activity.isCompleted;
      if (activity.isCompleted) {
        activity.completedDate = new Date().toISOString().split('T')[0];
      } else {
        activity.completedDate = undefined;
      }
      await this.saveControlActivity(activity);
    }
  },

  async deleteControlActivity(id: string): Promise<void> {
    const activities = this.getControlActivities().filter(a => a.id !== id);
    cachedControlActivities = activities;
    localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(activities));
    notifyListeners();

    try {
      await rtdbRemove(rtdbRef(rtdb, `control_activities/${id}`));
    } catch (rtdbErr) {
      console.error('Firebase RTDB Delete Control Activity Error:', rtdbErr);
    }

    try {
      await deleteDoc(doc(db, 'control_activities', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `control_activities/${id}`);
    }
  },

  // 5. Outbreaks
  getOutbreaks(): OutbreakEvent[] {
    if (cachedOutbreaks.length > 0) return cachedOutbreaks;
    const raw = localStorage.getItem(STORAGE_KEYS.OUTBREAKS);
    return raw ? JSON.parse(raw) : INITIAL_OUTBREAKS;
  },

  async saveOutbreak(outbreak: OutbreakEvent): Promise<void> {
    const cleanOb: OutbreakEvent = cleanForFirebase(outbreak);
    const outbreaks = [...this.getOutbreaks()];
    const index = outbreaks.findIndex(o => o.id === cleanOb.id);
    if (index >= 0) {
      outbreaks[index] = cleanOb;
    } else {
      outbreaks.unshift(cleanOb);
    }
    cachedOutbreaks = outbreaks;
    localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify(outbreaks));
    notifyListeners();

    try {
      await rtdbSet(rtdbRef(rtdb, `outbreaks/${cleanOb.id}`), cleanForFirebase(cleanOb));
    } catch (rtdbErr) {
      console.error('Firebase RTDB Save Outbreak Error:', rtdbErr);
    }

    try {
      await setDoc(doc(db, 'outbreaks', cleanOb.id), cleanForFirebase(cleanOb));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `outbreaks/${cleanOb.id}`);
    }
  },

  // 6. Alerts
  getAlerts(): EpiAlert[] {
    if (cachedAlerts.length > 0) return cachedAlerts;
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return raw ? JSON.parse(raw) : INITIAL_ALERTS;
  },

  async markAlertAsRead(id: string): Promise<void> {
    const alerts = this.getAlerts().map(a => a.id === id ? { ...a, isRead: true } : a);
    cachedAlerts = alerts;
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    notifyListeners();

    const targetAlert = alerts.find(a => a.id === id);
    if (targetAlert) {
      const cleanAlt = cleanForFirebase(targetAlert);
      try {
        await rtdbSet(rtdbRef(rtdb, `alerts/${id}`), cleanAlt);
      } catch (rtdbErr) {
        console.error('Firebase RTDB Mark Alert Error:', rtdbErr);
      }

      try {
        await setDoc(doc(db, 'alerts', id), cleanAlt);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `alerts/${id}`);
      }
    }
  },

  async saveAlert(alert: EpiAlert): Promise<void> {
    const cleanAlt: EpiAlert = cleanForFirebase(alert);
    const alerts = [...this.getAlerts()];
    const index = alerts.findIndex(a => a.id === cleanAlt.id);
    if (index >= 0) {
      alerts[index] = cleanAlt;
    } else {
      alerts.unshift(cleanAlt);
    }
    cachedAlerts = alerts;
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    notifyListeners();

    try {
      await rtdbSet(rtdbRef(rtdb, `alerts/${cleanAlt.id}`), cleanAlt);
    } catch (rtdbErr) {
      console.error('Firebase RTDB Save Alert Error:', rtdbErr);
    }

    try {
      await setDoc(doc(db, 'alerts', cleanAlt.id), cleanAlt);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `alerts/${cleanAlt.id}`);
    }
  },

  addAlert(alert: EpiAlert): void {
    this.saveAlert(alert);
  },

  async seedInitialFirestoreData(): Promise<void> {
    try {
      console.log('Seeding initial surveillance data to Firebase...');
      for (const r of INITIAL_REPORTS) {
        await this.saveReport(r);
      }
      for (const inv of INITIAL_INVESTIGATIONS) {
        await this.saveInvestigation(inv);
      }
      for (const con of INITIAL_CONTACTS) {
        await this.saveContact(con);
      }
      for (const act of INITIAL_CONTROL_ACTIVITIES) {
        await this.saveControlActivity(act);
      }
      for (const ob of INITIAL_OUTBREAKS) {
        await this.saveOutbreak(ob);
      }
      for (const alt of INITIAL_ALERTS) {
        await this.saveAlert(alt);
      }
    } catch (e) {
      console.error('Error seeding initial data to Firebase:', e);
    }
  },

  resetToDefault(): void {
    this.seedInitialFirestoreData();
  },

  // Full Backup / Export
  exportAllJson(): string {
    const data = {
      hospital: 'โรงพยาบาลโพนนาแก้ว',
      exportedAt: new Date().toISOString(),
      reports: this.getReports(),
      investigations: this.getInvestigations(),
      contacts: this.getContacts(),
      controlActivities: this.getControlActivities(),
      outbreaks: this.getOutbreaks(),
      alerts: this.getAlerts(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Import JSON
  async importJson(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.reports)) {
        for (const r of data.reports) {
          await this.saveReport(r);
        }
      }
      if (Array.isArray(data.investigations)) {
        for (const i of data.investigations) {
          await this.saveInvestigation(i);
        }
      }
      if (Array.isArray(data.contacts)) {
        for (const c of data.contacts) {
          await this.saveContact(c);
        }
      }
      if (Array.isArray(data.controlActivities)) {
        for (const a of data.controlActivities) {
          await this.saveControlActivity(a);
        }
      }
      if (Array.isArray(data.outbreaks)) {
        for (const o of data.outbreaks) {
          await this.saveOutbreak(o);
        }
      }
      if (Array.isArray(data.alerts)) {
        for (const al of data.alerts) {
          await this.saveAlert(al);
        }
      }
      return true;
    } catch {
      return false;
    }
  }
};
