import { z } from "zod";

export const rechargeSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  lastRechargeAmount: z.number().min(0.01, "Amount must be greater than 0"),
  rechargeDate: z.date(),
  planDays: z.number().min(1, "Plan days must be at least 1"),
});

export type RechargeFormValues = z.infer<typeof rechargeSchema>;