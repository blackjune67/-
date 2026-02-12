
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, LayoutTemplate, ToggleLeft, ToggleRight, AlertCircle, Plus, X } from 'lucide-react';

interface PosWindowProduct {
  id: string;
  boothName: string;
  code: string;
  channel: string;
  name: string;
  productCount: number;
  usage: '사용' | '미사용'; // Added for filter consistency
}

interface PopupProduct {
  id: string;
  code: string;
  name: string;
  status: string;
  category: string;
  dateType: string;
  period: string;
  salesPeriod: string;
}

interface AppliedProduct extends PopupProduct {
  order: number;
}

// Synced Mock Data with Usage
const MOCK_POS_LIST_DATA: PosWindowProduct[] = [
  { id: '1', boothName: '정문 매표소', code: '01', channel: '키오스크', name: '키오스크 1', productCount: 7, usage: '사용' },
  { id: '2', boothName: '정문 매표소', code: '03', channel: '현장POS', name: '포스 1', productCount: 12, usage: '사용' },
  { id: '3', boothName: '후문 매표소', code: '01', channel: '배리어프리키오스크', name: '배리어프리 1', productCount: 5, usage: '사용' },
  { id: '4', boothName: '중앙 매표소', code: '01', channel: '현장POS', name: '포스 2', productCount: 8, usage: '미사용' },
  { id: '5', boothName: '중앙 매표소', code: '55', channel: '키오스크', name: '키오스크 3', productCount: 0, usage: '사용' },
];

const MOCK_BOOTHS = [
  { id: 1, name: '정문 매표소' },
  { id: 2, name: '후문 매표소' },
  { id: 3, name: '중앙 매표소' },
];

