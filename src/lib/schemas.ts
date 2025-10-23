import { z } from "zod";

export const rechargeSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  lastRechargeAmount: z.number().min(0.01, "Amount must be greater than 0"),
  rechargeDate: z.date(),
  planDays: z.number().min(1, "Plan days must be at least 1"),
});

export type RechargeFormValues = z.infer<typeof rechargeSchema>;

export const sipSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.date(),
  duration: z.number().min(1, "Duration must be at least 1 month"),
});

export type SIPFormValues = z.infer<typeof sipSchema>;