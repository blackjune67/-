
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, LayoutTemplate } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ReservationList from './pages/ReservationList';
import ProductList from './pages/ProductList';
import ProductRegister from './pages/ProductRegister';
import ProductForm from './pages/ProductForm';
import ProductSpec from './pages/ProductSpec';
import Dashboard from './pages/Dashboard';
import FacilityBooth from './pages/FacilityBooth';
import FacilityPos from './pages/FacilityPos'; 
import FacilityPosProduct from './pages/FacilityPosProduct'; 
import FacilityKioskBanner from './pages/FacilityKioskBanner'; 
import AdminStaff from './pages/AdminStaff'; // Import AdminStaff
import AdminFacility from './pages/AdminFacility'; // Import AdminFacility
import { MENU_ITEMS } from './constants';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [currentModel, setCurrentModel] = useState('model1-split');
  const [isSpecOpen, setIsSpecOpen] = useState(false);

  const [showGroupExperience, setShowGroupExperience] = useState(false);
  const [showImmediateEntryCheck, setShowImmediateEntryCheck] = useState(false);
  const [showMember, setShowMember] = useState(false);

  const [registerFormData, setRegisterFormData] = useState({
    productType: '입장권',
    useElectronicPayment: '전자결제 사용',
    dateType: '기간상품',
    maxSalesLimit: '제한없음',
    ticketType: '지류티켓',
    useSecurityCode: '보안코드 미사용'
  });

  const handleNavigate = (path: string) => setCurrentPath(path);
  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    setIsSpecOpen(model.includes('-split'));
  };

  const modelNum = parseInt(currentModel.replace(/model(\d+)-.*/, '$1')) || 1;

  const getPageTitle = (path: string) => {
    if (currentModel.includes('-split')) return `Model ${modelNum} 명세서 + 시뮬레이션`;
    if (path === '/dashboard') return '통합 운영 대시보드';
    return 'MakeTicket Admin';
  };

  const renderContent = () => {
    const showGuides = currentModel.includes('-split');
    if (currentPath === '/dashboard') return <Dashboard modelId={modelNum} />;
    if (currentPath === '/sales/reserve') return <ReservationList />;
    if (currentPath === '/products/list') return <ProductList onNavigate={handleNavigate} showDevGuides={showGuides} />;
    if (currentPath === '/products/register') return <ProductRegister onNavigate={handleNavigate} showDevGuides={showGuides} formData={registerFormData} setFormData={setRegisterFormData} />;
    if (currentPath === '/products/register/form') return <ProductForm onNavigate={handleNavigate} showDevGuides={showGuides} registerConfig={registerFormData} modelId={modelNum} showImmediateEntryCheck={showImmediateEntryCheck} />;
    if (currentPath === '/facility/booth') return <FacilityBooth />;
    
    // Facility POS & Kiosk
    if (currentPath === '/facility/pos') return <FacilityPos pageTitle="POS 창구관리" />;
    if (currentPath === '/facility/kiosk-window') return <FacilityPos pageTitle="키오스크 창구 관리" />;
    
    if (currentPath === '/facility/pos-window') return <FacilityPosProduct modelId={modelNum} pageTitle="POS 창구별 상품관리" />;
    if (currentPath === '/facility/kiosk-product') return <FacilityPosProduct modelId={modelNum} pageTitle="키오스크별 상품관리" />;
    
    if (currentPath === '/facility/kiosk-banner') return <FacilityKioskBanner />;
    
    if (currentPath === '/admin/staff') return <AdminStaff />;
    if (currentPath === '/admin/facility') return <AdminFacility />;

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <CheckCircle size={48} className="mb-4 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">Model {modelNum} 전용 기능 영역</h2>
        <p className="text-sm mt-2">상위 계층 메뉴({currentPath})는 기획서 명세에 따라 구현됩니다.</p>
        <button onClick={() => setCurrentPath('/dashboard')} className="mt-6 text-purple-600 underline">대시보드로</button>
      </div>
    );
  };

  const isSplitView = currentModel.endsWith('-split');

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle(currentPath)} currentModel={currentModel} onModelChange={handleModelChange} />
      <div className="pt-14 flex h-screen overflow-hidden relative">
        {isSplitView && (
          <div className={`h-full overflow-y-auto border-r border-gray-300 bg-white shadow-xl transition-all duration-300 ${isSpecOpen ? 'w-1/2 min-w-[500px]' : 'w-0 overflow-hidden opacity-0'}`}>
            <ProductSpec viewPath={currentPath} modelId={modelNum} />
          </div>
        )}
        <div className="flex-1 h-full relative bg-gray-100 overflow-hidden">
          {isSplitView && (
            <button onClick={() => setIsSpecOpen(!isSpecOpen)} className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-white border border-gray-300 shadow-md p-1.5 rounded-r-md">
              {isSpecOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          )}
          <Sidebar 
            isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} currentPath={currentPath} onNavigate={handleNavigate} isSplitView={isSplitView} modelId={modelNum}
            showGroupExperience={showGroupExperience} setShowGroupExperience={setShowGroupExperience} showImmediateEntryCheck={showImmediateEntryCheck} setShowImmediateEntryCheck={setShowImmediateEntryCheck} showMember={showMember} setShowMember={setShowMember}
          />
          <main className={`absolute inset-0 top-0 bottom-0 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
            <div className="min-w-[768px] h-full">{renderContent()}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
