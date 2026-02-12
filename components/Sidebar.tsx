
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Download, Users, ToggleLeft, ToggleRight, Settings2, Sparkles, ShieldCheck, Megaphone, Store } from 'lucide-react';
import { MENU_ITEMS } from '../constants';
import { MenuItem } from '../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  isSplitView?: boolean;
  modelId: number;
  showGroupExperience: boolean;
  setShowGroupExperience: (v: boolean) => void;
  showImmediateEntryCheck: boolean;
  setShowImmediateEntryCheck: (v: boolean) => void;
  showMember: boolean;
  setShowMember: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPath, onNavigate, isOpen, toggleSidebar, isSplitView = false, modelId,
  showGroupExperience, setShowGroupExperience, showImmediateEntryCheck, setShowImmediateEntryCheck, showMember, setShowMember
}) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems) {
      setExpandedMenus(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
    } else if (item.path) {
      onNavigate(item.path);
    }
  };

  const handleDownloadHtml = () => {
    try {
      // 1. Deep clone the document element
      const docClone = document.documentElement.cloneNode(true) as HTMLElement;
      
      // 2. Sync dynamic input values (React state) to DOM attributes in the clone
      // Because cloneNode only copies HTML attributes, not current JS properties
      const currentInputs = document.querySelectorAll('input, textarea, select');
      const clonedInputs = docClone.querySelectorAll('input, textarea, select');

      currentInputs.forEach((input, index) => {
        const clonedInput = clonedInputs[index] as HTMLElement;
        if (!clonedInput) return;

        if (input instanceof HTMLInputElement) {
          if (input.type === 'checkbox' || input.type === 'radio') {
             if (input.checked) clonedInput.setAttribute('checked', '');
             else clonedInput.removeAttribute('checked');
          } else {
             clonedInput.setAttribute('value', input.value);
          }
        } else if (input instanceof HTMLTextAreaElement) {
           clonedInput.innerHTML = input.value;
        } else if (input instanceof HTMLSelectElement) {
           const options = clonedInput.querySelectorAll('option');
           options.forEach((opt, optIdx) => {
             if (optIdx === input.selectedIndex) opt.setAttribute('selected', '');
             else opt.removeAttribute('selected');
           });
           clonedInput.setAttribute('value', input.value);
        }
      });

      // 3. Create Blob and Download
      const htmlContent = `<!DOCTYPE html>\n${docClone.outerHTML}`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const date = new Date();
      const timestamp = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}_${String(date.getHours()).padStart(2,'0')}${String(date.getMinutes()).padStart(2,'0')}`;
      
      link.href = url;
      link.download = `MakeTicket_Snapshot_${timestamp}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("HTML download failed", e);
      alert("화면 캡처 저장 중 오류가 발생했습니다.");
    }
  };

  const dynamicMenuItems = useMemo(() => {
    let base = [...MENU_ITEMS];

    // Model 2+ : Package, Group/Experience
    if (modelId >= 2) {
      base = base.map(item => {
        if (item.id === 'products') {
          const sub = [
            { id: 'product-list', label: '입장권 상품 관리', path: '/products/list' },
            { id: 'product-package', label: '패키지 상품 관리', path: '/products/package' }
          ];
          if (showGroupExperience) {
            sub.push({ id: 'product-group', label: '단체 상품 관리', path: '/products/group' });
            sub.push({ id: 'product-experience', label: '체험 상품 관리', path: '/products/experience' });
          }
          return { ...item, subItems: sub };
        }
        return item;
      });
    }

    // Model 3+ : Membership inserted after Facility, Immediate Entry Check
    if (modelId >= 3) {
      const facilityIdx = base.findIndex(i => i.id === 'facility');
      if (showMember && facilityIdx !== -1) {
        base.splice(facilityIdx + 1, 0, {
          id: 'member', label: '회원', icon: <Users size={20} />,
          subItems: [
            { id: 'member-info', label: '회원 정보 관리', path: '/member/info' },
            { id: 'member-blacklist', label: '블랙 리스트', path: '/member/blacklist' }
          ]
        });
      }
      if (showImmediateEntryCheck) {
        base = base.map(item => {
          if (item.id === 'usage') {
            const sub = [...(item.subItems || [])];
            if (!sub.some(s => s.id === 'usage-self-check')) {
              sub.splice(1, 0, { id: 'usage-self-check', label: '바로 입장 검표', path: '/usage/self-check' });
            }
            return { ...item, subItems: sub };
          }
          return item;
        });
      }
    }

    // Model 4+ : Marketing (Promotions, Coupons) + Kiosk Menus in Facility
    if (modelId >= 4) {
      base.splice(3, 0, {
        id: 'marketing', label: '마케팅/프로모션', icon: <Megaphone size={20} />,
        subItems: [
          { id: 'mkt-coupon', label: '쿠폰 관리', path: '/marketing/coupon' },
          { id: 'mkt-point', label: '포인트/마일리지 설정', path: '/marketing/point' },
          { id: 'mkt-event', label: '이벤트 관리', path: '/marketing/event' }
        ]
      });

      // Add Kiosk menus to Facility
      base = base.map(item => {
        if (item.id === 'facility') {
          const sub = [...(item.subItems || [])];
          const posWindowIdx = sub.findIndex(s => s.id === 'facility-pos-window');
          if (posWindowIdx !== -1 && !sub.some(s => s.id === 'kiosk-window')) {
             sub.splice(posWindowIdx + 1, 0, 
               { id: 'kiosk-window', label: '키오스크 창구 관리', path: '/facility/kiosk-window' },
               { id: 'kiosk-product', label: '키오스크별 상품관리', path: '/facility/kiosk-product' },
               { id: 'kiosk-banner', label: '키오스크 배너관리', path: '/facility/kiosk-banner' }
             );
          }
          return { ...item, subItems: sub };
        }
        return item;
      });
    }

    // Model 5+ : Deep Operation (F&B, MD)
    if (modelId >= 5) {
      base.splice(6, 0, {
        id: 'facility-deep', label: '시설 심화 관리', icon: <Store size={20} />,
        subItems: [
          { id: 'fnb-manage', label: 'F&B 매장 관리', path: '/facility/fnb' },
          { id: 'md-inventory', label: 'MD 재고 관리', path: '/facility/md' },
          { id: 'pos-realtime', label: '실시간 POS 현황', path: '/facility/pos-live' }
        ]
      });
    }

    // Model 6+ : AI Strategy
    if (modelId >= 6) {
      base = base.map(item => {
        if (item.id === 'report') {
          return {
            ...item,
            subItems: [
              ...(item.subItems || []),
              { id: 'report-ai', label: 'AI 수요 예측 보고서', path: '/report/ai-predict' },
              { id: 'report-sim', label: '매출 시뮬레이션', path: '/report/simulation' }
            ]
          };
        }
        return item;
      });
    }

    // Model 7 : Security & Master
    if (modelId >= 7) {
      base.push({
        id: 'security-master', label: '시스템 마스터', icon: <ShieldCheck size={20} />,
        subItems: [
          { id: 'audit-log', label: '전체 시스템 감사 로그', path: '/system/audit' },
          { id: 'pg-master', label: 'PG/결제 마스터 설정', path: '/system/pg' },
          { id: 'api-gateway', label: '외부 API 연동 관리', path: '/system/api' }
        ]
      });
    }

    return base;
  }, [modelId, showGroupExperience, showImmediateEntryCheck, showMember]);

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-20 ${isSplitView ? 'absolute top-0 bottom-0 left-0 h-full' : 'fixed left-0 top-14 bottom-0'} ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
      <div className="bg-purple-50 p-4 border-b border-purple-100">
         <div className="flex items-center gap-2 mb-3 text-purple-800">
           <Settings2 size={16} />
           <span className="text-xs font-bold uppercase tracking-wider">Level {modelId} Authority</span>
         </div>
         {modelId >= 2 && (
           <div className="space-y-2">
              <button onClick={() => setShowGroupExperience(!showGroupExperience)} className="w-full flex items-center justify-between text-[11px] font-medium text-gray-600 hover:text-purple-700">
                <span>단체/체험 활성</span>
                {showGroupExperience ? <ToggleRight className="text-purple-600" size={18} /> : <ToggleLeft className="text-gray-300" size={18} />}
              </button>
              {modelId >= 3 && (
                <>
                  <button onClick={() => setShowImmediateEntryCheck(!showImmediateEntryCheck)} className="w-full flex items-center justify-between text-[11px] font-medium text-gray-600 hover:text-purple-700">
                    <span>바로 입장 활성</span>
                    {showImmediateEntryCheck ? <ToggleRight className="text-purple-600" size={18} /> : <ToggleLeft className="text-gray-300" size={18} />}
                  </button>
                  <button onClick={() => setShowMember(!showMember)} className="w-full flex items-center justify-between text-[11px] font-medium text-gray-600 hover:text-purple-700">
                    <span>회원 메뉴 활성</span>
                    {showMember ? <ToggleRight className="text-purple-600" size={18} /> : <ToggleLeft className="text-gray-300" size={18} />}
                  </button>
                </>
              )}
           </div>
         )}
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {dynamicMenuItems.map((item) => {
            const isActive = item.subItems?.some(sub => sub.path === currentPath);
            const isExpanded = expandedMenus.includes(item.id);
            return (
              <div key={item.id}>
                <button onClick={() => handleItemClick(item)} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <div className="flex items-center"><span className="mr-3 text-gray-400">{item.icon}</span>{item.label}</div>
                  {item.subItems && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                </button>
                {item.subItems && isExpanded && (
                  <div className="mt-1 space-y-1">
                    {item.subItems.map((sub) => (
                      <button key={sub.id} onClick={() => onNavigate(sub.path!)} className={`w-full flex items-center pl-12 pr-4 py-2 text-sm font-medium transition-colors rounded-lg text-left ${sub.path === currentPath ? 'text-purple-700 bg-purple-50 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>{sub.label}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button onClick={handleDownloadHtml} className="w-full bg-gray-800 text-white py-2.5 rounded text-xs font-bold shadow-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
          <Download size={14} />
          HTML 다운로드
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
