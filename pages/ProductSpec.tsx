
import React, { useMemo } from 'react';
import { ClipboardList, Sparkles, Layout, BarChart, Target, MousePointerClick, GitCommit, AlertTriangle, CheckCircle2, ArrowRightLeft, FileText, Download } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ProductSpecProps {
  viewPath?: string;
  modelId?: number;
}

interface SpecItem {
  id: string;
  category: string;
  title: string;
  content: React.ReactNode;
  models: number[];
}

const ProductSpec: React.FC<ProductSpecProps> = ({ viewPath = '/dashboard', modelId = 1 }) => {
  
  // 🛠️ Context Awareness: 현재 페이지 경로(viewPath)에 따라 명세서 데이터를 동적으로 생성
  const currentSpecs = useMemo<SpecItem[]>(() => {
    const commonSpecs: SpecItem[] = [
      { 
        id: 'SYS-01', 
        category: '시스템 공통', 
        title: 'Level 기반 권한 제어 (RBAC)', 
        content: `현재 Model Level: ${modelId}. 레벨에 따라 Sidebar 메뉴 및 접근 권한이 동적으로 제어됩니다.`, 
        models: [1,2,3,4,5,6,7] 
      }
    ];

    // 1️⃣ 상품 목록 페이지 명세
    if (viewPath === '/products/list') {
      return [
        ...commonSpecs,
        {
          id: 'PL-01',
          category: '상품관리 / 상태로직',
          title: '판매 상태 3단계 토글 로직 (Status Toggle)',
          content: (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 p-2 rounded">
                <span className="text-gray-400">[As-Is]</span> 단순 텍스트 배지 (Read-only)
                <ArrowRightLeft size={12} />
                <span className="text-purple-600">[To-Be]</span> 상태 변경 가능한 인터랙티브 버튼
              </div>
              <div className="border-l-2 border-purple-200 pl-3 space-y-1">
                <p className="text-xs font-bold text-gray-800">[Interaction Logic]</p>
                <div className="text-[11px] text-gray-600 leading-relaxed space-y-1">
                  <div className="flex gap-2">
                    <span className="font-bold text-blue-600 shrink-0 min-w-[50px]">Trigger:</span>
                    <span>사용자가 '판매중'(Green) 또는 '판매중지'(Red) 버튼 클릭</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-orange-600 shrink-0 min-w-[50px]">Check:</span>
                    <span>현재 시각(Now) vs 판매종료일(salesPeriodEnd) 비교</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-purple-600 shrink-0 min-w-[50px]">Action:</span>
                    <span>
                      조건 1: 만료 시 → <span className="text-gray-500 font-bold">'판매마감'</span> 상태로 강제 전환 (Click Event 차단)<br/>
                      조건 2: 유효 시 → <span className="text-green-600 font-bold">'판매중'</span> ↔ <span className="text-red-500 font-bold">'판매중지'</span> 상태 Toggle
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'PL-02',
          category: '상품관리 / UI개선',
          title: '사이니지 설정 버튼 이관 (Migration)',
          content: (
            <div className="space-y-2">
               <div className="text-xs text-gray-600">
                 <span className="font-bold text-red-500">[Removed]</span> 상품 날짜 컬럼 내 '사이니지' 버튼 제거
               </div>
               <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="font-bold">Reason:</span> 디지털 사이니지(CMS) 전용 메뉴 신설로 인한 기능 이관. 
                  해당 영역은 공백 또는 날짜 정보만 유지.
               </div>
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'PL-03',
          category: '상품관리 / UI개선',
          title: 'Ghost Column 처리 (Spec Mode)',
          content: (
            <div className="text-[11px] text-gray-600">
              개발 가이드 모드(After) 활성화 시, 삭제된 '상품 카테고리', '채널연동' 컬럼을 
              <span className="font-bold text-gray-400 bg-gray-100 px-1 rounded mx-1">Ghost Area(점선)</span>로 시각화하여
              기존 레이아웃 대비 변경점을 명확히 인지시킵니다.
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        }
      ];
    }

    // 5️⃣ 매표소 관리 명세
    if (viewPath === '/facility/booth') {
      return [
        ...commonSpecs,
        {
          id: 'FAC-BOOTH-01',
          category: '매표소관리 / 검색',
          title: '검색 조건 셀렉트박스 최적화',
          content: (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                 <span className="font-bold text-gray-400">[As-Is]</span> 선택(Default), 매표소명, 매표소코드
                 <ArrowRightLeft size={10} />
                 <span className="font-bold text-purple-600">[To-Be]</span> 매표소명(Default), 매표소코드
              </div>
              <div className="text-[11px] text-gray-600">
                불필요한 Depth를 줄이기 위해 '선택' 옵션을 제거하고 '매표소명'을 기본값으로 설정합니다.
              </div>
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-BOOTH-02',
          category: '매표소관리 / 삭제',
          title: '삭제 유효성 검사 및 팝업 시나리오',
          content: (
            <div className="space-y-2">
               <div className="text-[11px] text-gray-600">
                 매표소 삭제 시도시 유효성 검사 및 단계별 팝업 노출 로직을 정의합니다.
               </div>
               <div className="border-l-2 border-red-200 pl-3 text-[11px] space-y-1">
                  <p className="font-bold text-red-600">[Step 1] 삭제 Confirm</p>
                  <p>Trigger: '삭제' 버튼 클릭</p>
                  <p>UI: "정말 삭제하시겠습니까?" (확인/취소)</p>
                  
                  <p className="font-bold text-red-600 mt-2">[Step 2] Validation Check (확인 클릭 시)</p>
                  <p>Logic: 해당 매표소에 연결된 POS(창구) 존재 여부 확인 (linkedPosCount > 0)</p>
                  
                  <p className="font-bold text-red-600 mt-2">[Step 3] Result Alert</p>
                  <p>Case A (연결됨): "창구를 사용하고 있어 삭제할 수 없습니다." 경고 팝업 노출 (삭제 중단)</p>
                  <p>Case B (미연결): 즉시 삭제 처리 및 리스트 갱신</p>
               </div>
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-BOOTH-03',
          category: '매표소관리 / UX',
          title: '데이터 상태별 화면 전환',
          content: '데이터가 없을 때는 "검색 결과 없음" Empty State를 중앙에 표시하고, 데이터가 1건이라도 등록되면 리스트 테이블 UI로 즉시 전환되어야 합니다.',
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-BOOTH-04',
          category: '매표소관리 / 등록',
          title: '매표소 등록 팝업 UX',
          content: (
            <div className="space-y-2">
               <div className="text-[11px] text-gray-600">
                 매표소 등록 시 '검표 중복사용 여부'에 따른 입력 필드 제어 로직을 적용합니다.
               </div>
               <div className="border-l-2 border-purple-200 pl-3 text-[11px]">
                  <p className="font-bold text-purple-700">Interaction Logic (After Mode):</p>
                  1. <strong>미사용</strong>(Default): 시간 입력 필드 영역 미노출 (Hidden).<br/>
                  2. <strong>사용</strong>: 시간 입력 필드 노출 및 활성화 (Visible, Enabled).<br/>
                  3. <strong>저장</strong>: 매표소 코드는 자동 채번(Auto Increment) 처리.
               </div>
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-BOOTH-05',
          category: '매표소관리 / 수정',
          title: '매표소 수정 프로세스',
          content: '목록에서 [수정] 버튼 클릭 시, 등록 팝업과 동일한 UI의 모달을 호출하되 타이틀을 "매표소 수정"으로 변경하고 기존 데이터를 바인딩하여 제공해야 합니다.',
          models: [1,2,3,4,5,6,7]
        }
      ];
    }

    // 6️⃣ POS 창구 관리 명세
    if (viewPath === '/facility/pos') {
      return [
        ...commonSpecs,
        {
          id: 'FAC-POS-01',
          category: 'POS창구 / 검색',
          title: '검색 조건 및 필터 구성',
          content: (
            <div className="space-y-2">
              <div className="text-[11px] text-gray-600">
                POS 창구 목록 조회를 위한 검색 조건을 정의합니다.
              </div>
              <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-1">
                <li><strong>검색어:</strong> 창구명(Default), 창구코드</li>
                <li><strong>매표소:</strong> 전체(Default), 등록된 매표소 리스트(Mock: 정문/동문/단체)</li>
                <li><strong>창구상태:</strong> 전체(Default), 사용중, 창구마감, 관리마감</li>
                <li className="text-red-500 font-bold"><strong>[After Mode]</strong> 창구채널 필터 제거 (Ghost 처리)</li>
              </ul>
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-POS-02',
          category: 'POS창구 / 리스트',
          title: '리스트 컬럼 정의',
          content: '컬럼 구성: 체크박스, 매표소, 창구코드, [삭제]창구채널, 창구명, 창구상태, 로그인ID, 로그인시간, 창구마감시간, 버전정보(3종), 사용여부, 환불전용, 관리마감',
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-POS-03',
          category: 'POS창구 / 삭제',
          title: '삭제 유효성 검사 (Validation)',
          content: (
            <div className="space-y-2">
               <div className="text-[11px] text-gray-600">
                 창구 삭제 시 연결된 상품 여부를 확인하여 삭제를 방지합니다.
               </div>
               <div className="border-l-2 border-red-200 pl-3 text-[11px] space-y-1">
                  <p className="font-bold text-red-600">[Process Flow]</p>
                  <p>1. 삭제 버튼 클릭 → Confirm 팝업 ("정말 삭제하시겠습니까?")</p>
                  <p>2. 확인 클릭 → <strong>연결 상품 체크 (linkedProductCount)</strong></p>
                  <p>3. 상품 존재 시 → Alert 팝업 ("창구에 상품이 등록되어 있어 삭제할 수 없습니다.")</p>
               </div>
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-POS-04',
          category: 'POS창구 / 팝업',
          title: '등록/수정 팝업 필드 정책',
          content: (
            <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-1">
                <li><strong>[After Mode] 창구채널:</strong> 사용자 입력 필드 제거 (Hidden). 내부적으로 '현장POS' 고정.</li>
                <li><strong>[Common] 창구코드:</strong> 수정 시 <strong>Read-Only</strong> 처리 (비활성화 스타일 적용).</li>
            </ul>
          ),
          models: [1,2,3,4,5,6,7]
        }
      ];
    }

    // 7️⃣ POS 창구별 상품 관리 명세 (New)
    if (viewPath === '/facility/pos-window') {
      return [
        ...commonSpecs,
        {
          id: 'FAC-POS-PROD-01',
          category: '창구상품 / 할당구조',
          title: '3단 계층 할당 구조 (Hierarchy)',
          content: '매표소(Booth) > 창구(POS/Kiosk) > 판매가능 상품(Products)의 3단 구조를 관리합니다. 각 창구는 독립적인 상품 판매 목록을 가집니다.',
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-POS-PROD-02',
          category: '창구상품 / 필터',
          title: '창구채널 필터 제거 (Ghost)',
          content: (
            <div className="text-[11px] text-gray-600">
               After 모드에서는 상단 필터의 '창구채널' 영역을 <span className="text-red-500 font-bold line-through">삭제됨</span>(Ghost UI) 처리하여, 향후 '현장POS' 전용 메뉴로의 전환을 예고합니다.
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-POS-PROD-03',
          category: '창구상품 / 팝업',
          title: 'Model 기반 상품 필터링',
          content: (
            <div className="space-y-2">
               <div className="text-[11px] text-gray-600">
                  상품 추가 팝업 호출 시, 현재 Model Level에 적합한 상품만 노출되어야 합니다.
               </div>
               <div className="border-l-2 border-blue-200 pl-3 text-[11px] space-y-1">
                  <p><strong>Model 1:</strong> '일반상품'(입장권)만 노출 (패키지 숨김)</p>
                  <p><strong>Model 2+:</strong> 입장권 및 패키지 상품 모두 노출</p>
               </div>
            </div>
          ),
          models: [1,2,3,4,5,6,7]
        },
        {
          id: 'FAC-POS-PROD-04',
          category: '창구상품 / 편집',
          title: '적용 상품 순서 편집 및 삭제',
          content: '적용된 상품 목록에서 순서(Order)를 직접 입력하여 변경할 수 있으며, 체크박스를 통해 다중 선택 후 일괄 삭제가 가능해야 합니다.',
          models: [1,2,3,4,5,6,7]
        }
      ];
    }

    // Default Fallback
    return [
      ...commonSpecs,
      { 
        id: 'DASH-01', category: '대시보드 / 시각화', title: 'KPI 카드 및 차트 시각화 원칙', 
        content: 'Black 폰트와 원색(Blue, Green)을 사용한 고대비 UI. 전일/전월 대비 증감률(Trend) 반드시 표기.', models: [1,2,3,4,5,6,7] 
      }
    ];

  }, [viewPath, modelId]);

  const handleDownloadPDF = async () => {
    // 1. Capture the Spec Card Element
    const element = document.getElementById('spec-content');
    if (!element) return;

    // 2. Clone to handle scrollable content (Full Height Capture) & Remove Animations
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '210mm'; // A4 width
    clone.style.height = 'auto';
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '0';
    clone.style.zIndex = '-1';
    
    // Ensure all scrollable areas are visible in the clone
    const scrollables = clone.querySelectorAll('.overflow-y-auto');
    scrollables.forEach(el => {
        (el as HTMLElement).style.overflow = 'visible';
        (el as HTMLElement).style.height = 'auto';
    });

    // 🚫 Remove animation classes to prevent capture issues (blank or faded content)
    const animatedElements = clone.querySelectorAll('.animate-in, .slide-in-from-bottom-2, .fade-in, .slide-in-from-left-2');
    animatedElements.forEach(el => {
        el.classList.remove('animate-in', 'slide-in-from-bottom-2', 'fade-in', 'slide-in-from-left-2');
        (el as HTMLElement).style.animation = 'none';
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
    });

    document.body.appendChild(clone);

    try {
        // 3. Generate Canvas
        const canvas = await html2canvas(clone, {
            scale: 2, // High resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // 4. Generate PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        // First page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Subsequent pages if content is long
        while (heightLeft > 0) {
          position = heightLeft - imgHeight; // Shift up
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position - pdfHeight, pdfWidth, imgHeight); // Adjust position logic
          heightLeft -= pdfHeight;
        }

        const fileName = `MakeTicket_Spec_${viewPath?.replace(/\//g, '_') || 'Common'}_${new Date().toISOString().slice(0,10)}.pdf`;
        pdf.save(fileName);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        document.body.removeChild(clone);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col h-full relative">
      <div id="spec-content" className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-purple-100 pb-4 mb-6 shrink-0">
          <ClipboardList size={24} className="text-purple-600" />
          <div className="flex-1">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Active Spec (Live)</span>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Context: {viewPath}</span>
            </div>
            <h1 
                onClick={handleDownloadPDF} 
                className="text-lg font-bold text-gray-900 mt-1 cursor-pointer hover:text-purple-600 hover:underline decoration-wavy underline-offset-4 transition-all flex items-center gap-2 group"
                title="Click to Download PDF"
            >
               {viewPath === '/products/list' ? '상품 목록 개발 명세서' : 
                viewPath === '/products/register' ? '상품 등록(유형) 개발 명세서' :
                viewPath === '/products/register/form' ? '상품 등록(상세) 개발 명세서' : 
                viewPath === '/facility/booth' ? '매표소 관리 개발 명세서' :
                viewPath === '/facility/pos' ? 'POS 창구 관리 개발 명세서' :
                viewPath === '/facility/pos-window' ? 'POS 창구별 상품 관리 개발 명세서' :
                '통합 운영 개발 명세서'}
                <Download size={16} className="text-gray-300 group-hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100 animate-in fade-in" />
            </h1>
          </div>
        </div>

        {/* Dynamic Guide Section */}
        {viewPath === '/dashboard' && (
             <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-left-2 shrink-0">
                <h3 className="text-xs font-black text-blue-800 mb-2 flex items-center gap-2">
                   <Layout size={14} /> 대시보드 시각화 가이드
                </h3>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                   <div className="bg-white p-3 rounded border border-blue-100">
                      <span className="block font-bold text-gray-700 mb-1">Color System</span>
                      <div className="flex gap-1">
                         <div className="w-4 h-4 bg-[#3b82f6] rounded" title="Main Blue"></div>
                         <div className="w-4 h-4 bg-[#10b981] rounded" title="Success Green"></div>
                         <div className="w-4 h-4 bg-[#ef4444] rounded" title="Error Red"></div>
                         <div className="w-4 h-4 bg-[#f59e0b] rounded" title="Warning Orange"></div>
                      </div>
                   </div>
                   <div className="bg-white p-3 rounded border border-blue-100">
                      <span className="block font-bold text-gray-700 mb-1">Chart Type</span>
                      <span className="text-gray-500">Bar, Area, Line, Pie (Recharts)</span>
                   </div>
                </div>
             </div>
        )}

        {/* Requirements List */}
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2 flex items-center gap-1 sticky top-0 bg-white z-10 py-2">
            <GitCommit size={12} /> Detailed Logic Requirements
          </div>
          
          {currentSpecs.map((req, idx) => (
            <div key={req.id} className="group border border-gray-100 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all bg-white animate-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 50}ms`}}>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${req.id.includes('PL') || req.id.includes('FORM') || req.id.includes('REG') || req.id.includes('FAC') ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-800 group-hover:text-white'}`}>
                    {req.id}
                  </span>
                  {req.category.includes('로직') && <MousePointerClick size={14} className="mt-2 text-purple-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <h4 className="text-[13px] font-black text-gray-900">{req.title}</h4>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{req.category}</span>
                  </div>
                  <div className="text-[12px] text-gray-600 leading-relaxed">
                     {typeof req.content === 'string' ? req.content : req.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {currentSpecs.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-xs italic">
               해당 페이지에 대한 상세 명세가 정의되지 않았습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSpec;
