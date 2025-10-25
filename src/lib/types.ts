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
  enabled: boolean; // Whether to include in monthly spend calculations
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

export type XIRRMode = 'calculateXIRR' | 'calculateFinal';

export interface XIRRCalculation {
  id: string;
  name: string;
  mode: XIRRMode;
  initialAmount: number;
  finalAmount?: number;
  xirr?: number;
  periodYears: number;
  createdAt: Date;
}

export interface XIRRFormData {
  name: string;
  mode: XIRRMode;
  initialAmount: number;
  finalAmount?: number;
  xirr?: number;
  periodYears: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: Date;
  dissolutionPeriodYears: number; // Period over which the expense is amortized
  perDayCost: number;
  perMonthCost: number;
  perYearCost: number;
  createdAt: Date;
  enabled: boolean; // Whether to include in expense summary calculations
}

export interface ExpenseFormData {
  name: string;
  amount: number;
  date: Date;
  dissolutionPeriodYears: number;
  enabled?: boolean;
}

// MFAPI response types
export interface MFAPIMeta {
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
  scheme_code: number;
  scheme_name: string;
  isin_growth: string | null;
  isin_div_reinvestment: string | null;
}

export interface MFAPIDataPoint {
  date: string; // DD-MM-YYYY format
  nav: string; // NAV as string
}

export interface MFAPIResponse {
  meta: MFAPIMeta;
  data: MFAPIDataPoint[];
  status: string;
}

export interface MFAPISearchResult {
  schemeCode: number;
  schemeName: string;
}

export interface MutualFund {
  id: string;
  name: string;
  schemeCode: number;
  category: string;
  fundHouse: string;
  currentNav: number;
  navDate: Date;
  riskLevel: 'Low' | 'Moderate' | 'High';
  expenseRatio: number;
  aum: number; // Assets Under Management
}

export interface MutualFundPrice {
  date: Date;
  nav: number;
}

export interface MutualFundWithHistory extends MutualFund {
  historicalPrices: MutualFundPrice[];
}

export interface WatchlistItem {
  schemeCode: number;
  addedAt: Date;
}

export interface MFPurchase {
  id: string;
  schemeCode: number;
  purchaseDate: Date;
  amount: number;
  units: number;
  navAtPurchase: number;
  createdAt: Date;
}

export interface MFPurchaseFormData {
  purchaseDate: Date;
  amount: number;
}