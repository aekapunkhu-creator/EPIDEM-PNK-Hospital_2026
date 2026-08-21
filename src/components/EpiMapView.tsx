import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  Layers,
  Flame,
  Activity,
  Eye,
  Building2,
  Navigation,
  Compass,
  AlertTriangle,
  Hospital,
  Share2,
  Smartphone,
  SearchCheck,
  CheckCircle2,
  Radio,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  Map as MapIcon,
  ShieldAlert,
  Info,
  ExternalLink,
  Navigation2,
  Globe
} from 'lucide-react';
import { DiseaseReport, OutbreakEvent, SubdistrictInfo, VillageInfo } from '../types';
import { PHON_NA_KAEO_SUBDISTRICTS, PHON_NA_KAEO_VILLAGES, PHON_NA_KAEO_DISTRICT_CENTER } from '../data/mockData';

interface EpiMapViewProps {
  reports: DiseaseReport[];
  outbreaks: OutbreakEvent[];
  onSelectReport: (report: DiseaseReport) => void;
  onShareGpsLink?: (report: DiseaseReport) => void;
  onOpenMobileSurvey?: (report: DiseaseReport) => void;
}

// Subdistricts Polygon Boundaries for Phon Na Kaeo District (Sakon Nakhon)
// Calibrated around official center: 17.2226°N, 104.3094°E
const SUBDISTRICT_POLYGONS: Record<string, [number, number][]> = {
  'ตำบลนาแก้ว': [
    [17.1640, 104.3920],
    [17.1720, 104.3730],
    [17.2389, 104.2719],
    [17.2415, 104.2697],
    [17.2498, 104.2744],
    [17.2502, 104.2802],
    [17.2020, 104.3820],
    [17.1780, 104.4010],
  ],
  'ตำบลนาตงวัฒนา': [
    [17.1380, 104.3610],
    [17.1690, 104.3490],
    [17.1700, 104.3650],
    [17.1550, 104.3740],
    [17.1390, 104.3790],
  ],
  'ตำบลบ้านแป้น': [
    [17.2020, 104.3350],
    [17.2080, 104.3280],
    [17.2180, 104.3210],
    [17.2280, 104.3320],
    [17.2340, 104.3440],
    [17.2260, 104.3520],
    [17.2110, 104.3430],
  ],
  'ตำบลบ้านโพน': [
    [17.1860, 104.4290],
    [17.1890, 104.4120],
    [17.2060, 104.4150],
    [17.2150, 104.4210],
    [17.2180, 104.4350],
  ],
  'ตำบลเชียงสือ': [
    [17.1080, 104.3590],
    [17.1120, 104.3480],
    [17.1330, 104.3390],
    [17.1350, 104.3580],
    [17.1280, 104.3670],
    [17.1180, 104.3630],
  ],
};

const SUBDISTRICT_COLORS: Record<string, { fill: string; stroke: string; activeFill: string }> = {
  'ตำบลนาแก้ว': { fill: '#3b82f6', stroke: '#1d4ed8', activeFill: '#60a5fa' },
  'ตำบลนาตงวัฒนา': { fill: '#8b5cf6', stroke: '#6d28d9', activeFill: '#a78bfa' },
  'ตำบลบ้านแป้น': { fill: '#10b981', stroke: '#047857', activeFill: '#34d399' },
  'ตำบลบ้านโพน': { fill: '#0ea5e9', stroke: '#0284c7', activeFill: '#38bdf8' },
  'ตำบลเชียงสือ': { fill: '#f59e0b', stroke: '#d97706', activeFill: '#fbbf24' },
};

// Health Facilities in Phon Na Kaeo (Calibrated coordinates)
const HEALTH_FACILITIES = [
  {
    id: 'hospital_pnk',
    name: 'โรงพยาบาลโพนนาแก้ว',
    type: 'hospital',
    role: 'ศูนย์ปฏิบัติการควบคุมโรค & สารสนเทศระบาดวิทยา (Node กลาง)',
    lat: 17.221402,
    lng: 104.287914,
    phone: '042-707003',
  },
  {
    id: 'pcu_nk',
    name: 'รพ.สต.นาแก้ว',
    type: 'pcu',
    subdistrict: 'ตำบลนาแก้ว',
    lat: 17.2260,
    lng: 104.3120,
    phone: '042-719123',
  },
  {
    id: 'pcu_nt',
    name: 'รพ.สต.นาตงวัฒนา',
    type: 'pcu',
    subdistrict: 'ตำบลนาตงวัฒนา',
    lat: 17.1850,
    lng: 104.2850,
    phone: '042-719124',
  },
  {
    id: 'pcu_bp',
    name: 'รพ.สต.บ้านแป้น',
    type: 'pcu',
    subdistrict: 'ตำบลบ้านแป้น',
    lat: 17.2550,
    lng: 104.2750,
    phone: '042-719125',
  },
  {
    id: 'pcu_bphon',
    name: 'รพ.สต.บ้านโพน',
    type: 'pcu',
    subdistrict: 'ตำบลบ้านโพน',
    lat: 17.2450,
    lng: 104.3600,
    phone: '042-719126',
  },
  {
    id: 'pcu_cs',
    name: 'รพ.สต.เชียงสือ',
    type: 'pcu',
    subdistrict: 'ตำบลเชียงสือ',
    lat: 17.1650,
    lng: 104.3350,
    phone: '042-719127',
  },
];

