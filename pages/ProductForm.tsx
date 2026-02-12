import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Plus, ImageIcon, Type, X, ToggleLeft, ToggleRight, LayoutTemplate, Search, Info, AlertCircle, Edit, Trash2, FileText, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Link, Check } from 'lucide-react';

interface ProductFormProps {
  onNavigate: (path: string) => void;
  showDevGuides?: boolean;
  registerConfig: any;
  modelId: number;
  showImmediateEntryCheck?: boolean; // Added to sync with sidebar
}

// Mock Data for Ticket Types
interface TicketType {
  id: number;
  priority: number;
  code: string;
  name: string;
  // englishName removed as per request
  onlinePrice: number;
  regularPrice: number;
  onsitePrice: number;
  outputName: string;
  usageStatus: '사용' | '미사용';
  channels: string[];
  isMultiUse: '사용' | '미사용';
  maxUseCount: string;
  usePrecaution: '사용' | '미사용';
  precautionText: string;
  descriptionExposure: '사용' | '미사용';
  description: string;
  unit: string; // Korean unit
  unitEng?: string; // English unit (pax)
  unitMulti?: string; // Chinese/Japanese unit (人)
  isPriceModifiable: '가능' | '불가능';
  isRequired: '적용' | '미적용';
  printerNo: number;
  reportCount: number;
  seasonPrice: number;
  outputPrice: number;
  minQty: number;
  maxQty: number;
  isDiscountProof: '사용' | '미사용';
}

const MOCK_TICKET_TYPES: TicketType[] = [
  {
    id: 1,
    priority: 1,
    code: 'PL2500973',
    name: '입장권',
    onlinePrice: 100,
    regularPrice: 100,
    onsitePrice: 100,
    outputName: '',
    usageStatus: '사용',
    channels: ['온라인', '관리자', '키오스크', '현장POS'],
    isMultiUse: '미사용',
    maxUseCount: '-',
    usePrecaution: '미사용',
    precautionText: '',
    descriptionExposure: '미사용',
    description: '',
    unit: '', 
    unitEng: 'pax',
    unitMulti: '人',
    isPriceModifiable: '불가능',
    isRequired: '미적용',
    printerNo: 1,
    reportCount: 1,
    seasonPrice: 0,
    outputPrice: 0,
    minQty: 0,
    maxQty: 0,
    isDiscountProof: '미사용'
  },
  {
    id: 2,
    priority: 2,
    code: 'PL2500981',
    name: '장애인 할인',
    onlinePrice: 50,
    regularPrice: 50,
    onsitePrice: 50,
    outputName: '',
    usageStatus: '사용',
    channels: ['온라인', '관리자', '키오스크', '현장POS'],
    isMultiUse: '미사용',
    maxUseCount: '-',
    usePrecaution: '미사용',
    precautionText: '',
    descriptionExposure: '미사용',
    description: '',
    unit: '',
    unitEng: 'pax',
    unitMulti: '人',
    isPriceModifiable: '불가능',
    isRequired: '미적용',
    printerNo: 1,
    reportCount: 1,
    seasonPrice: 0,
    outputPrice: 0,
    minQty: 0,
    maxQty: 0,
    isDiscountProof: '미사용'
  }
];

const ProductForm: React.FC<ProductFormProps> = ({ onNavigate, showDevGuides = false, registerConfig, modelId, showImmediateEntryCheck = false }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [refundType, setRefundType] = useState('refund_impossible'); 
  const [viewMode, setViewMode] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  
  // UI States for After Mode
  const [useAddress, setUseAddress] = useState(false); 
  const [cancelBtnConfig, setCancelBtnConfig] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  // Etc Tab Detailed States
  const [phoneLimitUsage, setPhoneLimitUsage] = useState('unused'); // 'used' | 'unused'
  const [duplicateLimitType, setDuplicateLimitType] = useState('제한없음'); // '제한없음' | '상품별' | '업체별'
  const [reserveConfirmUsage, setReserveConfirmUsage] = useState('미사용'); // '사용' | '미사용'
  const [hasBoothData, setHasBoothData] = useState(true); // Redemption booth data toggle state
  
  // Ticket Type Tab States
  const [ticketList, setTicketList] = useState<TicketType[]>(MOCK_TICKET_TYPES);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  
  // Description Modal States
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [descTicket, setDescTicket] = useState<TicketType | null>(null);

  // Helper to check product type
  const isSessionProduct = registerConfig.dateType === '일자(회차)상품';

  // Refs for Validation Focus
  const nameRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const salesStartDateRef = useRef<HTMLInputElement>(null);
  const salesEndDateRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const maxSalesRef = useRef<HTMLInputElement>(null);
  const refundRuleRef = useRef<HTMLTextAreaElement>(null);
  const precautionRef = useRef<HTMLTextAreaElement>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressData, setAddressData] = useState({
    zipcode: '',
    address: '',
    detailAddress: ''
  });

  // 상세정보 동적 추가를 위한 상태 관리
  const [productDetails, setProductDetails] = useState([
    { id: 1, label: '', content: '' }
  ]);

  const [repImage, setRepImage] = useState<string | null>(null);
  const [detailImages, setDetailImages] = useState([
    { id: 1, fileName: '' }
  ]);
  const [signageBgImage, setSignageBgImage] = useState<string | null>(null);

  const handleAddDetail = () => {
    const newId = productDetails.length > 0 ? Math.max(...productDetails.map(d => d.id)) + 1 : 1;
    setProductDetails([...productDetails, { id: newId, label: '', content: '' }]);
  };

  const handleRemoveDetail = (id: number) => {
    if (productDetails.length === 1) return;
    setProductDetails(productDetails.filter(detail => detail.id !== id));
  };

  const handleAddDetailImage = () => {
    const newId = detailImages.length > 0 ? Math.max(...detailImages.map(d => d.id)) + 1 : 1;
    setDetailImages([...detailImages, { id: newId, fileName: '' }]);
  };

  const handleRemoveDetailImage = (id: number) => {
    if (detailImages.length === 1) return;
    setDetailImages(detailImages.filter(img => img.id !== id));
  };

  const handleRepImageUpload = () => {
    setRepImage('3월_컴퓨터_달력X.png');
  };
  
  const handleDetailImageUpload = (id: number) => {
    setDetailImages(prev => prev.map(img => img.id === id ? { ...img, fileName: '상세_이미지_01.jpg' } : img));
  };

  const handleSignageImageUpload = () => {
    setSignageBgImage('signage_bg_v1.jpg');
  };

  const handleAddressSelect = (zip: string, addr: string) => {
    setAddressData(prev => ({ ...prev, zipcode: zip, address: addr }));
    setIsAddressModalOpen(false);
  };

  const handleSave = () => {
    if (!nameRef.current?.value) { alert('상품명을 입력해주세요.'); nameRef.current?.focus(); return; }
    if (!startDateRef.current?.value) { alert('시작일시를 입력해주세요.'); startDateRef.current?.focus(); return; }
    if (!endDateRef.current?.value) { alert('종료일시를 입력해주세요.'); endDateRef.current?.focus(); return; }
    if (!salesStartDateRef.current?.value) { alert('판매 시작일시를 입력해주세요.'); salesStartDateRef.current?.focus(); return; }
    if (!salesEndDateRef.current?.value) { alert('판매 종료일시를 입력해주세요.'); salesEndDateRef.current?.focus(); return; }

    if (viewMode === 'AFTER') {
      if (useAddress && (!addressData.zipcode || !addressData.detailAddress)) {
         alert('주소를 입력해주세요.');
         addressRef.current?.focus();
         return;
      }
    } else {
      if (!addressData.zipcode || !addressData.detailAddress) {
         alert('주소를 입력해주세요.');
         addressRef.current?.focus();
         return; 
      }
    }

    if (registerConfig.maxSalesLimit === '상품 기간 수량 제한') {
       if (!maxSalesRef.current?.value) {
          alert('최대 판매 수량을 입력해주세요.');
          maxSalesRef.current?.focus();
          return;
       }
    }

    if (!refundRuleRef.current?.value) {
      alert('취소·환불 규정을 입력해주세요.');
      refundRuleRef.current?.focus();
      return;
    }
    if (!precautionRef.current?.value) {
      alert('예약 유의사항을 입력해주세요.');
      precautionRef.current?.focus();
      return;
    }

    alert('저장되었습니다.');
  };

  const handleTicketDelete = (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setTicketList(prev => prev.filter(ticket => ticket.id !== id));
    }
  };

  const handleTicketEdit = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const handleTicketSave = (ticketData: TicketType) => {
    if (editingTicket) {
      setTicketList(prev => prev.map(t => t.id === ticketData.id ? ticketData : t));
    } else {
      const newId = Math.max(...ticketList.map(t => t.id), 0) + 1;
      setTicketList(prev => [...prev, { ...ticketData, id: newId, code: `NEW${newId}` }]);
    }
    setIsTicketModalOpen(false);
    setEditingTicket(null);
  };

  const handleDescriptionEdit = (ticket: TicketType) => {
    setDescTicket(ticket);
    setIsDescModalOpen(true);
  };

  const handleDescriptionSave = (exposure: '사용'|'미사용', content: string) => {
    if (descTicket) {
      setTicketList(prev => prev.map(t => t.id === descTicket.id ? { 
        ...t, 
        descriptionExposure: exposure,
        description: content 
      } : t));
    }
    setIsDescModalOpen(false);
    setDescTicket(null);
  };

  const DevBadge = ({ type, text }: { type: 'moved' | 'changed' | 'hidden' | 'new', text: string }) => {
    if (viewMode !== 'AFTER') return null;
    const colors = {
      moved: 'bg-blue-100 text-blue-700 border-blue-200',
      changed: 'bg-orange-100 text-orange-700 border-orange-200',
      hidden: 'bg-gray-100 text-gray-500 border-gray-200',
      new: 'bg-green-100 text-green-700 border-green-200'
    };
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border rounded ml-2 ${colors[type]}`}>
        {type === 'moved' && '↪'} {type === 'changed' && '⚡'} {type === 'new' && '+'} {text}
      </div>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2 mt-8 first:mt-0">
      <span className="w-2.5 h-2.5 bg-gray-700 rounded-sm"></span>
      {title}
    </div>
  );

  const FormRow = ({ label, required = false, children, className = '', badge = null }: React.PropsWithChildren<{ label: string, required?: boolean, className?: string, badge?: React.ReactNode }>) => (
    <div className={`flex border-b border-gray-200 last:border-0 min-h-[50px] ${className}`}>
      <div className="w-48 bg-gray-50 px-4 py-3 flex items-center text-xs font-semibold text-gray-700 border-r border-gray-200 shrink-0">
        <span className="leading-tight flex flex-col items-start gap-1">
          <span>{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
          {badge}
        </span>
      </div>
      <div className="flex-1 px-4 py-2 flex items-center bg-white text-sm">
        {children}
      </div>
    </div>
  );

  // Ticket Type Modal Component
  const TicketTypeModal = ({ onClose, initialData, onSave, currentViewMode }: { onClose: () => void, initialData: TicketType | null, onSave: (data: TicketType) => void, currentViewMode: 'BEFORE' | 'AFTER' }) => {
    const [formData, setFormData] = useState<Partial<TicketType>>({
        priority: 1,
        name: '',
        onlinePrice: 0,
        regularPrice: 0,
        onsitePrice: 0,
        outputName: '',
        usageStatus: '사용',
        channels: ['온라인', '관리자', '키오스크', '현장POS'],
        isMultiUse: '미사용',
        maxUseCount: '',
        usePrecaution: '미사용',
        precautionText: '',
        unit: '명',
        unitEng: 'pax',
        unitMulti: '人',
        isPriceModifiable: '불가능',
        isRequired: '미적용',
        isDiscountProof: '미사용',
        printerNo: 1,
        reportCount: 1,
        seasonPrice: 0,
        outputPrice: 0,
        minQty: 0,
        maxQty: 0,
        ...initialData
    });

    const handleChange = (field: keyof TicketType, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleChannelChange = (channel: string) => {
        const current = formData.channels || [];
        if (channel === '전체') {
            if (current.includes('전체') || current.length === 4) { 
                handleChange('channels', []);
            } else {
                handleChange('channels', ['온라인', '관리자', '키오스크', '현장POS', '전체']);
            }
            return;
        }
        
        const newChannels = current.includes(channel) 
            ? current.filter(c => c !== channel) 
            : [...current, channel];
        
        handleChange('channels', newChannels);
    };

    const inputClass = "w-full h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm no-spinner";
    const shortInputClass = "w-32 h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm no-spinner";

    const ModalRow = ({ label, required, children, className = '' }: React.PropsWithChildren<{ label: string, required?: boolean, className?: string }>) => (
        <div className={`flex border-b border-gray-200 last:border-0 ${className}`}>
            <div className="w-40 px-4 py-3 flex items-center text-xs font-bold text-gray-800 shrink-0">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </div>
            <div className="flex-1 px-4 py-2 flex items-center bg-white text-sm">
                {children}
            </div>
        </div>
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-[800px] max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <div className="flex items-center justify-between px-6 py-4 bg-purple-600 text-white shrink-0">
              <span className="font-bold text-lg">{initialData ? '권종 수정' : '권종 등록'}</span>
              <button onClick={onClose} className="text-white hover:text-purple-200"><X size={24} /></button>
           </div>
           
           <div className="flex-1 overflow-y-auto">
              <div className="border-t border-gray-200">
                <ModalRow label="권종명" required>
                  <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} />
                </ModalRow>
                
                <ModalRow label="우선순위">
                  <div className="flex flex-col gap-1 w-full">
                    <input type="number" value={formData.priority} onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)} className={shortInputClass} />
                    <span className="text-pink-500 text-xs">* 우선순위가 없거나 중복일 경우 권종명 내림차순으로 노출됩니다.</span>
                  </div>
                </ModalRow>
                <ModalRow label="온라인 판매가" required>
                  <input type="number" value={formData.onlinePrice} onChange={(e) => handleChange('onlinePrice', parseInt(e.target.value) || 0)} className={inputClass} />
                </ModalRow>
                <ModalRow label="온라인 정가" required>
                  <input type="number" value={formData.regularPrice} onChange={(e) => handleChange('regularPrice', parseInt(e.target.value) || 0)} className={inputClass} />
                </ModalRow>
                <ModalRow label="현장 판매가" required>
                  <input type="number" value={formData.onsitePrice} onChange={(e) => handleChange('onsitePrice', parseInt(e.target.value) || 0)} className={inputClass} />
                </ModalRow>
                <ModalRow label="티켓출력가">
                   <input type="number" value={formData.outputPrice} onChange={(e) => handleChange('outputPrice', parseInt(e.target.value) || 0)} className={inputClass} />
                </ModalRow>
                <ModalRow label="성수기가격">
                   <div className="flex flex-col gap-1 w-full">
                     <input type="number" value={formData.seasonPrice} onChange={(e) => handleChange('seasonPrice', parseInt(e.target.value) || 0)} className={inputClass} />
                     <span className="text-pink-500 text-xs">* 성수기 일정이 있을 시, 해당 가격으로 노출 됩니다.</span>
                   </div>
                </ModalRow>
                <ModalRow label="권종 최소수량">
                   <div className="flex items-center justify-between w-full">
                      <input type="number" value={formData.minQty} onChange={(e) => handleChange('minQty', parseInt(e.target.value) || 0)} className={shortInputClass} />
                      <span className="text-pink-500 text-xs ml-2 flex-1 text-right">* 0 제한 없음.</span>
                   </div>
                </ModalRow>
                <ModalRow label="권종 최대수량">
                   <div className="flex items-center justify-between w-full">
                      <input type="number" value={formData.maxQty} onChange={(e) => handleChange('maxQty', parseInt(e.target.value) || 0)} className={shortInputClass} />
                      <span className="text-pink-500 text-xs ml-2 flex-1 text-right">* 0 제한 없음.</span>
                   </div>
                </ModalRow>
                <ModalRow label="권종 필수 여부">
                   <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.isRequired === '적용'} onChange={() => handleChange('isRequired', '적용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">적용</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.isRequired === '미적용'} onChange={() => handleChange('isRequired', '미적용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">미적용</span></label>
                   </div>
                </ModalRow>
                <ModalRow label="권종단위">
                    <input type="text" value={formData.unit} onChange={(e) => handleChange('unit', e.target.value)} className={shortInputClass} placeholder="명" />
                </ModalRow>
                <ModalRow label="사용여부">
                   <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.usageStatus === '사용'} onChange={() => handleChange('usageStatus', '사용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">사용</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.usageStatus === '미사용'} onChange={() => handleChange('usageStatus', '미사용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">미사용</span>
                      </label>
                   </div>
                </ModalRow>
                <ModalRow label="구매유의사항">
                   <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-6">
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.usePrecaution === '사용'} onChange={() => handleChange('usePrecaution', '사용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">사용</span></label>
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.usePrecaution === '미사용'} onChange={() => setFormData(prev => ({...prev, usePrecaution: '미사용'}))} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">미사용</span></label>
                      </div>
                      <span className="text-pink-500 text-xs">* 구매유의사항 사용 시, 해당 권종 선택 시, 안내문구가 노출됩니다.</span>
                   </div>
                </ModalRow>
                
                {(currentViewMode === 'BEFORE' || (currentViewMode === 'AFTER' && formData.usePrecaution === '사용')) && (
                    <ModalRow label="구매유의사항 안내문구">
                        <textarea 
                            className="w-full h-24 p-2 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 resize-none disabled:bg-gray-100 disabled:text-gray-400"
                            value={formData.precautionText}
                            onChange={(e) => handleChange('precautionText', e.target.value)}
                            disabled={formData.usePrecaution === '미사용'}
                        ></textarea>
                    </ModalRow>
                )}

                <ModalRow label="권종가격수정 가능 여부">
                   <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.isPriceModifiable === '가능'} onChange={() => handleChange('isPriceModifiable', '가능')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">가능</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.isPriceModifiable === '불가능'} onChange={() => handleChange('isPriceModifiable', '불가능')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">불가능</span></label>
                   </div>
                </ModalRow>

                <ModalRow label="권종 노출 채널" required>
                   <div className="flex flex-col gap-2">
                      {['전체', '온라인', '관리자', '키오스크', '현장POS'].map(ch => (
                         <label key={ch} className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                checked={formData.channels?.includes(ch)}
                                onChange={() => handleChannelChange(ch)}
                            />
                            <span className="text-sm text-gray-700">{ch}</span>
                         </label>
                      ))}
                   </div>
                </ModalRow>

                <ModalRow label="다회권 사용여부">
                   <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.isMultiUse === '사용'} onChange={() => handleChange('isMultiUse', '사용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">사용</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.isMultiUse === '미사용'} onChange={() => setFormData(prev => ({...prev, isMultiUse: '미사용'}))} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">미사용</span></label>
                   </div>
                </ModalRow>

                {(currentViewMode === 'BEFORE' || (currentViewMode === 'AFTER' && formData.isMultiUse === '사용')) && (
                    <ModalRow label="최대사용횟수">
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    className="w-32 h-8 px-2 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                    value={formData.maxUseCount === '-' ? '' : formData.maxUseCount}
                                    onChange={(e) => handleChange('maxUseCount', e.target.value)}
                                    disabled={formData.isMultiUse === '미사용'}
                                />
                                <label className={`flex items-center gap-1 text-sm text-gray-600 ${formData.isMultiUse === '미사용' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" disabled={formData.isMultiUse === '미사용'} />
                                    제한 없음
                                </label>
                            </div>
                            <span className="text-pink-500 text-xs">* 숫자 2이상 입력 가능합니다.</span>
                        </div>
                    </ModalRow>
                )}

                <ModalRow label="할인증빙 권종여부">
                   <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-6">
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.isDiscountProof === '사용'} onChange={() => handleChange('isDiscountProof', '사용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">사용</span></label>
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.isDiscountProof === '미사용'} onChange={() => handleChange('isDiscountProof', '미사용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">미사용</span></label>
                      </div>
                      <span className="text-pink-500 text-xs">* 할인증빙 권종 사용 시, 현장 매표소에서 증빙 후 이용 가능</span>
                   </div>
                </ModalRow>
                <ModalRow label="티켓출력 프린터 번호">
                   <input type="number" value={formData.printerNo} onChange={(e) => handleChange('printerNo', parseInt(e.target.value) || 0)} className={shortInputClass} />
                </ModalRow>
                <ModalRow label="이용인원(보고서용)">
                   <input type="number" value={formData.reportCount} onChange={(e) => handleChange('reportCount', parseInt(e.target.value) || 0)} className={shortInputClass} />
                </ModalRow>
              </div>
           </div>

           <div className="p-4 border-t border-gray-200 flex justify-center gap-3 shrink-0">
               <button onClick={() => onSave(formData as TicketType)} className="px-10 py-2.5 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 shadow-sm text-sm">저장</button>
               <button onClick={onClose} className="px-10 py-2.5 bg-gray-700 text-white rounded font-bold hover:bg-gray-800 shadow-sm text-sm">취소</button>
           </div>
        </div>
      </div>
    );
  };

  const CancelButtonConfig = () => (
    <>
      <FormRow 
         label="예매취소 버튼 노출 설정" 
         required 
         badge={viewMode === 'AFTER' ? <DevBadge type="changed" text="설정 시에만 상세입력 노출" /> : null}
      >
         <div className="flex items-center gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                    type="radio" 
                    name="cancel_btn" 
                    className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                    checked={viewMode === 'AFTER' ? cancelBtnConfig : undefined}
                    onChange={() => setCancelBtnConfig(true)}
                /> 
                <span className="text-sm text-gray-700">설정</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                    type="radio" 
                    name="cancel_btn" 
                    className="text-purple-600 focus:ring-purple-500 border-gray-300" 
                    defaultChecked 
                    checked={viewMode === 'AFTER' ? !cancelBtnConfig : undefined}
                    onChange={() => setCancelBtnConfig(false)}
                /> 
                <span className="text-sm text-gray-700">미설정</span>
            </label>
            <span className="text-sm text-gray-500">(이용시간 이후 예매취소 버튼 비노출)</span>
         </div>
      </FormRow>
      
      {(viewMode === 'BEFORE' || (viewMode === 'AFTER' && cancelBtnConfig)) && (
          <FormRow label="" className="!border-t-0 -mt-[1px] bg-gray-50/50">
             <div className="flex items-center gap-2">
                <select className="form-select h-9 w-40 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 shadow-sm">
                  <option>예매후</option>
                  <option>이용일(일자)</option>
                  <option>이용일(시간)</option>
                </select>
                <input type="text" className="form-input w-20 h-9 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-center" />
                <span className="text-gray-700">일</span>
                <input type="text" className="form-input w-20 h-9 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-center" />
                <span className="text-gray-700">시간 전(이내)</span>
             </div>
          </FormRow>
      )}
    </>
  );

  const TicketTypeTab = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-gray-700">페이지 당 데이터 건수</span>
               <select className="form-select h-8 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500">
                   <option>15</option>
                   <option>30</option>
                   <option>50</option>
               </select>
            </div>
            
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">사용여부</span>
                    <select className="form-select h-8 text-xs border border-gray-300 rounded w-24"><option>사용</option><option>미사용</option></select>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">다회권</span>
                    <select className="form-select h-8 text-xs border border-gray-300 rounded w-24"><option>전체</option></select>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">구매유의사항</span>
                    <select className="form-select h-8 text-xs border border-gray-300 rounded w-24"><option>전체</option></select>
                 </div>
                 <button className="px-4 py-1.5 border border-purple-500 text-purple-600 bg-white hover:bg-purple-50 rounded text-xs font-bold transition-colors shadow-sm">
                    검색
                 </button>
                 <button 
                    onClick={() => { setEditingTicket(null); setIsTicketModalOpen(true); }}
                    className="px-4 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded text-xs font-bold transition-colors shadow-sm"
                 >
                    권종 등록
                 </button>
            </div>
        </div>
        
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
           <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 text-xs text-center">
                 <tr>
                    <th className="px-4 py-3 w-16">우선순위</th>
                    <th className="px-4 py-3">권종코드</th>
                    <th className="px-4 py-3">권종명</th>
                    <th className="px-4 py-3">온라인 판매가</th>
                    <th className="px-4 py-3">온라인 정가</th>
                    <th className="px-4 py-3">현장 판매가</th>
                    <th className="px-4 py-3">티켓출력가</th>
                    <th className="px-4 py-3">사용여부</th>
                    <th className="px-4 py-3 min-w-[200px]">권종노출채널</th>
                    <th className="px-4 py-3">다회권</th>
                    <th className="px-4 py-3">최대사용횟수</th>
                    <th className="px-4 py-3">구매유의사항</th>
                    <th className="px-4 py-3">설명</th>
                    <th className="px-4 py-3 w-32">관리</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                 {ticketList.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors text-center text-xs">
                       <td className="px-4 py-3">{ticket.priority}</td>
                       <td className="px-4 py-3 text-gray-500">{ticket.code}</td>
                       <td className="px-4 py-3 font-medium text-gray-900">{ticket.name}</td>
                       <td className="px-4 py-3">{ticket.onlinePrice.toLocaleString()}</td>
                       <td className="px-4 py-3">{ticket.regularPrice.toLocaleString()}</td>
                       <td className="px-4 py-3">{ticket.onsitePrice.toLocaleString()}</td>
                       <td className="px-4 py-3">{ticket.outputPrice > 0 ? ticket.outputPrice.toLocaleString() : '-'}</td>
                       <td className="px-4 py-3">{ticket.usageStatus}</td>
                       <td className="px-4 py-3 text-gray-500">{ticket.channels.join(',')}</td>
                       <td className="px-4 py-3">{ticket.isMultiUse}</td>
                       <td className="px-4 py-3">{ticket.maxUseCount}</td>
                       <td className="px-4 py-3">{ticket.usePrecaution}</td>
                       <td className="px-4 py-3">
                           <button onClick={() => handleDescriptionEdit(ticket)} className="px-3 py-1 border border-purple-400 text-purple-600 rounded bg-white hover:bg-purple-50 whitespace-nowrap">설명</button>
                       </td>
                       <td className="px-4 py-3">
                          <div className="flex flex-row justify-center gap-1.5">
                             <button onClick={() => handleTicketEdit(ticket)} className="px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 whitespace-nowrap min-w-[40px]">수정</button>
                             <button onClick={() => handleTicketDelete(ticket.id)} className="px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 whitespace-nowrap min-w-[40px]">삭제</button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {ticketList.length === 0 && <tr><td colSpan={14} className="px-6 py-10 text-center text-gray-400">등록된 권종이 없습니다.</td></tr>}
              </tbody>
           </table>
        </div>
      </div>
    );
  };

  const DescriptionModal = ({ onClose, initialData, onSave }: { onClose: () => void, initialData: TicketType, onSave: (exposure: '사용'|'미사용', content: string) => void }) => {
    const [exposure, setExposure] = useState<'사용'|'미사용'>(initialData.descriptionExposure);
    const [content, setContent] = useState(initialData.description);

    const ModalRow = ({ label, children }: React.PropsWithChildren<{ label: string }>) => (
        <div className="flex border-b border-gray-200 last:border-0">
            <div className="w-40 bg-gray-50 px-4 py-3 flex items-center text-xs font-bold text-gray-700 border-r border-gray-200 shrink-0">
                {label}
            </div>
            <div className="flex-1 px-4 py-2 flex items-center bg-white">
                {children}
            </div>
        </div>
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 bg-purple-600 text-white shrink-0">
             <span className="font-bold text-lg">상품설명 설정</span>
             <button onClick={onClose} className="text-white hover:text-purple-200"><X size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
             <div className="border-t border-gray-200">
                 <ModalRow label="노출여부">
                    <div className="flex items-center gap-6">
                       <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={exposure === '사용'} onChange={() => setExposure('사용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">노출</span></label>
                       <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={exposure === '미사용'} onChange={() => setExposure('미사용')} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">노출안함</span></label>
                    </div>
                 </ModalRow>
                 <ModalRow label="상품설명">
                     <textarea className="w-full h-48 p-2 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 resize-none" value={content} onChange={(e) => setContent(e.target.value)} placeholder="권종에 대한 상세 설명을 입력하세요."></textarea>
                 </ModalRow>
             </div>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-center gap-3 shrink-0">
               <button onClick={() => onSave(exposure, content)} className="px-10 py-2.5 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 shadow-sm text-sm">저장</button>
               <button onClick={onClose} className="px-10 py-2.5 bg-gray-700 text-white rounded font-bold hover:bg-gray-800 shadow-sm text-sm">취소</button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-20 relative">
      <style>{`
        /* Force remove spinners for number inputs with .no-spinner class */
        input[type=number].no-spinner::-webkit-inner-spin-button, 
        input[type=number].no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none !important; 
          margin: 0 !important; 
        }
        input[type=number].no-spinner {
          -moz-appearance: textfield !important;
          appearance: none !important;
        }
      `}</style>

      {/* Dev Mode Toggle & Banner */}
      {showDevGuides && (
        <div className="absolute top-0 right-6 z-40 flex items-center gap-3 bg-white px-4 py-2 rounded-b-lg shadow-md border border-t-0 border-gray-200">
           <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
             <LayoutTemplate size={14} /> View Mode:
           </span>
           <button 
             onClick={() => {
                const newMode = viewMode === 'BEFORE' ? 'AFTER' : 'BEFORE';
                setViewMode(newMode);
                if(newMode === 'AFTER') {
                    setUseAddress(false); 
                }
             }}
             className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${viewMode === 'BEFORE' ? 'bg-gray-200 text-gray-600' : 'bg-purple-100 text-purple-700'}`}
           >
             {viewMode === 'BEFORE' ? <ToggleLeft size={24} className="text-gray-500"/> : <ToggleRight size={24} className="text-purple-600"/>}
             {viewMode === 'BEFORE' ? 'Before (AS-IS)' : 'After (TO-BE)'}
           </button>
        </div>
      )}
      
      {viewMode === 'AFTER' && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <AlertCircle className="text-orange-600 mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-orange-800 mb-1">개발 가이드: 주요 수정 사항 (TO-BE)</h3>
            <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
              <li>다국어 설정이 가로 정렬로 변경되었습니다.</li>
              <li>예매취소 버튼 설정이 결제 섹션으로 이동되었습니다.</li>
              <li>기간상품 최대 판매수량 입력 필드에 가이드 문구가 추가되었습니다.</li>
              <li>취소수수료 설정 UI가 복구되었습니다.</li>
              <li className="font-bold text-red-600">[기타 탭] 모델 1, 2 공통: 쿠폰, 채널판매, 장소 설정이 제거되었습니다.</li>
              <li className="font-bold text-purple-700">[권종 탭] 권종단위가 단일 입력칸으로 간소화되었습니다. (이미지 준수)</li>
              <li className="font-bold text-blue-600 underline underline-offset-2">[기타 탭] 바로 입장 검표 상시 수정사항:</li>
              <ul className="pl-4 mt-1 space-y-0.5 text-blue-800 font-medium">
                <li>• '바로 입장 검표' 메뉴 활성화 시 관련 설정 필드(사용여부, 이미지) 복구 구현</li>
                <li>• 검표 비밀패턴: A, B, C, D 문자 조합 2~6자리 유효성 검사 필수</li>
              </ul>
            </ul>
          </div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="mb-6 relative">
        <div className="flex items-center justify-between mb-4">
           <div><h2 className="text-2xl font-bold text-gray-800 mb-1">기본정보</h2></div>
           <div className="absolute right-0 top-0">
               <button onClick={() => setIsTypeModalOpen(true)} className="px-3 py-1.5 border border-purple-300 text-purple-700 rounded bg-purple-50 hover:bg-purple-100 text-xs font-medium transition-colors flex items-center gap-1 shadow-sm">
                 <Info size={14} /> 상품 유형
               </button>
           </div>
        </div>
        <div className="flex justify-end text-xs text-gray-500 mb-4">
          <span>상품관리</span> <span className="mx-2">›</span> <span>상품등록</span>
        </div>
        <div className="flex border-b border-gray-200">
          {[{ id: 'basic', label: '기본정보' }, { id: 'ticket_type', label: '권종' }, { id: 'etc', label: '기타' }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 text-sm font-medium border-t border-l border-r rounded-t-lg relative top-[1px] ${activeTab === tab.id ? 'bg-white border-gray-200 border-b-white text-gray-900 font-bold' : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`bg-white rounded-b-lg shadow-sm border border-gray-200 p-6 ${viewMode === 'BEFORE' && activeTab === 'basic' ? 'grayscale-[10%]' : ''}`}>
        
        {/* Render Active Tab Content */}
        {activeTab === 'basic' && (
          <>
            <SectionHeader title="기본정보" />
            <div className="border-t border-gray-200 mt-2">
              <FormRow label="상품명" required>
                <input ref={nameRef} type="text" className="form-input w-full max-w-2xl h-9 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500" />
              </FormRow>
              <FormRow label="시작일시" required>
                <div className="flex items-center gap-2">
                  <input ref={startDateRef} type="date" className="form-input h-9 w-36 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                  <select className="form-select h-9 w-20 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>00</option></select> <span>시</span>
                  <select className="form-select h-9 w-20 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>00</option></select> <span>분</span>
                </div>
              </FormRow>
              <FormRow label="종료일시" required>
                <div className="flex items-center gap-2">
                    <input ref={endDateRef} type="date" className="form-input h-9 w-36 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                    <select className="form-select h-9 w-20 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>00</option></select> <span>시</span>
                    <select className="form-select h-9 w-20 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>00</option></select> <span>분</span>
                </div>
              </FormRow>
              <FormRow label="판매시작일시" required>
                 <div className="flex items-center gap-2">
                    <input ref={salesStartDateRef} type="date" className="form-input h-9 w-36 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                    <select className="form-select h-9 w-20 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>00</option></select> <span>시</span>
                    <select className="form-select h-9 w-20 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>00</option></select> <span>분</span>
                </div>
              </FormRow>
              <FormRow label="판매종료일시" required>
                 <div className="flex items-center gap-2">
                    <input ref={salesEndDateRef} type="date" className="form-input h-9 w-36 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                    <select className="form-select h-9 w-20 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>00</option></select> <span>시</span>
                    <select className="form-select h-9 w-20 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>00</option></select> <span>분</span>
                </div>
              </FormRow>
              <FormRow label="상품유형" required>
                <select className="form-select h-9 w-56 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>일반</option></select>
              </FormRow>
              <FormRow label="시설구분">
                <select className="form-select h-9 w-56 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"><option>선택</option></select>
              </FormRow>
              
              <FormRow label="주소" required={viewMode === 'AFTER' ? false : true} className={viewMode === 'AFTER' ? 'h-auto py-3' : 'py-3'} badge={<DevBadge type="changed" text="사용 설정 추가됨" />}>
                 <div className="w-full max-w-3xl flex flex-col gap-2">
                    {viewMode === 'AFTER' && (
                      <div className="flex items-center gap-6 mb-1">
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="use_address" checked={useAddress} onChange={() => setUseAddress(true)} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">사용</span></label>
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="use_address" checked={!useAddress} onChange={() => setUseAddress(false)} className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">미사용</span></label>
                      </div>
                    )}
                    {(viewMode === 'BEFORE' || (viewMode === 'AFTER' && useAddress)) && (
                      <>
                        <div className="flex gap-2">
                          <input type="text" className="form-input w-24 h-9 text-sm border border-gray-300 rounded bg-gray-50 text-gray-600 focus:border-purple-500 focus:ring-purple-500 text-center" readOnly value={addressData.zipcode} placeholder="우편번호" />
                          <button onClick={() => setIsAddressModalOpen(true)} className="px-4 py-1.5 border border-purple-500 text-purple-600 text-xs font-medium rounded hover:bg-purple-50 transition-colors">주소찾기</button>
                        </div>
                        <input type="text" className="form-input w-full h-9 text-sm border border-gray-300 rounded bg-gray-50 focus:border-purple-500 focus:ring-purple-500" readOnly value={addressData.address} placeholder="기본 주소" />
                        <input ref={addressRef} type="text" className="form-input w-full h-9 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500" placeholder="상세주소 입력" value={addressData.detailAddress} onChange={(e) => setAddressData(prev => ({ ...prev, detailAddress: e.target.value }))} />
                      </>
                    )}
                 </div>
              </FormRow>

              {registerConfig.maxSalesLimit === '상품 기간 수량 제한' && (
                <FormRow label="최대 판매 수량" required>
                    <div className="flex items-center gap-2">
                        <input ref={maxSalesRef} type="text" className="form-input w-24 h-9 text-right border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" placeholder="0" />
                        <span className="text-gray-700 text-sm">매</span>
                        {viewMode === 'AFTER' && (
                            <span className="text-xs text-gray-500 ml-2">* 총 판매 가능한 수량을 입력하세요.</span>
                        )}
                    </div>
                </FormRow>
              )}
            </div>

            <SectionHeader title="상품소개" />
            <div className="border-t border-gray-200 mt-2">
               <FormRow label="상품 대표 이미지 (715x447px)">
                  <div className="flex flex-col gap-1.5">
                     <span className="text-pink-500 text-xs">* 3MB까지 업로드 가능.</span>
                     <div className="flex gap-2 items-center">
                        <button onClick={handleRepImageUpload} className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium bg-white hover:bg-gray-50 text-gray-700">파일선택</button>
                        {repImage ? <div className="flex items-center gap-1 text-gray-700 text-xs"><span>{repImage}</span><button onClick={() => setRepImage(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button></div> : <span className="text-gray-400 text-xs">선택된 파일 없음</span>}
                     </div>
                  </div>
               </FormRow>
               
               {isSessionProduct && repImage && (
                   <FormRow label="상품 상세 이미지 (715x447px)">
                      <div className="flex flex-col gap-2 w-full">
                         {viewMode === 'BEFORE' && <div className="w-full bg-blue-50 border border-blue-200 rounded p-2 mb-1 flex items-start gap-2"><Info size={14} className="text-blue-600 mt-0.5" /><span className="text-xs text-blue-700">실제 시스템에서는 <strong>상품 저장 후</strong> 해당 필드가 노출됩니다.</span></div>}
                         <span className="text-pink-500 text-xs">* 3MB까지 업로드 가능.</span>
                         {detailImages.map((img, idx) => (
                            <div key={img.id} className="flex gap-2 items-center">
                               {idx === 0 ? <button onClick={handleAddDetailImage} className="w-9 h-9 bg-purple-600 text-white flex items-center justify-center rounded hover:bg-purple-700 transition-colors shrink-0 shadow-sm"><Plus size={18}/></button> : <button onClick={() => handleRemoveDetailImage(img.id)} className="w-9 h-9 bg-white border border-gray-300 text-gray-500 flex items-center justify-center rounded hover:bg-gray-50 transition-colors shrink-0"><X size={16} /></button>}
                               <span className="w-6 text-center text-sm text-gray-600">{idx + 1}</span>
                               <button onClick={() => handleDetailImageUpload(img.id)} className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium bg-white hover:bg-gray-50 text-gray-700">파일 선택</button>
                               {img.fileName ? <div className="flex items-center gap-1 text-gray-700 text-xs"><span>{img.fileName}</span><button onClick={() => setDetailImages(prev => prev.map(item => item.id === img.id ? { ...item, fileName: '' } : item))} className="text-gray-400 hover:text-gray-600"><X size={14} /></button></div> : <span className="text-gray-400 text-xs">선택된 파일 없음</span>}
                            </div>
                         ))}
                      </div>
                   </FormRow>
               )}

               {viewMode === 'BEFORE' && isSessionProduct && (
                   <>
                       <FormRow label="사이니지 배경 이미지">
                          <div className="flex flex-col gap-1.5">
                             <span className="text-pink-500 text-xs">* 3MB까지 업로드 가능.</span>
                             <div className="flex gap-2 items-center">
                                <button onClick={handleSignageImageUpload} className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium bg-white hover:bg-gray-50 text-gray-700">파일선택</button>
                                {signageBgImage ? <div className="flex items-center gap-1 text-gray-700 text-xs"><span>{signageBgImage}</span><button onClick={() => setSignageBgImage(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button></div> : <span className="text-gray-400 text-xs">선택된 파일 없음</span>}
                             </div>
                          </div>
                       </FormRow>
                       <FormRow label="사이니지 정원 노출">
                          <div className="flex items-center gap-6">
                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="signage_capacity" className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /> <span className="text-sm text-gray-700">노출</span></label>
                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="signage_capacity" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">노출안함</span></label>
                          </div>
                       </FormRow>
                       <FormRow label="사이니지 회차 노출기준">
                          <div className="flex flex-wrap items-center gap-6">
                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="signage_criteria" className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /> <span className="text-sm text-gray-700">스케줄 시작시간 전까지</span></label>
                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="signage_criteria" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">스케줄 종료시간 전까지</span></label>
                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="signage_criteria" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">현장판매 시작시간 전까지</span></label>
                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="signage_criteria" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">현장판매 종료시간 전까지</span></label>
                          </div>
                       </FormRow>
                       <FormRow label="사이니지 타이틀명">
                          <div className="flex flex-col gap-1 w-full max-w-2xl">
                              <input type="text" className="form-input w-full h-9 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500" />
                              <span className="text-pink-500 text-xs">* 미 입력 시, 상품명으로 노출 됩니다.</span>
                          </div>
                       </FormRow>
                   </>
               )}

               <FormRow label="상품상세정보 노출" required>
                  <div className="flex items-center gap-6">
                     <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="detail_show" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">노출</span></label>
                     <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="detail_show" className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /> <span className="text-sm text-gray-700">노출안함</span></label>
                  </div>
               </FormRow>
               
               <FormRow label="상품상세정보" className="h-auto">
                    <div className="w-full bg-white border border-gray-300 h-64 rounded flex flex-col shadow-sm">
                        <div className="h-9 border-b border-gray-300 bg-gray-100 flex items-center px-3 gap-2 rounded-t">
                            <div className="w-24 h-6 bg-white border border-gray-300 rounded"></div>
                            <div className="flex-1"></div>
                            <div className="w-12 h-6 bg-white border border-gray-300 rounded text-[10px] flex items-center justify-center text-gray-500">사진</div>
                        </div>
                        <div className="flex-1 p-4 text-gray-400 text-sm">에디터 영역</div>
                        <div className="h-7 border-t border-gray-200 flex justify-end px-2 items-center gap-1 text-[10px] text-gray-500 bg-gray-50 rounded-b"><span className="border px-1.5 bg-white">Editor</span></div>
                    </div>
               </FormRow>
               
               <FormRow label="상품 상세정보 추가">
                <div className="flex flex-col w-full gap-2">
                    {productDetails.map((item, index) => (
                        <div key={item.id} className="flex w-full gap-2">
                            {index === 0 ? <button onClick={handleAddDetail} className="w-12 h-9 bg-purple-600 text-white flex items-center justify-center rounded hover:bg-purple-700 transition-colors shrink-0"><Plus size={18}/></button> : <button onClick={() => handleRemoveDetail(item.id)} className="w-12 h-9 bg-white border border-purple-300 text-purple-600 flex items-center justify-center rounded hover:bg-purple-50 transition-colors shrink-0"><X size={18} /></button>}
                            <input type="text" className="form-input w-48 h-9 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500" placeholder="항목명" />
                            <input type="text" className="form-input flex-1 h-9 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500" placeholder="내용" />
                        </div>
                    ))}
                </div>
               </FormRow>
            </div>

            {/* Section 3: Booking Page */}
            <SectionHeader title="예약페이지" />
            <div className="border-t border-gray-200 mt-2">
              <FormRow label="다국어 설정" badge={viewMode === 'AFTER' ? <DevBadge type="changed" text="가로 정렬" /> : null}>
                 <div className={`flex ${viewMode === 'BEFORE' ? 'flex-col gap-2 items-start' : 'items-center gap-6'}`}>
                    {['영어', '중국어(간체)', '중국어(번체)', '일본어'].map(lang => (
                       <label key={lang} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm text-gray-700">{lang}</span>
                       </label>
                    ))}
                 </div>
              </FormRow>
              <FormRow label="이메일 입력 설정">
                 <div className="flex items-center gap-6">
                     <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="email_req" className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /> <span className="text-sm text-gray-700">선택입력</span></label>
                     <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="email_req" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">필수입력</span></label>
                  </div>
              </FormRow>
              
              {viewMode === 'AFTER' && (
                 <FormRow label="상품목록 노출" required badge={<DevBadge type="moved" text="결제 섹션에서 이동됨" />}>
                    <div className="flex items-center gap-6">
                       <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="list_show" className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /> <span className="text-sm text-gray-700">노출</span></label>
                       <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="list_show" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">노출안함</span></label>
                    </div>
                 </FormRow>
              )}

              {viewMode === 'BEFORE' && <CancelButtonConfig />}
            </div>

            {/* Section 4: Payment */}
            <SectionHeader title="결제" />
            <div className="border-t border-gray-200 mt-2">
               <FormRow label="부분취소 가능여부" required>
                  <div className="flex items-center gap-6">
                     <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="partial_cancel" className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /> <span className="text-sm text-gray-700">가능</span></label>
                     <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="partial_cancel" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">부분취소 불가</span></label>
                  </div>
               </FormRow>

               {viewMode === 'AFTER' && <CancelButtonConfig />}
               
               {viewMode === 'BEFORE' && (
                   <FormRow label="상품목록 노출" required>
                      <div className="flex items-center gap-6">
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="list_show" className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /> <span className="text-sm text-gray-700">노출</span></label>
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="list_show" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">노출안함</span></label>
                      </div>
                   </FormRow>
               )}
               
               {viewMode === 'BEFORE' && (
                   <FormRow label="여행사 상품 노출" required>
                      <div className="flex items-center gap-6">
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="agency_show" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">노출</span></label>
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="agency_show" className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /> <span className="text-sm text-gray-700">노출안함</span></label>
                      </div>
                   </FormRow>
               )}

               {registerConfig.maxSalesLimit === '상품 기간 수량 제한' && (
                  <FormRow label="최대 판매 수량" required>
                     <div className="flex items-center gap-2">
                        <input ref={maxSalesRef} type="text" className="form-input w-24 h-9 text-right border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" placeholder="0" />
                        <span className="text-gray-700 text-sm">매</span>
                        {viewMode === 'AFTER' && (
                            <span className="text-xs text-gray-500 ml-2">* 총 판매 가능한 수량을 입력하세요.</span>
                        )}
                     </div>
                  </FormRow>
               )}

               <FormRow label="미사용 티켓 환불 여부">
                  <div className="flex items-center gap-4 flex-wrap">
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="unused_refund" className="text-purple-600 focus:ring-purple-500 border-gray-300" checked={refundType === 'refund_impossible'} onChange={() => setRefundType('refund_impossible')} /> 
                       <span className="text-sm text-gray-700">환불 불가</span>
                     </label>
                     <span className="text-pink-500 text-xs">*이용일이 경과하면 사용하지 않아도 환불 불가.</span>
                     <label className="flex items-center gap-2 ml-8 cursor-pointer">
                       <input type="radio" name="unused_refund" className="text-purple-600 focus:ring-purple-500 border-gray-300" checked={refundType === 'auto_refund'} onChange={() => setRefundType('auto_refund')} /> 
                       <span className="text-sm text-gray-700">자동 환불</span>
                     </label>
                     <input type="text" className="form-input w-20 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-400" disabled={refundType !== 'auto_refund'} />
                     <span className="text-gray-700">%</span>
                     <span className="text-pink-500 text-xs">*사용하지 않은 경우에 일부 공제 후 자동환불.</span>
                  </div>
               </FormRow>
               
               <FormRow label="취소수수료 설정" required className="py-4">
                  <div className="w-full bg-white border border-gray-200 rounded overflow-hidden">
                     <div className="grid grid-cols-12 bg-purple-50 border-b border-gray-300 text-xs font-bold text-gray-700 py-2.5">
                        <div className="col-span-1 text-center">사용</div>
                        <div className="col-span-7 pl-4">취소일 설정</div>
                        <div className="col-span-4 pl-4">취소 수수료</div>
                     </div>
                     
                     <div className="grid grid-cols-12 border-b border-gray-100 py-2 items-center hover:bg-gray-50 transition-colors">
                        <div className="col-span-1 text-center"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /></div>
                        <div className="col-span-7 pl-4 flex items-center gap-2 text-xs text-gray-800">
                            <span>예매 당일 및</span>
                            <select className="form-select h-8 text-xs border border-purple-500 focus:ring-purple-500 rounded py-0 w-24 text-gray-800 font-medium shadow-sm">
                                <option>이용일</option>
                                <option>예매 후</option>
                            </select>
                            <input type="text" defaultValue="3" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" /><span>일</span><input type="text" defaultValue="0" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" /><span>시간 전(이내)</span>
                        </div>
                        <div className="col-span-4 pl-4 text-xs text-gray-600">취소수수료 없음</div>
                     </div>
                     <div className="grid grid-cols-12 border-b border-gray-100 py-2 items-center hover:bg-gray-50 transition-colors">
                        <div className="col-span-1 text-center"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /></div>
                        <div className="col-span-7 pl-4 flex items-center gap-2 text-xs text-gray-800">
                            <select className="form-select h-8 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 py-0 w-24">
                                <option>예매 후</option>
                                <option>이용일</option>
                            </select>
                            <input type="text" defaultValue="8" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <span>일 ~ 이용일</span>
                            <input type="text" defaultValue="10" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <span>일 전</span>
                        </div>
                        <div className="col-span-4 pl-4 flex items-center gap-2 text-xs text-gray-600">
                            <span>결제 금액의</span>
                            <input type="text" defaultValue="10" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <select className="form-select h-8 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 py-0 w-16"><option>%</option></select>
                            <span>공제</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-12 border-b border-gray-100 py-2 items-center hover:bg-gray-50 transition-colors">
                        <div className="col-span-1 text-center"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /></div>
                        <div className="col-span-7 pl-4 flex items-center gap-2 text-xs text-gray-800">
                            <span>이용일</span>
                            <input type="text" defaultValue="9" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <span>일 ~ 이용일</span>
                            <input type="text" defaultValue="7" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <span>일 전</span>
                        </div>
                        <div className="col-span-4 pl-4 flex items-center gap-2 text-xs text-gray-600">
                            <span>결제 금액의</span>
                            <input type="text" defaultValue="10" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <select className="form-select h-8 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 py-0 w-16"><option>%</option></select>
                            <span>공제</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-12 border-b border-gray-100 py-2 items-center hover:bg-gray-50 transition-colors">
                        <div className="col-span-1 text-center"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /></div>
                        <div className="col-span-7 pl-4 flex items-center gap-2 text-xs text-gray-800">
                            <span>이용일</span>
                            <input type="text" defaultValue="2" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <span>일 ~ 이용일</span>
                            <input type="text" defaultValue="2" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <span>일 전</span>
                        </div>
                        <div className="col-span-4 pl-4 flex items-center gap-2 text-xs text-gray-600">
                            <span>결제 금액의</span>
                            <input type="text" defaultValue="20" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <select className="form-select h-8 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 py-0 w-16"><option>%</option></select>
                            <span>공제</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-12 border-b border-gray-100 py-2 items-center hover:bg-gray-50 transition-colors">
                        <div className="col-span-1 text-center"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /></div>
                        <div className="col-span-7 pl-4 flex items-center gap-2 text-xs text-gray-800">
                            <span>이용일</span>
                            <input type="text" defaultValue="1" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <span>일 ~ 이용일</span>
                            <input type="text" defaultValue="1" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <span>일 전</span>
                        </div>
                        <div className="col-span-4 pl-4 flex items-center gap-2 text-xs text-gray-600">
                            <span>결제 금액의</span>
                            <input type="text" defaultValue="30" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <select className="form-select h-8 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 py-0 w-16"><option>%</option></select><span>공제</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-12 border-b border-gray-100 py-2 items-center hover:bg-gray-50 transition-colors">
                        <div className="col-span-1 text-center"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /></div>
                        <div className="col-span-7 pl-4 flex items-center gap-2 text-xs text-gray-800">
                            <span>이용일 당일 ~ 운영 시작시간 전</span>
                        </div>
                        <div className="col-span-4 pl-4 flex items-center gap-2 text-xs text-gray-600">
                            <span>결제 금액의</span>
                            <input type="text" defaultValue="50" className="w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-xs" />
                            <select className="form-select h-8 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 py-0 w-16"><option>%</option></select>
                            <span>공제</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-12 py-2 items-center hover:bg-gray-50 transition-colors">
                        <div className="col-span-1 text-center"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /></div>
                        <div className="col-span-7 pl-4 text-xs text-gray-800">운영 시작시간 이후</div>
                        <div className="col-span-4 pl-4 text-xs text-gray-600">100% 공제</div>
                     </div>
                  </div>
               </FormRow>

               <FormRow label="취소·환불 규정" required className="h-auto">
                  <div className="w-full flex flex-col gap-2">
                      <textarea ref={refundRuleRef} className="form-textarea w-full h-32 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 p-2 resize-none" defaultValue={`· 이용 당일 취소/변경/환불이 불가합니다.\n· 예매 후 7일 이내라도 취소시점이 이용일로부터 10일 이내라면 이용일에 해당하는 취소수수료가 부과됩니다.\n· 기간상품일 경우, 이용일은 상품 종료일자 기준으로 정해집니다.`}></textarea>
                  </div>
               </FormRow>

               <FormRow label="예약 유의사항" required className="h-auto">
                  <div className="w-full flex flex-col gap-2">
                      <textarea ref={precautionRef} className="form-textarea w-full h-32 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 p-2 resize-none" defaultValue={`- 결제 시, 사용 업체는 (주)스마틱스로 표시됩니다.\n- 결제 완료 후 모바일티켓이 휴대폰으로 전송됩니다.\n(e-mail 주소를 입력하신 분만 예약 내역 메일을 받아 볼 수 있습니다.)\n- 거래 영수증 확인 및 예약 취소는 예약내역 페이지에서 확인 가능합니다.`}></textarea>
                  </div>
               </FormRow>
               
               {viewMode === 'BEFORE' && (
                 <FormRow label="상품 별 PG 가맹점 아이디">
                     <input type="text" className="form-input w-full max-w-md h-9 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500" placeholder="상품에 적용할 PG가맹점 아이디(MID)를 입력해주세요." />
                 </FormRow>
               )}
            </div>

            {viewMode === 'BEFORE' && (
              <>
                <SectionHeader title="연동 및 기타" />
                <div className="border-t border-gray-200 mt-2">
                   <FormRow label="공연 상품여부">
                      <div className="flex items-center gap-6">
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="perf" className="text-purple-600 focus:ring-purple-500 border-gray-300" /> <span className="text-sm text-gray-700">사용</span></label>
                         <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="perf" className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked /> <span className="text-sm text-gray-700">미사용</span></label>
                      </div>
                   </FormRow>
                   {isSessionProduct && (
                       <FormRow label="주중/주말 구분" required className="py-4">
                          <div className="w-full bg-white border border-gray-300">
                             <div className="grid grid-cols-12 bg-purple-50/50 border-b border-gray-300 text-xs font-bold text-gray-700 h-9 items-center">
                                 <div className="col-span-2 pl-4 border-r border-gray-300 h-full flex items-center bg-gray-100">요일</div>
                                 <div className="col-span-5 pl-4 border-r border-gray-300 h-full flex items-center bg-gray-50">주중</div>
                                 <div className="col-span-5 pl-4 h-full flex items-center bg-gray-50">주말</div>
                             </div>
                             {['월', '화', '수', '목', '금', '토', '일'].map((day) => {
                                 const isWeekendDay = ['토', '일'].includes(day);
                                 return (
                                     <div key={day} className="grid grid-cols-12 border-b border-gray-200 last:border-0 text-sm h-10 items-center hover:bg-gray-50">
                                         <div className="col-span-2 pl-4 border-r border-gray-300 h-full flex items-center bg-white">{day}</div>
                                         <div className="col-span-5 pl-4 border-r border-gray-300 h-full flex items-center">
                                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`day_type_${day}`} className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked={!isWeekendDay} /> <span className="text-sm text-gray-700">주중</span></label>
                                         </div>
                                         <div className="col-span-5 pl-4 h-full flex items-center">
                                             <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`day_type_${day}`} className="text-purple-600 focus:ring-purple-500 border-gray-300" defaultChecked={isWeekendDay} /> <span className="text-sm text-gray-700">주말</span></label>
                                         </div>
                                     </div>
                                 );
                             })}
                          </div>
                       </FormRow>
                   )}
                </div>
              </>
            )}

            <div className="mt-10 flex justify-center gap-3">
               <button onClick={handleSave} className="px-10 py-3 bg-purple-600 text-white rounded-md font-bold text-sm shadow hover:bg-purple-700 transition-colors">저장</button>
               <button onClick={() => onNavigate('/products/register')} className="px-10 py-3 bg-gray-700 text-white rounded-md font-bold text-sm shadow hover:bg-gray-800 transition-colors">취소</button>
            </div>
          </>
        )}

        {activeTab === 'ticket_type' && <TicketTypeTab />}
        
        {activeTab === 'etc' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SectionHeader title="구매 제한 설정" />
            <div className="border-t border-gray-200 mt-2">
              <FormRow label="1회 구매가능 매수" required>
                <input type="text" defaultValue="9" className="form-input w-full max-w-2xl h-9 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
              </FormRow>
              <FormRow label="휴대폰 번복 제한">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="phone_limit" checked={phoneLimitUsage === 'used'} onChange={() => setPhoneLimitUsage('used')} className="text-purple-600 focus:ring-purple-500 border-gray-300" />
                    <span className="text-sm text-gray-700 whitespace-nowrap">사용 상품 당</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-input w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm disabled:bg-gray-100 disabled:text-gray-400" 
                    disabled={phoneLimitUsage === 'unused'}
                  />
                  <span className="text-sm text-gray-700">회</span>
                  <label className="flex items-center gap-2 cursor-pointer ml-4">
                    <input type="radio" name="phone_limit" checked={phoneLimitUsage === 'unused'} onChange={() => setPhoneLimitUsage('unused')} className="text-purple-600 focus:ring-purple-500 border-gray-300" />
                    <span className="text-sm text-gray-700 whitespace-nowrap">사용 안함</span>
                  </label>
                  <span className="text-pink-500 text-xs ml-2">*사용 안함 시 동일 휴대폰 번호로 제한 없이 예매가능.</span>
                </div>
              </FormRow>
              <FormRow label="중복 구매 매수 제한">
                <div className="flex items-center gap-2">
                  <select 
                    className="form-select h-8 w-32 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"
                    value={duplicateLimitType}
                    onChange={(e) => setDuplicateLimitType(e.target.value)}
                  >
                    <option value="제한없음">제한없음</option>
                    <option value="상품별">상품별</option>
                    <option value="업체별">업체별</option>
                  </select>
                  <input 
                    type="text" 
                    defaultValue="0" 
                    className="form-input w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm disabled:bg-gray-100 disabled:text-gray-400" 
                    disabled={duplicateLimitType === '제한없음'}
                  />
                  <span className="text-sm text-gray-700">매</span>
                  <span className="text-pink-500 text-xs ml-2">*국문페이지는 동일 휴대폰번호 기준, 다국어페이지는 동일 이메일 기준으로 중복 제한됩니다.</span>
                </div>
              </FormRow>
              <FormRow label="개인정보 제3자 제공받는자">
                <input type="text" className="form-input w-full max-w-2xl h-9 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" placeholder="최대 30자까지 작성 가능합니다." />
              </FormRow>
              
              {(viewMode === 'BEFORE' || (viewMode === 'AFTER' && showImmediateEntryCheck)) && (
                <>
                  <FormRow label="바로 입장 사용여부" badge={viewMode === 'AFTER' ? <DevBadge type="new" text="바로 입장 검표 사용 시 노출" /> : null}>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="direct_entry" className="text-purple-600 focus:ring-purple-500 border-gray-300" />
                        <span className="text-sm text-gray-700">사용</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="direct_entry" defaultChecked className="text-purple-600 focus:ring-purple-500 border-gray-300" />
                        <span className="text-sm text-gray-700">사용 안함</span>
                      </label>
                    </div>
                  </FormRow>
                  <FormRow label="바로 입장 이미지 (270x154px)">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-pink-500 text-xs">* 3MB까지 업로드 가능.</span>
                      <div className="flex gap-2 items-center">
                        <button className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">파일선택</button>
                        <span className="text-gray-400 text-xs">선택된 파일 없음</span>
                      </div>
                    </div>
                  </FormRow>
                </>
              )}

              <FormRow label="다회권 유효기간">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">검표 당일 ~</span>
                  <input type="text" defaultValue="0" className="form-input w-12 h-8 text-center border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm" />
                  <span className="text-sm text-gray-700">일 이후 까지</span>
                  <span className="text-pink-500 text-xs ml-6">일자상품의 다회권은 해당일에만 사용 가능합니다.</span>
                </div>
              </FormRow>

              {viewMode === 'BEFORE' ? (
                <FormRow label="쿠폰 사용여부">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="coupon_use" className="text-purple-600 focus:ring-purple-500 border-gray-300" />
                      <span className="text-sm text-gray-700">사용</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="coupon_use" defaultChecked className="text-purple-600 focus:ring-purple-500 border-gray-300" />
                      <span className="text-sm text-gray-700">사용 안함</span>
                    </label>
                  </div>
                </FormRow>
              ) : (
                <div className="hidden">/* 쿠폰 사용여부 제거됨 (모델 1,2 미사용) */</div>
              )}
            </div>

            <SectionHeader title="예약완료 알림톡 설정" />
            <div className="border-t border-gray-200 mt-2">
              <FormRow label="채널명">
                <input type="text" defaultValue="스마틱스" disabled className="form-input w-56 h-9 text-sm border border-gray-300 rounded bg-gray-50 text-gray-500 px-2" />
              </FormRow>
              <FormRow label="채널 프로필키">
                <input type="text" defaultValue="aa31a63c397b67e2ad6654314d463ed2c804adf3" disabled className="form-input w-full max-w-2xl h-9 text-sm border border-gray-300 rounded bg-gray-50 text-gray-500 px-2" />
              </FormRow>
              <FormRow label="예매완료 템플릿">
                <div className="flex items-center gap-2 w-full">
                  <input type="text" className="form-input w-48 h-9 border border-gray-300 rounded bg-gray-50" disabled />
                  <input type="text" className="form-input flex-1 h-9 border border-gray-300 rounded bg-gray-50 max-w-lg" disabled />
                  <button className="px-4 py-2 bg-gray-800 text-white rounded text-xs font-bold hover:bg-gray-900 transition-colors">템플릿 찾기</button>
                </div>
              </FormRow>
              <FormRow label="템플릿 내용" className="!p-0 border-r-0">
                <div className="flex flex-col w-full">
                  <div className="bg-[#dee2e6] text-[#495057] text-center text-xs font-bold py-1.5 border-b border-gray-200">템플릿 내용</div>
                  <div className="p-4 bg-white">
                    <textarea className="w-full h-40 p-3 border border-gray-300 rounded bg-gray-50 resize-none outline-none" readOnly></textarea>
                  </div>
                </div>
              </FormRow>
              <FormRow label="예매완료 알림톡 유의사항 (최대 500자)">
                <textarea className="w-full h-32 p-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 resize-none outline-none text-sm"></textarea>
              </FormRow>
            </div>

            <SectionHeader title="모바일 티켓 설정" />
            <div className="border-t border-gray-200 mt-2">
              <FormRow label="모바일티켓 사용여부">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="mt_use" defaultChecked className="text-purple-600 focus:ring-purple-500" /> <span className="text-sm">사용</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="mt_use" className="text-purple-600 focus:ring-purple-500" /> <span className="text-sm">사용 안함</span></label>
                </div>
              </FormRow>
              <FormRow label="모바일티켓 유형">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="mt_type" defaultChecked className="text-purple-600 focus:ring-purple-500" /> <span className="text-sm">낱장</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="mt_type" className="text-purple-600 focus:ring-purple-500" /> <span className="text-sm">묶음</span></label>
                </div>
              </FormRow>
              <FormRow label="검표 비밀패턴 설정" required>
                <div className="flex items-center gap-3">
                  <input type="text" className="form-input w-24 h-8 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                  <span className="text-[#f06595] text-xs font-medium">* A,B,C,D 4개 문자 조합하여 2~6자리 까지 입력 가능 합니다.</span>
                </div>
              </FormRow>
              <FormRow 
                label="검표 가능 매표소 설정"
                badge={
                  <button 
                    onClick={() => setHasBoothData(!hasBoothData)}
                    className="mt-1 px-2 py-1 bg-gray-200 text-[10px] font-bold text-gray-600 rounded hover:bg-gray-300 transition-colors border border-gray-300 shadow-sm"
                  >
                    데이터 {hasBoothData ? '미노출' : '노출'} 확인
                  </button>
                }
              >
                <div className="w-full border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead className="bg-[#dee2e6] border-b border-gray-300 text-[#495057] font-bold">
                      <tr className="h-8">
                        <th className="w-16 border-r border-white"><input type="checkbox" className="rounded text-purple-600" /></th>
                        <th className="border-r border-white px-4 text-left font-bold">매표소명</th>
                        <th className="w-32 font-bold px-4">검표 중복사용 여부</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {hasBoothData ? (
                        <>
                          <tr className="hover:bg-gray-50 transition-colors h-9">
                            <td className="border-r border-gray-200"><input type="checkbox" className="rounded text-purple-600" /></td>
                            <td className="border-r border-gray-200 text-left px-4 text-gray-700">중복검표 가능</td>
                            <td className="px-4 text-gray-600">사용</td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors h-9">
                            <td className="border-r border-gray-200"><input type="checkbox" className="rounded text-purple-600" /></td>
                            <td className="border-r border-gray-200 text-left px-4 text-gray-700">중복검표 불가능</td>
                            <td className="px-4 text-gray-600">미사용</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-10 text-gray-400 italic">등록된 매표소가 없습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </FormRow>
            </div>

            {viewMode === 'BEFORE' ? (
              <>
                <SectionHeader title="채널판매 설정" />
                <div className="border-t border-gray-200 mt-2">
                  <FormRow label="TCM 연동 여부">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="tcm_sync" className="text-purple-600 focus:ring-purple-500" /> <span className="text-sm">Yes</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="tcm_sync" defaultChecked className="text-purple-600 focus:ring-purple-500" /> <span className="text-sm">No</span></label>
                      <span className="text-[#f06595] text-xs font-medium">* 사용 시, 예매/취소 내역이 TCM으로 연동 됩니다.</span>
                    </div>
                  </FormRow>
                  <FormRow label="TCM 상품번호">
                    <div className="flex items-center gap-3">
                      <input type="text" className="form-input w-48 h-9 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                      <span className="text-[#f06595] text-xs font-medium">숫자만 가능</span>
                    </div>
                  </FormRow>
                  <FormRow label="TCM 채널">
                    <select className="form-select h-9 w-48 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500">
                      <option value="선택">선택</option>
                      <option value="메이크 2.0">메이크 2.0</option>
                    </select>
                  </FormRow>
                  <FormRow label="TCM 업체번호">
                    <div className="flex items-center gap-3">
                      <input type="text" className="form-input w-48 h-9 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                      <span className="text-[#f06595] text-xs font-medium">* 예약연동시 필요한 TCM 업체 번호 입니다. (숫자만 가능)</span>
                    </div>
                  </FormRow>
                  <FormRow label="TCM 사용처리 업체번호">
                    <div className="flex items-center gap-3">
                      <input type="text" className="form-input w-48 h-9 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                      <span className="text-[#f06595] text-xs font-medium">* 발권/검표/예약확정 사용 시 필요한 TCM 업체 번호 입니다. (숫자만 가능)</span>
                    </div>
                  </FormRow>
                  <FormRow label="예매완료 문자 발송 주체">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="msg_host" className="text-purple-600" /> <span className="text-sm">Yes(TCM에서 발송)</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="msg_host" defaultChecked className="text-purple-600" /> <span className="text-sm">No(메이크티켓에서 발송)</span></label>
                    </div>
                  </FormRow>
                  <FormRow label="모바일티켓 QR코드">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="qr_type" defaultChecked className="text-purple-600" /> <span className="text-sm">메이크티켓 QR</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="qr_type" className="text-purple-600" /> <span className="text-sm">TCM QR</span></label>
                      <span className="text-[#f06595] text-xs font-medium">* TCM QR은 개별 QR로 노출됩니다.</span>
                    </div>
                  </FormRow>
                  <FormRow label="상품 연동 업체">
                    <select className="form-select h-9 w-48 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500">
                      <option value="선택">선택</option>
                      <option value="인터파크">인터파크</option>
                    </select>
                  </FormRow>
                  <FormRow label="예약확정 사용여부">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="reserve_confirm" checked={reserveConfirmUsage === '사용'} onChange={() => setReserveConfirmUsage('사용')} className="text-purple-600 focus:ring-purple-500" /> <span className="text-sm">사용</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="reserve_confirm" checked={reserveConfirmUsage === '미사용'} onChange={() => setReserveConfirmUsage('미사용')} className="text-purple-600 focus:ring-purple-500" /> <span className="text-sm">미사용</span></label>
                      <span className="text-[#f06595] text-xs font-medium">* 사용 시, TCM 예약확정 전용 상품으로 설정되어 Front 예매가 불가합니다.</span>
                    </div>
                  </FormRow>
                  <FormRow label="예약확정 상품유형">
                    <select 
                      className="form-select h-9 w-48 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-400"
                      disabled={reserveConfirmUsage === '미사용'}
                    >
                      <option value="선택">선택</option>
                      <option value="일반">일반</option>
                      <option value="선박">선박</option>
                      <option value="마라톤 개인">마라톤 개인</option>
                      <option value="마라톤 단체">마라톤 단체</option>
                    </select>
                  </FormRow>
                  <FormRow label="예약확정 구매가능 일자">
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        defaultValue="0" 
                        className="form-input w-48 h-9 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2 disabled:bg-gray-100 disabled:text-gray-400" 
                        disabled={reserveConfirmUsage === '미사용'}
                      />
                      <span className="text-[#f06595] text-xs font-medium">* 0 입력시 제한 없음.</span>
                    </div>
                  </FormRow>
                </div>
              </>
            ) : (
              <div className="hidden">/* 채널판매 설정 섹션 제거됨 (모델 1,2 미사용) */</div>
            )}

            {viewMode === 'BEFORE' ? (
              <>
                <SectionHeader title="장소(지점) 설정" />
                <div className="border-t border-gray-200 mt-2">
                  <FormRow label="장소(지점) 노출여부">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="loc_show" className="text-purple-600 focus:ring-purple-500" /> <span className="text-sm">사용</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="loc_show" defaultChecked className="text-purple-600" /> <span className="text-sm">미사용</span></label>
                    </div>
                  </FormRow>
                  <FormRow label="전화번호" required>
                    <input type="text" className="form-input w-full max-w-2xl h-9 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                  </FormRow>
                  <FormRow label="주소" required className="py-3">
                    <div className="w-full max-w-3xl flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input type="text" className="form-input w-64 h-9 border border-gray-300 rounded bg-gray-50 text-gray-600 px-2" readOnly />
                        <button className="px-4 py-1.5 border border-[#8b5cf6] text-[#8b5cf6] text-xs font-bold rounded hover:bg-purple-50 transition-colors">주소찾기</button>
                      </div>
                      <input type="text" className="form-input w-full h-9 border border-gray-300 rounded bg-gray-50 px-2" readOnly />
                      <input type="text" className="form-input w-full h-9 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 px-2" />
                    </div>
                  </FormRow>
                  <FormRow label="운영시간 (최대 100자)">
                    <textarea className="w-full h-20 p-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 resize-none outline-none text-sm"></textarea>
                  </FormRow>
                  <FormRow label="안내 문구 (최대 300자)">
                    <textarea className="w-full h-32 p-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 resize-none outline-none text-sm"></textarea>
                  </FormRow>
                </div>
              </>
            ) : (
              <div className="hidden">/* 장소(지점) 설정 섹션 제거됨 (모델 1,2 미사용) */</div>
            )}

            <SectionHeader title="시설 발권 옵션" />
            <div className="border-t border-gray-200 mt-2">
              <FormRow label="주차 코드">
                <select className="form-select h-9 w-48 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500">
                  <option value="미사용">미사용</option>
                  <option value="예술의전당">예술의전당</option>
                  <option value="세종문화회관">세종문화회관</option>
                  <option value="충무아트홀">충무아트홀</option>
                  <option value="블루스퀘어">블루스퀘어</option>
                </select>
              </FormRow>
              <FormRow label="입장 전용 코드">
                <select className="form-select h-9 w-48 text-sm border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500">
                  <option value="미사용">미사용</option>
                  <option value="예술의 전당">예술의 전당</option>
                </select>
              </FormRow>
            </div>
            
            <div className="mt-12 flex justify-center gap-3">
               <button onClick={handleSave} className="px-14 py-3 bg-[#6d28d9] text-white rounded font-bold text-sm shadow hover:bg-purple-800 transition-colors">저장</button>
               <button onClick={() => onNavigate('/products/list')} className="px-14 py-3 bg-[#334155] text-white rounded font-bold text-sm shadow hover:bg-slate-800 transition-colors">취소</button>
            </div>
          </div>
        )}

      </div>
      {isTicketModalOpen && <TicketTypeModal onClose={() => setIsTicketModalOpen(false)} initialData={editingTicket} onSave={handleTicketSave} currentViewMode={viewMode} />}
      {isDescModalOpen && descTicket && <DescriptionModal onClose={() => setIsDescModalOpen(false)} initialData={descTicket} onSave={handleDescriptionSave} />}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[500px] h-[600px] rounded shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50"><span className="font-bold text-gray-800">우편번호 서비스</span><button onClick={() => setIsAddressModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button></div>
            <div className="p-4 border-b border-gray-200"><div className="relative"><input type="text" placeholder="예) 판교역로 166, 분당 주공, 백현동 532" className="w-full h-10 pl-4 pr-10 border border-purple-500 rounded focus:outline-none" autoFocus /><button className="absolute right-3 top-2.5 text-purple-600"><Search size={20} /></button></div></div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50"><div className="border-t border-gray-200 pt-4"><p className="text-xs text-gray-500 mb-2">검색 결과 예시 (클릭하여 선택)</p><button onClick={() => handleAddressSelect('13494', '경기 성남시 분당구 판교역로 166')} className="w-full text-left p-3 bg-white border border-gray-200 rounded hover:border-purple-500 hover:shadow-sm mb-2 group transition-all"><div className="text-xs font-bold text-gray-800 group-hover:text-purple-700">[13494] 경기 성남시 분당구 판교역로 166</div><div className="text-xs text-gray-500 mt-1">분당 카카오 판교 아지트</div></button></div></div>
          </div>
        </div>
      )}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[600px] rounded shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-purple-600 text-white"><span className="font-bold text-lg">상품 유형</span><button onClick={() => setIsTypeModalOpen(false)} className="text-white hover:text-purple-200"><X size={24} /></button></div>
            <div className="p-6">
               <div className="border-t border-gray-200">
                  {[{ label: '전자결제 사용여부', value: registerConfig.useElectronicPayment, options: ['전자결제 사용', '전자결제 미사용'] }, { label: '상품 날짜선택', value: registerConfig.dateType, options: ['일자(회차)상품', '기간상품'] }, { label: '최대판매수량 선택', value: registerConfig.maxSalesLimit, options: ['상품 기간 수량 제한', '제한없음', '일자(회차)별 수량 제한', '권종별 수량 제한'] }, { label: '티켓 출력 유형', value: registerConfig.ticketType, options: ['지류티켓', '영수증티켓', '손목밴드티켓'] }].map((row, idx) => (
                    <div key={idx} className="flex border-b border-gray-200 min-h-[50px]">
                       <div className="w-40 bg-gray-50 px-4 py-3 flex items-center text-xs font-semibold text-gray-700 border-r border-gray-200 shrink-0">{row.label}</div>
                       <div className="flex-1 px-4 py-3 flex items-center gap-6">
                          {row.options.map(opt => {
                             const isChecked = row.value === opt;
                             if (!isChecked && row.label === '최대판매수량 선택' && !['상품 기간 수량 제한', '제한없음'].includes(opt) && !['일자(회차)별 수량 제한', '권종별 수량 제한'].includes(opt)) return null;
                             return (<label key={opt} className={`flex items-center gap-2 cursor-not-allowed opacity-70 ${isChecked ? 'opacity-100 font-medium text-purple-700' : ''}`}><input type="radio" checked={isChecked} readOnly disabled className="text-gray-500 border-gray-300 bg-gray-100"/> <span className="text-sm">{opt}</span></label>);
                          })}
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-8 flex justify-center"><button onClick={() => setIsTypeModalOpen(false)} className="px-8 py-2.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium text-sm transition-colors">닫기</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;