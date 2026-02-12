
import React, { useState, useEffect } from 'react';
import { Search, LayoutTemplate, ToggleLeft, ToggleRight, AlertCircle, ChevronLeft, ChevronRight, X, Eye, EyeOff, RotateCcw, Bug } from 'lucide-react';

interface AdminUser {
  id: number;
  role: string;
  name: string;
  email: string;
  phone: string;
  loginFailCount: number; // Added for Edit Modal
}

interface Product {
  id: string;
  code: string;
  name: string;
  status: string;
  category: string;
  dateType: string;
  productPeriod: string;
  salesPeriod: string;
}

const MOCK_ADMINS_INIT: AdminUser[] = [
  { id: 1, role: '업체 관리자', name: '김철수', email: 'cskim@test.co.kr', phone: '01012345678', loginFailCount: 0 },
  { id: 2, role: '업체 사용자', name: '이영희', email: 'yhlee@test.co.kr', phone: '01098765432', loginFailCount: 3 },
  { id: 3, role: '업체 사용자', name: '박민수', email: 'mspark@test.co.kr', phone: '01055556666', loginFailCount: 0 },
  { id: 4, role: '업체 사용자', name: '최지은', email: 'jechoi@test.co.kr', phone: '01077778888', loginFailCount: 1 },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', code: 'GDHGSQsi', name: 'GD2302977', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', productPeriod: '2023-03-15 00:00\n2030-12-31 00:00', salesPeriod: '2023-03-15 00:00\n2030-12-31 00:00' },
  { id: '2', code: 'GDgfJsug', name: 'GD2400661', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', productPeriod: '2023-03-15 00:00\n2030-12-31 00:00', salesPeriod: '2023-03-15 00:00\n2030-12-31 00:00' },
  { id: '3', code: 'GDdMXVCQ', name: 'GD2302999', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', productPeriod: '2023-03-15 00:00\n2030-12-31 00:00', salesPeriod: '2023-03-15 00:00\n2030-12-31 00:00' },
  { id: '4', code: 'GD2600507', name: 'tcm-예약확정테스트', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', productPeriod: '2026-02-01 00:00\n2026-03-02 00:00', salesPeriod: '2026-02-01 00:00\n2026-03-02 00:00' },
  { id: '5', code: 'GD2503452', name: '권종별상품_A', status: '판매중', category: '일반상품', dateType: '권종별 수량 제한', productPeriod: '2025-12-31 00:00\n2026-02-28 00:00', salesPeriod: '2025-12-31 00:00\n2026-02-28 00:00' },
  { id: '6', code: 'GD2503442', name: '스케줄테스트상품_A', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', productPeriod: '2025-12-31 00:00\n2026-02-28 00:00', salesPeriod: '2025-12-31 00:00\n2026-02-28 00:00' },
  { id: '7', code: 'GD2400661', name: '!!!', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', productPeriod: '2023-03-15 00:00\n2030-12-31 00:00', salesPeriod: '2023-03-15 00:00\n2030-12-31 00:00' },
  { id: '8', code: 'GD2302999', name: '스타벅스 문래역점', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', productPeriod: '2025-08-19 09:00\n2030-12-31 23:00', salesPeriod: '2025-08-19 09:00\n2030-12-31 23:00' },
  { id: '9', code: 'GD2302984', name: '이디야 문래역점', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', productPeriod: '2023-03-15 00:00\n2030-12-31 00:00', salesPeriod: '2023-03-15 00:00\n2030-12-31 00:00' },
  { id: '10', code: 'GD2302977', name: '공차 문래역점', status: '판매중', category: '일반상품', dateType: '일자(회차)별 수량 제한', productPeriod: '2023-03-15 00:00\n2030-12-31 00:00', salesPeriod: '2023-03-15 00:00\n2030-12-31 00:00' },
];

const AdminStaff: React.FC = () => {
  const [viewMode, setViewMode] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const isAfter = viewMode === 'AFTER';
  
  // Admin List Search State
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminSearchType, setAdminSearchType] = useState('name'); // Default 'name'
  const [filteredAdminList, setFilteredAdminList] = useState<AdminUser[]>(MOCK_ADMINS_INIT);
  const [adminList, setAdminList] = useState<AdminUser[]>(MOCK_ADMINS_INIT);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'REGISTER' | 'EDIT'>('REGISTER');
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: '',
    loginFailCount: 0
  });

  // Product Add Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Product Search State (Separated for Before/After logic)
  const [productSearchInput, setProductSearchInput] = useState(''); // Input value
  const [activeProductSearchTerm, setActiveProductSearchTerm] = useState(''); // Actual filter term
  const [productStatusFilter, setProductStatusFilter] = useState('판매중');
  const [productSearchType, setProductSearchType] = useState('상품명');

  // Confirm & Alert Modal States
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, targetId?: number}>({
    isOpen: false, message: '', targetId: undefined
  });
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, message: string}>({
    isOpen: false, message: ''
  });

  // Update filtered list when source list changes
  useEffect(() => {
    setFilteredAdminList(adminList);
  }, [adminList]);

  // Product Search Logic - Effect for After Mode (Live Search)
  useEffect(() => {
    if (isAfter) {
        setActiveProductSearchTerm(productSearchInput);
    }
  }, [productSearchInput, isAfter]);

  // Admin List Search Logic
  const handleAdminSearch = () => {
    const term = adminSearchTerm.trim().toLowerCase();
    if (!term) {
        setFilteredAdminList(adminList);
        return;
    }

    const filtered = adminList.filter(user => {
        if (adminSearchType === 'name') return user.name.toLowerCase().includes(term);
        if (adminSearchType === 'email') return user.email.toLowerCase().includes(term);
        if (adminSearchType === 'phone') return user.phone.includes(term);
        return false;
    });
    setFilteredAdminList(filtered);
  };

  // Filtered Products Logic
  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    // 1. Status Filter
    if (productStatusFilter !== '전체' && product.status !== productStatusFilter) {
        return false;
    }
    // 2. Search Filter (Using activeProductSearchTerm)
    if (activeProductSearchTerm.trim()) {
        const term = activeProductSearchTerm.trim();
        if (productSearchType === '상품명' && !product.name.includes(term)) return false;
        if (productSearchType === '상품코드' && !product.code.includes(term)) return false;
    }
    return true;
  });

  const handleOpenRegister = () => {
    setModalType('REGISTER');
    setFormData({ name: '', phone: '', email: '', password: '', role: '', loginFailCount: 0 });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setModalType('EDIT');
    setEditTargetId(user.id);
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: '', // Edit mode starts with empty password
      role: user.role,
      loginFailCount: user.loginFailCount
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenProductAdd = () => {
    setSelectedProductIds([]);
    setProductSearchInput('');
    setActiveProductSearchTerm('');
    setProductStatusFilter('판매중');
    setProductSearchType('상품명');
    setIsProductModalOpen(true);
  };

  const handleProductSearchClick = () => {
    setActiveProductSearchTerm(productSearchInput);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Phone number validation for After mode
    if (isAfter && name === 'phone') {
        const numbersOnly = value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, [name]: numbersOnly }));
        return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Validation
    if (!formData.name || !formData.phone || !formData.email || !formData.role) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
    // Password required only for Register
    if (modalType === 'REGISTER' && !formData.password) {
        alert('비밀번호를 입력해주세요.');
        return;
    }

    if (modalType === 'REGISTER') {
        const newId = adminList.length > 0 ? Math.max(...adminList.map(u => u.id)) + 1 : 1;
        const newUser: AdminUser = {
          id: newId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          loginFailCount: 0
        };
        setAdminList(prev => [...prev, newUser]);
        alert('저장되었습니다.');
    } else {
        // Update Existing
        setAdminList(prev => prev.map(u => u.id === editTargetId ? {
            ...u,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            role: formData.role,
            loginFailCount: formData.loginFailCount
        } : u));
        alert('수정되었습니다.');
    }

    setIsModalOpen(false);
  };

  const handleResetLoginFail = () => {
    setFormData(prev => ({ ...prev, loginFailCount: 0 }));
  };

  // 임시 비밀번호 발송 핸들러
  const handleSendPasswordClick = (id: number) => {
    const message = isAfter 
        ? '임시 비밀번호를 발송하시겠습니까?' 
        : '임시비밀번호를 발송하시겠습니까?';
    setConfirmModal({ isOpen: true, message, targetId: id });
  };

  // 임시 비밀번호 발송 확인 처리
  const processSendPassword = () => {
    setConfirmModal({ ...confirmModal, isOpen: false, targetId: undefined });
    
    const message = isAfter
        ? '임시 비밀번호가 발송되었습니다.'
        : '임시비밀번호가 발송되었습니다.';
    
    setTimeout(() => {
        setAlertModal({ isOpen: true, message });
    }, 100);
  };

  const toggleProductSelect = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleProductCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        // 현재 필터링된 목록의 모든 ID 선택
        const allFilteredIds = filteredProducts.map(p => p.id);
        // 기존 선택된 ID와 병합하여 중복 제거
        setSelectedProductIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    } else {
        // 현재 필터링된 목록의 ID만 해제
        const filteredIds = filteredProducts.map(p => p.id);
        setSelectedProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  const handleProductAddConfirm = () => {
    setIsProductModalOpen(false);
    setAlertModal({ isOpen: true, message: `${selectedProductIds.length}개 상품이 추가되었습니다.` });
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto relative min-h-screen font-['Noto_Sans_KR']">
       {/* View Mode Toggle */}
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

      {isAfter && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3 text-[13px] text-orange-900 animate-in fade-in duration-500">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-orange-600" />
          <div className="space-y-1">
            <p className="font-extrabold text-orange-800 underline decoration-orange-300 underline-offset-4">🛠️ 개발 가이드: 상품 추가 팝업 개선 (Model 1)</p>
            <p>1. <strong>명칭 최적화</strong>: Model 1은 입장권 중심이므로 '상품 카테고리' 컬럼명을 '상품 유형'으로 변경하고, 값 또한 '일반상품' 대신 '입장권'으로 표시하여 직관성을 높입니다.</p>
            <p>2. <strong>실시간 검색(Live Search)</strong>: After 모드에서는 검색어 입력과 동시에 결과가 필터링되어야 합니다. (Before 모드: 조회 버튼 클릭 시 동작)</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">직원 계정관리</h2>
        <div className="text-xs text-gray-400 font-medium">
          <span>관리자</span> <span className="mx-2 text-gray-300">›</span> <span className="text-purple-600 font-bold">직원 계정관리</span>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700 whitespace-nowrap w-12">검색어</span>
                <select 
                    className="form-select text-sm border border-gray-400 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-32"
                    value={adminSearchType}
                    onChange={(e) => setAdminSearchType(e.target.value)}
                >
                    <option value="name">이름</option>
                    <option value="select">선택</option>
                    <option value="email">이메일</option>
                    <option value="phone">전화번호</option>
                </select>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="검색 값을 입력하세요." 
                        className="form-input w-80 text-sm border border-gray-400 rounded-md h-9 pr-10 focus:border-purple-500 focus:ring-purple-500 placeholder:text-gray-400"
                        value={adminSearchTerm}
                        onChange={(e) => setAdminSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminSearch()}
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400 cursor-pointer" size={16} onClick={handleAdminSearch} />
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={handleAdminSearch}
                    className="bg-[#7e22ce] hover:bg-purple-800 text-white px-6 py-1.5 rounded-md text-sm font-bold shadow-sm transition-all"
                >
                    검색
                </button>
                <button className="bg-[#7e22ce] hover:bg-purple-800 text-white px-6 py-1.5 rounded-md text-sm font-bold shadow-sm transition-all">
                    엑셀
                </button>
            </div>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">총 <span className="text-purple-700 font-bold">{filteredAdminList.length}개</span></span>
                <span className="text-gray-200">|</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">페이지 당 데이터건수</span>
                    <select className="form-select text-xs border-gray-300 rounded py-1 px-2 h-8 focus:border-purple-500 focus:ring-purple-500">
                        <option>15</option>
                        <option>30</option>
                        <option>50</option>
                    </select>
                </div>
            </div>
            <button 
                onClick={handleOpenRegister}
                className="px-4 py-1.5 bg-[#f3e8ff] text-[#7e22ce] border border-purple-200 rounded text-xs font-bold hover:bg-purple-100 transition-colors shadow-sm"
            >
                관리자 등록
            </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-center border-collapse">
                <thead className="bg-[#f8f9fa] text-gray-500 font-bold border-b border-gray-200">
                    <tr>
                        <th className="py-3 px-4 w-16">번호</th>
                        <th className="py-3 px-4">권한</th>
                        <th className="py-3 px-4">이름</th>
                        <th className="py-3 px-4">이메일</th>
                        <th className="py-3 px-4">전화번호</th>
                        <th className="py-3 px-4">임시비밀번호</th>
                        <th className="py-3 px-4">관련상품</th>
                        <th className="py-3 px-4 w-32"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredAdminList.length > 0 ? (
                        filteredAdminList.map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-50 transition-colors h-14">
                            <td className="py-2 px-4 text-gray-600">{admin.id}</td>
                            <td className="py-2 px-4 text-gray-600">{admin.role}</td>
                            <td className="py-2 px-4 text-gray-800">{admin.name}</td>
                            <td className="py-2 px-4 text-gray-600">{admin.email}</td>
                            <td className="py-2 px-4 text-gray-600">{admin.phone}</td>
                            <td className="py-2 px-4">
                                <button 
                                    onClick={() => handleSendPasswordClick(admin.id)}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm
                                        ${confirmModal.isOpen && confirmModal.targetId === admin.id 
                                            ? 'bg-[#7e22ce] text-white border border-[#7e22ce]' 
                                            : 'bg-white border border-[#7e22ce] text-[#7e22ce] hover:bg-purple-50'}`}
                                >
                                    발송
                                </button>
                            </td>
                            <td className="py-2 px-4">
                                <button 
                                    onClick={handleOpenProductAdd}
                                    className="px-3 py-1 bg-white border border-[#7e22ce] text-[#7e22ce] rounded text-xs font-medium hover:bg-purple-50 transition-colors"
                                >
                                    상품추가
                                </button>
                            </td>
                            <td className="py-2 px-4">
                                <div className="flex justify-center gap-1">
                                    <button 
                                        onClick={() => handleOpenEdit(admin)}
                                        className="px-3 py-1 bg-white border border-[#7e22ce] text-[#7e22ce] rounded text-xs font-medium hover:bg-purple-50 transition-colors"
                                    >
                                        수정
                                    </button>
                                    <button className="px-3 py-1 bg-white border border-gray-300 text-gray-500 rounded text-xs font-medium hover:bg-gray-50 transition-colors">
                                        삭제
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="py-20 text-center text-gray-400">
                                검색 결과가 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex justify-center bg-white rounded-b-lg">
            <div className="flex items-center gap-1">
                <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 disabled:opacity-50" disabled>
                    <ChevronLeft size={12} />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded bg-[#333] text-white text-xs font-bold">1</button>
                <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50">2</button>
                <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-400">
                    <ChevronRight size={12} />
                </button>
            </div>
        </div>
      </div>

      {/* Product Add Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
            <div className="bg-white w-[1000px] h-[700px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 bg-[#8b5cf6] text-white flex justify-between items-center shrink-0">
                    <span className="font-bold text-lg">상품 추가</span>
                    <button onClick={() => setIsProductModalOpen(false)} className="text-white hover:text-purple-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Filter */}
                <div className="p-5 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">검색어</span>
                        <select 
                            className="form-select text-sm border border-gray-400 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-28"
                            value={productSearchType}
                            onChange={(e) => setProductSearchType(e.target.value)}
                        >
                            <option value="상품명">상품명</option>
                            <option value="상품코드">상품코드</option>
                        </select>
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="검색 값을 입력하세요." 
                                className="form-input w-full text-sm border border-gray-400 rounded-md h-9 pr-10 focus:border-purple-500 focus:ring-purple-500 placeholder:text-gray-400"
                                value={productSearchInput}
                                onChange={(e) => setProductSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleProductSearchClick()}
                            />
                            <Search 
                                className="absolute right-3 top-2.5 text-gray-400 cursor-pointer" 
                                size={16} 
                                onClick={handleProductSearchClick}
                            />
                        </div>
                        
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap ml-4">판매상태</span>
                        <select 
                            className="form-select text-sm border border-gray-400 rounded-md h-9 focus:border-purple-500 focus:ring-purple-500 w-32"
                            value={productStatusFilter}
                            onChange={(e) => setProductStatusFilter(e.target.value)}
                        >
                            <option value="전체">전체</option>
                            <option value="판매중">판매중</option>
                            <option value="판매일시중지">판매일시중지</option>
                            <option value="마감">마감</option>
                        </select>

                        <button 
                            onClick={handleProductSearchClick}
                            className="bg-[#7e22ce] hover:bg-purple-800 text-white px-6 py-1.5 rounded-md text-sm font-bold shadow-sm transition-all ml-2"
                        >
                            조회
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto bg-gray-50 p-5">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-xs text-center border-collapse">
                            <thead className="bg-[#f8f9fa] text-gray-500 font-bold border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 w-12">
                                        <input 
                                            type="checkbox" 
                                            className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" 
                                            checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.includes(p.id))}
                                            onChange={handleProductCheckAll}
                                        />
                                    </th>
                                    <th className="py-3 px-4 w-28">상품코드</th>
                                    <th className="py-3 px-4">상품명</th>
                                    <th className="py-3 px-4 w-20">상태</th>
                                    <th className="py-3 px-4 w-28">
                                        {/* After & Model 1 Logic: Rename Category Header */}
                                        {isAfter ? '상품 유형' : '상품 카테고리'}
                                    </th>
                                    <th className="py-3 px-4 w-32">상품 날짜선택</th>
                                    <th className="py-3 px-4 w-40">상품기간</th>
                                    <th className="py-3 px-4 w-40">판매기간</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <input 
                                                type="checkbox" 
                                                className="rounded text-purple-600 focus:ring-purple-500 border-gray-300" 
                                                checked={selectedProductIds.includes(product.id)}
                                                onChange={() => toggleProductSelect(product.id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 font-mono">{product.code}</td>
                                        <td className="py-3 px-4 text-left font-medium text-gray-800">{product.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{product.status}</td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {/* After & Model 1 Logic: Rename General Product to Ticket */}
                                            {isAfter && product.category === '일반상품' ? '입장권' : product.category}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{product.dateType}</td>
                                        <td className="py-3 px-4 text-gray-500 text-[11px] leading-tight text-left">
                                            {product.productPeriod.split('\n').map((d, i) => <div key={i}>{d}</div>)}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-[11px] leading-tight text-left">
                                            {product.salesPeriod.split('\n').map((d, i) => <div key={i}>{d}</div>)}
                                        </td>
                                    </tr>
                                ))
                                ) : (
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

                {/* Footer */}
                <div className="p-4 bg-white border-t border-gray-200 flex justify-center gap-3 shrink-0">
                    <button 
                        onClick={handleProductAddConfirm}
                        className="px-10 py-2.5 bg-[#7e22ce] text-white rounded font-bold hover:bg-purple-800 shadow-sm text-sm transition-colors"
                    >
                        확인
                    </button>
                    <button 
                        onClick={() => setIsProductModalOpen(false)}
                        className="px-10 py-2.5 bg-[#343a40] text-white rounded font-bold hover:bg-gray-800 shadow-sm text-sm transition-colors"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Register/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
            <div className="bg-white w-[700px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-[#8b5cf6] text-white flex justify-between items-center">
                    <span className="font-bold text-lg">{modalType === 'REGISTER' ? '관리자 등록' : '관리자 수정'}</span>
                    {isAfter ? (
                        <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-purple-200 transition-colors">
                            <X size={24} />
                        </button>
                    ) : (
                        <div className="w-6 h-6"></div> 
                    )}
                </div>

                {/* Modal Body */}
                <div className="p-10 flex flex-col gap-6">
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-bold text-gray-700 text-right mr-6">이름 <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="flex-1 h-10 px-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-bold text-gray-700 text-right mr-6">전화번호 <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder={isAfter ? "숫자만 입력 가능합니다." : ""}
                            className="flex-1 h-10 px-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-bold text-gray-700 text-right mr-6">이메일 <span className="text-red-500">*</span></label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="flex-1 h-10 px-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-bold text-gray-700 text-right mr-6">비밀번호 {modalType === 'REGISTER' && <span className="text-red-500">*</span>}</label>
                        <div className="flex-1 relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={modalType === 'EDIT' && isAfter ? "변경 시에만 입력" : ""}
                                className="w-full h-10 px-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm pr-10"
                            />
                            {isAfter && (
                                <button 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-bold text-gray-700 text-right mr-6">권한 <span className="text-red-500">*</span></label>
                        <div className="flex-1 flex items-center gap-2">
                            <select 
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="h-10 w-48 px-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-sm"
                            >
                                <option value="">선택</option>
                                <option value="업체 관리자">업체 관리자</option>
                                <option value="업체 사용자">업체 사용자</option>
                            </select>
                            {modalType === 'REGISTER' && <span className="text-xs text-gray-400">프리뷰에서는 권한을 업체 관리자와 업체사용자만 노출합니다</span>}
                        </div>
                    </div>
                    {/* Login Fail Count - Only for Edit Mode */}
                    {modalType === 'EDIT' && (
                        <div className="flex items-center">
                            <label className="w-32 text-sm font-bold text-gray-700 text-right mr-6">로그인 실패 횟수</label>
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-16 px-3 border border-gray-300 rounded bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                                    {formData.loginFailCount}
                                </div>
                                <button 
                                    onClick={handleResetLoginFail}
                                    className="h-10 px-4 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm font-bold text-gray-600 transition-colors shadow-sm flex items-center gap-1"
                                >
                                    <RotateCcw size={14} /> 초기화
                                </button>
                                {/* Debug Button for Demonstration */}
                                <button 
                                    onClick={() => setFormData(prev => ({...prev, loginFailCount: 5}))}
                                    className="h-10 px-3 bg-red-50 border border-red-100 rounded text-xs font-bold text-red-500 hover:bg-red-100 transition-colors ml-2 flex items-center gap-1"
                                    title="테스트용: 실패횟수 5회 설정"
                                >
                                    <Bug size={14} />
                                    TEST: 5회
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 flex justify-center gap-2 pb-8">
                    <button 
                        onClick={handleSave}
                        className="px-10 py-2.5 bg-[#7e22ce] text-white rounded font-bold hover:bg-purple-800 shadow-sm text-sm transition-colors"
                    >
                        저장
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-10 py-2.5 bg-[#e5e7eb] text-gray-700 rounded font-bold hover:bg-gray-300 shadow-sm text-sm transition-colors"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Confirm Modal (Browser Alert Style) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-30 animate-in fade-in duration-200">
            <div className="bg-white w-[400px] rounded-xl shadow-2xl p-6 flex flex-col animate-in zoom-in-95 duration-200">
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">devadm.maketicket.co.kr 내용:</p>
                    <p className="text-base font-medium text-gray-800 whitespace-pre-wrap">{confirmModal.message}</p>
                </div>
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={processSendPassword}
                        className="px-5 py-2 bg-[#7e22ce] text-white rounded-md text-sm font-bold hover:bg-purple-800 transition-colors"
                    >
                        확인
                    </button>
                    <button 
                        onClick={() => setConfirmModal({...confirmModal, isOpen: false, targetId: undefined})}
                        className="px-5 py-2 bg-[#f3e8ff] text-[#7e22ce] rounded-md text-sm font-bold hover:bg-purple-100 transition-colors"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Result Alert Modal (Browser Alert Style) */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-30 animate-in fade-in duration-200">
            <div className="bg-white w-[400px] rounded-xl shadow-2xl p-6 flex flex-col animate-in zoom-in-95 duration-200">
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">devadm.maketicket.co.kr 내용:</p>
                    <p className="text-base font-medium text-gray-800 whitespace-pre-wrap">{alertModal.message}</p>
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={() => setAlertModal({...alertModal, isOpen: false})}
                        className="px-5 py-2 bg-[#7e22ce] text-white rounded-md text-sm font-bold hover:bg-purple-800 transition-colors"
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

export default AdminStaff;