// Helper to get color by disease
const getDiseaseColor = (disease: string) => {
  switch (disease) {
    case 'Dengue':
      return { main: '#e11d48', bg: '#ffe4e6', border: '#be123c', name: 'ไข้เลือดออก' };
    case 'HFMD':
      return { main: '#d97706', bg: '#fef3c7', border: '#b45309', name: 'มือเท้าปาก' };
    case 'Influenza':
      return { main: '#2563eb', bg: '#dbeafe', border: '#1d4ed8', name: 'ไข้หวัดใหญ่' };
    case 'Diarrhea':
      return { main: '#9333ea', bg: '#f3e8ff', border: '#7e22ce', name: 'อุจจาระร่วง' };
    case 'Leptospirosis':
    case 'Melioidosis':
      return { main: '#059669', bg: '#d1fae5', border: '#047857', name: 'ฉี่หนู/เมลิออยด์' };
    default:
      return { main: '#475569', bg: '#f1f5f9', border: '#334155', name: disease };
  }
};

export const EpiMapView: React.FC<EpiMapViewProps> = ({
  reports,
  outbreaks,
  onSelectReport,
  onShareGpsLink,
  onOpenMobileSurvey,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups refs for efficient targeted updates
  const subdistrictLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const bufferLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const casesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const villagesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const outbreaksLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter States
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('all');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [selectedDisease, setSelectedDisease] = useState<string>('all');
  
  // Layer Visibility Toggles
  const [showBufferZones, setShowBufferZones] = useState<boolean>(true);
  const [showVillageMarkers, setShowVillageMarkers] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [showOutbreakClusters, setShowOutbreakClusters] = useState<boolean>(true);
  const [showSubdistrictBounds, setShowSubdistrictBounds] = useState<boolean>(true);

  // Basemap style mode (Supports Google Maps Tiles & Leaflet)
  const [basemapType, setBasemapType] = useState<'google_road' | 'google_hybrid' | 'google_terrain' | 'positron' | 'osm' | 'dark'>('google_hybrid');

  // Inspector & Hovered Item State
  const [selectedCase, setSelectedCase] = useState<DiseaseReport | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ type: 'case' | 'village' | 'subdistrict' | 'outbreak'; data: any } | null>(null);

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (selectedSubdistrict !== 'all' && r.patient.subdistrict !== selectedSubdistrict) return false;
      if (selectedVillage !== 'all' && r.patient.villageName !== selectedVillage) return false;
      if (selectedDisease !== 'all' && r.disease !== selectedDisease) return false;
      return true;
    });
  }, [reports, selectedSubdistrict, selectedVillage, selectedDisease]);

  // Filtered villages
  const relevantVillages = useMemo(() => {
    if (selectedSubdistrict === 'all') return PHON_NA_KAEO_VILLAGES;
    const subObj = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.nameTh === selectedSubdistrict);
    if (!subObj) return PHON_NA_KAEO_VILLAGES;
    return PHON_NA_KAEO_VILLAGES.filter(v => v.subdistrictId === subObj.id);
  }, [selectedSubdistrict]);

  // Subdistrict stats for sidebar
  const subdistrictStats = useMemo(() => {
    return PHON_NA_KAEO_SUBDISTRICTS.map(s => {
      const caseCount = reports.filter(r => r.patient.subdistrict === s.nameTh).length;
      const dengueCount = reports.filter(r => r.patient.subdistrict === s.nameTh && r.disease === 'Dengue').length;
      return {
        ...s,
        caseCount,
        dengueCount,
      };
    });
  }, [reports]);

  // 1. Initialize Leaflet Map with Phon Na Kaeo Official Center
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Official Phon Na Kaeo District (17.2226, 104.3094)
      const map = L.map(mapContainerRef.current, {
        center: [PHON_NA_KAEO_DISTRICT_CENTER.lat, PHON_NA_KAEO_DISTRICT_CENTER.lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Add custom zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add attribution in bottom left
      L.control.attribution({ position: 'bottomleft', prefix: 'Google Maps GIS • อ.โพนนาแก้ว สกลนคร' }).addTo(map);

      // Initialize layer groups
      subdistrictLayerGroupRef.current = L.layerGroup().addTo(map);
      bufferLayerGroupRef.current = L.layerGroup().addTo(map);
      outbreaksLayerGroupRef.current = L.layerGroup().addTo(map);
      facilitiesLayerGroupRef.current = L.layerGroup().addTo(map);
      villagesLayerGroupRef.current = L.layerGroup().addTo(map);
      casesLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Update Basemap Tile Layer (Google Maps Tiles, Carto, OSM)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Google Hybrid default
    let subdomains: string | string[] = 'abcd';
    let maxZoom = 20;

    if (basemapType === 'google_road') {
      url = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      subdomains = [];
    } else if (basemapType === 'google_hybrid') {
      url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      subdomains = [];
    } else if (basemapType === 'google_terrain') {
      url = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      subdomains = [];
    } else if (basemapType === 'positron') {
      url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
    } else if (basemapType === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    } else if (basemapType === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
    }

    const newTileLayer = L.tileLayer(url, {
      maxZoom,
      subdomains,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [basemapType]);

  // 3. Render Subdistrict Boundary Polygons
  useEffect(() => {
    const group = subdistrictLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!group || !map) return;

    group.clearLayers();

    if (!showSubdistrictBounds) return;

    PHON_NA_KAEO_SUBDISTRICTS.forEach((sub) => {
      const polygonCoords = SUBDISTRICT_POLYGONS[sub.nameTh];
      if (!polygonCoords) return;

      const colors = SUBDISTRICT_COLORS[sub.nameTh] || { fill: '#3b82f6', stroke: '#1d4ed8', activeFill: '#60a5fa' };
      const isSelected = selectedSubdistrict === sub.nameTh;
      const subReportCount = reports.filter(r => r.patient.subdistrict === sub.nameTh).length;

      const polygon = L.polygon(polygonCoords, {
        color: colors.stroke,
        weight: isSelected ? 3 : 1.5,
        fillColor: isSelected ? colors.activeFill : colors.fill,
        fillOpacity: isSelected ? 0.25 : 0.08,
        dashArray: isSelected ? undefined : '4, 4',
      });

      // Tooltip
      polygon.bindTooltip(
        `<div class="text-xs">
          <strong>${sub.nameTh}</strong><br/>
          <span class="text-[10px] text-slate-300">${sub.healthCenter} • ผู้ป่วย ${subReportCount} เคส</span>
        </div>`,
        { sticky: true, className: 'leaflet-custom-tooltip' }
      );

      // Click event
      polygon.on('click', () => {
        const next = selectedSubdistrict === sub.nameTh ? 'all' : sub.nameTh;
        setSelectedSubdistrict(next);
        setSelectedVillage('all');
        if (next !== 'all') {
          map.flyTo([sub.centerLat, sub.centerLng], 13, { duration: 1 });
        }
      });

      polygon.on('mouseover', () => {
        polygon.setStyle({ fillOpacity: 0.3, weight: 2.5 });
        setHoveredItem({ type: 'subdistrict', data: sub });
      });

      polygon.on('mouseout', () => {
        polygon.setStyle({ fillOpacity: isSelected ? 0.25 : 0.08, weight: isSelected ? 3 : 1.5 });
      });

      polygon.addTo(group);

      // Label at subdistrict center
      const labelIcon = L.divIcon({
        className: 'subdistrict-label-icon',
        html: `
          <div style="transform: translate(-50%, -50%); pointer-events: none;" class="text-center">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs whitespace-nowrap ${
              isSelected ? 'bg-blue-600 text-white ring-2 ring-white' : 'bg-white/90 text-slate-700 border border-slate-200'
            }">
              ${sub.nameTh} (${subReportCount})
            </span>
          </div>
        `,
        iconSize: [0, 0],
      });

      L.marker([sub.centerLat, sub.centerLng], { icon: labelIcon, interactive: false }).addTo(group);
    });
  }, [showSubdistrictBounds, selectedSubdistrict, reports]);

  // 4. Render Health Facilities (Hospital & 5 PCUs)
  useEffect(() => {
    const group = facilitiesLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!showFacilities) return;

    HEALTH_FACILITIES.forEach((fac) => {
      const isHospital = fac.type === 'hospital';

      const icon = L.divIcon({
        className: 'facility-marker-icon',
        html: isHospital
          ? `
            <div style="transform: translate(-50%, -50%);" class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-sm hover:scale-110 transition">
                H
              </div>
              <span class="absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-900 text-white rounded text-[9px] font-bold shadow-md whitespace-nowrap">
                รพ.โพนนาแก้ว (Node กลาง)
              </span>
            </div>
          `
          : `
            <div style="transform: translate(-50%, -50%);" class="relative group cursor-pointer">
              <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-[10px] hover:scale-110 transition">
                +
              </div>
              <span class="absolute top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-emerald-800 text-white rounded text-[8px] font-medium shadow whitespace-nowrap">
                ${fac.name}
              </span>
            </div>
          `,
        iconSize: [0, 0],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon });

      marker.bindPopup(`
        <div class="p-3 max-w-[220px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${isHospital ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}">
              ${isHospital ? 'โรงพยาบาลแม่ข่าย' : 'รพ.สต.'}
            </span>
          </div>
          <h4 class="font-bold text-slate-800 text-xs">${fac.name}</h4>
          <p class="text-[10px] text-slate-500 mt-0.5">${fac.role || fac.subdistrict || ''}</p>
          <p class="text-[10px] text-slate-600 mt-1">📞 โทร: <a href="tel:${fac.phone}" class="text-blue-600 font-bold">${fac.phone}</a></p>
          <div class="mt-2 pt-2 border-t border-slate-100">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}" 
              target="_blank" 
              rel="noreferrer"
              class="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800"
            >
              📍 นำทางด้วย Google Maps ↗
            </a>
          </div>
        </div>
      `);

      marker.addTo(group);
    });
  }, [showFacilities]);

  // 5. Render Village Markers (53 หมู่บ้าน)
  useEffect(() => {
    const group = villagesLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!showVillageMarkers) return;

    relevantVillages.forEach((v) => {
      const villageCases = reports.filter(r => r.patient.villageName === v.name).length;
      const isSelected = selectedVillage === v.name;

      const icon = L.divIcon({
        className: 'village-marker-icon',
        html: `
          <div style="transform: translate(-50%, -50%);" class="group cursor-pointer flex flex-col items-center">
            <div class="w-3.5 h-3.5 rounded-full ${
              villageCases > 0 
                ? 'bg-rose-500 ring-2 ring-white shadow-md animate-pulse' 
                : 'bg-emerald-500 ring-1 ring-white opacity-80'
            } ${isSelected ? 'ring-3 ring-blue-500 scale-125' : ''}"></div>
            <span class="text-[8px] font-medium text-slate-700 bg-white/85 px-1 rounded shadow-2xs whitespace-nowrap mt-0.5 group-hover:bg-slate-900 group-hover:text-white transition">
              ${v.name} (ม.${v.moo})
            </span>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([v.lat, v.lng], { icon });

      marker.on('click', () => {
        setSelectedVillage(selectedVillage === v.name ? 'all' : v.name);
        setHoveredItem({ type: 'village', data: { ...v, villageCases } });
      });

      marker.bindPopup(`
        <div class="p-3 max-w-[220px]">
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">ข้อมูลหมู่บ้าน</span>
          <h4 class="font-bold text-slate-800 text-xs mt-1">${v.name} (หมู่ที่ ${v.moo})</h4>
          <p class="text-[10px] text-slate-500">หลังคาเรือน: ${v.households} หลัง • ประชากร: ${v.population} คน</p>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span class="text-slate-500">ผู้ป่วยสะสม:</span>
            <strong class="${villageCases > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}">${villageCases} เคส</strong>
          </div>
          <div class="mt-2 pt-1 border-t border-slate-100">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}" 
              target="_blank" 
              rel="noreferrer"
              class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-800"
            >
              📍 นำทางไปหมู่บ้าน (Google Maps) ↗
            </a>
          </div>
        </div>
      `);

      marker.addTo(group);
    });
  }, [showVillageMarkers, relevantVillages, selectedVillage, reports]);

  // 6. Render Outbreak Clusters
  useEffect(() => {
    const group = outbreaksLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!showOutbreakClusters) return;

    outbreaks.filter(o => o.status !== 'closed').forEach((ob) => {
      // Outbreak dynamic circle
      const circle = L.circle([ob.centerLat, ob.centerLng], {
        radius: ob.radiusMeters || 350,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '6, 6',
      });

      circle.bindTooltip(
        `<div class="text-xs font-bold text-rose-300">
          🔥 คลัสเตอร์: ${ob.title}<br/>
          <span class="text-[10px] text-white">ผู้ป่วยในกลุ่มก้อน: ${ob.totalCases} เคส (${ob.subdistrict})</span>
        </div>`,
        { sticky: true }
      );

      circle.addTo(group);

      // Outbreak Icon Tag
      const clusterIcon = L.divIcon({
        className: 'cluster-tag-icon',
        html: `
          <div style="transform: translate(-50%, -50%);" class="cursor-pointer flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-lg ring-2 ring-white animate-bounce">
            <span>🔥</span>
            <span>${ob.title} (${ob.totalCases})</span>
          </div>
        `,
        iconSize: [0, 0],
      });

      L.marker([ob.centerLat, ob.centerLng], { icon: clusterIcon }).addTo(group);
    });
  }, [showOutbreakClusters, outbreaks]);

  // 7. Render Spot Cases (จุดผู้ป่วย 506) & 100m Buffer Zones
  useEffect(() => {
    const casesGroup = casesLayerGroupRef.current;
    const bufferGroup = bufferLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!casesGroup || !bufferGroup || !map) return;

    casesGroup.clearLayers();
    bufferGroup.clearLayers();

    filteredReports.forEach((r) => {
      const lat = r.patient.lat || PHON_NA_KAEO_DISTRICT_CENTER.lat;
      const lng = r.patient.lng || PHON_NA_KAEO_DISTRICT_CENTER.lng;
      const isSelected = selectedCase?.id === r.id;
      const diseaseInfo = getDiseaseColor(r.disease);

      // 100-Meter Surveillance Buffer Circle (3-3-1 Ring)
      if (showBufferZones) {
        const buffer = L.circle([lat, lng], {
          radius: 100, // 100 meters
          color: diseaseInfo.border,
          fillColor: diseaseInfo.main,
          fillOpacity: isSelected ? 0.22 : 0.10,
          weight: isSelected ? 2 : 1,
          dashArray: '3, 3',
        });

        buffer.bindTooltip(`รัศมีควบคุมโรค 100m: ${r.patient.prefix}${r.patient.firstName} (${r.diseaseNameTh})`, {
          sticky: true,
        });

        buffer.addTo(bufferGroup);
      }

      // Disease Spot Marker
      const markerHtml = `
        <div style="transform: translate(-50%, -50%);" class="relative group cursor-pointer">
          ${r.status === 'reported' ? '<div class="absolute inset-0 rounded-full animate-marker-pulse" style="background-color: ' + diseaseInfo.main + ';"></div>' : ''}
          <div class="w-5 h-5 rounded-full border-2 ${isSelected ? 'border-slate-900 ring-4 ring-rose-400 scale-125' : 'border-white'} shadow-md flex items-center justify-center transition" style="background-color: ${diseaseInfo.main};">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const spotIcon = L.divIcon({
        className: 'case-spot-icon',
        html: markerHtml,
        iconSize: [0, 0],
      });

      const spotMarker = L.marker([lat, lng], { icon: spotIcon, zIndexOffset: isSelected ? 1000 : 100 });

      // Click to select case
      spotMarker.on('click', () => {
        setSelectedCase(r);
        setHoveredItem({ type: 'case', data: r });
      });

      // Custom Leaflet Popup with Google Maps Navigation Action
      const popupHtml = `
        <div class="p-3.5 max-w-[260px] text-xs font-sans">
          <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: ${diseaseInfo.main};">
              ${r.diseaseNameTh}
            </span>
            <span class="text-[10px] font-mono text-blue-600 font-bold">HN: ${r.patient.hn}</span>
          </div>

          <h4 class="font-bold text-slate-900 text-sm">
            ${r.patient.prefix}${r.patient.firstName} ${r.patient.lastName}
          </h4>
          <p class="text-[11px] text-slate-500 mt-0.5">อายุ ${r.patient.age} ปี • อาชีพ: ${r.patient.occupation}</p>

          <div class="mt-2.5 p-2 bg-slate-50 rounded-xl space-y-1 text-[10px] text-slate-600 border border-slate-100">
            <div>📍 <strong>พื้นที่:</strong> ${r.patient.villageName} ม.${r.patient.moo} ${r.patient.subdistrict}</div>
            <div>🌐 <strong>พิกัด:</strong> ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
            <div>📅 <strong>วันเริ่มป่วย:</strong> ${r.onsetDate}</div>
            <div>🏥 <strong>หน่วยรับแจ้ง:</strong> ${r.reportingUnit}</div>
          </div>

          <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
              target="_blank" 
              rel="noreferrer"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
            >
              🚗 นำทางด้วย Google Maps ↗
            </a>
          </div>
        </div>
      `;

      spotMarker.bindPopup(popupHtml);

      spotMarker.addTo(casesGroup);
    });
  }, [filteredReports, showBufferZones, selectedCase]);

  // Center to Phon Na Kaeo District Center
  const handleResetToDistrict = () => {
    setSelectedSubdistrict('all');
    setSelectedVillage('all');
    setSelectedDisease('all');
    setSelectedCase(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([PHON_NA_KAEO_DISTRICT_CENTER.lat, PHON_NA_KAEO_DISTRICT_CENTER.lng], 12, { duration: 1 });
    }
  };

  // Fly to specific case when selected
  const handleFlyToCase = (caseItem: DiseaseReport) => {
    setSelectedCase(caseItem);
    if (mapInstanceRef.current && caseItem.patient.lat && caseItem.patient.lng) {
      mapInstanceRef.current.flyTo([caseItem.patient.lat, caseItem.patient.lng], 16, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                  แผนที่ระบาดวิทยา อำเภอโพนนาแก้ว จังหวัดสกลนคร
                </h1>
                <a
                  href={PHON_NA_KAEO_DISTRICT_CENTER.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-[10px] font-bold transition"
                  title="เปิดตำแหน่งอำเภอโพนนาแก้วใน Google Maps"
                >
                  <Globe className="w-3 h-3 text-blue-600" />
                  <span>Google Maps: 17.2226°N, 104.3094°E</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ระบบแผนที่ GIS ตำแหน่งผู้ป่วย 506 รัศมีควบคุมโรค 100 เมตร ขอบเขต 5 ตำบล และ 53 หมู่บ้าน อ.โพนนาแก้ว
              </p>
            </div>
          </div>
        </div>

        {/* Basemap Styles & Layer Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Basemap Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setBasemapType('google_hybrid')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                basemapType === 'google_hybrid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛰️ Google ดาวเทียม
            </button>
            <button
              onClick={() => setBasemapType('google_road')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                basemapType === 'google_road' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗺️ Google ถนน
            </button>
            <button
              onClick={() => setBasemapType('google_terrain')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                basemapType === 'google_terrain' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⛰️ ภูมิประเทศ
            </button>
            <button
              onClick={() => setBasemapType('positron')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                basemapType === 'positron' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GIS สะอาด
            </button>
          </div>

          <a
            href={PHON_NA_KAEO_DISTRICT_CENTER.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-sm shadow-blue-600/20 transition"
          >
            <Navigation2 className="w-3.5 h-3.5" />
            <span>เปิดใน Google Maps</span>
          </a>
        </div>
      </div>

      {/* Layer Toggles & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 text-xs">
        
        {/* Layer Visibility Checkboxes */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>ชั้นข้อมูล:</span>
            </span>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/80 rounded-xl border border-rose-200/80 text-rose-800 cursor-pointer hover:bg-rose-100/70 transition">
              <input
                type="checkbox"
                checked={showBufferZones}
                onChange={(e) => setShowBufferZones(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="font-bold">วงแหวน 100m (3-3-1)</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-emerald-800 cursor-pointer hover:bg-emerald-100/70 transition">
              <input
                type="checkbox"
                checked={showVillageMarkers}
                onChange={(e) => setShowVillageMarkers(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-bold">จุดหมู่บ้าน (53 หมู่)</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 rounded-xl border border-blue-200/80 text-blue-800 cursor-pointer hover:bg-blue-100/70 transition">
              <input
                type="checkbox"
                checked={showFacilities}
                onChange={(e) => setShowFacilities(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-bold">รพ. / 5 รพ.สต.</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 rounded-xl border border-purple-200/80 text-purple-800 cursor-pointer hover:bg-purple-100/70 transition">
              <input
                type="checkbox"
                checked={showSubdistrictBounds}
                onChange={(e) => setShowSubdistrictBounds(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-bold">ขอบเขต 5 ตำบล</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50/80 rounded-xl border border-red-200/80 text-red-800 cursor-pointer hover:bg-red-100/70 transition">
              <input
                type="checkbox"
                checked={showOutbreakClusters}
                onChange={(e) => setShowOutbreakClusters(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className="font-bold">คลัสเตอร์ระบาด 🔥</span>
            </label>
          </div>

          <button
            onClick={handleResetToDistrict}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตศูนย์กลาง อ.โพนนาแก้ว</span>
          </button>
        </div>

        {/* Dropdown Filters (Subdistrict -> Village -> Disease) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Subdistrict Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">ตำบล:</span>
              <select
                value={selectedSubdistrict}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSubdistrict(val);
                  setSelectedVillage('all');
                  if (val !== 'all') {
                    const subObj = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.nameTh === val);
                    if (subObj && mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([subObj.centerLat, subObj.centerLng], 13, { duration: 1 });
                    }
                  }
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 font-medium"
              >
                <option value="all">ทุกตำบล (5 ตำบล)</option>
                <option value="ตำบลนาแก้ว">ตำบลนาแก้ว (14 หมู่บ้าน)</option>
                <option value="ตำบลนาตงวัฒนา">ตำบลนาตงวัฒนา (12 หมู่บ้าน)</option>
                <option value="ตำบลบ้านแป้น">ตำบลบ้านแป้น (10 หมู่บ้าน)</option>
                <option value="ตำบลบ้านโพน">ตำบลบ้านโพน (9 หมู่บ้าน)</option>
                <option value="ตำบลเชียงสือ">ตำบลเชียงสือ (8 หมู่บ้าน)</option>
              </select>
            </div>

            {/* Village Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">หมู่บ้าน:</span>
              <select
                value={selectedVillage}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedVillage(val);
                  if (val !== 'all') {
                    const vObj = PHON_NA_KAEO_VILLAGES.find(v => v.name === val);
                    if (vObj && mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([vObj.lat, vObj.lng], 15, { duration: 1.2 });
                    }
                  }
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 font-medium"
              >
                <option value="all">ทุกหมู่บ้าน ({relevantVillages.length} หมู่)</option>
                {relevantVillages.map(v => (
                  <option key={v.id} value={v.name}>
                    {v.name} (ม.{v.moo})
                  </option>
                ))}
              </select>
            </div>

            {/* Disease Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">กลุ่มโรค:</span>
              <select
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 font-medium"
              >
                <option value="all">ทุกโรคเฝ้าระวัง 506</option>
                <option value="Dengue">โรคไข้เลือดออก (DHF/DF)</option>
                <option value="HFMD">โรคมือ เท้า ปาก (HFMD)</option>
                <option value="Influenza">โรคไข้หวัดใหญ่</option>
                <option value="Diarrhea">อุจจาระร่วง / อาหารเป็นพิษ</option>
                <option value="Leptospirosis">ไข้ฉี่หนู</option>
                <option value="Melioidosis">เมลิออยโดสิส</option>
              </select>
            </div>
          </div>

          {/* Disease Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs"></span>
              <span>ไข้เลือดออก</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs"></span>
              <span>HFMD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-xs"></span>
              <span>ไข้หวัดใหญ่</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-xs"></span>
              <span>อุจจาระร่วง</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
              <span>ฉี่หนู/เมลิออยด์</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Leaflet Map Container (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[620px] relative">
          
          {/* Map Top Status Bar */}
          <div className="flex items-center justify-between z-10 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700">
                {selectedSubdistrict === 'all' 
                  ? 'แผนที่พิกัดระบาดวิทยา 5 ตำบล 53 หมู่บ้าน อ.โพนนาแก้ว' 
                  : `มุมมองเฉพาะ: ${selectedSubdistrict}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                พบผู้ป่วยตรงตามเงื่อนไข <strong className="text-blue-600 font-bold">{filteredReports.length}</strong> จุด
              </span>
            </div>
          </div>

          {/* Real Leaflet Map DOM Element */}
          <div className="flex-1 w-full min-h-[480px] rounded-2xl overflow-hidden my-3 border border-slate-200 relative shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />
          </div>

          {/* Map Bottom Footer Controls */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-3">
              <span>📍 พิกัดกลางอำเภอ: {PHON_NA_KAEO_DISTRICT_CENTER.lat.toFixed(4)}°N, {PHON_NA_KAEO_DISTRICT_CENTER.lng.toFixed(4)}°E</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">ขับเคลื่อนด้วย Google Maps Tile & Leaflet Engine</span>
            </div>
            
            <div className="flex items-center gap-2">
              <a
                href={PHON_NA_KAEO_DISTRICT_CENTER.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
              >
                <span>เปิดแผนที่ Google Maps เต็มจอ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Spot Details & Inspection Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Spot Inspector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>ข้อมูลจุดระบาด (Spot Inspector)</span>
              </span>
              {selectedCase && (
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-medium px-2 py-0.5 bg-slate-100 rounded-lg"
                >
                  ปิดหน้านี้
                </button>
              )}
            </h2>

            {selectedCase ? (
              <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
                <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                      {selectedCase.diseaseNameTh}
                    </span>
                    <span className="text-[10px] text-blue-700 font-mono font-bold">
                      HN: {selectedCase.patient.hn}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-sm mt-2">
                    {selectedCase.patient.prefix}{selectedCase.patient.firstName} {selectedCase.patient.lastName}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    อายุ {selectedCase.patient.age} ปี • อาชีพ: {selectedCase.patient.occupation}
                  </p>
                </div>

                <div className="space-y-2 text-slate-600 text-[11px] bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <p>📍 <strong>พื้นที่:</strong> {selectedCase.patient.villageName} ม.{selectedCase.patient.moo} {selectedCase.patient.subdistrict}</p>
                  <p>🌐 <strong>พิกัด GPS:</strong> {selectedCase.patient.lat.toFixed(5)}°N, {selectedCase.patient.lng.toFixed(5)}°E</p>
                  {selectedCase.patient.gpsAccuracy && (
                    <p className="text-emerald-700 font-medium">
                      🎯 ความแม่นยำ GPS: ±{selectedCase.patient.gpsAccuracy} เมตร ({selectedCase.patient.gpsDeviceType || 'Mobile'})
                    </p>
                  )}
                  <p>📅 <strong>วันเริ่มป่วย:</strong> {selectedCase.onsetDate}</p>
                  <p>🏥 <strong>หน่วยรับแจ้ง:</strong> {selectedCase.reportingUnit}</p>
                  <p>🧪 <strong>ผลตรวจ Lab:</strong> {selectedCase.labResult?.testName} ({selectedCase.labResult?.result})</p>
                </div>

                {/* Google Maps Navigation & Field Action Buttons */}
                <div className="space-y-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCase.patient.lat},${selectedCase.patient.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition"
                  >
                    <Navigation2 className="w-3.5 h-3.5" />
                    <span>นำทางไปยังบ้านผู้ป่วย (Google Maps)</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>

                  {onOpenMobileSurvey && (
                    <button
                      onClick={() => onOpenMobileSurvey(selectedCase)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>ยิงพิกัด GPS & ลงควบคุมโรค 3-3-1</span>
                    </button>
                  )}

                  {onShareGpsLink && (
                    <button
                      onClick={() => onShareGpsLink(selectedCase)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>ส่งลิงก์มือถือ (Android/iOS) ให้ รพ.สต.</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectReport(selectedCase)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <SearchCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>ดูประวัติการสอบสวนโรค</span>
                  </button>
                </div>
              </div>
            ) : hoveredItem?.type === 'village' ? (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                    ข้อมูลหมู่บ้าน
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1.5">
                    {hoveredItem.data.name} (หมู่ที่ {hoveredItem.data.moo})
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    หลังคาเรือน: {hoveredItem.data.households} หลัง • ประชากร: {hoveredItem.data.population} คน
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 text-[11px] space-y-2">
                  <p>📍 พิกัดหมู่บ้าน: {hoveredItem.data.lat}°N, {hoveredItem.data.lng}°E</p>
                  <p>🦟 ผู้ป่วยสะสมในหมู่บ้านนี้: <strong>{hoveredItem.data.villageCases} เคส</strong></p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hoveredItem.data.lat},${hoveredItem.data.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold pt-1"
                  >
                    <span>เปิดเส้นทางนำทาง Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="font-bold text-slate-600">คลิกที่จุดผู้ป่วยบนแผนที่ Google Maps</p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  เพื่อดูข้อมูลรายบุคคล รัศมีควบคุมโรค 100 เมตร และเปิดระบบนำทาง Google Maps ไปยังบ้านผู้ป่วย
                </p>
              </div>
            )}
          </div>

          {/* Subdistricts Distribution Summary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-xs space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center justify-between">
              <span>ภาระโรค 5 ตำบล (อำเภอโพนนาแก้ว)</span>
              <span className="text-[11px] text-blue-600 font-bold">รวม {reports.length} เคส</span>
            </h3>

            <div className="space-y-2">
              {subdistrictStats.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => {
                    const next = selectedSubdistrict === s.nameTh ? 'all' : s.nameTh;
                    setSelectedSubdistrict(next);
                    setSelectedVillage('all');
                    if (next !== 'all' && mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([s.centerLat, s.centerLng], 13, { duration: 1 });
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition cursor-pointer ${
                    selectedSubdistrict === s.nameTh 
                      ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20' 
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{s.nameTh}</p>
                    <p className="text-[10px] text-slate-400">{s.healthCenter} • {s.villagesCount} หมู่บ้าน</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600 text-xs">{s.caseCount} เคส</span>
                    {s.dengueCount > 0 && (
                      <p className="text-[10px] text-rose-600 font-medium">ไข้เลือดออก {s.dengueCount}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

