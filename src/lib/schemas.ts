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