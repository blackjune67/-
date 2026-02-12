import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_TICKETS } from '../constants';
import { SaleStatus } from '../types';

const ReservationList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Breadcrumb / Title Area */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">예매내역</h2>
        <div className="text-sm text-gray-500">
          <span>예매관리</span>
          <span className="mx-2 text-gray-300">›</span>
          <span className="text-purple-700 font-medium">예매내역</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">검색어</span>
            <select 
              className="form-select text-sm border-gray-300 rounded-md focus:border-purple-500 focus:ring-purple-500 h-9"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="name">상품명</option>
              <option value="code">상품코드</option>
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="검색 값을 입력하세요."
                className="form-input text-sm border-gray-300 rounded-md focus:border-purple-500 focus:ring-purple-500 h-9 w-64 pr-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-2 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">판매상태</span>
            <select 
              className="form-select text-sm border-gray-300 rounded-md focus:border-purple-500 focus:ring-purple-500 h-9 w-32"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">전체</option>
              <option value={SaleStatus.ON_SALE}>{SaleStatus.ON_SALE}</option>
              <option value={SaleStatus.STOPPED}>{SaleStatus.STOPPED}</option>
              <option value={SaleStatus.EXPIRED}>{SaleStatus.EXPIRED}</option>
            </select>
          </div>

          <div className="ml-auto">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
              검색
            </button>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-purple-50/30">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">총 <span className="text-purple-700 font-bold">{MOCK_TICKETS.length}</span>개</span>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">페이지 당 데이터 건수</span>
              <select 
                className="form-select text-xs border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 py-1"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <button className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded border border-purple-200 text-xs font-medium transition-colors">
            전체 예매내역 보기
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-center whitespace-nowrap w-32">상품코드</th>
                <th className="px-6 py-3 text-center whitespace-nowrap">상품명</th>
                <th className="px-6 py-3 text-center whitespace-nowrap w-24">상태</th>
                <th className="px-6 py-3 text-center whitespace-nowrap w-48">상품기간</th>
                <th className="px-6 py-3 text-center whitespace-nowrap w-48">판매기간</th>
                <th className="px-6 py-3 text-center whitespace-nowrap w-32">당해년도 판매매수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_TICKETS.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-600 font-mono">{ticket.code}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-900 hover:text-purple-700 hover:underline font-medium text-left">
                      {ticket.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                      ${ticket.status === SaleStatus.ON_SALE ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 text-xs">
                    <div className="flex flex-col gap-1">
                      <span>{ticket.productPeriodStart}</span>
                      <span>{ticket.productPeriodEnd}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 text-xs">
                    <div className="flex flex-col gap-1">
                      <span>{ticket.salesPeriodStart}</span>
                      <span>{ticket.salesPeriodEnd}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900">{ticket.salesCount}</td>
                </tr>
              ))}
              
              {/* Empty state filler for demo purposes if list is short */}
              {MOCK_TICKETS.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <div className="flex items-center gap-1">
            <button 
              className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-gray-800 text-white text-sm font-medium">
              1
            </button>
            {/* Additional page numbers would go here */}
            <button 
              className="p-1 rounded hover:bg-gray-100 text-gray-400"
              disabled
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationList;