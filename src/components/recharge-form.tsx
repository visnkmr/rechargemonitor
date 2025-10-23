"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays } from "date-fns";

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
import { DateInput } from "@/components/ui/date-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RechargeFormValues>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      rechargeDate: new Date(),
      inputMode: 'duration',
    },
  });

  const watchedDate = watch("rechargeDate");
  const watchedEndDate = watch("endDate");
  const watchedInputMode = watch("inputMode");
  const watchedPlanDays = watch("planDays");

  // Calculate remaining days based on input mode
  const calculateRemainingDays = () => {
    if (!watchedDate) return 0;

    const today = new Date();
    if (watchedInputMode === 'endDate' && watchedEndDate) {
      // Calculate based on end date
      const daysDiff = differenceInDays(watchedEndDate, today);
      return Math.max(0, daysDiff);
    } else if (watchedInputMode === 'duration' && watchedPlanDays) {
      // Calculate based on plan days from recharge date
      const endDate = new Date(watchedDate);
      endDate.setDate(endDate.getDate() + watchedPlanDays);
      const daysDiff = differenceInDays(endDate, today);
      return Math.max(0, daysDiff);
    }
    return 0;
  };

  const remainingDays = calculateRemainingDays();

  // Auto-calculate plan days when end date is selected
  React.useEffect(() => {
    if (watchedInputMode === 'endDate' && watchedDate && watchedEndDate) {
      const daysDiff = differenceInDays(watchedEndDate, watchedDate);
      if (daysDiff > 0) {
        setValue("planDays", daysDiff);
      }
    }
  }, [watchedInputMode, watchedDate, watchedEndDate, setValue]);

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
          endDate: recharge.endDate,
          inputMode: recharge.inputMode,
        });
      } else {
        reset({
          rechargeDate: new Date(),
          inputMode: 'duration',
        });
      }
    }
  };

  const onSubmit = (data: RechargeFormValues) => {
    const perDayCost = data.lastRechargeAmount / data.planDays;

    let endDate: Date | undefined;
    if (data.inputMode === 'endDate' && data.endDate) {
      endDate = data.endDate;
    } else {
      // Calculate end date from recharge date + plan days
      endDate = new Date(data.rechargeDate);
      endDate.setDate(endDate.getDate() + data.planDays);
    }

    const rechargeData: Recharge = {
      id: recharge?.id || crypto.randomUUID(),
      ...data,
      perDayCost,
      remainingDays: calculateRemainingDays(), // Calculate fresh remaining days
      endDate,
    };
    onFormSubmit(rechargeData);
    if (!recharge) {
      reset();
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

          {/* Input Mode Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Input Mode</Label>
            <div className="col-span-3">
              <RadioGroup
                value={watchedInputMode}
                onValueChange={(value: 'duration' | 'endDate') => setValue("inputMode", value)}
                className="flex flex-row space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="duration" id="duration" />
                  <Label htmlFor="duration">Duration (days)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="endDate" id="endDate" />
                  <Label htmlFor="endDate">End Date</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Recharge Date</Label>
            <div className="col-span-3">
              <DateInput
                date={watchedDate}
                onDateChange={(newDate) => setValue("rechargeDate", newDate || new Date())}
                placeholder="Select or enter date"
              />
            </div>
          </div>

          {watchedInputMode === 'duration' ? (
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
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">End Date</Label>
              <div className="col-span-3">
                <DateInput
                  date={watchedEndDate}
                  onDateChange={(newDate) => setValue("endDate", newDate)}
                  placeholder="Select or enter end date"
                />
              </div>
              {errors.endDate && (
                <p className="col-span-4 text-sm text-red-500">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          )}

          {/* Remaining Days Display */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Remaining Days</Label>
            <div className="col-span-3">
              <div className="text-lg font-semibold text-blue-600">
                {remainingDays} days
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">{recharge ? "Update" : "Add"} Recharge</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}