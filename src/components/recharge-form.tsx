"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { rechargeSchema, type RechargeFormValues } from "@/lib/schemas";
import { Recharge } from "@/lib/types";

interface RechargeFormProps {
  recharge?: Recharge;
  onSubmit: (recharge: Recharge) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
}

export function RechargeForm({
  recharge,
  onSubmit: onFormSubmit,
  trigger,
  title = recharge ? "Edit Recharge" : "Add New Recharge",
  description = recharge ? "Update the recharge details." : "Enter the details for the new recharge.",
}: RechargeFormProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RechargeFormValues>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      rechargeDate: new Date(),
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      if (recharge) {
        reset({
          nickname: recharge.nickname,
          phoneNumber: recharge.phoneNumber,
          lastRechargeAmount: recharge.lastRechargeAmount,
          rechargeDate: recharge.rechargeDate,
          planDays: recharge.planDays,
        });
        setDate(recharge.rechargeDate);
      } else {
        reset({
          rechargeDate: new Date(),
        });
        setDate(new Date());
      }
    }
  };

  const onSubmit = (data: RechargeFormValues) => {
    const perDayCost = data.lastRechargeAmount / data.planDays;
    const rechargeData: Recharge = {
      id: recharge?.id || crypto.randomUUID(),
      ...data,
      perDayCost,
      remainingDays: recharge?.remainingDays || data.planDays, // Keep existing remaining days for edits
    };
    onFormSubmit(rechargeData);
    if (!recharge) {
      reset();
      setDate(new Date());
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>{recharge ? "Edit" : "Add Recharge"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nickname" className="text-right">
              Nickname
            </Label>
            <Input
              id="nickname"
              {...register("nickname")}
              className="col-span-3"
            />
            {errors.nickname && (
              <p className="col-span-4 text-sm text-red-500">
                {errors.nickname.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phoneNumber" className="text-right">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              {...register("phoneNumber")}
              className="col-span-3"
            />
            {errors.phoneNumber && (
              <p className="col-span-4 text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastRechargeAmount" className="text-right">
              Amount
            </Label>
            <Input
              id="lastRechargeAmount"
              type="number"
              step="0.01"
              {...register("lastRechargeAmount", { valueAsNumber: true })}
              className="col-span-3"
            />
            {errors.lastRechargeAmount && (
              <p className="col-span-4 text-sm text-red-500">
                {errors.lastRechargeAmount.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Recharge Date</Label>
            <div className="col-span-3">
              <DatePicker
                date={date}
                onDateChange={(newDate) => {
                  setDate(newDate || new Date());
                  setValue("rechargeDate", newDate || new Date());
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="planDays" className="text-right">
              Plan Days
            </Label>
            <Input
              id="planDays"
              type="number"
              {...register("planDays", { valueAsNumber: true })}
              className="col-span-3"
            />
            {errors.planDays && (
              <p className="col-span-4 text-sm text-red-500">
                {errors.planDays.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">{recharge ? "Update" : "Add"} Recharge</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}