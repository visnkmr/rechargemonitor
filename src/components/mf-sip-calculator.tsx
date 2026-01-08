"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addMonths, differenceInMonths, startOfMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { mfSipSchema, type MFSIPFormValues } from "@/lib/schemas";
import { MFSIPCalculation, SIPFrequency, MutualFundWithHistory } from "@/lib/types";
import { calculateSIPFutureValue, getPeriodsPerYear } from "@/lib/financial-utils";

interface MFSIPCalculatorProps {
  fund: MutualFundWithHistory;
  onSaveCalculation: (calculation: MFSIPCalculation) => void;
  editingCalculation?: MFSIPCalculation | null;
  onCancelEdit?: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom (days)' },
] as const;

export function MFSIPCalculator({ fund, onSaveCalculation, editingCalculation, onCancelEdit }: MFSIPCalculatorProps) {
  const [calculation, setCalculation] = useState<MFSIPCalculation | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MFSIPFormValues>({
    resolver: zodResolver(mfSipSchema),
    defaultValues: {
      startDate: new Date(),
      frequency: 'monthly',
    },
  });

  const watchedDate = watch("startDate");
  const watchedAmount = watch("amount");
  const watchedFrequency = watch("frequency");
  const watchedDuration = watch("duration");
  const watchedXirr = watch("xirr");
  const watchedCustomDays = watch("customDays");

  // Save form values to localStorage
  useEffect(() => {
    const formData = {
      name: watch("name"),
      amount: watchedAmount,
      frequency: watchedFrequency,
      startDate: watchedDate,
      duration: watchedDuration,
      xirr: watchedXirr,
    };
    localStorage.setItem(`mf-sip-calculator-${fund.schemeCode}-form`, JSON.stringify(formData));
  }, [watchedDate, watchedAmount, watchedFrequency, watchedDuration, watchedXirr, fund.schemeCode, watch]);

  // Load saved values on mount
  useEffect(() => {
    const saved = localStorage.getItem(`mf-sip-calculator-${fund.schemeCode}-form`);
    if (saved) {
      try {
        const formData = JSON.parse(saved);
        if (formData.name) setValue("name", formData.name);
        if (formData.amount) setValue("amount", formData.amount);
        if (formData.frequency) setValue("frequency", formData.frequency);
        if (formData.startDate) setValue("startDate", new Date(formData.startDate));
        if (formData.duration) setValue("duration", formData.duration);
        if (formData.xirr) setValue("xirr", formData.xirr);
      } catch (error) {
        console.error('Failed to load MF SIP calculator form data:', error);
      }
    }
  }, [fund.schemeCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle editing mode
  useEffect(() => {
    if (editingCalculation) {
      reset({
        name: editingCalculation.name,
        amount: editingCalculation.amount,
        frequency: editingCalculation.frequency,
        startDate: editingCalculation.startDate,
        duration: editingCalculation.duration,
        xirr: editingCalculation.xirr,
        enabled: editingCalculation.enabled,
      });
    } else {
      reset({
        startDate: new Date(),
        frequency: 'monthly',
        enabled: true,
      });
    }
  }, [editingCalculation, reset]);

  // Auto-calculate duration based on start date to today
  useEffect(() => {
    if (watchedDate) {
      const today = new Date();
      const startOfStartMonth = startOfMonth(watchedDate);
      const startOfCurrentMonth = startOfMonth(today);

      // Calculate months difference (inclusive of current month if same month)
      const monthsDiff = differenceInMonths(startOfCurrentMonth, startOfStartMonth) + 1;

      // Handle different cases:
      // - Future date: set to minimum duration (1 month)
      // - Past date: calculate actual months
      // - Max limit: 1200 months (100 years)
      if (monthsDiff <= 0) {
        // Future date or current month
        setValue("duration", 1);
      } else if (monthsDiff <= 1200) {
        // Valid past date
        setValue("duration", monthsDiff);
      } else {
        // Too far in the past, set to maximum
        setValue("duration", 1200);
      }
    }
  }, [watchedDate, setValue]);

  // Calculate total invested amount or future value in real-time
  const calculateRealTimeTotal = () => {
    if (!watchedAmount || !watchedFrequency || !watchedDuration) {
      return 0;
    }

    // Calculate number of installments per month
    let installmentsPerMonth: number;
    switch (watchedFrequency) {
      case 'hourly':
        installmentsPerMonth = 30 * 24; // Approximate
        break;
      case 'daily':
        installmentsPerMonth = 30;
        break;
      case 'weekly':
        installmentsPerMonth = 4.33; // Approximate
        break;
      case 'monthly':
        installmentsPerMonth = 1;
        break;
      case 'quarterly':
        installmentsPerMonth = 1/3;
        break;
      case 'yearly':
        installmentsPerMonth = 1/12;
        break;
      case 'custom':
        if (watchedCustomDays && watchedCustomDays > 0) {
          installmentsPerMonth = 30 / watchedCustomDays; // e.g., every 5 days = 30/5 = 6 per month
        } else {
          installmentsPerMonth = 1;
        }
        break;
      default:
        installmentsPerMonth = 1;
    }

    const totalInstallments = Math.floor(watchedDuration * installmentsPerMonth);

    // If XIRR is provided, calculate future value, otherwise show total invested
    if (watchedXirr && watchedXirr > 0) {
      const periodsPerYear = getPeriodsPerYear(watchedFrequency);
      return calculateSIPFutureValue(watchedAmount, watchedXirr, periodsPerYear, totalInstallments);
    } else {
      return totalInstallments * watchedAmount;
    }
  };

  const realTimeTotal = calculateRealTimeTotal();

  const calculateMFSIP = (data: MFSIPFormValues) => {
    const { amount, frequency, customDays, startDate, duration, xirr, enabled = true } = data;

    // Calculate number of installments per month
    let installmentsPerMonth: number;
    switch (frequency) {
      case 'hourly':
        installmentsPerMonth = 30 * 24; // Approximate
        break;
      case 'daily':
        installmentsPerMonth = 30;
        break;
      case 'weekly':
        installmentsPerMonth = 4.33; // Approximate
        break;
      case 'monthly':
        installmentsPerMonth = 1;
        break;
      case 'quarterly':
        installmentsPerMonth = 1/3;
        break;
      case 'yearly':
        installmentsPerMonth = 1/12;
        break;
      case 'custom':
        if (customDays && customDays > 0) {
          installmentsPerMonth = 30 / customDays; // e.g., every 5 days = 30/5 = 6 per month
        } else {
          installmentsPerMonth = 1;
        }
        break;
      default:
        installmentsPerMonth = 1;
    }

    const totalInstallments = Math.floor(duration * installmentsPerMonth);
    const totalInvested = totalInstallments * amount;

    // Calculate future value if XIRR is provided
    let futureValue: number | undefined;
    if (xirr && xirr > 0) {
      const periodsPerYear = getPeriodsPerYear(frequency);
      futureValue = calculateSIPFutureValue(amount, xirr, periodsPerYear, totalInstallments);
    }

    const mfSipCalculation: MFSIPCalculation = {
      id: editingCalculation?.id || crypto.randomUUID(),
      schemeCode: fund.schemeCode,
      name: data.name,
      amount,
      frequency,
      customDays,
      startDate,
      duration,
      totalInvested,
      totalInstallments,
      xirr,
      futureValue,
      enabled: enabled,
      createdAt: editingCalculation?.createdAt || new Date(),
    };

    setCalculation(mfSipCalculation);
    onSaveCalculation(mfSipCalculation);

    // If editing, call cancel edit callback
    if (editingCalculation && onCancelEdit) {
      onCancelEdit();
    }
  };

  const resetCalculator = () => {
    reset({
      startDate: new Date(),
      frequency: 'monthly',
      enabled: true,
    });
    setCalculation(null);
    if (editingCalculation && onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingCalculation ? `Edit SIP: ${editingCalculation.name}` : `SIP Calculator for ${fund.name}`}
          </CardTitle>
          <CardDescription>
            {editingCalculation
              ? 'Update your Systematic Investment Plan calculation.'
              : 'Set up automatic investments in this mutual fund.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(calculateMFSIP)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder={`SIP in ${fund.name.slice(0, 20)}...`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="1000"
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>

               <div className="space-y-2">
                 <Label>Frequency</Label>
                 <Select
                   onValueChange={(value: SIPFrequency) => setValue("frequency", value)}
                   defaultValue="monthly"
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select frequency" />
                   </SelectTrigger>
                   <SelectContent>
                     {FREQUENCY_OPTIONS.map((option) => (
                       <SelectItem key={option.value} value={option.value}>
                         {option.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 {errors.frequency && (
                   <p className="text-sm text-red-500">{errors.frequency.message}</p>
                 )}
               </div>

               {watchedFrequency === 'custom' && (
                 <div className="space-y-2">
                   <Label htmlFor="customDays">Custom Days</Label>
                   <Input
                     id="customDays"
                     type="number"
                     min="1"
                     {...register("customDays", { valueAsNumber: true })}
                     placeholder="e.g., 5"
                   />
                   {errors.customDays && (
                     <p className="text-sm text-red-500">{errors.customDays.message}</p>
                   )}
                   <p className="text-xs text-muted-foreground">
                     Number of days between each investment
                   </p>
                 </div>
               )}

              <div className="space-y-2">
                <Label>Start Date</Label>
                <DateInput
                  date={watchedDate}
                  onDateChange={(newDate) => setValue("startDate", newDate || new Date())}
                />
              </div>

               <div className="space-y-2">
                 <Label htmlFor="duration">Duration (Months)</Label>
                 <Input
                   id="duration"
                   type="number"
                   {...register("duration", { valueAsNumber: true })}
                   placeholder="Auto-calculated from start date"
                 />
                 {errors.duration && (
                   <p className="text-sm text-red-500">{errors.duration.message}</p>
                 )}
                 <p className="text-xs text-muted-foreground">
                   Duration is automatically calculated based on the start date to today
                 </p>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="xirr">Expected Return (XIRR %)</Label>
                 <Input
                   id="xirr"
                   type="number"
                   step="0.01"
                   {...register("xirr", { valueAsNumber: true })}
                   placeholder="Optional - e.g., 12.5"
                 />
                 {errors.xirr && (
                   <p className="text-sm text-red-500">{errors.xirr.message}</p>
                 )}
                 <p className="text-xs text-muted-foreground">
                   Optional: Expected annual return rate to calculate future value
                 </p>
               </div>
             </div>

             <div className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 id="enabled"
                 {...register("enabled")}
                 defaultChecked={true}
                 className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
               />
               <Label htmlFor="enabled" className="text-sm">
                 Include in monthly spend calculations
               </Label>
             </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button type="submit">{editingCalculation ? 'Update' : 'Save SIP'}</Button>
                <Button type="button" variant="outline" onClick={resetCalculator}>
                  {editingCalculation ? 'Cancel' : 'Reset'}
                </Button>
              </div>
              {realTimeTotal > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {watchedXirr && watchedXirr > 0 ? `Future Value (${watchedXirr}% XIRR)` : 'Total Invested'}
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    ₹{realTimeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle>SIP Calculation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Investment Details</h3>
                <p><strong>Fund:</strong> {fund.name}</p>
                <p><strong>Plan Name:</strong> {calculation.name}</p>
                <p><strong>Amount per installment:</strong> ₹{calculation.amount.toFixed(2)}</p>
                <p><strong>Frequency:</strong> {calculation.frequency}</p>
                <p><strong>Start Date:</strong> {format(calculation.startDate, "PPP")}</p>
                <p><strong>Duration:</strong> {calculation.duration} months</p>
              </div>
               <div>
                 <h3 className="font-semibold mb-2">Results</h3>
                 <p><strong>Total Installments:</strong> {calculation.totalInstallments}</p>
                 <p><strong>Total Amount Invested:</strong> ₹{calculation.totalInvested.toFixed(2)}</p>
                 {calculation.futureValue && calculation.xirr && (
                   <p><strong>Future Value at {calculation.xirr}% XIRR:</strong> ₹{calculation.futureValue.toFixed(2)}</p>
                 )}
                 <p className="text-sm text-muted-foreground">
                   End Date: {format(addMonths(calculation.startDate, calculation.duration), "PPP")}
                 </p>
               </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}