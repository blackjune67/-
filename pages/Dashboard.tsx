import React, { useState } from 'react';
import { 
  Users, Activity, DollarSign, ArrowUp, ArrowDown, 
  Sparkles, Clock, X, Loader2, Smartphone, CreditCard, ShoppingCart,
  Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Bell, AlertCircle, Flag, Target, PieChart as PieChartIcon, BarChart2,
  Monitor, Store, MousePointerClick, CheckCircle2, TrendingUp, Ticket, MapPin, Footprints, LogIn, LogOut,
  AlertTriangle, Wrench, Umbrella, Car, Zap, Droplets, Thermometer, Wind, Siren, CheckCircle, Clock3, ParkingSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, LineChart, PieChart, Pie, Cell, Legend, BarChart, RadialBarChart, RadialBar
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  modelId: number;
}

// --- Custom Tooltip for Revenue Analysis ---
const RevenueAnalysisTooltip = ({ active, payload, label, unit = "억" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-sm font-bold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-xs font-bold" style={{ color: p.color }}>
              {p.name} : {p.value.toLocaleString()}{p.unit || unit}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- Custom Tooltip for ARPU Analysis ---
const ArpuTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-sm font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
            <span className="text-xs font-medium text-gray-500 min-w-[60px]">{p.name}</span>
            <span className="text-xs font-bold text-gray-800">
              {p.name === '매출액' ? `${(p.value / 10000).toLocaleString()}만원` : `${p.value.toLocaleString()}명`}
            </span>
          </div>
        ))}
        {payload.length >= 2 && (
           <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
              <span className="text-xs font-bold text-purple-600">객단가(ARPU)</span>
              <span className="text-xs font-black text-gray-800">
                {(payload.find((p: any) => p.name === '매출액')?.value / payload.find((p: any) => p.name === '입장객')?.value || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}원
              </span>
           </div>
        )}
      </div>
    );
  }
  return null;
};

// --- Custom Tooltip for Total Tab (Legacy) ---
const TotalTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-xl">
        <p className="text-sm font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
           <p key={i} className="text-xs font-medium" style={{color: p.color}}>
             {p.name}: {p.value.toLocaleString()}
           </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Custom Tooltip for Category Analysis ---
const CategoryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-lg">
        <p className="text-xs font-bold text-gray-700 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
            <span className="text-[10px] text-gray-500 min-w-[60px]">{p.name}</span>
            <span className="text-[11px] font-bold text-gray-800">{p.value.toLocaleString()}원</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ modelId }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  
  // Dashboard Main Tabs: 'total' | 'revenue' | 'op' | 'notice'
  const [activeMainTab, setActiveMainTab] = useState('revenue');
  // Revenue Sub Tabs: 'daily' | 'monthly' | 'yearly'
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  // Channel Analysis Tab: 'all' | 'online' | 'onsite'
  const [channelTab, setChannelTab] = useState<'all' | 'online' | 'onsite'>('all');
  // Revenue/Entry Indicator Toggle
  const [subIndicatorTab, setSubIndicatorTab] = useState<'revenue' | 'entry'>('revenue');

  // Notice State
  const [isNoticeVisible, setIsNoticeVisible] = useState(true);
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
  const [currentNoticeIdx, setCurrentNoticeIdx] = useState(2);

  const notices = [
    { type: '장애', tagColor: 'bg-red-500', title: '정문 키오스크 K-003 발권 장애 (조치중)', date: '2024.01.26 13:45', author: '시스템운영팀' },
    { type: '긴급', tagColor: 'bg-red-600', title: '[긴급] 주차장 요금 정산 서버 간헐적 오류', date: '2024.01.26 14:10', author: 'IT지원팀' },
    { type: '공지', tagColor: 'bg-blue-600', title: '2024년 2월 어트랙션 정기 점검 일정 안내', date: '2024.01.26 09:00', author: '시설관리팀' },
    { type: '점검', tagColor: 'bg-yellow-500', title: '서버 정기 점검 안내 (02:00 ~ 04:00)', date: '2024.01.25 18:00', author: 'IT지원팀' },
  ];

  // --- Data for ARPU Analysis ---
  const arpuData = [
    { time: '09:00', revenue: 15000000, visitors: 500 },
    { time: '10:00', revenue: 48000000, visitors: 1500 },
    { time: '11:00', revenue: 72000000, visitors: 2200 },
    { time: '12:00', revenue: 65000000, visitors: 2800 },
    { time: '13:00', revenue: 85000000, visitors: 2000 },
    { time: '14:00', revenue: 78000000, visitors: 2100 },
    { time: '15:00', revenue: 60000000, visitors: 1800 },
    { time: '16:00', revenue: 45000000, visitors: 1200 },
    { time: '17:00', revenue: 35000000, visitors: 800 },
    { time: '18:00', revenue: 20000000, visitors: 400 },
  ];

  // --- Data for Entry Analysis ---
  const crowdMonitorData = {
    current: 3450,
    capacity: 5000,
    entry: 5240,
    exit: 1790
  };
  
  const arrivalPredData = [
    { time: '0m', value: 850 },
    { time: '+20m', value: 720 },
    { time: '+40m', value: 1100 },
    { time: '+60m', value: 750 },
    { time: '+80m', value: 920 },
    { time: '+100m', value: 580 },
  ];

  // Visitor Demographics Data (New)
  const visitorDemographicsData = [
    { name: '가족 (자녀 동반)', value: 45, color: '#3b82f6' },
    { name: '커플', value: 30, color: '#ec4899' },
    { name: '친구/단체', value: 15, color: '#8b5cf6' },
    { name: '기타', value: 10, color: '#94a3b8' },
  ];

  const gateStatusData = [
    { id: 'G1', name: '메인 게이트 1', ppm: 45, queue: 12, status: '원활' },
    { id: 'G2', name: '메인 게이트 2', ppm: 42, queue: 15, status: '원활' },
    { id: 'G3', name: '동문 게이트', ppm: 18, queue: 45, status: '혼잡' },
    { id: 'G4', name: '단체 전용', ppm: 35, queue: 28, status: '지연' },
  ];

  // --- Data for Total Tab (Legacy) ---
  const totalRevenueData = [
    { time: '09:00', today: 1500, yesterday: 1400, avg: 1300 },
    { time: '10:00', today: 4500, yesterday: 4200, avg: 4000 },
    { time: '11:00', today: 6000, yesterday: 5500, avg: 5200 },
    { time: '12:00', today: 5500, yesterday: 5600, avg: 4800 },
    { time: '13:00', today: 7000, yesterday: 6200, avg: 6000 },
    { time: '14:00', today: 6500, yesterday: 6100, avg: 5500 },
    { time: '15:00', today: 5000, yesterday: 4800, avg: 4500 },
    { time: '16:00', today: 3500, yesterday: 3800, avg: 3600 },
    { time: '17:00', today: 3000, yesterday: 2800, avg: 2800 },
    { time: '18:00', today: 1800, yesterday: 1600, avg: 1500 },
  ];
  const totalVisitorData = [
    { time: '09:00', entry: 500, exit: 100, yesterday: 450, avg: 400 },
    { time: '10:00', entry: 2500, exit: 200, yesterday: 2300, avg: 2100 },
    { time: '11:00', entry: 4500, exit: 300, yesterday: 4200, avg: 3900 },
    { time: '12:00', entry: 3000, exit: 450, yesterday: 3200, avg: 3000 },
    { time: '13:00', entry: 2000, exit: 500, yesterday: 1900, avg: 1800 },
    { time: '14:00', entry: 2600, exit: 800, yesterday: 2400, avg: 2300 },
    { time: '15:00', entry: 3500, exit: 1200, yesterday: 3300, avg: 3100 },
    { time: '16:00', entry: 3000, exit: 2500, yesterday: 2900, avg: 2800 },
    { time: '17:00', entry: 2000, exit: 3500, yesterday: 2100, avg: 2000 },
    { time: '18:00', entry: 1500, exit: 4500, yesterday: 1600, avg: 1500 },
  ];
  const miniChartData = [{ v: 10 }, { v: 15 }, { v: 8 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 25 }];

  // --- Data for Revenue Analysis (Synced with images) ---
  const dailyData = [
    { label: '09:00', 오늘: 0.15, 어제: 0.12, 작년동기: 0.10 },
    { label: '10:00', 오늘: 0.45, 어제: 0.48, 작년동기: 0.40 },
    { label: '11:00', 오늘: 0.60, 어제: 0.55, 작년동기: 0.52 },
    { label: '12:00', 오늘: 0.55, 어제: 0.56, 작년동기: 0.48 },
    { label: '13:00', 오늘: 0.72, 어제: 0.62, 작년동기: 0.60 },
    { label: '14:00', 오늘: 0.65, 어제: 0.61, 작년동기: 0.55 },
    { label: '15:00', 오늘: 0.50, 어제: 0.48, 작년동기: 0.45 },
    { label: '16:00', 오늘: 0.45, 어제: 0.38, 작년동기: 0.36 },
    { label: '17:00', 오늘: 0.30, 어제: 0.28, 작년동기: 0.28 },
    { label: '18:00', 오늘: 0.18, 어제: 0.16, 작년동기: 0.15 },
  ];

  const monthlyData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    let base = 4 + Math.sin(day * 0.5) * 1.5;
    return {
      label: `${day}일`,
      이번달: base + Math.random(),
      지난달: base - 0.5 + Math.random(),
      작년동기: base - 1 + Math.random(),
    };
  });

  const yearlyData = [
    { label: '1월', 이번해: 145, 목표: 150, 작년동기: 118 },
    { label: '2월', 이번해: 135, 목표: 150, 작년동기: 112 },
    { label: '3월', 이번해: 125, 목표: 150, 작년동기: 115 },
    { label: '4월', 이번해: 135, 목표: 150, 작년동기: 125 },
    { label: '5월', 이번해: 150, 목표: 150, 작년동기: 120 },
    { label: '6월', 이번해: 130, 목표: 150, 작년동기: 115 },
    { label: '7월', 이번해: 135, 목표: 150, 작년동기: 112 },
    { label: '8월', 이번해: 148, 목표: 150, 작년동기: 110 },
    { label: '9월', 이번해: 135, 목표: 150, 작년동기: 122 },
    { label: '10월', 이번해: 145, 목표: 150, 작년동기: 118 },
    { label: '11월', 이번해: 148, 목표: 150, 작년동기: 125 },
    { label: '12월', 이번해: 143, 목표: 150, 작년동기: 124 },
  ];

  // --- Data for Channel Analysis ---
  const channelAllData = [
    { name: '온라인 채널', value: 29330, raw: 65, color: '#3b82f6' }, // Blue
    { name: '현장 (키오스크/POS)', value: 15900, raw: 35, color: '#f97316' }, // Orange
  ];
  
  const channelOnlineData = [
    { name: '공식 홈페이지/앱', value: 45, color: '#3b82f6', sales: '4,200', entry: '3,800', conv: '90%' },
    { name: '네이버 예약', value: 30, color: '#22c55e', sales: '2,800', entry: '2,100', conv: '75%' },
    { name: '카카오 예약', value: 15, color: '#facc15', sales: '1,400', entry: '1,100', conv: '79%' },
    { name: '놀(Nol)', value: 10, color: '#ec4899', sales: '950', entry: '800', conv: '84%' },
  ];

  const channelOnsiteData = [
    { name: '정문 무인발권기 1', value: 3000, desc: 'Best: 성인 종일권', color: '#3b82f6' },
    { name: '정문 무인발권기 2', value: 2750, desc: 'Best: 청소년 종일권', color: '#60a5fa' },
    { name: '정문 무인발권기 3', value: 1800, desc: 'Best: 성인 종일권', color: '#93c5fd' },
    { name: '정문 안내데스크', value: 1500, desc: '유인 매표소 POS', subDesc: 'Best: 장애인 우대권', color: '#f59e0b' },
    { name: '기프트샵', value: 2850, desc: '메인 기프트샵 POS 1', subDesc: 'Best: 시그니처 머리띠', color: '#10b981' },
    { name: '버거하우스', value: 1700, desc: 'Best: 치즈버거 세트', color: '#ec4899' },
  ];

  const categoryDailyData = dailyData.map(d => ({
    label: d.label,
    entry: d.오늘 * 500,
    package: d.오늘 * 200,
    annual: d.오늘 * 100,
    group: d.오늘 * 150,
    fnb: d.오늘 * 300 + 50
  }));

  const categoryMonthlyData = monthlyData.map(d => ({
    label: d.label,
    entry: d.이번달 * 500,
    package: d.이번달 * 200,
    annual: d.이번달 * 100,
    group: d.이번달 * 150,
    fnb: d.이번달 * 300 + 50
  }));

  const categoryYearlyData = yearlyData.map(d => ({
    label: d.label,
    entry: d.이번해 * 50,
    package: d.이번해 * 20,
    annual: d.이번해 * 10,
    group: d.이번해 * 15,
    fnb: d.이번해 * 30 + 50
  }));

  // --- Mock Data for Real-time Operation ---
  const opAttractions = [
    { id: 'AT-01', name: 'T-Express', status: 'RUNNING', wait: 140, fastPass: true, msg: '정상 운행 중', zone: 'Adventure' },
    { id: 'AT-02', name: 'Lost Valley', status: 'WAIT', wait: 90, fastPass: true, msg: '동물 이동으로 인한 지연', zone: 'Zootopia' },
    { id: 'AT-03', name: 'Safari World', status: 'RUNNING', wait: 60, fastPass: true, msg: '정상 운행 중', zone: 'Zootopia' },
    { id: 'AT-04', name: 'Amazon Express', status: 'RUNNING', wait: 45, fastPass: false, msg: '정상 운행 중', zone: 'Adventure' },
    { id: 'AT-05', name: 'Thunder Falls', status: 'STOP', wait: 0, fastPass: false, msg: '기상 악화(강풍) 대기', zone: 'Magic Land' },
    { id: 'AT-06', name: 'Rolling X-Train', status: 'CHECK', wait: 0, fastPass: false, msg: '정기 점검 중 (14:00~15:00)', zone: 'American' },
  ];

  const opIssues = [
    { id: 1, time: '14:25', level: 'High', area: 'American Adv', content: 'T-Express 대기열 내 환자 발생 (어지러움 호소)', status: '조치중' },
    { id: 2, time: '14:10', level: 'Medium', area: 'Magic Land', content: '범퍼카 3호기 센서 오작동 알림', status: '확인대기' },
    { id: 3, time: '13:55', level: 'Low', area: 'Global Fair', content: '분실물 습득 (검은색 지갑)', status: '완료' },
    { id: 4, time: '13:30', level: 'High', area: 'Parking A', content: '주차 정산기 오류 접수', status: '완료' },
  ];

  const opParking = [
    { name: '제1주차장 (정문)', total: 2500, current: 2450, status: '만차', type: '혼잡' },
    { name: '제2주차장 (셔틀)', total: 1800, current: 950, status: '여유', type: '원활' },
    { name: '제3주차장 (발렛)', total: 500, current: 480, status: '혼잡', type: '혼잡' },
  ];


  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "테마파크 실시간 지표 요약 및 특이사항 분석 보고서를 작성해줘."
      });
      setAiInsight(response.text);
    } catch (e) { setAiInsight("분석 실패"); } finally { setIsAiLoading(false); }
  };

  const KpiCard = ({ title, value, unit, icon: Icon, color, topTrend, subInfo, bottomTrends, children }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-full relative overflow-hidden transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${color.bg} ${color.text}`}><Icon size={22} /></div>
        <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100">
          어제 {topTrend > 0 ? '↑' : '↓'} {Math.abs(topTrend)}%
        </div>
      </div>
      <div className="mb-4">
        <p className="text-[12px] font-medium text-gray-500 mb-1">{title}</p>
        <div className="flex items-end gap-1">
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">{value}</h3>
          <span className="text-sm font-medium text-gray-400 mb-1">{unit}</span>
        </div>
        {subInfo && (
          <div className="flex gap-3 mt-1.5">
            {subInfo.map((s: any, i: number) => (
              <span key={i} className="text-[11px] text-gray-400">{s.label} <span className={s.color || "text-gray-600 font-bold"}>{s.value}</span></span>
            ))}
          </div>
        )}
      </div>
      {children}
      <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between relative">
        <div className="absolute inset-x-0 bottom-0 h-8 opacity-20 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={miniChartData}><Area type="monotone" dataKey="v" stroke={color.hex} fill={color.hex} strokeWidth={2} /></AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col z-10">
          <span className="text-[9px] text-gray-400 uppercase tracking-tighter">월 평균</span>
          <span className="text-[11px] font-bold text-green-600">+{bottomTrends.month}%</span>
        </div>
        <div className="flex flex-col items-end z-10">
          <span className="text-[9px] text-gray-400 uppercase tracking-tighter">연 평균</span>
          <span className="text-[11px] font-bold text-green-600">+{bottomTrends.year}%</span>
        </div>
      </div>
    </div>
  );

  const renderOperationTab = () => {
    return (
      <div className="animate-in fade-in duration-500 space-y-6">
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Parking Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                   <ParkingSquare size={18} className="text-blue-600" /> 주차 현황
                </h3>
                <span className="text-[10px] font-bold text-gray-400">실시간</span>
             </div>
             <div className="space-y-3">
                {opParking.map((p, i) => (
                   <div key={i} className="flex flex-col">
                      <div className="flex justify-between items-end mb-1">
                         <span className="text-xs font-bold text-gray-600">{p.name}</span>
                         <span className={`text-xs font-black ${p.type === '만차' ? 'text-red-500' : p.type === '혼잡' ? 'text-orange-500' : 'text-green-500'}`}>
                            {p.status} ({Math.round(p.current/p.total*100)}%)
                         </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div 
                            className={`h-full rounded-full ${p.type === '만차' ? 'bg-red-500' : p.type === '혼잡' ? 'bg-orange-500' : 'bg-green-500'}`} 
                            style={{width: `${(p.current/p.total)*100}%`}}
                         ></div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Weather Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                   <Umbrella size={18} className="text-purple-600" /> 기상 및 운행 영향
                </h3>
             </div>
             <div className="grid grid-cols-2 gap-4 h-full">
                <div className="bg-blue-50 rounded-xl p-3 flex flex-col items-center justify-center">
                   <Thermometer size={24} className="text-blue-500 mb-2"/>
                   <span className="text-2xl font-black text-gray-800">24°C</span>
                   <span className="text-[10px] text-gray-500 font-bold">체감온도 26°C</span>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                         <Wind size={14} className="text-gray-400"/>
                         <span className="text-xs font-bold text-gray-600">풍속</span>
                      </div>
                      <span className="text-xs font-black text-red-500">8 m/s (주의)</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                         <Droplets size={14} className="text-blue-400"/>
                         <span className="text-xs font-bold text-gray-600">강수확률</span>
                      </div>
                      <span className="text-xs font-black text-gray-800">20%</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                         <Zap size={14} className="text-yellow-500"/>
                         <span className="text-xs font-bold text-gray-600">낙뢰</span>
                      </div>
                      <span className="text-xs font-black text-green-600">없음</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Staff Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                   <Users size={18} className="text-orange-600" /> 근무자 현황
                </h3>
                <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Total 142</span>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">OP</div>
                   <div>
                      <span className="block text-[10px] text-gray-400 font-bold">운영팀</span>
                      <span className="text-sm font-bold text-gray-800">64명</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                   <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black text-xs">SEC</div>
                   <div>
                      <span className="block text-[10px] text-gray-400 font-bold">보안팀</span>
                      <span className="text-sm font-bold text-gray-800">28명</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                   <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-black text-xs">CS</div>
                   <div>
                      <span className="block text-[10px] text-gray-400 font-bold">서비스</span>
                      <span className="text-sm font-bold text-gray-800">35명</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-black text-xs">MED</div>
                   <div>
                      <span className="block text-[10px] text-gray-400 font-bold">의무실</span>
                      <span className="text-sm font-bold text-gray-800">15명</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Main Content: Attraction & Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left: Attraction Status */}
           <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-md font-black text-gray-800 flex items-center gap-2">
                    <Activity size={20} className="text-red-500" /> 주요 어트랙션 운영 현황
                 </h3>
                 <div className="flex gap-2 text-[10px] font-bold">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">정상</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">지연/대기</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">점검/중단</span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                       <tr>
                          <th className="py-3 px-4 rounded-l-lg">시설명 (Zone)</th>
                          <th className="py-3 px-4 text-center">상태</th>
                          <th className="py-3 px-4 text-center">대기시간</th>
                          <th className="py-3 px-4 text-center">매직패스</th>
                          <th className="py-3 px-4 rounded-r-lg">특이사항</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {opAttractions.map((attr) => (
                          <tr key={attr.id} className="hover:bg-gray-50 transition-colors">
                             <td className="py-4 px-4">
                                <span className="block text-sm font-bold text-gray-800">{attr.name}</span>
                                <span className="text-[10px] text-gray-400">{attr.zone}</span>
                             </td>
                             <td className="py-4 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black
                                   ${attr.status === 'RUNNING' ? 'bg-green-50 text-green-600 border border-green-100' : 
                                     attr.status === 'WAIT' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                                     'bg-red-50 text-red-600 border border-red-100'}`}>
                                   {attr.status === 'RUNNING' && <CheckCircle size={10} />}
                                   {attr.status === 'WAIT' && <Clock3 size={10} />}
                                   {attr.status === 'STOP' && <AlertTriangle size={10} />}
                                   {attr.status === 'CHECK' && <Wrench size={10} />}
                                   {attr.status}
                                </span>
                             </td>
                             <td className="py-4 px-4 text-center">
                                <span className={`text-lg font-black ${attr.wait >= 60 ? 'text-red-500' : attr.wait >= 30 ? 'text-orange-500' : 'text-gray-800'}`}>
                                   {attr.wait}
                                </span>
                                <span className="text-[10px] text-gray-400 ml-0.5">분</span>
                             </td>
                             <td className="py-4 px-4 text-center">
                                {attr.fastPass ? (
                                   <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">가능</span>
                                ) : (
                                   <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">불가</span>
                                )}
                             </td>
                             <td className="py-4 px-4">
                                <span className="text-xs text-gray-600 font-medium">{attr.msg}</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Right: Issue Feed */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-md font-black text-gray-800 flex items-center gap-2">
                    <Siren size={20} className="text-orange-500" /> 실시간 이슈 피드
                 </h3>
                 <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[400px]">
                 {opIssues.map((issue) => (
                    <div key={issue.id} className="relative pl-4 border-l-2 border-gray-100 pb-2">
                       <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-white
                          ${issue.level === 'High' ? 'bg-red-500' : issue.level === 'Medium' ? 'bg-orange-400' : 'bg-blue-400'}`}>
                       </div>
                       <div className="bg-gray-50 rounded-xl p-3 hover:bg-white hover:shadow-md transition-all border border-gray-100">
                          <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-gray-800">{issue.time}</span>
                                <span className="text-[10px] font-bold text-gray-400">{issue.area}</span>
                             </div>
                             <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded 
                                ${issue.status === '완료' ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-red-600'}`}>
                                {issue.status}
                             </span>
                          </div>
                          <p className="text-xs font-bold text-gray-700 leading-snug">{issue.content}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderRevenueTab = () => {
    const isDaily = revenuePeriod === 'daily';
    const isMonthly = revenuePeriod === 'monthly';
    const isYearly = revenuePeriod === 'yearly';

    const currentData = isDaily ? dailyData : isMonthly ? monthlyData : yearlyData;
    const categoryData = isDaily ? categoryDailyData : isMonthly ? categoryMonthlyData : categoryYearlyData;
    
    const progressValue = isDaily ? 90.5 : isMonthly ? 76.6 : 80.6;
    const targetValueText = isDaily ? "4.5 / 5.0억원" : isMonthly ? "115.0 / 150.0억원" : "1450.0 / 1800.0억원";
    const goalTitle = isDaily ? "일간 매출 목표 (실시간)" : isMonthly ? "월간 매출 목표 (전월 기준)" : "연간 매출 목표 (전년 기준)";
    const chartTitle = isDaily ? "시간별 매출 추이 (일간)" : isMonthly ? "일별 매출 추이 (월간)" : "월별 매출 추이 (연간)";
    const periodSubTitle = "선택한 기간별 매출 변동 추이 분석";

    const prevPerformanceLabel = isYearly ? '전년 최종 실적' : '전월 최종 실적';
    const prevPerformanceValue = isDaily ? '4.8억원' : isMonthly ? '135.0억원' : '1650.0억원';
    const growthValue = isDaily ? '+5.2%' : isMonthly ? '+12.5%' : '+8.4%';

    return (
      <div className="animate-in fade-in duration-500 space-y-4">
        
        {/* NEW: Combined ARPU Chart Section - Compact Mode */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
           <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={18} /></div>
                 <div>
                    <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                       실시간 객단가(ARPU) 추이 분석
                       <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 font-bold">작업 예정</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium">입장객 증가 대비 매출 연동성 모니터링</p>
                 </div>
              </div>
              <div className="flex gap-4 text-[10px] font-bold">
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></div> 입장객 수</div>
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-1 bg-blue-500 rounded-full"></div> 매출액</div>
              </div>
           </div>
           <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={arpuData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} tickFormatter={(v) => `${(v/10000).toLocaleString()}만원`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} tickFormatter={(v) => `${v.toLocaleString()}명`} />
                    <Tooltip content={<ArpuTooltip />} cursor={{fill: '#f8fafc'}} />
                    <Bar yAxisId="right" dataKey="visitors" name="입장객" fill="#a78bfa" barSize={20} radius={[4, 4, 0, 0]} opacity={0.8} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" name="매출액" stroke="#3b82f6" strokeWidth={3} dot={{r:3, fill:'#3b82f6', stroke:'#fff', strokeWidth:2}} activeDot={{r:5, fill:'#3b82f6', stroke:'#fff', strokeWidth:2}} />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200">
           <button 
             onClick={() => setSubIndicatorTab('revenue')}
             className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${subIndicatorTab === 'revenue' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
           >
             매출 지표
           </button>
           <button 
             onClick={() => setSubIndicatorTab('entry')}
             className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${subIndicatorTab === 'entry' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
           >
             입장 지표 <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded ml-1">Beta</span>
           </button>
        </div>

        {/* Content based on Tab */}
        {subIndicatorTab === 'revenue' ? (
          <>
            {/* Top Section: Goal & Trend */}
            <div className="grid grid-cols-12 gap-4">
              {/* Left Side: KPI Progress Card */}
              <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col transition-all hover:shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[12px] font-bold text-gray-500 tracking-tight">{goalTitle}</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Target size={18} /></div>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-5xl font-black text-gray-800 tracking-tighter mb-6">{progressValue}%</h2>
                    <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressValue}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-[11px] font-bold text-blue-600 tracking-tight">{targetValueText}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-4 pt-6 border-t border-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-gray-500 font-medium">오늘 판매 금액</span>
                      <span className="text-[14px] font-bold text-gray-800">45,230만원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-gray-500 font-medium">{prevPerformanceLabel}</span>
                      <span className="text-[14px] font-bold text-gray-800">{prevPerformanceValue}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-gray-500 font-medium">전년 동월 대비 성장</span>
                      <span className="text-[14px] font-bold text-green-600">{growthValue}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Large Chart Card */}
              <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-black text-gray-800 mb-1">{chartTitle}</h3>
                      <p className="text-xs text-gray-400 font-medium tracking-tight">{periodSubTitle}</p>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      {/* Period Switcher Tabs */}
                      <div className="flex bg-[#1e293b] rounded-xl p-1 shadow-lg">
                        {[
                          { id: 'daily', label: '일간' },
                          { id: 'monthly', label: '월간' },
                          { id: 'yearly', label: '연간' }
                        ].map((btn) => (
                          <button 
                            key={btn.id}
                            onClick={() => setRevenuePeriod(btn.id as any)}
                            className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all ${revenuePeriod === btn.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                      {/* Legend Display */}
                      <div className="flex gap-4 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> {isDaily ? '오늘' : isMonthly ? '이번 달' : '이번 해'}</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-600 rounded-full"></div> {isDaily ? '어제' : isMonthly ? '지난 달' : '목표'}</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-400 rounded-full"></div> 작년 동기</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={currentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} dy={15} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                          tickFormatter={(v) => isYearly ? `${v}억` : `${v}억`} 
                        />
                        <Tooltip 
                          content={<RevenueAnalysisTooltip unit={isYearly ? "억" : "억"} />} 
                          cursor={{stroke: '#e2e8f0', strokeWidth: 1}} 
                        />
                        <Bar 
                          dataKey={isDaily ? "오늘" : isMonthly ? "이번달" : "이번해"} 
                          fill="#3b82f6" 
                          radius={[6, 6, 0, 0]} 
                          barSize={isMonthly ? 14 : isDaily ? 35 : 45} 
                          name={isDaily ? "오늘" : isMonthly ? "이번 달" : "이번 해"}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={isDaily ? "어제" : isMonthly ? "지난달" : "목표"} 
                          stroke="#475569" 
                          strokeWidth={2} 
                          strokeDasharray="5 5" 
                          dot={false} 
                          name={isDaily ? "어제" : isMonthly ? "지난 달" : "목표"}
                          activeDot={{ r: 5, fill: '#475569', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="작년동기" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          dot={false} 
                          name="작년 동기"
                          activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Revenue Analysis Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-md font-black text-gray-800">채널별 매출 분석</h3>
                </div>
                
                {/* Top Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#f8f9fc] rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100">
                        <span className="text-xs text-gray-500 font-bold mb-1">어제 대비</span>
                        <span className={`text-2xl font-black ${channelTab === 'onsite' ? 'text-red-500' : 'text-red-500'}`}>
                            ↑ {channelTab === 'online' ? '15.8%' : channelTab === 'onsite' ? '2.1%' : '12.5%'}
                        </span>
                    </div>
                    <div className="bg-[#f8f9fc] rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100">
                        <span className="text-xs text-gray-500 font-bold mb-1">전월 대비</span>
                        <span className={`text-2xl font-black ${channelTab === 'onsite' ? 'text-red-500' : 'text-red-500'}`}>
                            {channelTab === 'onsite' ? (
                                <span className="text-red-500">↑ -1.5%</span> 
                            ) : (
                                <span className="text-red-500">↑ {channelTab === 'online' ? '8.4%' : '5.2%'}</span>
                            )}
                        </span>
                    </div>
                    <div className="bg-[#f8f9fc] rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100">
                        <span className="text-xs text-gray-500 font-bold mb-1">{channelTab === 'online' ? '평균 전환율(SHOW-UP)' : '전년 대비'}</span>
                        <span className="text-2xl font-black text-gray-800">
                            {channelTab === 'online' ? (
                              <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={24}/> 83%</span>
                            ) : (
                              <span className="text-red-500">↑ {channelTab === 'onsite' ? '5.4%' : '18.4%'}</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#f8f9fc] p-1 rounded-xl mb-6">
                    <button 
                      onClick={() => setChannelTab('all')} 
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${channelTab === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      전체
                    </button>
                    <button 
                      onClick={() => setChannelTab('online')} 
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${channelTab === 'online' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      온라인
                    </button>
                    <button 
                      onClick={() => setChannelTab('onsite')} 
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${channelTab === 'onsite' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      현장
                    </button>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[250px]">
                    {channelTab === 'all' && (
                        <>
                          <div className="relative h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={channelAllData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                  >
                                    {channelAllData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                  </Pie>
                                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sales</span>
                                  <span className="text-3xl font-black text-gray-800 tracking-tighter">4.5억</span>
                              </div>
                          </div>
                          <div className="space-y-4">
                              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                  <span className="text-xs font-bold text-gray-500">총 매출</span>
                                  <div className="flex items-center gap-2">
                                      <span className="text-lg font-black text-gray-800">45,230만원</span>
                                      <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded">100%</span>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center py-3 px-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                      <span className="text-sm font-bold text-gray-700">온라인 채널</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <span className="text-lg font-black text-blue-600">29,330만원</span>
                                      <span className="text-xs font-bold text-blue-400 bg-white px-2 py-0.5 rounded-full shadow-sm">65%</span>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center py-3 px-4 bg-orange-50/50 rounded-xl border border-orange-100">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                                      <span className="text-sm font-bold text-gray-700">현장 (키오스크/POS)</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <span className="text-lg font-black text-orange-500">15,900만원</span>
                                      <span className="text-xs font-bold text-orange-400 bg-white px-2 py-0.5 rounded-full shadow-sm">35%</span>
                                  </div>
                              </div>
                          </div>
                        </>
                    )}

                    {channelTab === 'online' && (
                        <>
                          <div className="h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart layout="vertical" data={channelOnlineData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }} barSize={25}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fontWeight: 'bold', fill: '#64748b'}} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                      {channelOnlineData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                              <div className="grid grid-cols-4 bg-gray-50/50 py-2 px-4 border-b border-gray-100 text-[10px] font-bold text-gray-500">
                                  <div className="col-span-1">채널</div>
                                  <div className="col-span-1 text-center">점유율</div>
                                  <div className="col-span-1 text-right">구매/사용</div>
                                  <div className="col-span-1 text-center">전환율</div>
                              </div>
                              {channelOnlineData.map((item, idx) => (
                                  <div key={idx} className="grid grid-cols-4 py-3 px-4 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors">
                                      <div className="col-span-1 text-xs font-bold text-gray-800 truncate">{item.name}</div>
                                      <div className="col-span-1 text-center text-xs text-gray-500">{item.value}%</div>
                                      <div className="col-span-1 text-right flex flex-col">
                                          <span className="text-xs font-bold text-gray-800">{item.sales}</span>
                                          <span className="text-[10px] text-gray-400">{item.entry}</span>
                                      </div>
                                      <div className="col-span-1 flex justify-center">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${parseInt(item.conv) >= 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                              {item.conv}
                                          </span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                        </>
                    )}

                    {channelTab === 'onsite' && (
                        <>
                          <div className="relative h-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={channelOnsiteData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                  >
                                    {channelOnsiteData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                  </Pie>
                                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                </PieChart>
                              </ResponsiveContainer>
                          </div>
                          <div className="h-[250px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                              {channelOnsiteData.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-purple-100 hover:shadow-sm transition-all bg-white">
                                      <div className="flex flex-col">
                                          <span className="text-[10px] text-gray-400 font-bold mb-0.5">{item.name}</span>
                                          <span className="text-xs font-bold text-gray-600">{item.desc}</span>
                                          {item.subDesc && <span className="text-[9px] text-purple-500 mt-0.5">{item.subDesc}</span>}
                                      </div>
                                      <span className="text-sm font-black text-gray-800">{item.value.toLocaleString()}만원</span>
                                  </div>
                              ))}
                          </div>
                        </>
                    )}
                </div>
            </div>

            {/* Category Performance Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BarChart2 size={18} /></div>
                    <div>
                      <h3 className="text-md font-black text-gray-800">상품 카테고리별 실적</h3>
                      <p className="text-[11px] text-gray-400 font-medium">카테고리별 누적 매출 및 F&B 상관관계</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> 입장권</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-purple-500 rounded-sm"></div> 패키지</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-pink-500 rounded-sm"></div> 연간회원</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-orange-500 rounded-full"></div> F&B/MD 매출</div>
                  </div>
              </div>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} tickFormatter={(v) => `${(v/10000).toFixed(0)}만`} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#fda4af', fontWeight: 600}} tickFormatter={(v) => `${(v/10000).toFixed(0)}만`} />
                      <Tooltip content={<CategoryTooltip />} cursor={{fill: '#f8fafc'}} />
                      <Bar yAxisId="left" dataKey="entry" name="입장권" stackId="a" fill="#3b82f6" barSize={isDaily ? 20 : 12} radius={[0,0,0,0]} />
                      <Bar yAxisId="left" dataKey="package" name="패키지" stackId="a" fill="#8b5cf6" barSize={isDaily ? 20 : 12} radius={[0,0,0,0]} />
                      <Bar yAxisId="left" dataKey="annual" name="연간회원" stackId="a" fill="#ec4899" barSize={isDaily ? 20 : 12} radius={[0,0,0,0]} />
                      <Bar yAxisId="left" dataKey="group" name="단체" stackId="a" fill="#10b981" barSize={isDaily ? 20 : 12} radius={[4,4,0,0]} />
                      <Line yAxisId="right" type="monotone" dataKey="fnb" name="F&B/MD" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{r:4, fill:'#f97316', stroke:'#fff'}} />
                    </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          /* Entry Indicator Screen (Beta - Enhanced) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
             
             {/* Card 1: Net Crowd Monitor (Stay Count) */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[320px]">
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Footprints size={20} /></div>
                      <div>
                         <h3 className="text-md font-black text-gray-800">실시간 원내 체류 인원</h3>
                      </div>
                   </div>
                   <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded border border-gray-200">
                      <Store size={12} className="text-gray-400"/>
                      <span className="text-[10px] font-bold text-gray-600">최대 수용: {crowdMonitorData.capacity.toLocaleString()}명</span>
                   </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                   {/* Semi Circle Gauge using PieChart */}
                   <div className="w-full h-[160px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                               data={[{ value: crowdMonitorData.current, fill: '#3b82f6' }, { value: crowdMonitorData.capacity - crowdMonitorData.current, fill: '#f1f5f9' }]}
                               cx="50%"
                               cy="100%"
                               startAngle={180}
                               endAngle={0}
                               innerRadius={80}
                               outerRadius={110}
                               dataKey="value"
                               stroke="none"
                            >
                               <Cell fill="#3b82f6" />
                               <Cell fill="#f1f5f9" />
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-end pb-2">
                         <span className="text-4xl font-black text-gray-800 tracking-tighter">
                            {((crowdMonitorData.current / crowdMonitorData.capacity) * 100).toFixed(1)}%
                         </span>
                         <span className="text-xs font-bold text-gray-400">시설 가동률</span>
                      </div>
                   </div>
                   <div className="w-full grid grid-cols-3 gap-2 mt-4 px-4">
                      <div className="flex flex-col items-center p-2 bg-blue-50 rounded-xl border border-blue-100">
                         <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 mb-1"><LogIn size={10}/> 누적 입장</span>
                         <span className="text-sm font-black text-gray-800">{crowdMonitorData.entry.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-xl border border-gray-100">
                         <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 mb-1"><Footprints size={10}/> 현재 체류</span>
                         <span className="text-lg font-black text-gray-900">{crowdMonitorData.current.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-red-50 rounded-xl border border-red-100">
                         <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 mb-1"><LogOut size={10}/> 누적 퇴장</span>
                         <span className="text-sm font-black text-gray-800">{crowdMonitorData.exit.toLocaleString()}</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Card 2: Arrival Analysis */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[320px]">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Ticket size={20} /></div>
                      <div>
                         <h3 className="text-md font-black text-gray-800">예약 대비 입장 및 예측</h3>
                         <p className="text-[11px] text-gray-400 font-medium">유입 및 잔여 현황</p>
                      </div>
                   </div>
                </div>
                <div className="flex-1 grid grid-cols-12 gap-6">
                   <div className="col-span-5 flex flex-col justify-between">
                      <div>
                         <div className="text-[10px] font-bold text-gray-400 mb-1">입장 완료율</div>
                         <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-800 tracking-tight">78.2%</span>
                            <span className="text-xs font-bold text-green-500">+4.5%</span>
                         </div>
                         <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{width: '78.2%'}}></div>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500">총 예약자</span>
                            <span className="text-sm font-bold text-gray-800">18,240명</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500">입장 완료</span>
                            <span className="text-sm font-bold text-indigo-600">14,263명</span>
                         </div>
                         <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                            <span className="text-xs font-bold text-gray-600">미입장 잔여</span>
                            <span className="text-sm font-black text-gray-900">3,977명</span>
                         </div>
                      </div>
                   </div>
                   <div className="col-span-7 flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-bold text-gray-500">시간대별 유입 예측</span>
                         <span className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-400">향후 2시간</span>
                      </div>
                      <div className="flex-1">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={arrivalPredData}>
                               <defs>
                                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                               <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} interval={1} />
                               <YAxis hide domain={['dataMin', 'dataMax']} />
                               <Tooltip contentStyle={{borderRadius: '8px', fontSize: '11px'}} itemStyle={{color: '#4f46e5', fontWeight: 'bold'}} />
                               <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>
             </div>

             {/* Card 3: Visitor Attribute Distribution (Replaces Entry Channel) */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[300px]">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users size={20} /></div>
                      <div>
                         <h3 className="text-md font-black text-gray-800">입장객 속성 분포</h3>
                         <p className="text-[11px] text-gray-400 font-medium">입장권 상품 기준</p>
                      </div>
                   </div>
                </div>
                <div className="flex-1 flex items-center gap-6">
                   <div className="w-[160px] h-[160px] relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                               data={visitorDemographicsData}
                               innerRadius={50}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                            >
                               {visitorDemographicsData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                               ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-xs text-gray-400 font-bold">Total</span>
                         <span className="text-xl font-black text-gray-800">100%</span>
                      </div>
                   </div>
                   <div className="flex-1 space-y-3">
                      {visitorDemographicsData.map((item, idx) => (
                         <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-2">
                               <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                               <span className="text-xs font-bold text-gray-600">{item.name}</span>
                            </div>
                            <span className="text-sm font-black text-gray-800">{item.value}%</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Card 4: Detailed Gate Status Grid */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[300px]">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Activity size={20} /></div>
                      <div>
                         <h3 className="text-md font-black text-gray-800">게이트별 실시간 부하도</h3>
                         <p className="text-[11px] text-gray-400 font-medium">게이트 혼잡도 현황</p>
                      </div>
                   </div>
                   <div className="px-2 py-1 bg-red-100 text-red-600 rounded text-[10px] font-bold animate-pulse">실시간</div>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 text-[10px] text-gray-500 font-bold uppercase sticky top-0 z-10">
                         <tr>
                            <th className="py-2 px-3 rounded-l-lg">게이트명</th>
                            <th className="py-2 px-2 text-center">분당 입장</th>
                            <th className="py-2 px-2 text-center">대기열</th>
                            <th className="py-2 px-3 text-right rounded-r-lg">상태</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {gateStatusData.map((gate) => (
                            <tr key={gate.id} className="hover:bg-gray-50 transition-colors">
                               <td className="py-3 px-3">
                                  <span className="text-xs font-bold text-gray-700">{gate.name}</span>
                               </td>
                               <td className="py-3 px-2 text-center">
                                  <span className="text-xs font-bold text-gray-800">{gate.ppm}명</span>
                               </td>
                               <td className="py-3 px-2 text-center">
                                  <span className="text-xs font-medium text-gray-500">{gate.queue}m</span>
                               </td>
                               <td className="py-3 px-3 text-right">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold ${
                                     gate.status === '혼잡' ? 'bg-red-100 text-red-600' : 
                                     gate.status === '지연' ? 'bg-yellow-100 text-yellow-600' : 
                                     'bg-green-100 text-green-600'
                                  }`}>
                                     {gate.status === '혼잡' && <AlertCircle size={10} className="mr-1"/>}
                                     {gate.status}
                                  </span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 animate-in fade-in duration-500 overflow-x-hidden pb-24">
      {/* Header & Status */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 tracking-tight">
            실시간 운영 상황실
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </h1>
          {!isNoticeVisible && (
            <button 
              onClick={() => setIsNoticeVisible(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold shadow-sm hover:bg-red-100 transition-all animate-bounce"
            >
              <Flag size={12} fill="currentColor" /> 긴급 공지 다시보기
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                {[
                  { id: 'total', label: '전체 (통합)' },
                  { id: 'revenue', label: '매출/입장' },
                  { id: 'op', label: '실시간 운영' },
                  { id: 'notice', label: '공지사항' }
                ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveMainTab(tab.id)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeMainTab === tab.id ? 'bg-[#1e293b] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded">어제</button>
                <button className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded">오늘</button>
                <div className="w-px h-3 bg-gray-200 mx-2"></div>
                <div className="flex items-center gap-2 px-2 cursor-pointer group">
                    <Calendar size={14} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                    <span className="text-xs font-bold text-gray-700">2026-02-04</span>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex items-center gap-4 min-w-[240px]">
                <div className="bg-orange-50 p-2.5 rounded-full text-orange-500"><Sparkles size={24} /></div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-gray-800 tracking-tighter">24°C</span>
                        <div className="flex gap-1 items-center"><span className="text-[10px] text-gray-300 font-bold uppercase">미세먼지</span><span className="text-[10px] text-blue-500 font-black bg-blue-50 px-1.5 rounded">좋음</span></div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-tight">맑음 • 습도 45%</p>
                </div>
            </div>
        </div>
      </div>

      {/* Persistent Emergency Notice Bar (Common for all tabs) */}
      {isNoticeVisible && (
        <div className={`bg-[#0f172a] text-white rounded-xl shadow-xl mb-8 transition-all duration-300 overflow-hidden`}>
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-gray-400" />
                <span className="text-sm font-bold tracking-tight">시스템 알림 전체보기</span>
                <span className="bg-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded ml-1 shadow-sm">4</span>
              </div>
              {!isNoticeExpanded && (
                <div className="flex items-center gap-3 animate-in fade-in duration-300">
                  <span className={`${notices[currentNoticeIdx].tagColor} text-[10px] font-black px-2 py-0.5 rounded shadow-sm`}>{notices[currentNoticeIdx].type}</span>
                  <p className="text-sm font-bold tracking-tight text-gray-100">{notices[currentNoticeIdx].title}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isNoticeExpanded && (
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/5">
                  <button onClick={() => setCurrentNoticeIdx(p => (p-1+4)%4)} className="p-0.5 hover:bg-white/10 rounded"><ChevronLeft size={16} className="text-gray-400 hover:text-white" /></button>
                  <span className="text-[10px] font-bold px-2 tabular-nums">{currentNoticeIdx + 1} / 4</span>
                  <button onClick={() => setCurrentNoticeIdx(p => (p+1)%4)} className="p-0.5 hover:bg-white/10 rounded"><ChevronRight size={16} className="text-gray-400 hover:text-white" /></button>
                </div>
              )}
              <div className="w-px h-4 bg-white/10 mx-1"></div>
              <button onClick={() => setIsNoticeExpanded(!isNoticeExpanded)} className="p-1 hover:bg-white/10 rounded transition-colors">
                {isNoticeExpanded ? <ChevronUp size={18} className="text-gray-400 hover:text-white" /> : <ChevronDown size={18} className="text-gray-400 hover:text-white" />}
              </button>
              <button onClick={() => { setIsNoticeVisible(false); setIsNoticeExpanded(false); }} className="p-1 hover:bg-white/10 rounded transition-colors"><X size={18} className="text-gray-400 hover:text-white" /></button>
            </div>
          </div>
          {isNoticeExpanded && (
            <div className="px-5 pb-5 space-y-2 animate-in slide-in-from-top-4 duration-300">
              {notices.map((n, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between hover:bg-white/10 transition-all group cursor-pointer shadow-sm">
                   <div className="flex items-center gap-4">
                      <span className={`${n.tagColor} text-[10px] font-black px-2 py-0.5 rounded w-10 text-center shadow-sm`}>{n.type}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-100 tracking-tight group-hover:text-blue-300 transition-colors">{n.title}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5 font-medium">{n.date} • {n.author}</span>
                      </div>
                   </div>
                   <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-300 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents */}
      {activeMainTab === 'revenue' ? (
        renderRevenueTab()
      ) : activeMainTab === 'total' ? (
        // Existing Dashboard Content
        <>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="grid grid-cols-2 gap-1">{[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-300 rounded-sm"></div>)}</div>
              <h2 className="text-sm font-black text-gray-800">핵심 지표 요약</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KpiCard title="오늘 총 매출" value="452,300,000" unit="원" icon={DollarSign} color={{bg:'bg-purple-50', text:'text-purple-600', hex:'#7c3aed'}} topTrend={12.5} subInfo={[{label:'수익', value:'44,690', color:'text-blue-600'}, {label:'환불', value:'540', color:'text-red-500'}]} bottomTrends={{month:8.4, year:15.2}} />
              <KpiCard title="오늘 입장객 수" value="14,250" unit="명" icon={Users} color={{bg:'bg-green-50', text:'text-green-600', hex:'#10b981'}} topTrend={5.2} subInfo={[{label:'현재', value:'5,850', color:'text-green-600'}, {label:'퇴장', value:'8,400'}]} bottomTrends={{month:12.1, year:24.8}}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 pt-3 border-t border-gray-50">
                  <div className="flex flex-col"><span className="text-[10px] text-gray-400">일반 입장</span><span className="text-xs font-bold text-gray-700">11,400명</span></div>
                  <div className="flex flex-col"><span className="text-[10px] text-gray-400">단체 입장</span><span className="text-xs font-bold text-gray-700">2,850명</span></div>
                </div>
              </KpiCard>
              <KpiCard title="1인당 객단가 (ARPU)" value="31,740" unit="원" icon={CreditCard} color={{bg:'bg-amber-50', text:'text-amber-50', hex:'#f59e0b'}} topTrend={6.8} bottomTrends={{month:2.5, year:10.2}} />
              <KpiCard title="현장 매출 구성비" value="35.1" unit="%" icon={ShoppingCart} color={{bg:'bg-blue-50', text:'text-blue-600', hex:'#3b82f6'}} topTrend={3.5} bottomTrends={{month:1.2, year:5.5}} />
              <KpiCard title="운영 시설 가동률" value="95.0" unit="%" icon={Activity} color={{bg:'bg-purple-50', text:'text-purple-600', hex:'#8b5cf6'}} topTrend={-1.2} bottomTrends={{month:0.5, year:-0.8}} />
              <KpiCard title="실시간 파크 혼잡도" value="75" unit="%" icon={AlertCircle} color={{bg:'bg-red-50', text:'text-red-500', hex:'#ef4444'}} topTrend={15.5} bottomTrends={{month:8.2, year:20.1}} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Chart 1: Revenue Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black text-gray-800">실시간 매출 및 추세 분석</h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">오늘 vs 어제 vs 1년 평균 비교 데이터</p>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-600 rounded-sm"></div> 오늘(실시간)</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-400 rounded-full"></div> 어제</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> 1년 평균</div>
                  </div>
              </div>
              <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={totalRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `${v/100}만`} />
                      <Tooltip content={<TotalTooltip />} cursor={{stroke: '#e2e8f0', strokeWidth: 1}} />
                      <Bar dataKey="today" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} name="오늘" />
                      <Line type="monotone" dataKey="yesterday" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4, fill: '#94a3b8' }} name="어제" />
                      <Line type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981' }} name="1년 평균" />
                    </ComposedChart>
                  </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Visitor Trend */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black text-gray-800">시간대별 방문객 추이</h3>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-400 rounded-full"></div> 1년 평균</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-300 rounded-full border border-dashed border-gray-500"></div> 어제</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> 오늘 입장</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-full"></div> 오늘 퇴장</div>
                  </div>
              </div>
              <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={totalVisitorData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                      <Tooltip content={<TotalTooltip />} cursor={{stroke: '#e2e8f0', strokeWidth: 1}} />
                      <Line type="monotone" dataKey="avg" stroke="#c084fc" strokeWidth={2} strokeDasharray="3 3" dot={false} activeDot={{ r: 4, fill: '#c084fc' }} name="1년 평균" />
                      <Line type="monotone" dataKey="yesterday" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4, fill: '#cbd5e1' }} name="어제" />
                      <Line type="monotone" dataKey="entry" stroke="#3b82f6" strokeWidth={3} dot={{r:4, fill:'#fff', stroke:'#3b82f6', strokeWidth:2}} name="오늘 입장" />
                      <Line type="monotone" dataKey="exit" stroke="#f87171" strokeWidth={2} strokeDasharray="2 2" dot={false} activeDot={{ r: 4, fill: '#f87171' }} name="오늘 퇴장" />
                    </LineChart>
                  </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : activeMainTab === 'op' ? (
        renderOperationTab()
      ) : (
        <div className="flex flex-col items-center justify-center h-[55vh] text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <Activity size={48} className="mb-4 opacity-10" />
          <h2 className="text-lg font-bold text-gray-300">"공지사항" 서비스 준비 중</h2>
          <p className="text-xs mt-2 opacity-50 font-medium">현재 "매출/입장", "전체 (통합)", "실시간 운영" 탭에서 상세 분석이 가능합니다.</p>
        </div>
      )}

      {/* AI Floating Button */}
      <button onClick={handleAiAnalysis} disabled={isAiLoading} className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:bg-purple-700 transition-all active:scale-90 group z-50">
        {isAiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        <span className="absolute right-full mr-4 bg-white text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-purple-100">운영 분석 리포트 생성</span>
      </button>

      {aiInsight && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 bg-purple-600 text-white flex justify-between items-center shadow-lg"><div className="flex items-center gap-2 font-bold"><Sparkles size={20}/> AI 운영 브리핑</div><button onClick={() => setAiInsight(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={24}/></button></div>
             <div className="p-8 text-gray-700 leading-relaxed max-h-[60vh] overflow-y-auto whitespace-pre-wrap font-medium">{aiInsight}</div>
             <div className="p-6 border-t border-gray-100 flex justify-end"><button onClick={() => setAiInsight(null)} className="px-10 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-sm">확인</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;