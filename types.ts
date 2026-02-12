import React from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  subItems?: MenuItem[];
  path?: string;
}

export enum SaleStatus {
  ON_SALE = '판매중',
  STOPPED = '판매중지',
  EXPIRED = '판매종료'
}

export interface TicketData {
  id: string;
  code: string;
  name: string;
  status: SaleStatus;
  productPeriodStart: string;
  productPeriodEnd: string;
  salesPeriodStart: string;
  salesPeriodEnd: string;
  salesCount: number;
}