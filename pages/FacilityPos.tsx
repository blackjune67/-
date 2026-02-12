
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, LayoutTemplate, ToggleLeft, ToggleRight, AlertCircle, Calendar, X } from 'lucide-react';

interface PosWindow {
  id: string;
  boothName: string;
  code: string;
  channel: string;
  name: string;
  status: string;
  loginId: string;
  loginTime: string;
  closeTime: string;
  appVer: string;
  localVer: string;
  agentVer: string;
  usage: '사용' | '미사용';
  refundOnly: '사용' | '미사용';
  adminClose: boolean;
  linkedProductCount: number; // 상품 연결 여부 (삭제 유효성 검사용)
}

// Synced Mock Data based on FacilityBooth.tsx
const MOCK_POS_LIST: PosWindow[] = [
  { id: '1', boothName: '정문 매표소', code: '01', channel: '키오스크', name: '키오스크 1', status: '사용중', loginId: 'admin', loginTime: '2026-02-09 09:00:00', closeTime: '-', appVer: '2.2025.0404.01', localVer: '2.2025.0404.01', agentVer: '2.2025.0404.01', usage: '사용', refundOnly: '미사용', adminClose: false, linkedProductCount: 3 },
  { id: '2', boothName: '정문 매표소', code: '02', channel: '키오스크', name: '키오스크 2', status: '관리마감', loginId: '', loginTime: '', closeTime: '', appVer: '2.2025.0404.01', localVer: '2.2025.0404.01', agentVer: '2.2025.0404.01', usage: '사용', refundOnly: '미사용', adminClose: true, linkedProductCount: 0 },
  { id: '3', boothName: '정문 매표소', code: '03', channel: '현장POS', name: '포스 1', status: '관리마감', loginId: '', loginTime: '', closeTime: '', appVer: '미설정', localVer: '2.2025.1017.01', agentVer: '2.2025.1017.01', usage: '사용', refundOnly: '미사용', adminClose: true, linkedProductCount: 5 },
  { id: '4', boothName: '후문 매표소', code: '01', channel: '배리어프리키오스크', name: '배리어프리 1', status: '사용중', loginId: 'staff2', loginTime: '2026-02-09 09:15:00', closeTime: '-', appVer: '2.2025.1113.01', localVer: '2.2025.1113.01', agentVer: '2.2025.1113.01', usage: '사용', refundOnly: '미사용', adminClose: false, linkedProductCount: 2 },
  { id: '5', boothName: '후문 매표소', code: '02', channel: '현장POS', name: '포스 2', status: '관리마감', loginId: '', loginTime: '', closeTime: '', appVer: '2.2025.1113.01', localVer: '2.2025.1126.01', agentVer: '2.2025.1126.01', usage: '사용', refundOnly: '미사용', adminClose: true, linkedProductCount: 0 },
  { id: '6', boothName: '중앙 매표소', code: '01', channel: '현장POS', name: '포스 3', status: '관리마감', loginId: '', loginTime: '', closeTime: '', appVer: '2.2025.1113.01', localVer: '2.2025.1126.01', agentVer: '2.2025.1126.01', usage: '사용', refundOnly: '미사용', adminClose: true, linkedProductCount: 1 },
];

const MOCK_BOOTHS = [
  { id: '1', name: '정문 매표소' },
  { id: '2', name: '후문 매표소' },
  { id: '3', name: '중앙 매표소' },
];

interface FacilityPosProps {
  pageTitle?: string;
}

