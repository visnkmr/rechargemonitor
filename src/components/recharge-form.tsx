"use client";

import React, { useState, useEffect } from "react";
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
      inputMode: 'startAndDuration',
    },
  });

  const watchedDate = watch("rechargeDate");
  const watchedEndDate = watch("endDate");
  const watchedInputMode = watch("inputMode");
  const watchedPlanDays = watch("planDays");

  // Calculate remaining days based on available dates
  const calculateRemainingDays = () => {
    if (!watchedDate && !watchedEndDate) return 0;

    const today = new Date();

    // If we have an end date, use it to calculate remaining days
    if (watchedEndDate) {
      const daysDiff = differenceInDays(watchedEndDate, today);
      return Math.max(0, daysDiff);
    }
    // Otherwise, if we have start date and plan days, calculate end date and remaining days
    else if (watchedDate && watchedPlanDays) {
      const endDate = new Date(watchedDate);
      endDate.setDate(endDate.getDate() + watchedPlanDays);
      const daysDiff = differenceInDays(endDate, today);
      return Math.max(0, daysDiff);
    }
    return 0;
  };

  const remainingDays = calculateRemainingDays();

  // Auto-calculate missing field based on input mode
  React.useEffect(() => {
    // Prevent infinite loops by checking if we actually need to update
    if (watchedInputMode === 'startAndDuration' && watchedDate && watchedPlanDays) {
      // Calculate end date from start date + duration
      const calculatedEndDate = new Date(watchedDate);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + watchedPlanDays);

      // Only update if the calculated date is different from current end date
      if (!watchedEndDate || calculatedEndDate.getTime() !== watchedEndDate.getTime()) {
        setValue("endDate", calculatedEndDate);
      }
    } else if (watchedInputMode === 'endAndDuration' && watchedEndDate && watchedPlanDays) {
      // Calculate start date from end date - duration
      const calculatedStartDate = new Date(watchedEndDate);
      calculatedStartDate.setDate(calculatedStartDate.getDate() - watchedPlanDays);

      // Only update if the calculated date is different from current start date
      if (!watchedDate || calculatedStartDate.getTime() !== watchedDate.getTime()) {
        setValue("rechargeDate", calculatedStartDate);
      }
    } else if (watchedInputMode === 'startAndEnd' && watchedDate && watchedEndDate) {
      // Calculate duration from end date - start date
      const calculatedDaysDiff = differenceInDays(watchedEndDate, watchedDate);

      // Only update if the calculated duration is different from current plan days
      if (calculatedDaysDiff > 0 && calculatedDaysDiff !== watchedPlanDays) {
        setValue("planDays", calculatedDaysDiff);
      }
    }
  }, [watchedInputMode, watchedDate, watchedEndDate, watchedPlanDays]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save form values to localStorage (only for new recharges, not edits)
  useEffect(() => {
    if (!recharge) { // Only save for new recharges, not when editing existing ones
      const formData = {
        nickname: watch("nickname"),
        phoneNumber: watch("phoneNumber"),
        lastRechargeAmount: watch("lastRechargeAmount"),
        rechargeDate: watchedDate,
        planDays: watchedPlanDays,
        endDate: watchedEndDate,
        inputMode: watchedInputMode,
      };
      localStorage.setItem('recharge-form', JSON.stringify(formData));
    }
  }, [watchedDate, watch, watchedEndDate, watchedInputMode, watchedPlanDays, recharge]);

  // Load saved values on mount (only for new recharges)
  useEffect(() => {
    if (!recharge) { // Only load for new recharges, not when editing existing ones
      const saved = localStorage.getItem('recharge-form');
      if (saved) {
        try {
          const formData = JSON.parse(saved);
          if (formData.nickname) setValue("nickname", formData.nickname);
          if (formData.phoneNumber) setValue("phoneNumber", formData.phoneNumber);
          if (formData.lastRechargeAmount) setValue("lastRechargeAmount", formData.lastRechargeAmount);
          if (formData.rechargeDate) setValue("rechargeDate", new Date(formData.rechargeDate));
          if (formData.planDays) setValue("planDays", formData.planDays);
          if (formData.endDate) setValue("endDate", new Date(formData.endDate));
          if (formData.inputMode) setValue("inputMode", formData.inputMode);
        } catch (error) {
          console.error('Failed to load recharge form data:', error);
        }
      }
    }
  }, [setValue, recharge]);

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
          inputMode: 'startAndDuration',
        });
      }
    }
  };

  const onSubmit = (data: RechargeFormValues) => {
    const perDayCost = data.lastRechargeAmount / data.planDays;

    let endDate: Date | undefined;
    if (data.endDate) {
      // If endDate is provided (from any input mode), use it
      endDate = data.endDate;
    } else if (data.rechargeDate && data.planDays) {
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
      enabled: recharge?.enabled !== undefined ? recharge.enabled : true,
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
                 onValueChange={(value: 'startAndDuration' | 'endAndDuration' | 'startAndEnd') => setValue("inputMode", value)}
                 className="grid grid-cols-1 gap-2"
               >
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="startAndDuration" id="startAndDuration" />
                   <Label htmlFor="startAndDuration">Start Date + Duration</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="endAndDuration" id="endAndDuration" />
                   <Label htmlFor="endAndDuration">End Date + Duration</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="startAndEnd" id="startAndEnd" />
                   <Label htmlFor="startAndEnd">Start Date + End Date</Label>
                 </div>
               </RadioGroup>
             </div>
           </div>

           {/* Start Date - shown for startAndDuration and startAndEnd modes */}
           {(watchedInputMode === 'startAndDuration' || watchedInputMode === 'startAndEnd') && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label className="text-right">Start Date</Label>
               <div className="col-span-3">
                 <DateInput
                   date={watchedDate}
                   onDateChange={(newDate) => setValue("rechargeDate", newDate || new Date())}
                 />
               </div>
             </div>
           )}

           {/* End Date - shown for endAndDuration and startAndEnd modes */}
           {(watchedInputMode === 'endAndDuration' || watchedInputMode === 'startAndEnd') && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label className="text-right">End Date</Label>
               <div className="col-span-3">
                 <DateInput
                   date={watchedEndDate}
                   onDateChange={(newDate) => setValue("endDate", newDate)}
                 />
               </div>
             </div>
           )}

           {/* Duration - shown for startAndDuration and endAndDuration modes */}
           {(watchedInputMode === 'startAndDuration' || watchedInputMode === 'endAndDuration') && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="planDays" className="text-right">
                 Duration (Days)
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