
import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertCircle, ToggleLeft, ToggleRight, LayoutTemplate, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  dateType: string;
  limitType: string;
  productPeriodStart: string;
  productPeriodEnd: string;
  salesPeriodStart: string;
  salesPeriodEnd: string;
  status: string;
  isSynced: boolean;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    code: 'GDHGSQsi',
    name: 'GD2302977',
    category: '일반상품',
    dateType: '일자(회차)상품',
    limitType: '일자(회차)별 수량 제한',
    productPeriodStart: '2023-03-15 00:00',
    productPeriodEnd: '2030-12-31 00:00',
    salesPeriodStart: '2023-03-09 00:00',
    salesPeriodEnd: '2030-12-31 00:00',
    status: '판매중',
    isSynced: true
  },
  {
    id: '2',
    code: 'GDgfJsug',
    name: 'GD2400661',
    category: '일반상품',
    dateType: '일자(회차)상품',
    limitType: '일자(회차)별 수량 제한',
    productPeriodStart: '2023-03-15 00:00',
    productPeriodEnd: '2030-12-31 00:00',
    salesPeriodStart: '2023-03-09 00:00',
    salesPeriodEnd: '2030-12-31 00:00',
    status: '판매중',
    isSynced: true
  },
  {
    id: '3',
    code: 'GDdMXVCQ',
    name: 'GD2302999',
    category: '일반상품',
    dateType: '일자(회차)상품',
    limitType: '일자(회차)별 수량 제한',
    productPeriodStart: '2023-03-15 00:00',
    productPeriodEnd: '2030-12-31 00:00',
    salesPeriodStart: '2023-03-09 00:00',
    salesPeriodEnd: '2030-12-31 00:00',
    status: '판매중',
    isSynced: true
  },
  {
    id: '4',
    code: 'GD2503452',
    name: '권종별상품_A',
    category: '일반상품',
    dateType: '일자(회차)상품',
    limitType: '권종별 수량 제한',
    productPeriodStart: '2025-12-31 00:00',
    productPeriodEnd: '2026-02-28 00:00',
    salesPeriodStart: '2025-12-31 00:00',
    salesPeriodEnd: '2026-02-28 00:00',
    status: '판매중',
    isSynced: true
  },
  {
    id: '5',
    code: 'GD2503442',
    name: '스케줄테스트상품_A',
    category: '일반상품',
    dateType: '일자(회차)상품',
    limitType: '일자(회차)별 수량 제한',
    productPeriodStart: '2025-12-31 00:00',
    productPeriodEnd: '2026-02-28 00:00',
    salesPeriodStart: '2025-12-31 00:00',
    salesPeriodEnd: '2026-02-28 00:00',
    status: '판매중',
    isSynced: true
  }
];

interface ProductListProps {
  onNavigate: (path: string) => void;
  showDevGuides?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ onNavigate, showDevGuides = false }) => {
  const [viewMode, setViewMode] = useState<'BEFORE' | 'AFTER'>(showDevGuides ? 'AFTER' : 'BEFORE');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const isAfter = viewMode === 'AFTER';

  const handleStatusToggle = (id: string, currentStatus: string, salesPeriodEnd: string) => {
    const now = new Date();
    const endDate = new Date(salesPeriodEnd.replace(' ', 'T')); // Simple ISO conversion

    if (now > endDate) {
        // Already expired, force refresh to expired state if not already
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: '판매마감' } : p));
        return;
    }

    const newStatus = currentStatus === '판매중' ? '판매중지' : '판매중';
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto relative min-h-screen">
      {/* 🛠️ View Mode Toggle */}
      {showDevGuides && (
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
      )}

      {/* 🛠️ Dev Guide Banner */}
      {showDevGuides && isAfter && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3 text-[13px] text-orange-900 animate-in fade-in duration-500">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-orange-600" />
          <div className="space-y-1">
            <p className="font-extrabold text-orange-800 underline decoration-orange-300 underline-offset-4">🛠️ 개발 가이드: 오렌지 그리드 제거 및 삭제 필드 위치 가이드 (TO-BE)</p>
            <p>1. <strong>오렌지색 구분선 제거</strong>: 디자인 요청에 따라 After 모드에서도 기존과 동일한 무채색 그리드를 유지합니다.</p>
            <p>2. <strong>삭제된 필드 위치 표시</strong>: 삭제된 [상품 카테고리], [채널연동] 영역을 Ghost Column(회색 점선)으로 표시하여 개발 시 해당 영역의 제거를 명확히 안내합니다.</p>
            <p>3. <strong>필터 영역</strong>: After 모드에서는 '상품 카테고리' 검색 조건이 제거되어야 합니다.</p>
            <p className="font-bold text-purple-700">4. [NEW] 상태값 개선: 판매중/중지/마감 3단계 토글 적용 및 사이니지 버튼 제거.</p>
          </div>
        </div>
      )}

      {/* Breadcrumb & Title */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">입장권 상품 관리</h2>
        <div className="text-xs text-gray-400 font-medium">
          <span>상품</span> <span className="mx-2 text-gray-300">›</span> <span className="text-purple-600 font-bold">입장권 상품 관리</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-700">검색어</span>
            <select className="form-select text-[12px] border-gray-300 rounded h-8 px-2 focus:ring-0 focus:border-gray-400">
              <option>상품명</option>
            </select>
            <div className="relative">
              <input type="text" placeholder="검색 값을 입력하세요." className="form-input text-[12px] border-gray-300 rounded h-8 w-64 pr-10 focus:ring-0 focus:border-gray-400 placeholder:text-gray-300" />
              <Search className="absolute right-3 top-2 text-gray-400" size={14} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-700">판매상태</span>
            <select className="form-select text-[12px] border-gray-300 rounded h-8 w-24 px-2 focus:ring-0 focus:border-gray-400">
              <option>판매중</option>
            </select>
          </div>

          <div className="flex items-center gap-4 transition-all duration-300">
            <span className={`text-xs font-bold ${isAfter ? 'text-gray-300' : 'text-gray-700'}`}>상품 카테고리</span>
            {isAfter ? (
              <div className="h-8 w-24 border border-dashed border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-300 bg-gray-50/50 uppercase font-bold tracking-tighter">
                Removed
              </div>
            ) : (
              <select className="form-select text-[12px] border-gray-300 rounded h-8 w-24 px-2 focus:ring-0 focus:border-gray-400">
                <option>전체</option>
              </select>
            )}
          </div>

          <div className="ml-auto">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-1.5 rounded text-[13px] font-bold shadow-sm transition-all active:scale-95">
              검색
            </button>
          </div>
        </div>
      </div>

      {/* List Area */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span>총 <span className="text-purple-700 font-bold">{products.length}</span>개</span>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">페이지 당 데이터 건수</span>
              <select className="form-select text-[11px] border-gray-300 rounded py-0.5 px-1 h-7 focus:ring-0 focus:border-gray-400">
                <option>15</option>
                <option>30</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-purple-200 text-purple-600 bg-white rounded text-[11px] font-bold hover:bg-purple-50 transition-colors">전체상품 엑셀</button>
            <button onClick={() => onNavigate('/products/register')} className="px-4 py-1.5 bg-purple-600 text-white rounded text-[11px] font-bold hover:bg-purple-700 shadow-sm transition-all active:scale-95">상품 등록</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-center border-collapse">
            <thead className="bg-[#f8f9fa] text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 whitespace-nowrap">상품코드</th>
                <th className="px-3 py-3 whitespace-nowrap">상품URL</th>
                <th className="px-3 py-3 whitespace-nowrap">상품명</th>
                
                {/* 🔵 Column Position: Product Category */}
                <th className={`px-3 py-3 whitespace-nowrap transition-all duration-300 ${isAfter ? 'bg-gray-100/50 text-gray-300 border-x border-dashed border-gray-200' : ''}`}>
                  {isAfter ? '[삭제] 상품 카테고리' : '상품 카테고리'}
                </th>
                
                <th className="px-3 py-3 whitespace-nowrap">상품 날짜</th>
                <th className="px-3 py-3 whitespace-nowrap">수량제한 유형</th>
                <th className="px-3 py-3 whitespace-nowrap">팝업관리</th>
                <th className="px-3 py-3 whitespace-nowrap">상품기간</th>
                <th className="px-3 py-3 whitespace-nowrap">판매기간</th>
                <th className="px-3 py-3 whitespace-nowrap">상태</th>
                
                {/* 🔵 Column Position: Channel Sync */}
                <th className={`px-3 py-3 whitespace-nowrap transition-all duration-300 ${isAfter ? 'bg-gray-100/50 text-gray-300 border-l border-dashed border-gray-200' : ''}`}>
                  {isAfter ? '[삭제] 채널연동' : '채널연동'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-4 text-gray-500">{p.code}</td>
                  <td className="px-3 py-4">
                    <div className="flex gap-1 justify-center scale-90">
                      <button className="px-2 py-1 border border-purple-300 text-purple-700 rounded bg-white font-bold hover:bg-purple-50">예매화면</button>
                      <button className="px-2 py-1 border border-purple-300 text-purple-700 rounded bg-white font-bold hover:bg-purple-50">QR</button>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gray-900 font-bold">{p.name}</td>
                  
                  {/* 🔵 Ghost Cell: Product Category */}
                  <td className={`px-3 py-4 transition-all duration-300 ${isAfter ? 'bg-gray-50/50 text-gray-300 border-x border-dashed border-gray-100' : 'text-gray-600'}`}>
                    {isAfter ? '-' : p.category}
                  </td>
                  
                  <td className="px-3 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-gray-700 font-medium">{p.dateType}</span>
                      {/* [2026.02.05] 사이니지 기능 이관으로 인한 주석 처리 */}
                      {/* <button className="px-2 py-0.5 border border-gray-300 text-gray-400 rounded text-[9px] font-bold">사이니지</button> */}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gray-600 font-medium">{p.limitType}</td>
                  <td className="px-3 py-4">
                    <button className="px-3 py-1.5 border border-purple-300 text-purple-700 rounded bg-white font-bold hover:bg-purple-50 whitespace-nowrap transition-colors">팝업 설정</button>
                  </td>
                  <td className="px-3 py-4 text-gray-400 leading-relaxed">
                    <div className="flex flex-col"><span>{p.productPeriodStart}</span><span>{p.productPeriodEnd}</span></div>
                  </td>
                  <td className="px-3 py-4 text-gray-400 leading-relaxed">
                    <div className="flex flex-col"><span>{p.salesPeriodStart}</span><span>{p.salesPeriodEnd}</span></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col items-center gap-1">
                      {(() => {
                          const now = new Date();
                          const endDate = new Date(p.salesPeriodEnd.replace(' ', 'T'));
                          const isExpired = now > endDate;
                          const displayStatus = isExpired ? '판매마감' : p.status;
                          
                          return (
                              <button 
                                onClick={() => handleStatusToggle(p.id, p.status, p.salesPeriodEnd)}
                                disabled={displayStatus === '판매마감'}
                                className={`
                                  px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap shadow-sm
                                  ${displayStatus === '판매중' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : ''}
                                  ${displayStatus === '판매중지' ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' : ''}
                                  ${displayStatus === '판매마감' ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed opacity-70' : ''}
                                `}
                              >
                                {displayStatus}
                              </button>
                          );
                      })()}
                    </div>
                  </td>
                  
                  {/* 🔵 Ghost Cell: Channel Sync */}
                  <td className={`px-3 py-4 transition-all duration-300 ${isAfter ? 'bg-gray-50/50 text-gray-300 border-l border-dashed border-gray-100' : ''}`}>
                    {isAfter ? (
                      <span className="flex items-center justify-center"><Trash2 size={12} className="opacity-30" /></span>
                    ) : (
                      <button className="px-3 py-1.5 border border-purple-300 text-purple-700 rounded bg-white font-bold hover:bg-purple-50 whitespace-nowrap transition-colors">
                         상품연동
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex justify-center bg-white">
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-gray-300 hover:bg-gray-50"><ChevronLeft size={16} /></button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-[#343a40] text-white text-[11px] font-bold shadow-sm transition-all active:scale-95">1</button>
            <button className="p-1 rounded text-gray-300 hover:bg-gray-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
