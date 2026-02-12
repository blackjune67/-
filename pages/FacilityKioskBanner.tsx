
import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, LayoutTemplate, ToggleLeft, ToggleRight, AlertCircle, X, Upload, RefreshCw } from 'lucide-react';

interface KioskBanner {
  id: string;
  boothName: string;
  code: string;
  channelType: 'kiosk' | 'bf' | 'bf_nol';
  name: string;
  usage: 'Y' | 'N';
}

interface PopupProduct {
  code: string;
  name: string;
  status: string;
  category: string;
}

interface ProductBanner extends PopupProduct {
  bannerImage: string | null;
}

// Mock Data
const MOCK_BANNER_LIST_INIT: KioskBanner[] = [
  { id: '1', boothName: '정문 매표소', code: '02', channelType: 'kiosk', name: '키오스크 1', usage: 'Y' },
  { id: '2', boothName: '정문 매표소', code: '04', channelType: 'bf', name: '배리어프리 1', usage: 'Y' },
  { id: '3', boothName: '후문 매표소', code: '11', channelType: 'kiosk', name: '키오스크 2', usage: 'Y' },
  { id: '4', boothName: '중앙 매표소', code: '33', channelType: 'bf_nol', name: 'NOL키오스크 1', usage: 'Y' },
  { id: '5', boothName: '중앙 매표소', code: '55', channelType: 'kiosk', name: '키오스크 3', usage: 'Y' },
];

const MOCK_BOOTHS = [
  { id: '1', name: '정문 매표소' },
  { id: '2', name: '후문 매표소' },
  { id: '3', name: '중앙 매표소' },
];

const MOCK_POPUP_PRODUCTS: PopupProduct[] = [
  { code: 'GD2400661', name: '!!!', status: '판매중', category: '일반상품' },
  { code: 'GD2302984', name: '이디야 문래역점', status: '판매중', category: '일반상품' },
  { code: 'GD2201126', name: '구매유의사항 테스트상품', status: '마감', category: '일반상품' },
  { code: 'GD2100862', name: 'B 상품', status: '마감', category: '일반상품' },
  { code: 'GD2100251', name: 'C 상품', status: '마감', category: '일반상품' },
];

// File Input Component Helper with Simulation Logic
const FileInput = ({ fileName, onSelect, onDelete }: { fileName?: string | null, onSelect: () => void, onDelete: () => void }) => (
  <div className="flex items-center gap-2">
    <button 
      onClick={onSelect}
      className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-50 cursor-pointer shadow-sm text-gray-700 transition-colors"
    >
      파일선택
    </button>
    {fileName ? (
      <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-200">
        <span className="text-xs text-gray-800 ml-1 underline decoration-gray-300 underline-offset-2 cursor-help" title="미리보기">{fileName}</span>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50">
          <X size={14} />
        </button>
      </div>
    ) : (
      <span className="text-xs text-gray-400">선택된 파일 없음</span>
    )}
  </div>
);

