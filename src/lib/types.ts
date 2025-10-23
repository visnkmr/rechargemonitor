export interface Recharge {
  id: string;
  nickname: string;
  phoneNumber: string;
  lastRechargeAmount: number;
  rechargeDate: Date;
  planDays: number;
  perDayCost: number;
  remainingDays: number;
  endDate?: Date;
  inputMode: 'startAndDuration' | 'endAndDuration' | 'startAndEnd';
}

export interface RechargeFormData {
  nickname: string;
  phoneNumber: string;
  lastRechargeAmount: number;
  rechargeDate: Date;
  planDays: number;
  endDate?: Date;
  inputMode: 'startAndDuration' | 'endAndDuration' | 'startAndEnd';
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
  xirr?: number; // Expected rate of return (percentage)
  futureValue?: number; // Future value at XIRR
  enabled: boolean; // Whether to include in monthly spend calculations
  createdAt: Date;
}

export interface SIPFormData {
  name: string;
  amount: number;
  frequency: SIPFrequency;
  startDate: Date;
  duration: number;
  xirr?: number;
  enabled?: boolean;
}