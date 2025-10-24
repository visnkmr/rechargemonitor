import { z } from "zod";

export const rechargeSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  lastRechargeAmount: z.number().min(0.01, "Amount must be greater than 0"),
  rechargeDate: z.date(),
  planDays: z.number().min(1, "Plan days must be at least 1"),
  endDate: z.date().optional(),
  inputMode: z.enum(['startAndDuration', 'endAndDuration', 'startAndEnd']),
}).refine((data) => {
  if (data.inputMode === 'startAndDuration') {
    return data.rechargeDate && data.planDays;
  } else if (data.inputMode === 'endAndDuration') {
    return data.endDate && data.planDays;
  } else if (data.inputMode === 'startAndEnd') {
    return data.rechargeDate && data.endDate && data.endDate > data.rechargeDate;
  }
  return true;
}, {
  message: "Please provide valid date and duration combination",
  path: ["inputMode"],
});

export type RechargeFormValues = z.infer<typeof rechargeSchema>;

export const sipSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.date(),
  duration: z.number().min(1, "Duration must be at least 1 month"),
  xirr: z.number().min(0).max(100).optional(),
  enabled: z.boolean().optional(),
});

export type SIPFormValues = z.infer<typeof sipSchema>;

export const xirrSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mode: z.enum(['calculateXIRR', 'calculateFinal']),
  initialAmount: z.number().min(0.01, "Initial amount must be greater than 0"),
  finalAmount: z.number().min(0.01, "Final amount must be greater than 0").optional(),
  xirr: z.number().min(0).max(100, "XIRR must be between 0 and 100").optional(),
  periodYears: z.number().min(0.01, "Period must be greater than 0"),
}).refine((data) => {
  if (data.mode === 'calculateXIRR') {
    return data.finalAmount !== undefined && data.finalAmount > 0;
  } else {
    return data.xirr !== undefined && data.xirr >= 0;
  }
}, {
  message: "Please provide the required fields for the selected calculation mode",
  path: ["mode"],
});

export type XIRRFormValues = z.infer<typeof xirrSchema>;