const MOCK_POPUP_PRODUCTS: PopupProduct[] = [
  { id: '1', code: 'GD2502397', name: '상품별 일자', status: '판매중', category: '패키지상품', dateType: '일자(회차)별 수량 제한', period: '2025-09-01 00:00 ~ 2026-12-31 00:00', salesPeriod: '2025-09-01 00:00 ~ 2026-12-31 00:00' },
  { id: '2', code: 'GD2500851', name: '2.0에서 tcm으로 연동하는 스케줄 상품', status: '판매중', category: '일반상품', dateType: '권종별 수량 제한', period: '2025-04-01 00:00 ~ 2026-12-31 00:00', salesPeriod: '2025-04-01 00:00 ~ 2026-12-31 00:00' },
  { id: '3', code: 'GD2500843', name: 'TCM 에서 2.0으로 연동되는 스케줄 상품', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', period: '2025-04-01 00:00 ~ 2026-12-31 00:00', salesPeriod: '2025-04-01 00:00 ~ 2026-12-31 00:00' },
  { id: '4', code: 'GD2303038', name: '연동 안하는 2.0 회차상품', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', period: '2023-07-26 00:00 ~ 2027-12-31 00:00', salesPeriod: '2023-07-26 00:00 ~ 2027-12-31 00:00' },
];

const MOCK_APPLIED_PRODUCTS_INIT: AppliedProduct[] = [
  { id: 'AP1', order: 0, code: 'GD2501243', name: '망곰이 테마파크 (TCM 통해서 키즈에서 사용 처리)', status: '마감', category: '일반상품', dateType: '없음', period: '2025-02-01 08:00\n2025-12-31 23:59', salesPeriod: '2025-02-01 00:00\n2025-12-31 23:59' },
  { id: 'AP2', order: 0, code: 'GD2500876', name: '2.0에서 tcm으로 연동되는 기간 상품', status: '판매일시중지', category: '일반상품', dateType: '없음', period: '2025-04-01 00:00\n2026-10-17 00:00', salesPeriod: '2025-04-01 00:00\n2026-10-17 00:00' },
  { id: 'AP3', order: 0, code: 'GD2500851', name: '2.0에서 tcm으로 연동하는 스케줄 상품', status: '판매중', category: '일반상품', dateType: '권종별 수량 제한', period: '2025-04-01 00:00\n2026-12-31 00:00', salesPeriod: '2025-04-01 00:00\n2026-12-31 00:00' },
  { id: 'AP4', order: 0, code: 'GD2500843', name: 'TCM 에서 2.0으로 연동되는 스케줄 상품', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', period: '2025-04-01 00:00\n2026-12-31 00:00', salesPeriod: '2025-04-01 00:00\n2026-12-31 00:00' },
  { id: 'AP5', order: 0, code: 'GD2403547', name: '연동 안하는 2.0 상품 일반 (기간) 상품', status: '마감', category: '일반상품', dateType: '없음', period: '2024-12-30 00:00\n2025-12-31 00:00', salesPeriod: '2024-12-30 00:00\n2025-12-31 00:00' },
  { id: 'AP6', order: 0, code: 'GD2303038', name: '연동 안하는 2.0 회차상품', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', period: '2023-07-26 00:00\n2027-12-31 00:00', salesPeriod: '2023-07-26 00:00\n2027-12-31 00:00' },
  { id: 'AP7', order: 0, code: 'GD2303004', name: '24604 TCM 에서 2.0으로 연동되는 기간상품', status: '마감', category: '일반상품', dateType: '없음', period: '2025-04-01 00:00\n2025-12-31 00:00', salesPeriod: '2025-04-01 00:00\n2025-12-31 00:00' },
];

interface FacilityPosProductProps {
  modelId?: number;
  pageTitle?: string;
}

const FacilityPosProduct: React.FC<FacilityPosProductProps> = ({ modelId = 1, pageTitle }) => {
  const [viewMode, setViewMode] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [boothFilter, setBoothFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [usageFilter, setUsageFilter] = useState('all');
  
  const isKioskMode = (pageTitle || '').includes('키오스크');

  // Initialize data based on mode
  const [posList, setPosList] = useState<PosWindowProduct[]>(() => {
    if (isKioskMode) {
      return MOCK_POS_LIST_DATA.filter(p => p.channel !== '현장POS');
    }
    return MOCK_POS_LIST_DATA;
  });

  // Update data when mode changes
  useEffect(() => {
    handleSearch();
  }, [isKioskMode]);
  
  // 검색 핸들러 구현
  const handleSearch = () => {
    let filtered = MOCK_POS_LIST_DATA;

    // 1. 모드 필터 (키오스크 모드인 경우 현장POS 제외)
    if (isKioskMode) {
        filtered = filtered.filter(p => p.channel !== '현장POS');
    }

    // 2. 매표소 필터
    if (boothFilter !== 'all') {
        filtered = filtered.filter(p => p.boothName === boothFilter);
    }

    // 3. 채널 필터
    if (channelFilter !== 'all') {
        if (channelFilter === 'kiosk') filtered = filtered.filter(p => p.channel === '키오스크');
        else if (channelFilter === 'pos') filtered = filtered.filter(p => p.channel === '현장POS');
        else if (channelFilter.includes('barrier_free')) filtered = filtered.filter(p => p.channel.includes('배리어프리'));
    }

    // 4. 사용여부 필터
    if (usageFilter !== 'all') {
       const targetUsage = usageFilter === 'Y' ? '사용' : '미사용';
       filtered = filtered.filter(p => p.usage === targetUsage);
    }

    // 5. 검색어 필터
    if (searchTerm) {
        filtered = filtered.filter(p => {
            if (searchType === 'name') return p.name.includes(searchTerm);
            if (searchType === 'code') return p.code.includes(searchTerm);
            return false;
        });
    }
    setPosList(filtered);
  };

  // Product Add Modal State
  const [isProductAddModalOpen, setIsProductAddModalOpen] = useState(false);
  const [activePosId, setActivePosId] = useState<string | null>(null);
  const [selectedPopupItems, setSelectedPopupItems] = useState<string[]>([]);
  const [popupSearchType, setPopupSearchType] = useState('name');
  const [popupStatusFilter, setPopupStatusFilter] = useState('판매중');
  const [popupSearchTerm, setPopupSearchTerm] = useState('');

  // Applied Product Modal State
  const [isAppliedModalOpen, setIsAppliedModalOpen] = useState(false);
  const [appliedProducts, setAppliedProducts] = useState<AppliedProduct[]>([]);
  const [selectedAppliedIds, setSelectedAppliedIds] = useState<string[]>([]);

  // Custom Confirm/Alert Modal State
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, action?: 'DELETE' | 'SAVE'}>({
    isOpen: false, message: '', action: undefined
  });
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, message: string}>({
    isOpen: false, message: ''
  });

  const isAfter = viewMode === 'AFTER';
  const displayTitle = pageTitle || (isAfter ? 'POS 창구별 상품관리' : '창구별 상품관리');

  // --- Handlers for Product Add Modal (Existing) ---
  const handleOpenProductAdd = (posId: string) => {
    setActivePosId(posId);
    setSelectedPopupItems([]); 
    setIsProductAddModalOpen(true);
    setPopupSearchType('name');
    setPopupStatusFilter('판매중');
    setPopupSearchTerm('');
  };

  const getFilteredPopupProducts = () => {
    let filtered = MOCK_POPUP_PRODUCTS;
    if (isAfter) {
        if (modelId === 1) {
            filtered = filtered.filter(p => p.category !== '패키지상품');
        } 
    }
    return filtered;
  };

  const popupProducts = getFilteredPopupProducts();

  const handlePopupCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedPopupItems(popupProducts.map(p => p.id));
    } else {
        setSelectedPopupItems([]);
    }
  };

  const handlePopupCheckRow = (id: string) => {
    setSelectedPopupItems(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePopupConfirm = () => {
    if (activePosId && selectedPopupItems.length > 0) {
        setPosList(prev => prev.map(pos => 
            pos.id === activePosId 
            ? { ...pos, productCount: pos.productCount + selectedPopupItems.length } 
            : pos
        ));
        setAlertModal({ isOpen: true, message: `${selectedPopupItems.length}건의 상품이 추가되었습니다.` });
    }
    setIsProductAddModalOpen(false);
  };

  // --- Handlers for Applied Product Modal (New) ---
  const handleOpenAppliedModal = (posId: string) => {
    setActivePosId(posId);
    setAppliedProducts(MOCK_APPLIED_PRODUCTS_INIT);
    setSelectedAppliedIds([]);
    setIsAppliedModalOpen(true);
  };

  const toggleAppliedSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAppliedIds(appliedProducts.map(p => p.id));
    } else {
      setSelectedAppliedIds([]);
    }
  };

  const toggleAppliedSelectOne = (id: string) => {
    setSelectedAppliedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAppliedOrderChange = (id: string, order: number) => {
    setAppliedProducts(prev => prev.map(p => p.id === id ? { ...p, order } : p));
  };

  const handleDeleteApplied = () => {
    if (selectedAppliedIds.length === 0) {
      setAlertModal({ isOpen: true, message: '선택된 항목이 없습니다.' });
      return;
    }
    setConfirmModal({ isOpen: true, message: '삭제하시겠습니까?', action: 'DELETE' });
  };

  const handleSaveAppliedOrder = () => {
    if (selectedAppliedIds.length === 0) {
      setAlertModal({ isOpen: true, message: '선택된 항목이 없습니다.' });
      return;
    }
    setConfirmModal({ isOpen: true, message: '저장하시겠습니까?', action: 'SAVE' });
  };

  const processConfirmAction = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));

    if (confirmModal.action === 'DELETE') {
       const remaining = appliedProducts.filter(p => !selectedAppliedIds.includes(p.id));
       setAppliedProducts(remaining);
       if (activePosId) {
         setPosList(prev => prev.map(pos => 
           pos.id === activePosId ? { ...pos, productCount: Math.max(0, pos.productCount - selectedAppliedIds.length) } : pos
         ));
       }
       setSelectedAppliedIds([]);
       setAlertModal({ isOpen: true, message: '삭제되었습니다.' });
       setIsAppliedModalOpen(false);
    } else if (confirmModal.action === 'SAVE') {
       setAlertModal({ isOpen: true, message: '저장되었습니다.' });
       setIsAppliedModalOpen(false);
    }
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto relative min-h-screen">
      <style>{`
        input[type=number].no-spinner::-webkit-inner-spin-button, 
        input[type=number].no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number].no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* 🛠️ View Mode Toggle */}
      <div className="absolute top-0 right-6 z-40 flex items-center gap-3 bg-white px-4 py-2 rounded-b-lg shadow-md border border-t-0 border-gray-200">
         <span className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase tracking-tighter">
           <LayoutTemplate size={14} /> Spec Mode:
         </span>
         <button 
           onClick={() => setViewMode(prev => prev === 'BEFORE' ? 'AFTER' : 'BEFORE')}
           className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${isAfter ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}
         >
           {isAfter ? <ToggleRight size={22} className="text-purple-600"/> : <ToggleLeft size={22} className="text-gray-400"/>}
           {isAfter ? 'After (TO-BE)' : 'Before (AS-IS)'}
         </button>
      </div>

      {/* 🛠️ Dev Guide Banner (After Mode Only) */}
      {isAfter && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3 text-[13px] text-orange-900 animate-in fade-in duration-500">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-orange-600" />
          <div className="space-y-1">
            <p className="font-extrabold text-orange-800 underline decoration-orange-300 underline-offset-4">🛠️ 개발 가이드: {displayTitle} 개선 (TO-BE)</p>
            {isKioskMode ? (
                <>
                    <p>1. <strong>필터 활성화</strong>: 키오스크 채널 전용 필터를 제공합니다. (일반 키오스크, 배리어프리, 배리어프리 NOL티켓)</p>
                    <p>2. <strong>화면 목적</strong>: 각 창구별 판매 가능한 상품을 할당하고 관리하는 전용 화면입니다.</p>
                </>
            ) : (
                <>
                    <p>1. <strong>필터 정리</strong>: '창구채널' 검색 조건은 더 이상 사용하지 않으므로 제거합니다. (현장 POS 전용)</p>
                    <p>2. <strong>화면 목적</strong>: 각 창구별 판매 가능한 상품을 할당하고 관리하는 전용 화면입니다.</p>
                </>
            )}
            <p className="mt-1 pt-1 border-t border-orange-200 text-orange-700 font-medium">※ 일부 컬럼 또는 필드 주석처리 외 기능은 당장 개선 없이 현재 상태를 유지합니다.</p>
            {isKioskMode ? (
                <>
                    <p>3. <strong>상품 추가 팝업</strong>: 현재 모델(Model {modelId})에서 사용하는 상품 유형만 노출됩니다.</p>
                    <ul className="list-disc list-inside ml-2 text-xs">
                        <li>Model 1: 입장권(일반상품) 전용</li>
                        <li>Model 2+: 입장권 + 패키지 상품 노출</li>
                        <li>레이블 변경: [상품 카테고리] → [상품 유형], [일반상품] → [입장권]</li>
                    </ul>
                </>
            ) : (
                <>
                    <p>3. <strong>상품 추가 팝업</strong>: 현재 모델(Model {modelId})에서 사용하는 상품 유형만 노출됩니다.</p>
                    <ul className="list-disc list-inside ml-2 text-xs">
                        <li>Model 1: 입장권(일반상품) 전용</li>
                        <li>Model 2+: 입장권 + 패키지 상품 노출</li>
                        <li>레이블 변경: [상품 카테고리] → [상품 유형], [일반상품] → [입장권]</li>
                    </ul>
                </>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb & Title */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                {displayTitle}
            </h2>
            {isKioskMode && !isAfter && (
                <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">
                    * 키오스크별 상품 관리는 새로 추가되는 메뉴입니다.
                </span>
            )}
        </div>
        <div className="text-xs text-gray-400 font-medium">
          <span>입장시설 관리</span> <span className="mx-2 text-gray-300">›</span> <span className="text-purple-600 font-bold">{displayTitle}</span>
        </div>
      </div>

      {/* Search Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        {/* ... Search Filter Content (Same as before) ... */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* 검색어 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap w-12">검색어</span>
            <select 
                className="form-select text-sm border-gray-300 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-28"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
            >
                <option value="name">창구명</option>
                <option value="code">창구코드</option>
            </select>
            <div className="relative">
                <input 
                type="text" 
                placeholder="검색 값을 입력하세요." 
                className="form-input w-64 text-sm border-gray-300 rounded-md h-9 pr-10 focus:border-purple-500 focus:ring-purple-500 placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* 매표소 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">매표소</span>
            <select 
                className="form-select text-sm border-gray-300 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-40"
                value={boothFilter}
                onChange={(e) => setBoothFilter(e.target.value)}
            >
                <option value="all">전체</option>
                {MOCK_BOOTHS.map(booth => (
                    <option key={booth.id} value={booth.name}>{booth.name}</option>
                ))}
            </select>
          </div>

          {/* 창구채널 */}
          {/* POS After Mode: Ghost */}
          {!isKioskMode && isAfter && (
             <div className="flex items-center gap-2 opacity-50 grayscale transition-all duration-300">
                <span className="text-sm font-bold whitespace-nowrap text-gray-400 line-through">창구채널</span>
                <div className="h-9 w-48 border border-dashed border-red-300 rounded-md flex items-center justify-center bg-red-50 text-red-400 text-xs font-bold" title="현장 POS 전용">
                    [삭제됨]
                </div>
             </div>
          )}

          {/* POS Before Mode OR Kiosk (Any Mode) */}
          {(isKioskMode || !isAfter) && (
             <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700 whitespace-nowrap">창구채널</span>
                <select
                    className="form-select text-sm border-gray-300 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-48"
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                >
                    <option value="all">전체</option>
                    {isKioskMode ? (
                        <>
                            <option value="kiosk">일반 키오스크</option>
                            <option value="barrier_free">배리어프리</option>
                            <option value="barrier_free_nol">배리어프리(NOL티켓)</option>
                        </>
                    ) : (
                        <>
                            <option value="kiosk">키오스크</option>
                            <option value="pos">현장POS</option>
                            <option value="barrier_free_kiosk">배리어프리키오스크</option>
                            <option value="barrier_free_kiosk_nol">배리어프리키오스크(NOL티켓)</option>
                        </>
                    )}
                </select>
             </div>
          )}

          {/* 사용여부 (NEW) */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">사용여부</span>
            <select 
                className="form-select text-sm border-gray-300 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-32"
                value={usageFilter}
                onChange={(e) => setUsageFilter(e.target.value)}
            >
                <option value="all">전체</option>
                <option value="Y">사용</option>
                <option value="N">미사용</option>
            </select>
          </div>

          <div className="ml-auto">
            <button 
                onClick={handleSearch}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-1.5 rounded-md text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* Data List Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
        {/* Table Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">총 <span className="text-purple-700 font-bold">{posList.length}</span>개</span>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">페이지 당 데이터 건수</span>
              <select className="form-select text-xs border-gray-300 rounded py-1 px-2 h-8 focus:border-purple-500 focus:ring-purple-500">
                <option>15</option>
                <option>30</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-[#f8f9fa] text-gray-500 font-bold border-b border-gray-200 whitespace-nowrap">
              <tr>
                <th className="py-3 px-4 w-12"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" /></th>
                <th className="py-3 px-4">매표소</th>
                <th className="py-3 px-4">창구코드</th>
                <th className={`py-3 px-4 ${isAfter && !isKioskMode ? 'line-through text-gray-300 bg-red-50' : ''}`}>창구채널</th>
                <th className="py-3 px-4">창구명</th>
                <th className="py-3 px-4">적용 상품 수</th>
                <th className="py-3 px-4">사용여부</th>
                <th className="py-3 px-4 bg-gray-50"></th>{/* Actions */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posList.length > 0 ? (
                posList.map((pos) => (
                  <tr key={pos.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" /></td>
                    <td className="py-4 px-4 text-gray-600">{pos.boothName}</td>
                    <td className="py-4 px-4 text-gray-600">{pos.code}</td>
                    <td className={`py-4 px-4 ${isAfter && !isKioskMode ? 'text-gray-300' : 'text-gray-600'}`}>{pos.channel}</td>
                    <td className="py-4 px-4 font-bold text-gray-800">{pos.name}</td>
                    <td className="py-4 px-4">
                        <span 
                          onClick={() => handleOpenAppliedModal(pos.id)}
                          className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded font-bold cursor-pointer hover:bg-purple-50 hover:shadow-sm transition-all"
                        >
                          {pos.productCount}
                        </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                        {pos.usage}
                    </td>
                    <td className="py-4 px-4">
                        <button 
                            onClick={() => handleOpenProductAdd(pos.id)}
                            className="px-3 py-1.5 bg-white border border-purple-400 text-purple-600 rounded text-xs font-bold hover:bg-purple-50 shadow-sm transition-colors"
                        >
                            상품추가
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-40 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <p className="text-sm font-medium text-gray-500">검색 결과가 없습니다.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex justify-center bg-white rounded-b-lg">
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded text-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#343a40] text-white text-xs font-bold shadow-sm">1</button>
            <button className="p-1.5 rounded text-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* 🛠️ Applied Products Modal */}
      {isAppliedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
          <div className="bg-white w-[1200px] h-[750px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-purple-600 text-white shrink-0">
              <span className="font-bold text-lg">적용 상품</span>
              <button onClick={() => setIsAppliedModalOpen(false)} className="text-white hover:text-purple-200 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50 p-5">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full text-xs text-center border-collapse">
                  <thead className="bg-[#f8f9fa] text-gray-500 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 w-12">
                        <input 
                          type="checkbox" 
                          className="rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                          onChange={toggleAppliedSelectAll}
                          checked={appliedProducts.length > 0 && selectedAppliedIds.length === appliedProducts.length}
                        />
                      </th>
                      <th className="py-3 px-4 w-20">노출순서</th>
                      <th className="py-3 px-4 w-28">상품코드</th>
                      <th className="py-3 px-4">상품명</th>
                      <th className="py-3 px-4 w-20">상태</th>
                      <th className="py-3 px-4 w-24">
                        {isAfter ? '상품 유형' : '상품 카테고리'}
                      </th>
                      <th className="py-3 px-4 w-28">상품 날짜선택</th>
                      <th className="py-3 px-4 w-36">상품기간</th>
                      <th className="py-3 px-4 w-36">판매기간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appliedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <input 
                            type="checkbox" 
                            className="rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                            checked={selectedAppliedIds.includes(p.id)}
                            onChange={() => toggleAppliedSelectOne(p.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input 
                            type="number" 
                            className={`w-16 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 ${!isAfter ? 'no-spinner' : ''}`}
                            value={p.order}
                            onChange={(e) => handleAppliedOrderChange(p.id, parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono">{p.code}</td>
                        <td className="py-3 px-4 text-left font-medium text-gray-800 truncate max-w-[200px]" title={p.name}>{p.name}</td>
                        <td className="py-3 px-4 text-gray-600">{p.status}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {isAfter && p.category === '일반상품' ? '입장권' : p.category}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{p.dateType}</td>
                        <td className="py-3 px-4 text-gray-500 text-[11px] leading-tight text-left whitespace-pre-wrap">{p.period}</td>
                        <td className="py-3 px-4 text-gray-500 text-[11px] leading-tight text-left whitespace-pre-wrap">{p.salesPeriod}</td>
                      </tr>
                    ))}
                    {appliedProducts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-20 text-center text-gray-400">
                          등록된 상품이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-200 flex justify-center gap-3 shrink-0">
                <button 
                  onClick={handleDeleteApplied}
                  className="px-8 py-2.5 bg-[#862e9c] text-white rounded font-bold hover:bg-[#702485] shadow-sm text-sm transition-colors"
                >
                  선택삭제
                </button>
                <button 
                  onClick={handleSaveAppliedOrder}
                  className="px-8 py-2.5 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 shadow-sm text-sm transition-colors"
                >
                  상품 순서 저장
                </button>
                <button 
                  onClick={() => setIsAppliedModalOpen(false)}
                  className="px-8 py-2.5 bg-[#343a40] text-white rounded font-bold hover:bg-gray-800 shadow-sm text-sm transition-colors"
                >
                  취소
                </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ Product Add Modal */}
      {isProductAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
            <div className="bg-white w-[1000px] h-[700px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-purple-600 text-white shrink-0">
                    <span className="font-bold text-lg">상품 추가</span>
                    <button onClick={() => setIsProductAddModalOpen(false)} className="text-white hover:text-purple-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Filter */}
                <div className="p-5 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">검색어</span>
                        <select 
                            className="form-select text-sm border-gray-300 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-28"
                            value={popupSearchType}
                            onChange={(e) => setPopupSearchType(e.target.value)}
                        >
                            <option value="name">상품명</option>
                            <option value="code">상품코드</option>
                        </select>
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="검색 값을 입력하세요." 
                                className="form-input w-full text-sm border-gray-300 rounded-md h-9 pr-10 focus:border-purple-500 focus:ring-purple-500 placeholder:text-gray-400"
                                value={popupSearchTerm}
                                onChange={(e) => setPopupSearchTerm(e.target.value)}
                            />
                            <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap ml-4">판매상태</span>
                        <select 
                            className="form-select text-sm border-gray-300 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-32"
                            value={popupStatusFilter}
                            onChange={(e) => setPopupStatusFilter(e.target.value)}
                        >
                            {isAfter ? (
                                <>
                                    <option value="판매중">판매중</option>
                                    <option value="판매중지">판매중지</option>
                                    <option value="판매 마감">판매 마감</option>
                                </>
                            ) : (
                                <>
                                    <option value="전체">전체</option>
                                    <option value="판매중">판매중</option>
                                    <option value="판매 일시중지">판매 일시중지</option>
                                    <option value="마감">마감</option>
                                </>
                            )}
                        </select>

                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-1.5 rounded-md text-sm font-bold shadow-sm transition-all ml-2">
                            조회
                        </button>
                    </div>
                </div>

                {/* Modal Table */}
                <div className="flex-1 overflow-auto bg-gray-50 p-5">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-xs text-center border-collapse">
                            <thead className="bg-[#f8f9fa] text-gray-500 font-bold border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 w-12">
                                        <input 
                                            type="checkbox" 
                                            className="rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                                            onChange={handlePopupCheckAll} 
                                            checked={popupProducts.length > 0 && selectedPopupItems.length === popupProducts.length}
                                        />
                                    </th>
                                    <th className="py-3 px-4 w-32">상품코드</th>
                                    <th className="py-3 px-4">상품명</th>
                                    <th className="py-3 px-4 w-20">상태</th>
                                    <th className="py-3 px-4 w-24">
                                        {isAfter ? '상품 유형' : '상품 카테고리'}
                                    </th>
                                    <th className="py-3 px-4 w-32">상품 날짜선택</th>
                                    <th className="py-3 px-4 w-40">상품기간</th>
                                    <th className="py-3 px-4 w-40">판매기간</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {popupProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <input 
                                                type="checkbox" 
                                                className="rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                                                checked={selectedPopupItems.includes(p.id)}
                                                onChange={() => handlePopupCheckRow(p.id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 font-mono">{p.code}</td>
                                        <td className="py-3 px-4 text-left font-medium text-gray-800">{p.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{p.status}</td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {isAfter && p.category === '일반상품' ? '입장권' : p.category}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{p.dateType}</td>
                                        <td className="py-3 px-4 text-gray-500 text-[11px] leading-tight text-left">
                                            {p.period.split(' ~ ').map((d, i) => <div key={i}>{d}</div>)}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-[11px] leading-tight text-left">
                                            {p.salesPeriod.split(' ~ ').map((d, i) => <div key={i}>{d}</div>)}
                                        </td>
                                    </tr>
                                ))}
                                {popupProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center text-gray-400">
                                            검색 결과가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-white border-t border-gray-200 flex justify-center gap-3 shrink-0">
                    <button 
                        onClick={handlePopupConfirm}
                        className="px-10 py-2.5 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 shadow-sm text-sm transition-colors"
                    >
                        확인
                    </button>
                    <button 
                        onClick={() => setIsProductAddModalOpen(false)}
                        className="px-10 py-2.5 bg-[#343a40] text-white rounded font-bold hover:bg-gray-800 shadow-sm text-sm transition-colors"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 🛠️ Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-30 animate-in fade-in duration-200">
          <div className="bg-white w-[360px] rounded-xl shadow-2xl p-6 flex flex-col animate-in zoom-in-95 duration-200">
             <div className="mb-4">
               <p className="text-xs text-gray-500 mb-2">devadm.maketicket.co.kr 내용:</p>
               <p className="text-sm font-bold text-gray-800 whitespace-pre-line">{confirmModal.message}</p>
             </div>
             <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={processConfirmAction}
                  className="px-4 py-2 bg-purple-700 text-white rounded-md text-xs font-bold hover:bg-purple-800 transition-colors shadow-sm"
                >
                  확인
                </button>
                <button 
                  onClick={() => setConfirmModal({...confirmModal, isOpen: false})}
                  className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-md text-xs font-bold hover:bg-purple-100 transition-colors"
                >
                  취소
                </button>
             </div>
          </div>
        </div>
      )}

      {/* 🛠️ Custom Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-30 animate-in fade-in duration-200">
          <div className="bg-white w-[360px] rounded-xl shadow-2xl p-6 flex flex-col animate-in zoom-in-95 duration-200">
             <div className="mb-4">
               <p className="text-xs text-gray-500 mb-2">devadm.maketicket.co.kr 내용:</p>
               <p className="text-sm font-bold text-gray-800 whitespace-pre-line">{alertModal.message}</p>
             </div>
             <div className="flex justify-end mt-2">
                <button 
                  onClick={() => setAlertModal({...alertModal, isOpen: false})}
                  className="px-4 py-2 bg-purple-700 text-white rounded-md text-xs font-bold hover:bg-purple-800 transition-colors shadow-sm"
                >
                  확인
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityPosProduct;
