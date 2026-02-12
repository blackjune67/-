
import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  ShoppingCart, 
  CheckSquare, 
  MapPin, 
  Settings, 
  BarChart3 
} from 'lucide-react';
import { MenuItem, SaleStatus, TicketData } from './types';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: <LayoutDashboard size={20} />,
    path: '/dashboard'
  },
  {
    id: 'products',
    label: '상품',
    icon: <Ticket size={20} />,
    subItems: [
      { id: 'product-list', label: '입장권 상품 관리', path: '/products/list' }
    ]
  },
  {
    id: 'sales',
    label: '판매 내역',
    icon: <ShoppingCart size={20} />,
    subItems: [
      { id: 'sales-reserve', label: '예매 내역', path: '/sales/reserve' },
      { id: 'sales-onsite', label: '현장 판매 내역', path: '/sales/onsite' }
    ]
  },
  {
    id: 'usage',
    label: '사용 처리',
    icon: <CheckSquare size={20} />,
    subItems: [
      { id: 'usage-check', label: '티켓 검표', path: '/usage/check' },
      { id: 'usage-status', label: '검표 현황', path: '/usage/status' },
      { id: 'usage-history', label: '검표 내역', path: '/usage/history' }
    ]
  },
  {
    id: 'facility',
    label: '입장 시설 관리',
    icon: <MapPin size={20} />,
    subItems: [
      { id: 'facility-booth', label: '매표소 관리', path: '/facility/booth' },
      { id: 'facility-pos', label: 'POS 창구 관리', path: '/facility/pos' },
      { id: 'facility-pos-window', label: 'POS 창구별 상품관리', path: '/facility/pos-window' }
    ]
  },
  {
    id: 'admin',
    label: '관리자',
    icon: <Settings size={20} />,
    subItems: [
      { id: 'admin-facility', label: '시설관리', path: '/admin/facility' },
      { id: 'admin-org', label: '조직관리', path: '/admin/org' },
      { id: 'admin-staff', label: '직원 계정관리', path: '/admin/staff' },
      { id: 'admin-auth', label: '직원 계정별 권한 관리', path: '/admin/auth' }
    ]
  },
  {
    id: 'report',
    label: '보고서',
    icon: <BarChart3 size={20} />,
    subItems: [
      { id: 'report-reserve', label: '예약 판매 보고서', path: '/report/reserve' },
      { id: 'report-onsite', label: '현장 판매 보고서', path: '/report/onsite' },
      { id: 'report-remain', label: '회차별 잔여현황', path: '/report/remain' },
      { id: 'report-total', label: '통합 보고서', path: '/report/total' },
      { id: 'report-sales', label: '매출 보고서', path: '/report/sales' }
    ]
  }
];

export const MOCK_TICKETS: TicketData[] = [
  {
    id: '1',
    code: 'GD2500851',
    name: '2.0에서 tcm으로 연동하는 스케줄 상품',
    status: SaleStatus.ON_SALE,
    productPeriodStart: '2025-04-01 00:00',
    productPeriodEnd: '2026-12-31 00:00',
    salesPeriodStart: '2025-03-01 00:00',
    salesPeriodEnd: '2026-12-31 00:00',
    salesCount: 0
  },
  {
    id: '2',
    code: 'GD2500843',
    name: 'TCM 에서 2.0으로 연동되는 스케줄 상품',
    status: SaleStatus.ON_SALE,
    productPeriodStart: '2025-04-01 00:00',
    productPeriodEnd: '2026-12-31 00:00',
    salesPeriodStart: '2025-04-01 00:00',
    salesPeriodEnd: '2027-12-31 00:00',
    salesCount: 0
  },
  {
    id: '3',
    code: 'GD2303038',
    name: '연동 안하는 2.0 회차상품',
    status: SaleStatus.ON_SALE,
    productPeriodStart: '2023-07-26 00:00',
    productPeriodEnd: '2027-12-31 00:00',
    salesPeriodStart: '2023-07-26 00:00',
    salesPeriodEnd: '2027-12-31 00:00',
    salesCount: 0
  }
];
