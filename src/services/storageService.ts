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
  INITIALIZED: 'pnk_epi_initialized_v3',
};

export const storageService = {
  // Initialize default data if empty
  initData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      this.resetToDefaults();
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  },

  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(INITIAL_INVESTIGATIONS));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(INITIAL_CONTACTS));
    localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(INITIAL_CONTROL_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify(INITIAL_OUTBREAKS));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
  },

  // User
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

  // Reports (506 & Disease Intake)
  getReports(): DiseaseReport[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return raw ? JSON.parse(raw) : [];
  },

  saveReport(report: DiseaseReport): void {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === report.id);
    if (index >= 0) {
      reports[index] = { ...report, updatedAt: new Date().toISOString() };
    } else {
      reports.unshift({ ...report, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  deleteReport(id: string): void {
    const reports = this.getReports().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  deleteInvestigation(id: string): void {
    const investigations = this.getInvestigations().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
  },

  resetToDefault(): void {
    this.resetToDefaults();
  },

  toggleControlActivity(id: string): void {
    const activities = this.getControlActivities();
    const activity = activities.find(a => a.id === id);
    if (activity) {
      activity.isCompleted = !activity.isCompleted;
      if (activity.isCompleted) {
        activity.completedDate = new Date().toISOString().split('T')[0];
      } else {
        activity.completedDate = undefined;
      }
      this.saveControlActivity(activity);
    }
  },
  getInvestigations(): Investigation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS);
    return raw ? JSON.parse(raw) : [];
  },

  getInvestigationById(id: string): Investigation | undefined {
    return this.getInvestigations().find(inv => inv.id === id);
  },

  getInvestigationByReportId(reportId: string): Investigation | undefined {
    return this.getInvestigations().find(inv => inv.reportId === reportId);
  },

  saveInvestigation(investigation: Investigation): void {
    const investigations = this.getInvestigations();
    const index = investigations.findIndex(inv => inv.id === investigation.id);
    if (index >= 0) {
      investigations[index] = investigation;
    } else {
      investigations.unshift(investigation);
    }
    localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));

    // Update corresponding report status
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
  },

  // Contacts
  getContacts(): ContactPerson[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return raw ? JSON.parse(raw) : [];
  },

  saveContact(contact: ContactPerson): void {
    const contacts = this.getContacts();
    const index = contacts.findIndex(c => c.id === contact.id);
    if (index >= 0) {
      contacts[index] = contact;
    } else {
      contacts.unshift(contact);
    }
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  },

  deleteContact(id: string): void {
    const contacts = this.getContacts().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  },

  // Control Activities
  getControlActivities(): ControlActivity[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTROL_ACTIVITIES);
    return raw ? JSON.parse(raw) : [];
  },

  saveControlActivity(activity: ControlActivity): void {
    const activities = this.getControlActivities();
    const index = activities.findIndex(a => a.id === activity.id);
    if (index >= 0) {
      activities[index] = activity;
    } else {
      activities.unshift(activity);
    }
    localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(activities));
  },

  deleteControlActivity(id: string): void {
    const activities = this.getControlActivities().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(activities));
  },

  // Outbreaks
  getOutbreaks(): OutbreakEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OUTBREAKS);
    return raw ? JSON.parse(raw) : [];
  },

  saveOutbreak(outbreak: OutbreakEvent): void {
    const outbreaks = this.getOutbreaks();
    const index = outbreaks.findIndex(o => o.id === outbreak.id);
    if (index >= 0) {
      outbreaks[index] = outbreak;
    } else {
      outbreaks.unshift(outbreak);
    }
    localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify(outbreaks));
  },

  // Alerts
  getAlerts(): EpiAlert[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return raw ? JSON.parse(raw) : [];
  },

  markAlertAsRead(id: string): void {
    const alerts = this.getAlerts().map(a => a.id === id ? { ...a, isRead: true } : a);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },

  saveAlert(alert: EpiAlert): void {
    const alerts = this.getAlerts();
    const index = alerts.findIndex(a => a.id === alert.id);
    if (index >= 0) {
      alerts[index] = alert;
    } else {
      alerts.unshift(alert);
    }
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },

  addAlert(alert: EpiAlert): void {
    this.saveAlert(alert);
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
  importJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.reports) localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(data.reports));
      if (data.investigations) localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(data.investigations));
      if (data.contacts) localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(data.contacts));
      if (data.controlActivities) localStorage.setItem(STORAGE_KEYS.CONTROL_ACTIVITIES, JSON.stringify(data.controlActivities));
      if (data.outbreaks) localStorage.setItem(STORAGE_KEYS.OUTBREAKS, JSON.stringify(data.outbreaks));
      if (data.alerts) localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(data.alerts));
      return true;
    } catch {
      return false;
    }
  }
};