// Separated Modal Component for better state management
const BannerManagementModal = ({ kiosk, onClose, isAfter }: { kiosk: KioskBanner; onClose: () => void; isAfter: boolean }) => {
  // Banner Type States (Default: Image)
  const [introType, setIntroType] = useState<'image' | 'video'>('image');
  const [headerType, setHeaderType] = useState<'image' | 'video'>('image');
  
  // File States
  const [introImage, setIntroImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerLogo, setFooterLogo] = useState<string | null>('첨부파일명.png'); // Default simulated file

  // URL Input States
  const [introUrl, setIntroUrl] = useState('https://');
  const [headerUrl, setHeaderUrl] = useState('https://');

  // Product Banner List State
  const [productBanners, setProductBanners] = useState<ProductBanner[]>(() => {
    // 🛠️ Custom Logic: Kiosk 3 has no products by default
    if (kiosk.name === '키오스크 3') {
        return [];
    }
    return MOCK_POPUP_PRODUCTS.map(p => ({ ...p, bannerImage: null }));
  });

  const handleProductImageSelect = (index: number) => {
    setProductBanners(prev => prev.map((item, idx) => 
      idx === index ? { ...item, bannerImage: '첨부파일명.png' } : item
    ));
  };

  const handleProductImageDelete = (index: number) => {
    setProductBanners(prev => prev.map((item, idx) => 
      idx === index ? { ...item, bannerImage: null } : item
    ));
  };

  // Debug: Toggle Product List Empty State
  const toggleEmptyProducts = () => {
    if (productBanners.length > 0) {
        setProductBanners([]);
    } else {
        setProductBanners(MOCK_POPUP_PRODUCTS.map(p => ({ ...p, bannerImage: null })));
    }
  };

  const handleSave = () => {
    alert('저장되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
      <div className="bg-white w-[1000px] max-h-[90vh] rounded shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
            <span className="font-bold text-lg text-gray-800">배너관리</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
            {/* Info Grid */}
            <div className="border border-gray-200 mb-6">
                <div className="grid grid-cols-12 text-xs">
                    <div className="col-span-2 bg-gray-50 p-3 font-bold text-gray-600 border-r border-b border-gray-200 flex items-center">매표소</div>
                    <div className="col-span-2 p-3 text-gray-800 border-r border-b border-gray-200 flex items-center">{kiosk.boothName}</div>
                    <div className="col-span-2 bg-gray-50 p-3 font-bold text-gray-600 border-r border-b border-gray-200 flex items-center">창구코드</div>
                    <div className="col-span-2 p-3 text-gray-800 border-r border-b border-gray-200 flex items-center">{kiosk.code}</div>
                    <div className="col-span-2 bg-gray-50 p-3 font-bold text-gray-600 border-r border-b border-gray-200 flex items-center">창구명</div>
                    <div className="col-span-2 p-3 text-gray-800 border-b border-gray-200 flex items-center">{kiosk.name}</div>
                </div>
            </div>

            {/* Common Banner Section */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-2">공통배너</h3>
                <div className="border-t border-gray-200">
                    {/* Intro Banner */}
                    <div className="flex border-b border-gray-200">
                        <div className="w-48 bg-gray-50 p-4 text-xs font-bold text-gray-600 border-r border-gray-200 flex flex-col justify-center">
                            <span>인트로배너</span>
                            <span className="text-gray-400 font-normal">(1080x1920px)</span>
                        </div>
                        <div className="flex-1 p-4 space-y-3">
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="intro_type" 
                                      className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                                      checked={introType === 'image'}
                                      onChange={() => setIntroType('image')}
                                    />
                                    <span className="text-sm text-gray-700">이미지</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="intro_type" 
                                      className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                                      checked={introType === 'video'}
                                      onChange={() => setIntroType('video')}
                                    />
                                    <span className="text-sm text-gray-700">동영상(YouTube)</span>
                                </label>
                            </div>
                            
                            {introType === 'image' ? (
                              <div className="space-y-2 animate-in fade-in">
                                <div className="text-xs text-red-500 font-medium">* 3MB까지 업로드 가능.</div>
                                <FileInput 
                                    fileName={introImage}
                                    onSelect={() => setIntroImage('첨부파일명.png')}
                                    onDelete={() => setIntroImage(null)}
                                />
                              </div>
                            ) : (
                              <div className="animate-in fade-in">
                                <input 
                                  type="text" 
                                  className="w-full h-9 px-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                  placeholder="https://"
                                  value={introUrl}
                                  onChange={(e) => setIntroUrl(e.target.value)}
                                />
                              </div>
                            )}
                        </div>
                    </div>

                    {/* Header Banner */}
                    <div className="flex border-b border-gray-200">
                        <div className="w-48 bg-gray-50 p-4 text-xs font-bold text-gray-600 border-r border-gray-200 flex flex-col justify-center">
                            <span>헤더 배너</span>
                            <span className="text-gray-400 font-normal">(1080x350px)</span>
                        </div>
                        <div className="flex-1 p-4 space-y-3">
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="header_type" 
                                      className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                                      checked={headerType === 'image'}
                                      onChange={() => setHeaderType('image')}
                                    />
                                    <span className="text-sm text-gray-700">이미지</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="header_type" 
                                      className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                                      checked={headerType === 'video'}
                                      onChange={() => setHeaderType('video')}
                                    />
                                    <span className="text-sm text-gray-700">동영상(YouTube)</span>
                                </label>
                            </div>

                            {headerType === 'image' ? (
                              <div className="space-y-2 animate-in fade-in">
                                <div className="text-xs text-red-500 font-medium">* 3MB까지 업로드 가능.</div>
                                <FileInput 
                                    fileName={headerImage}
                                    onSelect={() => setHeaderImage('첨부파일명.png')}
                                    onDelete={() => setHeaderImage(null)}
                                />
                              </div>
                            ) : (
                              <div className="animate-in fade-in">
                                <input 
                                  type="text" 
                                  className="w-full h-9 px-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                                  placeholder="https://"
                                  value={headerUrl}
                                  onChange={(e) => setHeaderUrl(e.target.value)}
                                />
                              </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Logo */}
                    <div className="flex border-b border-gray-200">
                        <div className="w-48 bg-gray-50 p-4 text-xs font-bold text-gray-600 border-r border-gray-200 flex flex-col justify-center">
                            <span>푸터 로고</span>
                            <span className="text-gray-400 font-normal">(230x58px)</span>
                        </div>
                        <div className="flex-1 p-4 space-y-2">
                            <div className="text-xs text-red-500 font-medium mb-2">* 3MB까지 업로드 가능.</div>
                            <FileInput 
                              fileName={footerLogo} 
                              onSelect={() => setFooterLogo('첨부파일명.png')}
                              onDelete={() => setFooterLogo(null)} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Banner Section */}
            <div>
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-sm font-bold text-gray-800">적용 상품 별 배너</h3>
                    {isAfter && (
                        <button 
                            onClick={toggleEmptyProducts}
                            className="text-[10px] flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-200 hover:bg-orange-100 transition-colors"
                        >
                            <RefreshCw size={10} /> [디버그] 상품 {productBanners.length > 0 ? '비우기' : '채우기'}
                        </button>
                    )}
                </div>
                <div className="border-t border-l border-r border-gray-200 overflow-hidden rounded-t-sm">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#f8f9fa] text-gray-600 font-bold border-b border-gray-200">
                            <tr>
                                <th className="py-3 px-4 w-32 border-r border-gray-200">상품코드</th>
                                <th className="py-3 px-4 border-r border-gray-200">상품명</th>
                                <th className="py-3 px-4 w-20 border-r border-gray-200">상태</th>
                                <th className="py-3 px-4 w-32 border-r border-gray-200">상품 카테고리</th>
                                <th className="py-3 px-4 w-1/3">상품 별 배너 (293x594px)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 border-b border-gray-200">
                            {productBanners.length > 0 ? (
                                productBanners.map((prod, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 border-r border-gray-100 text-gray-600">{prod.code}</td>
                                        <td className="py-3 px-4 border-r border-gray-100 font-medium text-gray-800">{prod.name}</td>
                                        <td className="py-3 px-4 border-r border-gray-100 text-gray-600">{prod.status}</td>
                                        <td className="py-3 px-4 border-r border-gray-100 text-gray-600">{prod.category}</td>
                                        <td className="py-2 px-4 bg-[#fcfcfd]">
                                            <FileInput 
                                                fileName={prod.bannerImage}
                                                onSelect={() => handleProductImageSelect(idx)}
                                                onDelete={() => handleProductImageDelete(idx)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty State for Product Banners */
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400 bg-gray-50/30">
                                        등록된 상품이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-gray-200 flex justify-center gap-2 bg-white shrink-0">
            <button 
                onClick={handleSave}
                className="px-12 py-2.5 bg-[#7e22ce] text-white rounded font-bold hover:bg-purple-800 shadow-sm text-sm transition-colors"
            >
                저장
            </button>
            <button 
                onClick={onClose}
                className="px-12 py-2.5 bg-[#343a40] text-white rounded font-bold hover:bg-gray-800 shadow-sm text-sm transition-colors"
            >
                취소
            </button>
        </div>
      </div>
    </div>
  );
};

const FacilityKioskBanner: React.FC = () => {
  const [viewMode, setViewMode] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const [bannerList, setBannerList] = useState<KioskBanner[]>(MOCK_BANNER_LIST_INIT);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [boothFilter, setBoothFilter] = useState('all');
  const [usageFilter, setUsageFilter] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<KioskBanner | null>(null);

  const isAfter = viewMode === 'AFTER';

  const getChannelLabel = (type: string) => {
    if (isAfter) {
        switch (type) {
            case 'kiosk': return '일반 키오스크';
            case 'bf': return '배리어프리';
            case 'bf_nol': return '배리어프리(NOL)';
            default: return type;
        }
    } else {
        switch (type) {
            case 'kiosk': return '키오스크';
            case 'bf': return '배리어프리키오스크';
            case 'bf_nol': return '배리어프리키오스크(NOL티켓)';
            default: return type;
        }
    }
  };

  const handleSearch = () => {
      let filtered = MOCK_BANNER_LIST_INIT;

      if (boothFilter !== 'all') {
          filtered = filtered.filter(p => p.boothName === boothFilter);
      }

      if (usageFilter !== 'all') {
          filtered = filtered.filter(p => p.usage === usageFilter);
      }

      if (searchTerm) {
          filtered = filtered.filter(p => {
              if (searchType === 'name') return p.name.includes(searchTerm);
              if (searchType === 'code') return p.code.includes(searchTerm);
              return false;
          });
      }
      setBannerList(filtered);
  }

  const handleOpenModal = (kiosk: KioskBanner) => {
    setSelectedKiosk(kiosk);
    setIsModalOpen(true);
  };

  // Debug function to toggle empty state
  const toggleEmptyState = () => {
    if (bannerList.length > 0) {
      setBannerList([]);
    } else {
      setBannerList(MOCK_BANNER_LIST_INIT);
    }
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
            <p className="font-extrabold text-orange-800 underline decoration-orange-300 underline-offset-4">🛠️ 개발 가이드: 배너관리 팝업 및 Empty State (TO-BE)</p>
            <p>1. <strong>배너관리 팝업</strong>: 목록의 '배너관리' 버튼 클릭 시 상세 설정 팝업이 호출됩니다.</p>
            <ul className="list-disc list-inside ml-2 text-xs">
                <li>공통 배너 미디어 기본값: '이미지'</li>
                <li>파일 첨부 시뮬레이션: '파일선택' 클릭 시 '첨부파일명.png' 즉시 등록</li>
                <li>상품 목록 Empty State: 등록된 상품 없을 시 안내 문구 표시 (Ex. 키오스크 3)</li>
            </ul>
            <p className="mt-1">2. <strong>Empty State</strong>: 메인 목록 데이터가 없을 경우 "검색 결과가 없습니다." 메시지가 표시됩니다.</p>
            <div className="pt-2 mt-1 border-t border-orange-200">
                <button 
                    onClick={toggleEmptyState}
                    className="px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded text-xs font-bold hover:bg-orange-200 transition-colors"
                >
                    [디버그] 메인 목록 {bannerList.length > 0 ? '비우기' : '채우기'}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">키오스크 배너관리</h2>
        <div className="text-xs text-gray-400 font-medium">
          <span>현장관리</span> <span className="mx-2 text-gray-300">›</span> <span className="text-purple-600 font-bold">키오스크 배너관리</span>
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
                className="form-input w-80 text-sm border-gray-300 rounded-md h-9 pr-10 focus:border-purple-500 focus:ring-purple-500 placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* 매표소 */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">매표소</span>
            <select 
                className="form-select text-sm border-gray-300 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-48"
                value={boothFilter}
                onChange={(e) => setBoothFilter(e.target.value)}
            >
                <option value="all">전체</option>
                {MOCK_BOOTHS.map(booth => (
                    <option key={booth.id} value={booth.name}>{booth.name}</option>
                ))}
            </select>
          </div>

          {/* 사용여부 */}
          <div className="flex items-center gap-2 ml-4">
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
                className="bg-[#7e22ce] hover:bg-purple-800 text-white px-6 py-1.5 rounded-md text-sm font-bold shadow-sm transition-all active:scale-95"
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
            <span className="text-sm font-medium text-gray-600">총 <span className="text-purple-700 font-bold">{bannerList.length}</span>개</span>
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
        <div className="flex-1 overflow-x-auto bg-white">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-[#f8f9fa] text-gray-500 font-bold border-b border-gray-200 whitespace-nowrap">
              <tr>
                <th className="py-4 px-4 w-1/5">매표소</th>
                <th className="py-4 px-4 w-1/6">창구코드</th>
                <th className="py-4 px-4 w-1/5">창구채널</th>
                <th className="py-4 px-4 w-1/5">창구명</th>
                <th className="py-4 px-4 w-1/6">사용여부</th>
                <th className="py-4 px-4 bg-gray-50"></th>{/* Actions */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bannerList.length > 0 ? (
                bannerList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors h-14">
                    <td className="py-2 px-4 text-gray-600 font-medium">{item.boothName}</td>
                    <td className="py-2 px-4 text-gray-600">{item.code}</td>
                    <td className="py-2 px-4 text-gray-600">{getChannelLabel(item.channelType)}</td>
                    <td className="py-2 px-4 text-gray-800 font-bold">{item.name}</td>
                    <td className="py-2 px-4 text-gray-600">{item.usage}</td>
                    <td className="py-2 px-4 bg-[#fcfcfd]">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="px-3 py-1.5 bg-white border border-purple-400 text-purple-600 rounded text-xs font-bold hover:bg-purple-50 transition-colors"
                      >
                        배너관리
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty State */
                <tr>
                  <td colSpan={6} className="h-[400px] bg-[#f9f8fd]/30">
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
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

      {/* 🛠️ Banner Management Modal Component */}
      {isModalOpen && selectedKiosk && (
        <BannerManagementModal 
            kiosk={selectedKiosk} 
            onClose={() => setIsModalOpen(false)} 
            isAfter={isAfter}
        />
      )}
    </div>
  );
};

export default FacilityKioskBanner;
