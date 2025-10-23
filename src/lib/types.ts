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