const FacilityPos: React.FC<FacilityPosProps> = ({ pageTitle }) => {
  const [viewMode, setViewMode] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [boothFilter, setBoothFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const displayTitle = pageTitle || 'POS 창구관리';
  const isKioskMode = displayTitle.includes('키오스크');

  // Initialize data based on mode
  const [posList, setPosList] = useState<PosWindow[]>(() => {
    if (isKioskMode) {
      return MOCK_POS_LIST.filter(p => p.channel !== '현장POS');
    }
    return MOCK_POS_LIST;
  });

  const isAfter = viewMode === 'AFTER';

  // Update data when mode changes (e.g. navigation)
  useEffect(() => {
    handleSearch();
  }, [isKioskMode]);

  // 검색 핸들러 구현
  const handleSearch = () => {
    let filtered = MOCK_POS_LIST;

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

    // 4. 상태 필터
    if (statusFilter !== 'all') {
        const statusMap: {[key:string]: string} = { 'active': '사용중', 'closed': '창구마감', 'admin_closed': '관리마감' };
        filtered = filtered.filter(p => p.status === statusMap[statusFilter]);
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalForm, setModalForm] = useState({
    booth: '',
    channel: '',
    name: '',
    code: '',
    usage: '사용',
    refundOnly: '미사용',
    programVer: '',
    contactKiosk: '',
    logStart: '',
    logEnd: '',
    contactCall: '',
    storeName: '',
    bizNum: '',
    ownerName: '',
    storePhone: '',
    storeAddr: ''
  });

  // Custom Confirm/Alert Modal State
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, targetId: string | null, linkedCount: number}>({
    isOpen: false, message: '', targetId: null, linkedCount: 0
  });
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, message: string}>({
    isOpen: false, message: ''
  });

  const handleOpenRegister = () => {
    setIsEditMode(false);
    
    // Determine default channel based on mode and state
    let defaultChannel = '';
    if (isAfter) {
        if (isKioskMode) defaultChannel = '일반 키오스크';
        else defaultChannel = '현장POS';
    }

    setModalForm({
      booth: '', 
      channel: defaultChannel,
      name: '', code: '', usage: '사용', refundOnly: '미사용',
      programVer: '', contactKiosk: '', logStart: '', logEnd: '', contactCall: '',
      storeName: '', bizNum: '', ownerName: '', storePhone: '', storeAddr: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (pos: PosWindow) => {
    setIsEditMode(true);
    setModalForm({
      booth: pos.boothName,
      channel: pos.channel,
      name: pos.name,
      code: pos.code,
      usage: pos.usage as string,
      refundOnly: pos.refundOnly as string,
      programVer: pos.appVer === '미설정' ? '' : pos.appVer,
      contactKiosk: '', 
      logStart: '',
      logEnd: '',
      contactCall: '',
      storeName: '',
      bizNum: '',
      ownerName: '',
      storePhone: '',
      storeAddr: ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (pos: PosWindow) => {
    setConfirmModal({
        isOpen: true,
        message: '정말 삭제하시겠습니까?',
        targetId: pos.id,
        linkedCount: pos.linkedProductCount
    });
  };

  const processDelete = () => {
    const { targetId, linkedCount } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    // 유효성 검사: 연결된 상품이 있으면 삭제 불가
    if (linkedCount > 0) {
        setAlertModal({
            isOpen: true,
            message: '창구에 상품이 등록되어 있어 삭제할 수 없습니다.'
        });
        return;
    }

    // 삭제 처리
    if (targetId) {
        setPosList(prev => prev.filter(p => p.id !== targetId));
    }
  };

  const handleSave = () => {
    alert('저장되었습니다.');
    setIsModalOpen(false);
  };

  // Helper for Modal Form Rows
  const ModalRow = ({ label, required, children, hidden = false }: React.PropsWithChildren<{ label: string, required?: boolean, hidden?: boolean }>) => {
    if (hidden) return null;
    return (
        <div className="flex border-b border-gray-200 last:border-0 min-h-[50px]">
        <div className="w-48 bg-gray-50 px-4 py-3 flex items-center text-xs font-bold text-gray-800 border-r border-gray-200 shrink-0">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <div className="flex-1 px-4 py-2 flex items-center bg-white">
            {children}
        </div>
        </div>
    );
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto relative min-h-screen">
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
                    <p>2. <strong>등록 팝업</strong>: 창구 채널 필드를 활성화하며, '현장 POS' 옵션은 제거됩니다.</p>
                    <ul className="list-disc list-inside ml-2 text-xs">
                        <li>최초 등록 시 '일반 키오스크'가 기본 선택됩니다.</li>
                    </ul>
                    <p>3. <strong>삭제 유효성</strong>: 상품이 연결된 창구는 삭제가 불가능하며, 안내 팝업을 출력합니다.</p>
                </>
            ) : (
                <>
                    <p>1. <strong>삭제 유효성 검사</strong>: 상품이 연결된 창구는 삭제가 불가능하며, 안내 팝업을 출력합니다.</p>
                    <p>2. <strong>등록 팝업 간소화</strong>: '창구채널' 필드는 사용자에게 노출하지 않고 내부적으로 '현장POS'로 처리합니다.</p>
                    <p>3. <strong>창구 코드 보호</strong>: 수정 시 창구 코드는 변경할 수 없도록 Read-only 처리합니다.</p>
                </>
            )}
            <p className="mt-1 pt-1 border-t border-orange-200 text-orange-700 font-medium">※ 일부 컬럼 또는 필드 주석처리 외 기능은 당장 개선 없이 현재 상태를 유지합니다.</p>
          </div>
        </div>
      )}

      {/* Breadcrumb & Title */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{displayTitle}</h2>
            {isKioskMode && !isAfter && (
                <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">
                    * 키오스크 창구관리는 새로 추가되는 메뉴입니다.
                </span>
            )}
        </div>
        <div className="text-xs text-gray-400 font-medium">
          <span>입장시설 관리</span> <span className="mx-2 text-gray-300">›</span> <span className="text-purple-600 font-bold">{displayTitle}</span>
        </div>
      </div>

      {/* Search Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
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
                <div className="h-9 w-40 border border-dashed border-red-300 rounded-md flex items-center justify-center bg-red-50 text-red-400 text-xs font-bold">
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
                    {isKioskMode && isAfter ? (
                        <>
                            <option value="일반 키오스크">일반 키오스크</option>
                            <option value="배리어프리">배리어프리</option>
                            <option value="배리어프리(NOL티켓)">배리어프리(NOL티켓)</option>
                        </>
                    ) : (
                        <>
                            <option value="키오스크">키오스크</option>
                            <option value="현장POS">현장POS</option>
                            <option value="배리어프리키오스크">배리어프리키오스크</option>
                            <option value="배리어프리키오스크(NOL티켓)">배리어프리키오스크(NOL티켓)</option>
                        </>
                    )}
                </select>
             </div>
          )}

          {/* 창구상태 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">창구상태</span>
            <select 
                className="form-select text-sm border-gray-300 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-32"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="all">전체</option>
                <option value="active">사용중</option>
                <option value="closed">창구마감</option>
                <option value="admin_closed">관리마감</option>
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
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 rounded text-xs font-bold hover:bg-purple-200 transition-colors shadow-sm">
                현장프로그램 버전 일괄설정
            </button>
            <button 
              onClick={handleOpenRegister}
              className="px-4 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 rounded text-xs font-bold hover:bg-purple-200 transition-colors shadow-sm"
            >
                창구 등록
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse whitespace-nowrap">
            <thead className="bg-[#f8f9fa] text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 w-12"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" /></th>
                <th className="py-3 px-4">매표소</th>
                <th className="py-3 px-4">창구코드</th>
                <th className={`py-3 px-4 ${isAfter && !isKioskMode ? 'bg-red-50' : ''}`}>
                    {isAfter && !isKioskMode ? (
                        <span className="text-red-400 line-through decoration-2">
                            창구채널 <span className="no-underline text-[10px] bg-red-100 px-1 rounded ml-1 text-red-500">삭제</span>
                        </span>
                    ) : '창구채널'}
                </th>
                <th className="py-3 px-4">창구명</th>
                <th className="py-3 px-4">창구상태</th>
                <th className="py-3 px-4">로그인 ID</th>
                <th className="py-3 px-4">로그인<br/>시간</th>
                <th className="py-3 px-4">창구마감<br/>시간</th>
                <th className="py-3 px-4">프로그램 버전</th>
                <th className="py-3 px-4">로컬 프로그램 버전</th>
                <th className="py-3 px-4">로컬 에이전트 버전</th>
                <th className="py-3 px-4">사용여부</th>
                <th className="py-3 px-4">환불전용창구</th>
                <th className="py-3 px-4">관리마감</th>
                <th className="py-3 px-4 w-48 bg-gray-50"></th>{/* Actions */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posList.length > 0 ? (
                posList.map((pos) => (
                  <tr key={pos.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" /></td>
                    <td className="py-3 px-4 text-gray-600">{pos.boothName}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.code}</td>
                    <td className={`py-3 px-4 ${isAfter && !isKioskMode ? 'text-gray-300' : 'text-gray-600'}`}>{pos.channel}</td>
                    <td className="py-3 px-4 font-bold text-gray-800 text-left">{pos.name}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.status}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.loginId}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.loginTime}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.closeTime}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.appVer}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.localVer}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.agentVer}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.usage}</td>
                    <td className="py-3 px-4 text-gray-600">{pos.refundOnly}</td>
                    <td className="py-3 px-4">
                      {pos.adminClose && <button className="px-2 py-1 bg-white border border-purple-400 text-purple-600 rounded text-[10px] font-bold hover:bg-purple-50">관리마감</button>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => handleEdit(pos)} className="px-2 py-1 bg-white border border-purple-400 text-purple-600 rounded text-[10px] font-bold hover:bg-purple-50">수정</button>
                        <button onClick={() => handleDeleteClick(pos)} className="px-2 py-1 bg-white border border-gray-400 text-gray-600 rounded text-[10px] font-bold hover:bg-gray-100">삭제</button>
                        <button className="px-2 py-1 bg-white border border-purple-400 text-purple-600 rounded text-[10px] font-bold hover:bg-purple-50">정보</button>
                        <button className="px-2 py-1 bg-white border border-purple-400 text-purple-600 rounded text-[10px] font-bold hover:bg-purple-50">설정</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={16} className="py-40 text-center">
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

      {/* 🛠️ Register/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
          <div className="bg-white w-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-purple-600 text-white shrink-0">
              <span className="font-bold text-lg">{isEditMode ? '창구 수정' : '창구 등록'}</span>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-purple-200 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* ... Modal content ... */}
              <div className="border-t border-gray-200">
                <ModalRow label="매표소" required>
                  <select 
                    className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                    value={modalForm.booth}
                    onChange={(e) => setModalForm({...modalForm, booth: e.target.value})}
                  >
                    <option value="">선택</option>
                    {MOCK_BOOTHS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </ModalRow>
                
                {/* After Mode에서는 창구 채널 필드 제어: 키오스크 모드는 보임, POS 모드는 숨김 */}
                <ModalRow label="창구채널" required hidden={!isKioskMode && isAfter}>
                  <select 
                    className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                    value={modalForm.channel}
                    onChange={(e) => setModalForm({...modalForm, channel: e.target.value})}
                  >
                    <option value="">선택</option>
                    {isKioskMode && isAfter ? (
                        <>
                            <option value="일반 키오스크">일반 키오스크</option>
                            <option value="배리어프리">배리어프리</option>
                            <option value="배리어프리(NOL티켓)">배리어프리(NOL티켓)</option>
                        </>
                    ) : (
                        <>
                            <option value="키오스크">키오스크</option>
                            <option value="현장POS">현장POS</option>
                            <option value="배리어프리키오스크">배리어프리키오스크</option>
                            <option value="배리어프리키오스크(NOL티켓)">배리어프리키오스크(NOL티켓)</option>
                        </>
                    )}
                  </select>
                </ModalRow>

                <ModalRow label="창구명" required>
                  <input 
                    type="text" 
                    className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                    value={modalForm.name}
                    onChange={(e) => setModalForm({...modalForm, name: e.target.value})}
                  />
                </ModalRow>
                <ModalRow label="창구 코드" required>
                  <input 
                    type="text" 
                    className={`w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                    value={modalForm.code}
                    onChange={(e) => setModalForm({...modalForm, code: e.target.value})}
                    readOnly={isEditMode}
                    disabled={isEditMode}
                  />
                </ModalRow>
                <ModalRow label="사용여부">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="usage" 
                        className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                        checked={modalForm.usage === '사용'}
                        onChange={() => setModalForm({...modalForm, usage: '사용'})}
                      /> 
                      <span className="text-sm text-gray-700">사용</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="usage" 
                        className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                        checked={modalForm.usage === '미사용'}
                        onChange={() => setModalForm({...modalForm, usage: '미사용'})}
                      /> 
                      <span className="text-sm text-gray-700">미사용</span>
                    </label>
                  </div>
                </ModalRow>
                
                <ModalRow label="환불전용창구">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="refundOnly" 
                        className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                        checked={modalForm.refundOnly === '사용'}
                        onChange={() => setModalForm({...modalForm, refundOnly: '사용'})}
                      /> 
                      <span className="text-sm text-gray-700">사용</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="refundOnly" 
                        className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                        checked={modalForm.refundOnly === '미사용'}
                        onChange={() => setModalForm({...modalForm, refundOnly: '미사용'})}
                      /> 
                      <span className="text-sm text-gray-700">미사용</span>
                    </label>
                  </div>
                </ModalRow>
                <ModalRow label="현장프로그램 버전">
                  <div className="flex gap-2 w-full">
                    <input 
                        type="text" 
                        className="flex-1 h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm bg-gray-100"
                        readOnly
                        value={modalForm.programVer}
                    />
                    <button className="px-3 py-1 bg-white border border-purple-400 text-purple-600 rounded text-xs font-bold hover:bg-purple-50">선택</button>
                    <button className="px-3 py-1 bg-white border border-purple-400 text-purple-600 rounded text-xs font-bold hover:bg-purple-50">삭제</button>
                  </div>
                </ModalRow>

                {/* 
                    [BEFORE Mode Correction] 
                    Adding specific fields requested by user for the "Before" popup design.
                    These fields are wrapped in {!isAfter} because the user specifically asked 
                    to add them to the "BEFORE screen's popup".
                */}
                {!isAfter && (
                    <>
                        <ModalRow label="키오스크 용지부족 담당자 연락처">
                            <input 
                                type="text" 
                                className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                value={modalForm.contactKiosk}
                                onChange={(e) => setModalForm({...modalForm, contactKiosk: e.target.value})}
                            />
                        </ModalRow>
                        <ModalRow label="로그파일 요청 시작 일자">
                            <div className="relative w-full">
                                <input 
                                    type="text" 
                                    placeholder="yyyy-mm-dd"
                                    className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                    value={modalForm.logStart}
                                    onChange={(e) => setModalForm({...modalForm, logStart: e.target.value})}
                                />
                                <Calendar className="absolute right-2 top-2 text-purple-400 pointer-events-none" size={16} />
                            </div>
                        </ModalRow>
                        <ModalRow label="로그파일 요청 종료 일자">
                            <div className="relative w-full">
                                <input 
                                    type="text" 
                                    placeholder="yyyy-mm-dd"
                                    className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                    value={modalForm.logEnd}
                                    onChange={(e) => setModalForm({...modalForm, logEnd: e.target.value})}
                                />
                                <Calendar className="absolute right-2 top-2 text-purple-400 pointer-events-none" size={16} />
                            </div>
                        </ModalRow>
                        <ModalRow label="호출 담당자 연락처">
                            <input 
                                type="text" 
                                className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                value={modalForm.contactCall}
                                onChange={(e) => setModalForm({...modalForm, contactCall: e.target.value})}
                            />
                        </ModalRow>
                        <ModalRow label="가맹점명">
                            <input 
                                type="text" 
                                className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                value={modalForm.storeName}
                                onChange={(e) => setModalForm({...modalForm, storeName: e.target.value})}
                            />
                        </ModalRow>
                        <ModalRow label="가맹점 사업자번호">
                            <input 
                                type="text" 
                                className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                value={modalForm.bizNum}
                                onChange={(e) => setModalForm({...modalForm, bizNum: e.target.value})}
                            />
                        </ModalRow>
                        <ModalRow label="가맹점 대표자명">
                            <input 
                                type="text" 
                                className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                value={modalForm.ownerName}
                                onChange={(e) => setModalForm({...modalForm, ownerName: e.target.value})}
                            />
                        </ModalRow>
                        <ModalRow label="가맹점 전화번호">
                            <input 
                                type="text" 
                                className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                value={modalForm.storePhone}
                                onChange={(e) => setModalForm({...modalForm, storePhone: e.target.value})}
                            />
                        </ModalRow>
                        <ModalRow label="가맹점 주소">
                            <input 
                                type="text" 
                                className="w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                value={modalForm.storeAddr}
                                onChange={(e) => setModalForm({...modalForm, storeAddr: e.target.value})}
                            />
                        </ModalRow>
                    </>
                )}

              </div>

              {/* Modal Footer */}
              <div className="mt-8 flex justify-center gap-3">
                 <button 
                   onClick={handleSave} 
                   className="px-10 py-2.5 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 shadow-sm text-sm transition-colors"
                 >
                   저장
                 </button>
                 <button 
                   onClick={() => setIsModalOpen(false)} 
                   className="px-10 py-2.5 bg-[#343a40] text-white rounded font-bold hover:bg-gray-800 shadow-sm text-sm transition-colors"
                 >
                   취소
                 </button>
              </div>
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
                  onClick={processDelete}
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

      {/* 🛠️ Custom Alert Modal (Delete Error) */}
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

export default FacilityPos;
