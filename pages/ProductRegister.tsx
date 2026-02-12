import React, { useState } from 'react';
import { Eye, EyeOff, AlertTriangle, Info } from 'lucide-react';

interface ProductRegisterProps {
  onNavigate: (path: string) => void;
  showDevGuides?: boolean;
  formData: any;
  setFormData: (data: any) => void;
}

const ProductRegister: React.FC<ProductRegisterProps> = ({ onNavigate, showDevGuides = false, formData, setFormData }) => {
  // Extended product type options
  const productTypeOptions = [
    '입장권', '패키지', '연간이용권', '단체 상품', '체험 상품', 
    '카바나', '공연', '패스트트랙', 'F&B', 'MD상품', '대여 상품', '주차장 상품'
  ];

  // State to toggle hidden fields visibility manually
  const [forceReveal, setForceReveal] = useState(false);

  const handleChange = (key: string, value: string) => {
    // [MODIFIED] Handle side-effects for dateType change
    if (key === 'dateType') {
        const defaultMaxSales = value === '일자(회차)상품' 
            ? '일자(회차)별 수량 제한' 
            : '제한없음';
        setFormData((prev: any) => ({ ...prev, [key]: value, maxSalesLimit: defaultMaxSales }));
    } else {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckType = () => {
    setForceReveal(!forceReveal);
  };

  const handleSave = () => {
    // Navigate to the Detailed Form Page (ProductForm)
    onNavigate('/products/register/form');
  };

  const RadioGroup = ({ name, options, value, onChange, disabled = false }: { name: string, options: string[], value: string, onChange: (val: string) => void, disabled?: boolean }) => (
    <div className="flex flex-wrap items-center gap-4 gap-y-2">
      {options.map((opt: string) => (
        <label key={opt} className={`flex items-center group ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
          <div className="relative flex items-center justify-center w-4 h-4 mr-2">
            <input
              type="radio"
              name={name}
              className={`
                peer appearance-none w-4 h-4 border border-gray-300 rounded-full 
                checked:border-purple-600 checked:border-4 
                transition-all outline-none
                ${disabled ? 'bg-gray-100 checked:border-gray-500' : 'focus:ring-2 focus:ring-purple-200'}
              `}
              checked={value === opt}
              onChange={() => !disabled && onChange(opt)}
              disabled={disabled}
            />
          </div>
          <span className={`text-sm group-hover:text-gray-900 ${value === opt ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
            {opt}
          </span>
        </label>
      ))}
    </div>
  );

  // [MODIFIED] Dynamic options based on dateType
  const maxSalesLimitOptions = formData.dateType === '일자(회차)상품' 
    ? ['일자(회차)별 수량 제한', '권종별 수량 제한'] 
    : ['제한없음', '상품 기간 수량 제한'];

  return (
    <div className="p-6 max-w-[1600px] mx-auto relative">
      {/* Dev Guide Banner */}
      {showDevGuides && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3 text-sm text-orange-800 animate-pulse">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">🛠️ 개발 가이드: 기본값 설정 및 숨김 처리</p>
            <p>1. 상품 유형은 <strong>'입장권'</strong>이 기본 선택되어야 합니다.</p>
            <p>2. 상품 유형 선택 UI는 운영자에게 노출되지 않도록 <strong>숨김(Hidden)</strong> 처리합니다.</p>
          </div>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">상품 유형 선택</h2>
        <div className="text-sm text-gray-500">
          <span className="cursor-pointer hover:text-purple-700">상품관리</span>
          <span className="mx-2 text-gray-300">›</span>
          <span className="text-purple-700 font-medium">상품 등록/수정</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        
        {/* Form Header with Verification Button */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-700">상품 기본 정보</h3>
                {!showDevGuides && !forceReveal && (
                    <span className="text-xs text-gray-400 font-normal flex items-center gap-1">
                        <Info size={12} />
                        입장권 상품 자동 선택됨
                    </span>
                )}
            </div>
            
            {/* Verification Button - Safe placement in header */}
            <div className="flex items-center gap-2">
                 {showDevGuides && (
                    <span className="text-[10px] font-bold bg-orange-600 text-white px-2 py-0.5 rounded shadow-sm">
                        Dev Mode
                    </span>
                 )}
                 <button 
                    onClick={handleCheckType}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all shadow-sm active:bg-gray-50
                      ${forceReveal 
                        ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700' 
                        : 'bg-white text-gray-600 border-gray-300 hover:text-purple-700 hover:border-purple-300'}
                    `}
                    title="숨겨진 상품 유형 필드 토글"
                  >
                    {forceReveal ? <EyeOff size={14} /> : <Eye size={14} />}
                    {forceReveal ? '유형 숨기기' : '선택된 유형 확인'}
                  </button>
            </div>
        </div>

        <div className="border-b border-gray-200">
           {/* Form Rows */}
           {[
             { 
                label: '상품유형', 
                key: 'productType', 
                options: productTypeOptions,
                isHidden: !showDevGuides && !forceReveal, 
                isDevHidden: showDevGuides && !forceReveal,
                disabled: true 
             },
             { label: '전자결제 사용여부', key: 'useElectronicPayment', options: ['전자결제 사용', '전자결제 미사용'] },
             { label: '상품 날짜선택', key: 'dateType', options: ['일자(회차)상품', '기간상품'] },
             { label: '최대판매수량 선택', key: 'maxSalesLimit', options: maxSalesLimitOptions },
             { label: '현장 티켓 출력 유형', key: 'ticketType', options: ['지류티켓', '영수증티켓', '손목밴드티켓'] },
             { label: '상품보안코드 사용여부', key: 'useSecurityCode', options: ['보안코드 미사용', '보안코드 사용'] },
           ].map((row) => (
             <div 
               key={row.key} 
               className={`
                 flex border-b border-gray-100 last:border-0 min-h-[64px] relative transition-all duration-300
                 ${row.isHidden ? 'hidden' : ''}
                 ${row.isDevHidden ? 'opacity-50 grayscale bg-gray-100 border-2 border-dashed border-orange-300' : ''}
                 ${forceReveal && row.key === 'productType' ? 'bg-purple-50 ring-2 ring-inset ring-purple-100' : ''}
               `}
             >
               {/* Dev Guide Overlay for Hidden Row */}
               {row.isDevHidden && (
                 <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                   <div className="bg-orange-600 text-white px-4 py-1 rounded shadow-lg font-bold text-sm transform -rotate-1 border border-white opacity-90">
                     ⚠️ DEVELOPER NOTICE: HIDDEN IN PROD
                   </div>
                 </div>
               )}

               <div className="w-56 bg-gray-50 px-6 flex items-center text-sm font-semibold text-gray-700 border-r border-gray-100 shrink-0">
                 {row.label} <span className="text-red-500 ml-1">*</span>
               </div>
               <div className="flex-1 px-6 py-4 flex items-center bg-white">
                 <RadioGroup 
                    name={row.key} 
                    options={row.options} 
                    value={formData[row.key as keyof typeof formData]} 
                    onChange={(val: string) => handleChange(row.key, val)}
                    disabled={row.disabled} 
                 />
               </div>
             </div>
           ))}
        </div>

        {/* Footer Actions */}
        <div className="p-8 flex justify-center gap-3 bg-gray-50/30">
           <button 
             onClick={handleSave}
             className="min-w-[120px] px-6 py-3 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 transition-all shadow-md text-sm tracking-wide"
           >
             저장
           </button>
           <button 
             onClick={() => onNavigate('/products/list')} 
             className="min-w-[120px] px-6 py-3 bg-gray-700 text-white rounded font-bold hover:bg-gray-800 transition-all shadow-md text-sm tracking-wide"
           >
             취소
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProductRegister;