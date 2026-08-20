import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Camera,
  Layers,
  Sparkles,
  ArrowLeft,
  Share2,
  Navigation,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck,
  Check,
  Send,
  Phone,
  Flame,
  AlertTriangle,
  ExternalLink,
  Navigation2
} from 'lucide-react';
import { DiseaseReport, ControlActivity, UserSession } from '../types';
import { storageService } from '../services/storageService';
import { PHON_NA_KAEO_DISTRICT_CENTER } from '../data/mockData';

interface MobileGpsSurveyViewProps {
  report: DiseaseReport;
  user: UserSession;
  onBack: () => void;
  onSaved: (updatedReport: DiseaseReport) => void;
}

export const MobileGpsSurveyView: React.FC<MobileGpsSurveyViewProps> = ({
  report,
  user,
  onBack,
  onSaved,
}) => {
  // GPS States
  const [lat, setLat] = useState<number>(report.patient.lat || PHON_NA_KAEO_DISTRICT_CENTER.lat);
  const [lng, setLng] = useState<number>(report.patient.lng || PHON_NA_KAEO_DISTRICT_CENTER.lng);
  const [accuracy, setAccuracy] = useState<number | null>(report.patient.gpsAccuracy || null);
  const [gpsTimestamp, setGpsTimestamp] = useState<string>(report.patient.gpsTimestamp || '');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>('');
  const [deviceType, setDeviceType] = useState<'Android' | 'iOS' | 'Web'>('Web');

  // Mini Leaflet Map ref
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMarkerRef = useRef<L.Marker | null>(null);
  const miniCircleRef = useRef<L.Circle | null>(null);

  // Control Form States
  const [houseIndex, setHouseIndex] = useState<string>('0');
  const [containerIndex, setContainerIndex] = useState<string>('0');
  const [activitiesDone, setActivitiesDone] = useState<string[]>([
    'larval_destruction',
    'health_education',
  ]);
  const [chemicalSprayDone, setChemicalSprayDone] = useState<boolean>(false);
  const [fieldNotes, setFieldNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(report.patient.gpsPhotoUrl || null);

  // Detect Mobile OS (Android / iOS)
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    if (/android/i.test(userAgent)) {
      setDeviceType('Android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDeviceType('iOS');
    } else {
      setDeviceType('Web');
    }
  }, []);

  // Initialize and update Mini Leaflet Map for Mobile Field Survey
  useEffect(() => {
    if (!miniMapContainerRef.current) return;

    if (!miniMapInstanceRef.current) {
      const map = L.map(miniMapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom GPS Pin Marker (Draggable for fine tuning)
      const customPin = L.divIcon({
        className: 'gps-mini-pin',
        html: `
          <div style="transform: translate(-50%, -50%);" class="flex flex-col items-center">
            <div class="w-7 h-7 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold animate-bounce">
              📍
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon: customPin, draggable: true }).addTo(map);
      marker.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        setLat(newPos.lat);
        setLng(newPos.lng);
      });

      // 100m Buffer Zone
      const circle = L.circle([lat, lng], {
        radius: 100,
        color: '#e11d48',
        fillColor: '#f43f5e',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);

      // Click on map to reposition pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
      });

      miniMarkerRef.current = marker;
      miniCircleRef.current = circle;
      miniMapInstanceRef.current = map;
    } else {
      const map = miniMapInstanceRef.current;
      map.panTo([lat, lng]);
      if (miniMarkerRef.current) {
        miniMarkerRef.current.setLatLng([lat, lng]);
      }
      if (miniCircleRef.current) {
        miniCircleRef.current.setLatLng([lat, lng]);
      }
    }

    return () => {
      // Map cleanup on unmount
    };
  }, [lat, lng]);

  // Capture High-Accuracy Geolocation from Device
  const handleCaptureGps = () => {
    setIsLocating(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('อุปกรณ์นี้ไม่รองรับการดึงพิกัด Geolocation');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const acc = Math.round(position.coords.accuracy * 10) / 10;
        const nowIso = new Date().toISOString();

        setLat(latitude);
        setLng(longitude);
        setAccuracy(acc);
        setGpsTimestamp(nowIso);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'ไม่สามารถดึงพิกัดได้';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'กรุณากด "อนุญาตการเข้าถึงตำแหน่งที่ตั้ง (Location Permission)" บนเบราว์เซอร์ของคุณ';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'สัญญาณ GPS อ่อนหรือไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้งกลางแจ้ง';
        } else if (error.code === error.TIMEOUT) {
          msg = 'หมดเวลาค้นหาพิกัด GPS กรุณากดลองใหม่อีกครั้ง';
        }
        setLocationError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Toggle activity checkbox
  const toggleActivity = (id: string) => {
    if (activitiesDone.includes(id)) {
      setActivitiesDone(activitiesDone.filter(a => a !== id));
    } else {
      setActivitiesDone([...activitiesDone, id]);
    }
  };

  // Photo file upload simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save GPS & Field Control Data back to storage
  const handleSaveFieldData = () => {
    setIsSubmitting(true);

    const updatedPatient = {
      ...report.patient,
      lat: lat,
      lng: lng,
      gpsAccuracy: accuracy || undefined,
      gpsTimestamp: gpsTimestamp || new Date().toISOString(),
      gpsRecordedBy: user.name || user.pcuName || 'เจ้าหน้าที่ รพ.สต.',
      gpsDeviceType: deviceType,
      gpsPhotoUrl: photoPreview || undefined,
    };

    const updatedReport: DiseaseReport = {
      ...report,
      patient: updatedPatient,
      status: report.status === 'reported' ? 'in_control' : report.status,
      updatedAt: new Date().toISOString(),
    };

    // Save report in storage
    storageService.saveReport(updatedReport);

    // Also record a Control Activity
    const newControlActivity: ControlActivity = {
      id: `act_${Date.now()}`,
      title: `ลงพื้นที่ยิงพิกัด & ควบคุมโรค: ${report.patient.prefix}${report.patient.firstName} (${report.diseaseNameTh})`,
      category: chemicalSprayDone ? 'chemical_spray' : 'larval_destruction',
      targetLocation: `${report.patient.address} ${report.patient.villageName}`,
      subdistrict: report.patient.subdistrict,
      villageName: report.patient.villageName,
      relatedDisease: report.disease,
      relatedReportId: report.id,
      assignedTo: user.name || user.pcuName || 'รพ.สต. พื้นที่',
      dueDate: new Date().toISOString().split('T')[0],
      completedDate: new Date().toISOString().split('T')[0],
      isCompleted: true,
      outcomeSummary: `ยิงพิกัด GPS (${lat.toFixed(5)}, ${lng.toFixed(5)} ±${accuracy || 0}m) HI=${houseIndex}% CI=${containerIndex}% ${fieldNotes}`,
      hiAfter: parseFloat(houseIndex) || 0,
      ciAfter: parseFloat(containerIndex) || 0,
      gpsLat: lat,
      gpsLng: lng,
      gpsPhotoUrl: photoPreview || undefined,
      createdAt: new Date().toISOString(),
    };

    storageService.saveControlActivity(newControlActivity);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onSaved(updatedReport);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white px-4 py-3 shadow-md flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับ</span>
        </button>

        <div className="text-center min-w-0 px-2">
          <h1 className="text-sm font-bold truncate">ระบบยิงพิกัด & ควบคุมโรคภาคสนาม</h1>
          <p className="text-[10px] text-blue-200 truncate">
            {report.patient.subdistrict} • {deviceType} Mobile
          </p>
        </div>

        <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold">
          {report.diseaseNameTh}
        </span>
      </header>

      {/* Main Form Container (Mobile Friendly) */}
      <div className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4 pb-24">
        
        {/* Success Modal / Banner */}
        {isSuccess && (
          <div className="p-4 bg-emerald-600 text-white rounded-3xl shadow-xl space-y-2 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-sm">บันทึกพิกัดและผลการควบคุมโรคสำเร็จ!</h3>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              พิกัด GPS ({lat.toFixed(5)}, {lng.toFixed(5)}) และมาตรการควบคุมโรคถูกส่งเข้าสู่ระบบกลาง รพ.โพนนาแก้ว เรียบร้อยแล้ว
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={onBack}
                className="flex-1 py-2 bg-white text-emerald-800 font-bold rounded-xl text-xs shadow-sm"
              >
                กลับหน้ารวม
              </button>
            </div>
          </div>
        )}

        {/* 1. Patient Case Overview Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base">
                {report.patient.firstName.charAt(0)}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 leading-tight">
                  {report.patient.prefix}{report.patient.firstName} {report.patient.lastName}
                </h2>
                <p className="text-[11px] text-slate-500">
                  HN: <span className="font-mono font-bold text-blue-600">{report.patient.hn}</span> • อายุ {report.patient.age} ปี
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-700 font-bold text-[10px]">
              {report.diseaseNameTh}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="p-2.5 bg-slate-50 rounded-2xl">
              <span className="text-[10px] text-slate-400 block">หมู่บ้าน/ตำบล:</span>
              <strong className="text-slate-800">{report.patient.villageName}</strong>
              <span className="text-[11px] text-slate-500 block">{report.patient.subdistrict}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 block">เบอร์โทรติดต่อ:</span>
              <a
                href={`tel:${report.patient.phone}`}
                className="text-blue-600 font-bold flex items-center gap-1 mt-0.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{report.patient.phone || '042-719xxx'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. GPS Geolocation Capture Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">ยิงพิกัด GPS ณ บ้านผู้ป่วย</h3>
                <p className="text-[10px] text-slate-500">ความแม่นยำสูง (High-Accuracy GPS)</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {deviceType}
            </span>
          </div>

          {/* Big Tactile GPS Trigger Button */}
          <button
            onClick={handleCaptureGps}
            disabled={isLocating}
            className={`w-full py-4 px-4 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2.5 active:scale-98 ${
              isLocating
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {isLocating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>กำลังค้นหาสัญญาณดาวเทียม GPS...</span>
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                <span>📍 แตะเพื่อดึงพิกัด GPS ปัจจุบัน (Android & iOS)</span>
              </>
            )}
          </button>

          {/* Location Error Notice */}
          {locationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-bold">เกิดข้อผิดพลาดในการดึง GPS:</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">{locationError}</p>
              </div>
            </div>
          )}

          {/* GPS Coordinates & Accuracy Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">ละติจูด (Latitude):</span>
                <span className="font-bold text-slate-800 text-xs">{lat.toFixed(6)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">ลองจิจูด (Longitude):</span>
                <span className="font-bold text-slate-800 text-xs">{lng.toFixed(6)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ความแม่นยำ: <strong className="text-emerald-700">{accuracy ? `± ${accuracy} เมตร` : 'พิกัดเริ่มต้นตำบล'}</strong></span>
              </div>
              {gpsTimestamp && (
                <span className="text-[10px] text-slate-400">
                  {new Date(gpsTimestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                </span>
              )}
            </div>
          </div>

          {/* Mini Interactive Leaflet Map Pin Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-semibold">🗺️ แผนที่พิกัด GIS (ลากหมุดเพื่อปรับพิกัดได้):</span>
              <span className="text-blue-600 font-bold">รัศมีควบคุมโรค 100 เมตร</span>
            </div>
            <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <div ref={miniMapContainerRef} className="w-full h-full" />
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Navigation2 className="w-3.5 h-3.5 text-blue-600" />
              <span>เปิดนำทางด้วย Google Maps ไปยังพิกัดนี้</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* 3. Field Photo Evidence */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>ภาพถ่ายหน้างาน / แหล่งเพาะพันธุ์</span>
            </h3>
            <span className="text-[10px] text-slate-400">ไม่บังคับ</span>
          </div>

          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={photoPreview}
                alt="Field Survey Photo"
                className="w-full h-40 object-cover"
              />
              <button
                onClick={() => setPhotoPreview(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white text-xs"
              >
                ✕ ลบรูป
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition">
              <Camera className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">แตะเพื่อถ่ายรูปหรือเลือกรูปจากมือถือ</span>
              <span className="text-[10px] text-slate-400 mt-0.5">รองรับกล้องสมาร์ทโฟน Android และ iPhone</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* 4. Disease Control & Larval Index Survey (HI / CI) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>ผลการควบคุมโรค & สำรวจลูกน้ำ (HI / CI)</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              มาตรการ 3-3-1
            </span>
          </div>

          {/* HI / CI Inputs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                House Index (HI %):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={houseIndex}
                onChange={(e) => setHouseIndex(e.target.value)}
                placeholder="เช่น 0 หรือ 5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Container Index (CI %):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={containerIndex}
                onChange={(e) => setContainerIndex(e.target.value)}
                placeholder="เช่น 0 หรือ 3"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Control Activities Checklist */}
          <div className="space-y-2 pt-1 text-xs">
            <span className="font-bold text-slate-700 block text-[11px]">กิจกรรมที่ดำเนินการแล้ว:</span>
            
            <label className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200 transition">
              <input
                type="checkbox"
                checked={activitiesDone.includes('larval_destruction')}
                onChange={() => toggleActivity('larval_destruction')}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="font-medium text-slate-800">ใส่ทรายอะเบท (Temephos) / กำจัดแหล่งเพาะพันธุ์</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200 transition">
              <input
                type="checkbox"
                checked={chemicalSprayDone}
                onChange={(e) => setChemicalSprayDone(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="font-medium text-slate-800">พ่นหมอกควัน / สารเคมี ULV รัศมี 100 เมตร</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200 transition">
              <input
                type="checkbox"
                checked={activitiesDone.includes('health_education')}
                onChange={() => toggleActivity('health_education')}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="font-medium text-slate-800">สุขศึกษาประชาสัมพันธ์ & แจกยาทากันยุง</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200 transition">
              <input
                type="checkbox"
                checked={activitiesDone.includes('active_case_finding')}
                onChange={() => toggleActivity('active_case_finding')}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="font-medium text-slate-800">ค้นหาผู้มีอาการคล้ายกันในละแวกบ้าน (Active Case Finding)</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              บันทึกข้อสังเกตเพิ่มเติม:
            </label>
            <textarea
              rows={2}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              placeholder="เช่น ผู้ป่วยพักรักษาตัวที่บ้าน อาการดีขึ้น ทำลายลูกน้ำรอบบ้าน 5 หลังคาเรือน"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

        </div>

      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 shadow-lg">
        <div className="max-w-lg mx-auto flex gap-2">
          <button
            onClick={onBack}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSaveFieldData}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>💾 บันทึกพิกัดและผลควบคุมโรค</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
