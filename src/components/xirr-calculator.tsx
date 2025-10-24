"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { xirrSchema, type XIRRFormValues } from "@/lib/schemas";
import { XIRRCalculation, XIRRMode } from "@/lib/types";
import { calculateXIRR } from "@/lib/financial-utils";

interface XIRRCalculatorProps {
  onSaveCalculation: (calculation: XIRRCalculation) => void;
  editingCalculation?: XIRRCalculation | null;
  onCancelEdit?: () => void;
}

const MODE_OPTIONS = [
  { value: 'calculateXIRR', label: 'Calculate XIRR from Initial, Final & Period' },
  { value: 'calculateFinal', label: 'Calculate Final Value from Initial, XIRR & Period' },
] as const;

export function XIRRCalculator({ onSaveCalculation, editingCalculation, onCancelEdit }: XIRRCalculatorProps) {
  const [calculation, setCalculation] = useState<XIRRCalculation | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<XIRRFormValues>({
    resolver: zodResolver(xirrSchema),
    defaultValues: {
      mode: 'calculateXIRR',
    },
  });

  const watchedMode = watch("mode");
  const watchedInitialAmount = watch("initialAmount");
  const watchedFinalAmount = watch("finalAmount");
  const watchedXirr = watch("xirr");
  const watchedPeriodYears = watch("periodYears");

  // Save form values to localStorage
  useEffect(() => {
    const formData = {
      name: watch("name"),
      mode: watchedMode,
      initialAmount: watchedInitialAmount,
      finalAmount: watchedFinalAmount,
      xirr: watchedXirr,
      periodYears: watchedPeriodYears,
    };
    localStorage.setItem('xirr-calculator-form', JSON.stringify(formData));
  }, [watchedMode, watchedInitialAmount, watchedFinalAmount, watchedXirr, watchedPeriodYears, watch]);

  // Load saved values on mount
  useEffect(() => {
    const saved = localStorage.getItem('xirr-calculator-form');
    if (saved) {
      try {
        const formData = JSON.parse(saved);
        if (formData.name) setValue("name", formData.name);
        if (formData.mode) setValue("mode", formData.mode);
        if (formData.initialAmount) setValue("initialAmount", formData.initialAmount);
        if (formData.finalAmount) setValue("finalAmount", formData.finalAmount);
        if (formData.xirr) setValue("xirr", formData.xirr);
        if (formData.periodYears) setValue("periodYears", formData.periodYears);
      } catch (error) {
        console.error('Failed to load XIRR calculator form data:', error);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle editing mode
  useEffect(() => {
    if (editingCalculation) {
      reset({
        name: editingCalculation.name,
        mode: editingCalculation.mode,
        initialAmount: editingCalculation.initialAmount,
        finalAmount: editingCalculation.finalAmount,
        xirr: editingCalculation.xirr,
        periodYears: editingCalculation.periodYears,
      });
    } else {
      reset({
        mode: 'calculateXIRR',
      });
    }
  }, [editingCalculation, reset]);

  // Calculate XIRR or final value in real-time
  const calculateRealTime = () => {
    if (watchedMode === 'calculateXIRR') {
      if (!watchedInitialAmount || !watchedFinalAmount || !watchedPeriodYears) {
        return null;
      }
      // Cash flows: -initial at t=0, +final at t=period
      const cashFlows = [
        { amount: -watchedInitialAmount, date: new Date() },
        { amount: watchedFinalAmount, date: new Date(Date.now() + watchedPeriodYears * 365 * 24 * 60 * 60 * 1000) }
      ];
      const xirr = calculateXIRR(cashFlows);
      return { xirr };
    } else {
      if (!watchedInitialAmount || !watchedXirr || !watchedPeriodYears) {
        return null;
      }
      // Compound interest formula: A = P * (1 + r)^t
      const finalAmount = watchedInitialAmount * Math.pow(1 + watchedXirr / 100, watchedPeriodYears);
      return { finalAmount };
    }
  };

  const realTimeResult = calculateRealTime();

  const calculateXIRRValue = (data: XIRRFormValues) => {
    const { name, mode, initialAmount, finalAmount, xirr, periodYears } = data;

    let calculatedXirr: number | undefined;
    let calculatedFinalAmount: number | undefined;

    if (mode === 'calculateXIRR') {
      // Cash flows: -initial at t=0, +final at t=period
      const cashFlows = [
        { amount: -initialAmount, date: new Date() },
        { amount: finalAmount!, date: new Date(Date.now() + periodYears * 365 * 24 * 60 * 60 * 1000) }
      ];
      calculatedXirr = calculateXIRR(cashFlows);
    } else {
      // Compound interest formula: A = P * (1 + r)^t
      calculatedFinalAmount = initialAmount * Math.pow(1 + xirr! / 100, periodYears);
    }

    const xirrCalculation: XIRRCalculation = {
      id: editingCalculation?.id || crypto.randomUUID(),
      name,
      mode,
      initialAmount,
      finalAmount: mode === 'calculateXIRR' ? finalAmount : calculatedFinalAmount,
      xirr: mode === 'calculateXIRR' ? calculatedXirr : xirr,
      periodYears,
      createdAt: editingCalculation?.createdAt || new Date(),
    };

    setCalculation(xirrCalculation);
    onSaveCalculation(xirrCalculation);

    // If editing, call cancel edit callback
    if (editingCalculation && onCancelEdit) {
      onCancelEdit();
    }
  };

  const resetCalculator = () => {
    reset({
      mode: 'calculateXIRR',
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
            {editingCalculation ? `Edit XIRR: ${editingCalculation.name}` : 'XIRR Calculator'}
          </CardTitle>
          <CardDescription>
            {editingCalculation
              ? 'Update your XIRR calculation.'
              : 'Calculate XIRR (Extended Internal Rate of Return) or final value for investments.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(calculateXIRRValue)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Calculation Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Stock Investment"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Calculation Mode</Label>
              <RadioGroup
                value={watchedMode}
                onValueChange={(value: XIRRMode) => setValue("mode", value)}
                className="flex flex-col space-y-2"
              >
                {MODE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.mode && (
                <p className="text-sm text-red-500">{errors.mode.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialAmount">Initial Amount</Label>
                <Input
                  id="initialAmount"
                  type="number"
                  step="0.01"
                  {...register("initialAmount", { valueAsNumber: true })}
                  placeholder="10000"
                />
                {errors.initialAmount && (
                  <p className="text-sm text-red-500">{errors.initialAmount.message}</p>
                )}
              </div>

              {watchedMode === 'calculateXIRR' ? (
                <div className="space-y-2">
                  <Label htmlFor="finalAmount">Final Amount</Label>
                  <Input
                    id="finalAmount"
                    type="number"
                    step="0.01"
                    {...register("finalAmount", { valueAsNumber: true })}
                    placeholder="15000"
                  />
                  {errors.finalAmount && (
                    <p className="text-sm text-red-500">{errors.finalAmount.message}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="xirr">XIRR (%)</Label>
                  <Input
                    id="xirr"
                    type="number"
                    step="0.01"
                    {...register("xirr", { valueAsNumber: true })}
                    placeholder="12.5"
                  />
                  {errors.xirr && (
                    <p className="text-sm text-red-500">{errors.xirr.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="periodYears">Period (Years)</Label>
                <Input
                  id="periodYears"
                  type="number"
                  step="0.01"
                  {...register("periodYears", { valueAsNumber: true })}
                  placeholder="5"
                />
                {errors.periodYears && (
                  <p className="text-sm text-red-500">{errors.periodYears.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button type="submit">{editingCalculation ? 'Update' : 'Calculate & Save'}</Button>
                <Button type="button" variant="outline" onClick={resetCalculator}>
                  {editingCalculation ? 'Cancel' : 'Reset'}
                </Button>
              </div>
              {realTimeResult && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {watchedMode === 'calculateXIRR' ? 'Calculated XIRR' : 'Calculated Final Value'}
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    {watchedMode === 'calculateXIRR'
                      ? `${realTimeResult.xirr?.toFixed(2)}%`
                      : realTimeResult.finalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    }
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
            <CardTitle>Calculation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Investment Details</h3>
                <p><strong>Name:</strong> {calculation.name}</p>
                <p><strong>Initial Amount:</strong> {calculation.initialAmount.toLocaleString()}</p>
                <p><strong>Period:</strong> {calculation.periodYears} years</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Results</h3>
                {calculation.mode === 'calculateXIRR' ? (
                  <>
                    <p><strong>Final Amount:</strong> {calculation.finalAmount?.toLocaleString()}</p>
                    <p><strong>XIRR:</strong> {calculation.xirr?.toFixed(2)}%</p>
                  </>
                ) : (
                  <>
                    <p><strong>XIRR:</strong> {calculation.xirr?.toFixed(2)}%</p>
                    <p><strong>Final Amount:</strong> {calculation.finalAmount?.toLocaleString()}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}