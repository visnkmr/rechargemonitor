"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addMonths } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { sipSchema, type SIPFormValues } from "@/lib/schemas";
import { SIPCalculation, SIPFrequency } from "@/lib/types";

interface SIPCalculatorProps {
  onSaveCalculation: (calculation: SIPCalculation) => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export function SIPCalculator({ onSaveCalculation }: SIPCalculatorProps) {
  const [calculation, setCalculation] = useState<SIPCalculation | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SIPFormValues>({
    resolver: zodResolver(sipSchema),
    defaultValues: {
      startDate: new Date(),
      frequency: 'monthly',
    },
  });

  const watchedDate = watch("startDate");

  const calculateSIP = (data: SIPFormValues) => {
    const { amount, frequency, startDate, duration } = data;

    // Calculate number of installments based on frequency
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
      default:
        installmentsPerMonth = 1;
    }

    const totalInstallments = Math.floor(duration * installmentsPerMonth);
    const totalInvested = totalInstallments * amount;

    const sipCalculation: SIPCalculation = {
      id: crypto.randomUUID(),
      name: data.name,
      amount,
      frequency,
      startDate,
      duration,
      totalInvested,
      totalInstallments,
      createdAt: new Date(),
    };

    setCalculation(sipCalculation);
    onSaveCalculation(sipCalculation);
  };

  const resetCalculator = () => {
    reset();
    setCalculation(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SIP Calculator</CardTitle>
          <CardDescription>
            Calculate your total investment amount for Systematic Investment Plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(calculateSIP)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Monthly SIP"
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

              <div className="space-y-2">
                <Label>Start Date</Label>
                <DateInput
                  date={watchedDate}
                  onDateChange={(newDate) => setValue("startDate", newDate || new Date())}
                  placeholder="Select or enter date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Months)</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register("duration", { valueAsNumber: true })}
                  placeholder="12"
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Calculate</Button>
              <Button type="button" variant="outline" onClick={resetCalculator}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle>Calculation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Investment Details</h3>
                <p><strong>Plan Name:</strong> {calculation.name}</p>
                <p><strong>Amount per installment:</strong> ${calculation.amount.toFixed(2)}</p>
                <p><strong>Frequency:</strong> {calculation.frequency}</p>
                <p><strong>Start Date:</strong> {format(calculation.startDate, "PPP")}</p>
                <p><strong>Duration:</strong> {calculation.duration} months</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Results</h3>
                <p><strong>Total Installments:</strong> {calculation.totalInstallments}</p>
                <p><strong>Total Amount Invested:</strong> ${calculation.totalInvested.toFixed(2)}</p>
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