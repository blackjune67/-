
import React from 'react';
import { Construction } from 'lucide-react';

const AdminFacility: React.FC = () => {
  return (
    <div className="p-6 max-w-[1800px] mx-auto relative min-h-screen font-['Noto_Sans_KR']">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">시설관리</h2>
        <div className="text-xs text-gray-400 font-medium">
          <span>관리자</span> <span className="mx-2 text-gray-300">›</span> <span className="text-purple-600 font-bold">시설관리</span>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col items-center justify-center">
        <div className="bg-purple-50 p-6 rounded-full mb-4">
            <Construction size={48} className="text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">작업 예정 페이지</h3>
        <p className="text-gray-500 text-sm">관리자 시설관리 화면은 리디자인 작업 대기 중입니다.</p>
      </div>
    </div>
  );
};

export default AdminFacility;
