import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
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
  INITIALIZED: 'pnk_epi_initialized_v4',
};

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
let isSeeding = false;
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

  getCloudSyncStatus(): { isConnected: boolean; lastSync: Date } {
    return {
      isConnected: isFirebaseConnected,
      lastSync: lastSyncTimestamp
    };
  },

  // Initialize data and real-time Firestore listeners
  initData(): void {
    if (isInitialized) return;
    isInitialized = true;

    // Load from local storage first for instant render
    this.loadLocalCache();

    // Attach Firestore Real-time Listeners
    this.initFirestoreRealtimeListeners();
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
    }
  },

  async seedInitialFirestoreData(): Promise<void> {
    if (isSeeding) return;
    isSeeding = true;
    try {
      console.log('Seeding initial Phon Na Kaeo data to Firestore...');
      // Seed Reports
      for (const rep of INITIAL_REPORTS) {
        await setDoc(doc(db, 'reports', rep.id), rep);
      }
      // Seed Investigations
      for (const inv of INITIAL_INVESTIGATIONS) {
        await setDoc(doc(db, 'investigations', inv.id), inv);
      }
      // Seed Contacts
      for (const con of INITIAL_CONTACTS) {
        await setDoc(doc(db, 'contacts', con.id), con);
      }
      // Seed Activities
      for (const act of INITIAL_CONTROL_ACTIVITIES) {
        await setDoc(doc(db, 'control_activities', act.id), act);
      }
      // Seed Outbreaks
      for (const out of INITIAL_OUTBREAKS) {
        await setDoc(doc(db, 'outbreaks', out.id), out);
      }
      // Seed Alerts
      for (const alt of INITIAL_ALERTS) {
        await setDoc(doc(db, 'alerts', alt.id), alt);
      }
      console.log('Firestore seed complete!');
    } catch (err) {
      console.error('Failed to seed initial Firestore data:', err);
    } finally {
      isSeeding = false;
    }
  },

  initFirestoreRealtimeListeners(): void {
    try {
      // 1. Reports Listener
      onSnapshot(collection(db, 'reports'), async (snapshot) => {
        isFirebaseConnected = true;
        if (snapshot.empty && !localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
          localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
          await this.seedInitialFirestoreData();
          return;
        }
        if (!snapshot.empty) {
          const items: DiseaseReport[] = [];
          snapshot.forEach(docSnap => items.push(docSnap.data() as DiseaseReport));
          // Sort by reportDate or createdAt descending
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
        if (!snapshot.empty) {
          const items: Investigation[] = [];
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
        if (!snapshot.empty) {
          const items: ContactPerson[] = [];
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
        if (!snapshot.empty) {
          const items: ControlActivity[] = [];
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
        if (!snapshot.empty) {
          const items: OutbreakEvent[] = [];
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
        if (!snapshot.empty) {
          const items: EpiAlert[] = [];
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
    this.seedInitialFirestoreData();
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
    const updatedReport: DiseaseReport = {
      ...report,
      updatedAt: new Date().toISOString(),
      createdAt: report.createdAt || new Date().toISOString()
    };

    if (index >= 0) {
      reports[index] = updatedReport;
    } else {
      reports.unshift(updatedReport);
    }

    cachedReports = reports;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    notifyListeners();

    // Persist to Cloud Firestore
    try {
      await setDoc(doc(db, 'reports', updatedReport.id), updatedReport);
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
    const investigations = [...this.getInvestigations()];
    const index = investigations.findIndex(inv => inv.id === investigation.id);
    if (index >= 0) {
      investigations[index] = investigation;
    } else {
      investigations.unshift(investigation);
    }
    cachedInvestigations = investigations;
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));

    // Update corresponding report status if needed
    const report = this.getReports().find(r => r.id === investigation.reportId);
    if (report) {
      report.investigationId = investigation.id;
      if (investigation.status === 'completed') {
        report.status = 'investigated';
      } else if (report.status === 'reported' || report.status === 'pending_investigation') {
        report.status = 'investigating';
      }
      this.saveReport(report);
    }

    notifyListeners();

    try {
      await setDoc(doc(db, 'investigations', investigation.id), investigation);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `investigations/${investigation.id}`);
    }
  },

  async deleteInvestigation(id: string): Promise<void> {
    const investigations = this.getInvestigations().filter(i => i.id !== id);
    cachedInvestigations = investigations;
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
    notifyListeners();

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
    const contacts = [...this.getContacts()];
    const index = contacts.findIndex(c => c.id === contact.id);
    if (index >= 0) {
      contacts[index] = contact;
    } else {
      contacts.unshift(contact);
    }
    cachedContacts = contacts;
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    notifyListeners();

    try {
      await setDoc(doc(db, 'contacts', contact.id), contact);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `contacts/${contact.id}`);
    }
  },

  async deleteContact(id: string): Promise<void> {
    const contacts = this.getContacts().filter(c => c.id !== id);
    cachedContacts = contacts;
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    notifyListeners();

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
    const activities = [...this.getControlActivities()];
    const index = activities.findIndex(a => a.id === activity.id);
    if (index >= 0) {
      activities[index] = activity;
    } else {
      activities.unshift(activity);
    }
    cachedControlActivities = activities;
    localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(activities));
    notifyListeners();

    try {
      await setDoc(doc(db, 'control_activities', activity.id), activity);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `control_activities/${activity.id}`);
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
    const outbreaks = [...this.getOutbreaks()];
    const index = outbreaks.findIndex(o => o.id === outbreak.id);
    if (index >= 0) {
      outbreaks[index] = outbreak;
    } else {
      outbreaks.unshift(outbreak);
    }
    cachedOutbreaks = outbreaks;
    localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify(outbreaks));
    notifyListeners();

    try {
      await setDoc(doc(db, 'outbreaks', outbreak.id), outbreak);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `outbreaks/${outbreak.id}`);
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
      try {
        await setDoc(doc(db, 'alerts', id), targetAlert);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `alerts/${id}`);
      }
    }
  },

  async saveAlert(alert: EpiAlert): Promise<void> {
    const alerts = [...this.getAlerts()];
    const index = alerts.findIndex(a => a.id === alert.id);
    if (index >= 0) {
      alerts[index] = alert;
    } else {
      alerts.unshift(alert);
    }
    cachedAlerts = alerts;
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    notifyListeners();

    try {
      await setDoc(doc(db, 'alerts', alert.id), alert);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `alerts/${alert.id}`);
    }
  },

  addAlert(alert: EpiAlert): void {
    this.saveAlert(alert);
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
