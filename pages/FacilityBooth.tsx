
import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertCircle, ToggleLeft, ToggleRight, LayoutTemplate, AlertTriangle, X, Info } from 'lucide-react';

interface Booth {
  id: string;
  code: string;
  name: string;
  linkedPosCount: number; // 0이면 삭제 가능, >0이면 삭제 불가
  duplicateCheck: '사용' | '미사용';
  blockTime: number;
}

// Initial Mock Data
const INITIAL_BOOTHS: Booth[] = [
  { id: '1', code: '01', name: '정문 매표소', linkedPosCount: 3, duplicateCheck: '사용', blockTime: 30 },
  { id: '2', code: '02', name: '후문 매표소', linkedPosCount: 2, duplicateCheck: '미사용', blockTime: 0 },
  { id: '3', code: '03', name: '중앙 매표소', linkedPosCount: 1, duplicateCheck: '사용', blockTime: 60 },
];

const FacilityBooth: React.FC = () => {
  const [viewMode, setViewMode] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const [booths, setBooths] = useState<Booth[]>(INITIAL_BOOTHS); 
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); 
  const isAfter = viewMode === 'AFTER';

  // Modal State (Register/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [registerForm, setRegisterForm] = useState({
    name: '',
    duplicateCheck: '미사용', // 기본값 미사용
    blockTime: 0
  });

  // Custom Confirm/Alert Modal State
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, targetId: string | null, linkedCount: number}>({
    isOpen: false, message: '', targetId: null, linkedCount: 0
  });
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, message: string}>({
    isOpen: false, message: ''
  });

  // 검색 핸들러 추가
  const handleSearch = () => {
    let filtered = INITIAL_BOOTHS;
    if (searchTerm) {
      filtered = filtered.filter(b => {
        if (searchType === 'name') return b.name.includes(searchTerm);
        if (searchType === 'code') return b.code.includes(searchTerm);
        return false;
      });
    }
    setBooths(filtered);
  };

  // 매표소 등록 팝업 열기
  const handleOpenRegister = () => {
    setIsEditMode(false);
    setEditingId(null);
    setRegisterForm({ name: '', duplicateCheck: '미사용', blockTime: 0 });
    setIsModalOpen(true);
  };

  // 매표소 수정 팝업 열기
  const handleEdit = (booth: Booth) => {
    setIsEditMode(true);
    setEditingId(booth.id);
    setRegisterForm({
      name: booth.name,
      duplicateCheck: booth.duplicateCheck as '사용' | '미사용',
      blockTime: booth.blockTime
    });
    setIsModalOpen(true);
  };

  // 매표소 저장 (신규/수정)
  const handleSave = () => {
    if (!registerForm.name.trim()) {
      alert('매표소명을 입력해주세요.');
      return;
    }

    if (isAfter && registerForm.duplicateCheck === '사용' && registerForm.blockTime <= 0) {
        // Validation logic if needed
    }

    if (isEditMode && editingId) {
      // Update Existing
      setBooths(prev => prev.map(b => b.id === editingId ? {
        ...b,
        name: registerForm.name,
        duplicateCheck: registerForm.duplicateCheck as '사용' | '미사용',
        blockTime: registerForm.blockTime
      } : b));
    } else {
      // Create New
      const maxCode = booths.reduce((max, booth) => Math.max(max, parseInt(booth.code, 10)), 0);
      const nextCode = String(maxCode + 1).padStart(2, '0');

      const newBooth: Booth = {
        id: Date.now().toString(),
        code: nextCode,
        name: registerForm.name,
        linkedPosCount: 0,
        duplicateCheck: registerForm.duplicateCheck as '사용' | '미사용',
        blockTime: registerForm.blockTime
      };
      setBooths([...booths, newBooth]);
    }
    setIsModalOpen(false);
  };

  // 매표소 삭제 버튼 클릭 (Confirm Modal 호출)
  const handleDeleteClick = (id: string, linkedCount: number) => {
    setConfirmModal({
      isOpen: true,
      message: '정말 삭제하시겠습니까?',
      targetId: id,
      linkedCount: linkedCount
    });
  };

  // 실제 삭제 처리 (Confirm 확인 후)
  const processDelete = () => {
    const { targetId, linkedCount } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false }); // Close confirm

    if (linkedCount > 0) {
      // 삭제 불가 알림
      setAlertModal({
        isOpen: true,
        message: '창구를 사용하고 있어 삭제할 수 없습니다.'
      });
      return;
    }

    // 삭제 진행
    if (targetId) {
      setBooths(prev => prev.filter(b => b.id !== targetId));
    }
  };

  // 팝업 내 입력 핸들러
  const handleFormChange = (key: string, value: any) => {
    setRegisterForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto relative min-h-screen">
      <style>{`
        /* 숫자 입력 스피너 제거 */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
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
            <p className="font-extrabold text-orange-800 underline decoration-orange-300 underline-offset-4">🛠️ 개발 가이드: 매표소 관리 로직 개선 (TO-BE)</p>
            <p>1. <strong>검색 조건 간소화</strong>: 불필요한 '선택' 옵션을 제거하고 '매표소명', '매표소코드' 2가지만 제공합니다.</p>
            <p>2. <strong>삭제 정합성 체크</strong>: 연결된 POS(창구)가 있는 매표소 삭제 시도 시, 삭제를 차단하고 안내 메시지를 출력해야 합니다.</p>
            <p>3. <strong>등록 팝업 UX</strong>: '검표 중복사용' 설정 시에만 시간 입력 필드가 활성화되도록 인터랙션을 구현합니다.</p>
            <p className="mt-1 pt-1 border-t border-orange-200 text-orange-700 font-medium">※ 일부 컬럼 또는 필드 주석처리 외 기능은 당장 개선 없이 현재 상태를 유지합니다.</p>
          </div>
        </div>
      )}

      {/* Breadcrumb & Title */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">매표소 관리</h2>
        <div className="text-xs text-gray-400 font-medium">
          <span>입장시설 관리</span> <span className="mx-2 text-gray-300">›</span> <span className="text-purple-600 font-bold">매표소관리</span>
        </div>
      </div>

      {/* Search Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">검색어</span>
          <select 
            className="form-select text-sm border-gray-300 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-32"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            {!isAfter && <option value="">선택</option>}
            <option value="name">매표소명</option>
            <option value="code">매표소코드</option>
          </select>

          <div className="relative flex-1 max-w-lg">
            <input 
              type="text" 
              placeholder="검색 값을 입력하세요." 
              className="form-input w-full text-sm border-gray-300 rounded-md h-9 pr-10 focus:border-purple-500 focus:ring-purple-500 placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
        {/* Table Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">총 <span className="text-purple-700 font-bold">{booths.length}</span>개</span>
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
          <button 
            onClick={handleOpenRegister}
            className="px-4 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 rounded text-xs font-bold hover:bg-purple-200 transition-colors shadow-sm"
          >
            매표소 등록
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse">
            <thead className="bg-[#f8f9fa] text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 w-1/4">매표소코드</th>
                <th className="py-3 px-4 w-1/2">매표소명</th>
                <th className="py-3 px-4 w-1/4">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {booths.length > 0 ? (
                booths.map((booth) => (
                  <tr key={booth.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-600 font-mono">{booth.code}</td>
                    <td className="py-4 px-4 text-gray-800 font-medium">{booth.name}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                         <button 
                           onClick={() => handleEdit(booth)}
                           className="px-3 py-1 bg-white border border-purple-300 text-purple-600 rounded text-xs font-bold hover:bg-purple-50 transition-colors"
                         >
                           수정
                         </button>
                         <button 
                           onClick={() => handleDeleteClick(booth.id, booth.linkedPosCount)}
                           className="px-3 py-1 bg-white border border-gray-300 text-gray-500 rounded text-xs font-bold hover:bg-gray-100 transition-colors"
                         >
                           삭제
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty State */
                <tr>
                  <td colSpan={3} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <AlertTriangle size={48} className="mb-4 opacity-20" />
                      <p className="text-base font-medium text-gray-500">검색 결과가 없습니다.</p>
                      <p className="text-xs text-gray-400 mt-1">매표소를 등록하거나 검색어를 확인해주세요.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Visible only when data exists) */}
        {booths.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center bg-white rounded-b-lg">
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded text-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#343a40] text-white text-xs font-bold shadow-sm">1</button>
              <button className="p-1.5 rounded text-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* 🛠️ Register/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
          <div className="bg-white w-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-purple-600 text-white shrink-0">
              <span className="font-bold text-lg">{isEditMode ? '매표소 수정' : '매표소 등록'}</span>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-purple-200 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="border-t border-gray-200">
                {/* Row 1: 매표소명 */}
                <div className="flex border-b border-gray-200 min-h-[50px]">
                  <div className="w-40 bg-gray-50 px-4 py-3 flex items-center text-xs font-bold text-gray-800 border-r border-gray-200 shrink-0">
                    매표소명 <span className="text-red-500 ml-1">*</span>
                  </div>
                  <div className="flex-1 px-4 py-2 flex items-center">
                    <input 
                      type="text" 
                      className="form-input w-full h-8 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2"
                      value={registerForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 2: 검표 중복사용 여부 */}
                <div className="flex border-b border-gray-200 min-h-[50px]">
                  <div className="w-40 bg-gray-50 px-4 py-3 flex items-center text-xs font-bold text-gray-800 border-r border-gray-200 shrink-0">
                    검표 중복사용 여부
                  </div>
                  <div className="flex-1 px-4 py-2 flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="duplicate_check" 
                        checked={registerForm.duplicateCheck === '사용'} 
                        onChange={() => handleFormChange('duplicateCheck', '사용')}
                        className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                      /> 
                      <span className="text-sm text-gray-700">사용</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="duplicate_check" 
                        checked={registerForm.duplicateCheck === '미사용'} 
                        onChange={() => {
                          handleFormChange('duplicateCheck', '미사용');
                          if(isAfter) handleFormChange('blockTime', 0); // Reset time in After mode
                        }}
                        className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                      /> 
                      <span className="text-sm text-gray-700">미사용</span>
                    </label>
                  </div>
                </div>

                {/* Row 3: 중복 검표불가 시간 */}
                {(!isAfter || registerForm.duplicateCheck === '사용') && (
                  <div className="flex border-b border-gray-200 min-h-[50px] animate-in fade-in slide-in-from-top-1">
                    <div className="w-40 bg-gray-50 px-4 py-3 flex items-center text-xs font-bold text-gray-800 border-r border-gray-200 shrink-0">
                      중복 검표불가 시간
                    </div>
                    <div className="flex-1 px-4 py-2 flex items-center gap-2">
                      <input 
                        type="number" 
                        className="form-input w-24 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                        value={registerForm.blockTime}
                        onChange={(e) => handleFormChange('blockTime', parseInt(e.target.value) || 0)}
                        disabled={!isAfter && registerForm.duplicateCheck === '미사용'}
                      />
                      <span className="text-sm text-gray-700">분 내 검표 불가</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-2">
                <p className="text-xs text-red-500 font-medium">
                  * 중복 사용 시, 같은 매표소에서 다회권 권종의 최대 사용횟수까지 중복 사용 처리 가능합니다.
                </p>
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
                   className="px-10 py-2.5 bg-gray-700 text-white rounded font-bold hover:bg-gray-800 shadow-sm text-sm transition-colors"
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

export default FacilityBooth;
