export interface Recharge {
  id: string;
  nickname: string;
  phoneNumber: string;
  lastRechargeAmount: number;
  rechargeDate: Date;
  planDays: number;
  perDayCost: number;
  remainingDays: number;
}

export interface RechargeFormData {
  nickname: string;
  phoneNumber: string;
  lastRechargeAmount: number;
  rechargeDate: Date;
  planDays: number;
}

export type SIPFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface SIPCalculation {
  id: string;
  name: string;
  amount: number;
  frequency: SIPFrequency;
  startDate: Date;
  duration: number; // in months
  totalInvested: number;
  totalInstallments: number;
  createdAt: Date;
}

export interface SIPFormData {
  name: string;
  amount: number;
  frequency: SIPFrequency;
  startDate: Date;
  duration: number;
}