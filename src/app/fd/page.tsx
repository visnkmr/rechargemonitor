"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, TrendingUp, Save } from "lucide-react";
import { calculateFDMaturity, calculateFDInterest } from "@/lib/financial-utils";
import { useFDCalculations } from "@/hooks/use-fd-calculations";
import { FDHistory } from "@/components/fd-history";

const fdSchema = z.object({
  principal: z.number().min(1, "Principal must be greater than 0"),
  annualRate: z.number().min(0.01, "Rate must be greater than 0").max(50, "Rate cannot exceed 50%"),
  years: z.number().min(0.1, "Years must be at least 0.1").max(50, "Years cannot exceed 50"),
  compoundingFrequency: z.number().min(1, "Compounding frequency must be at least 1").max(365, "Cannot exceed daily compounding"),
  xirr: z.number().min(0).max(100).optional(),
});

type FDFormValues = z.infer<typeof fdSchema>;

export default function FDPage() {
  const { calculations, addCalculation, deleteCalculation } = useFDCalculations();

  const [calculation, setCalculation] = useState<{
    principal: number;
    annualRate: number;
    years: number;
    compoundingFrequency: number;
    maturityAmount: number;
    totalInterest: number;
    xirr?: number;
    xirrMaturityAmount?: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FDFormValues>({
    resolver: zodResolver(fdSchema),
    defaultValues: {
      compoundingFrequency: 12, // Monthly by default
    },
  });

  const watchedPrincipal = watch("principal");
  const watchedRate = watch("annualRate");
  const watchedYears = watch("years");
  const watchedFrequency = watch("compoundingFrequency");
  const watchedXirr = watch("xirr");

  // Save form values to localStorage
  useEffect(() => {
    const formData = {
      principal: watchedPrincipal,
      annualRate: watchedRate,
      years: watchedYears,
      compoundingFrequency: watchedFrequency,
      xirr: watchedXirr,
    };
    localStorage.setItem('fd-calculator-form', JSON.stringify(formData));
  }, [watchedPrincipal, watchedRate, watchedYears, watchedFrequency, watchedXirr]);

  // Load saved values on mount
  useEffect(() => {
    const saved = localStorage.getItem('fd-calculator-form');
    if (saved) {
      try {
        const formData = JSON.parse(saved);
        if (formData.principal) setValue("principal", formData.principal);
        if (formData.annualRate) setValue("annualRate", formData.annualRate);
        if (formData.years) setValue("years", formData.years);
        if (formData.compoundingFrequency) setValue("compoundingFrequency", formData.compoundingFrequency);
        if (formData.xirr) setValue("xirr", formData.xirr);
      } catch (error) {
        console.error('Failed to load FD calculator form data:', error);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time calculation
  const realTimeCalculation = () => {
    if (!watchedPrincipal || !watchedRate || !watchedYears || !watchedFrequency) {
      return null;
    }

    const maturityAmount = calculateFDMaturity(watchedPrincipal, watchedRate, watchedYears, watchedFrequency);
    const totalInterest = calculateFDInterest(watchedPrincipal, maturityAmount);

    let xirrMaturityAmount: number | undefined;
    if (watchedXirr && watchedXirr > 0) {
      xirrMaturityAmount = calculateFDMaturity(watchedPrincipal, watchedXirr, watchedYears, watchedFrequency);
    }

    return {
      principal: watchedPrincipal,
      annualRate: watchedRate,
      years: watchedYears,
      compoundingFrequency: watchedFrequency,
      maturityAmount,
      totalInterest,
      xirr: watchedXirr,
      xirrMaturityAmount,
    };
  };

  const realTimeResult = realTimeCalculation();

  const calculateFD = (data: FDFormValues) => {
    const { principal, annualRate, years, compoundingFrequency, xirr } = data;

    const maturityAmount = calculateFDMaturity(principal, annualRate, years, compoundingFrequency);
    const totalInterest = calculateFDInterest(principal, maturityAmount);

    let xirrMaturityAmount: number | undefined;
    if (xirr && xirr > 0) {
      xirrMaturityAmount = calculateFDMaturity(principal, xirr, years, compoundingFrequency);
    }

    const result = {
      principal,
      annualRate,
      years,
      compoundingFrequency,
      maturityAmount,
      totalInterest,
      xirr,
      xirrMaturityAmount,
    };

    setCalculation(result);
  };

  const resetCalculator = () => {
    setCalculation(null);
  };

  const saveCalculation = () => {
    if (!calculation) return;

    const fdCalculation = {
      id: crypto.randomUUID(),
      ...calculation,
      createdAt: new Date(),
    };

    addCalculation(fdCalculation);
  };

  const getCompoundingLabel = (frequency: number) => {
    switch (frequency) {
      case 1: return "Annually";
      case 2: return "Semi-annually";
      case 4: return "Quarterly";
      case 12: return "Monthly";
      case 24: return "Semi-monthly";
      case 52: return "Weekly";
      case 365: return "Daily";
      default: return `${frequency} times per year`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex gap-2">
               <Link href="/">
                 <Button variant="outline" size="sm">Dashboard</Button>
               </Link>
               <Link href="/recharges">
                 <Button variant="outline" size="sm">Recharge Monitor</Button>
               </Link>
               <Link href="/sip">
                 <Button variant="outline" size="sm">SIP Calculator</Button>
               </Link>
                <Link href="/loan">
                  <Button variant="outline" size="sm">Loan Calculator</Button>
                </Link>
                <Link href="/xirr">
                  <Button variant="outline" size="sm">XIRR Calculator</Button>
                </Link>
                <Link href="/bills">
                  <Button variant="outline" size="sm">Bill Manager</Button>
                </Link>
               <Link href="/export">
                 <Button variant="outline" size="sm">Export/Import</Button>
               </Link>
             </div>
          </div>
          <h1 className="text-4xl font-bold">FD Calculator</h1>
          <p className="text-muted-foreground">
            Calculate Fixed Deposit maturity amount and interest earned.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                FD Calculator
              </CardTitle>
              <CardDescription>
                Enter your FD details to calculate maturity amount and interest.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(calculateFD)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">Principal Amount</Label>
                  <Input
                    id="principal"
                    type="number"
                    step="0.01"
                    {...register("principal", { valueAsNumber: true })}
                    placeholder="10000"
                  />
                  {errors.principal && (
                    <p className="text-sm text-red-500">{errors.principal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualRate">Annual Interest Rate (%)</Label>
                  <Input
                    id="annualRate"
                    type="number"
                    step="0.01"
                    {...register("annualRate", { valueAsNumber: true })}
                    placeholder="6.5"
                  />
                  {errors.annualRate && (
                    <p className="text-sm text-red-500">{errors.annualRate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years">Time Period (Years)</Label>
                  <Input
                    id="years"
                    type="number"
                    step="0.01"
                    {...register("years", { valueAsNumber: true })}
                    placeholder="5"
                  />
                  {errors.years && (
                    <p className="text-sm text-red-500">{errors.years.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xirr">Expected Return (XIRR %)</Label>
                  <Input
                    id="xirr"
                    type="number"
                    step="0.01"
                    {...register("xirr", { valueAsNumber: true })}
                    placeholder="Optional - e.g., 7.5"
                  />
                  {errors.xirr && (
                    <p className="text-sm text-red-500">{errors.xirr.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Optional: Compare with different expected return rate
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Compounding Frequency</Label>
                  <Select
                    onValueChange={(value) => setValue("compoundingFrequency", parseInt(value))}
                    defaultValue="12"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Annually</SelectItem>
                      <SelectItem value="2">Semi-annually</SelectItem>
                      <SelectItem value="4">Quarterly</SelectItem>
                      <SelectItem value="12">Monthly</SelectItem>
                      <SelectItem value="24">Semi-monthly</SelectItem>
                      <SelectItem value="52">Weekly</SelectItem>
                      <SelectItem value="365">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.compoundingFrequency && (
                    <p className="text-sm text-red-500">{errors.compoundingFrequency.message}</p>
                  )}
                </div>

                 <div className="flex gap-2">
                   <Button type="submit">Calculate</Button>
                   <Button type="button" variant="outline" onClick={resetCalculator}>
                     Reset
                   </Button>
                   {calculation && (
                     <Button type="button" variant="outline" onClick={saveCalculation}>
                       <Save className="h-4 w-4 mr-2" />
                       Save
                     </Button>
                   )}
                 </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {calculation ? "Calculation Result" : "Live Preview"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {realTimeResult && !calculation && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Principal:</p>
                      <p className="font-semibold">{realTimeResult.principal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate:</p>
                      <p className="font-semibold">{realTimeResult.annualRate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time:</p>
                      <p className="font-semibold">{realTimeResult.years} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Compounding:</p>
                      <p className="font-semibold">{getCompoundingLabel(realTimeResult.compoundingFrequency)}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Initial Investment:</p>
                          <p className="text-lg font-bold">
                            {realTimeResult.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Maturity Amount ({realTimeResult.annualRate}%):</p>
                          <p className="text-lg font-bold text-green-600">
                            {realTimeResult.maturityAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      {realTimeResult.xirr && realTimeResult.xirrMaturityAmount && (
                        <div className="grid grid-cols-2 gap-4 border-t pt-2">
                          <div>
                            <p className="text-muted-foreground">At {realTimeResult.xirr}% XIRR:</p>
                            <p className="text-lg font-bold text-blue-600">
                              {realTimeResult.xirrMaturityAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Difference:</p>
                            <p className={`text-lg font-bold ${(realTimeResult.xirrMaturityAmount - realTimeResult.maturityAmount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(realTimeResult.xirrMaturityAmount - realTimeResult.maturityAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Total Interest:</p>
                          <p className="text-lg font-bold text-blue-600">
                            {realTimeResult.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {calculation && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Principal Amount:</p>
                      <p className="font-semibold">{calculation.principal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Annual Rate:</p>
                      <p className="font-semibold">{calculation.annualRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Period:</p>
                      <p className="font-semibold">{calculation.years} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Compounding:</p>
                      <p className="font-semibold">{getCompoundingLabel(calculation.compoundingFrequency)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Initial Investment:</p>
                          <p className="text-2xl font-bold">
                            {calculation.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Maturity Amount ({calculation.annualRate}%):</p>
                          <p className="text-2xl font-bold text-green-600">
                            {calculation.maturityAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      {calculation.xirr && calculation.xirrMaturityAmount && (
                        <div className="grid grid-cols-2 gap-4 border-t pt-2">
                          <div>
                            <p className="text-muted-foreground">At {calculation.xirr}% XIRR:</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {calculation.xirrMaturityAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Difference:</p>
                            <p className={`text-2xl font-bold ${(calculation.xirrMaturityAmount - calculation.maturityAmount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(calculation.xirrMaturityAmount - calculation.maturityAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Total Interest Earned:</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {calculation.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!realTimeResult && !calculation && (
                <p className="text-muted-foreground text-center py-8">
                  Enter FD details to see live calculations
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <FDHistory calculations={calculations} onDeleteCalculation={deleteCalculation} />
      </div>
    </div>
  );
}