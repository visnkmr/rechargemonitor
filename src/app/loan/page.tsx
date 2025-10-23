"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, TrendingDown, Calendar } from "lucide-react";
import { calculateLoanDetailsWithTotal } from "@/lib/financial-utils";

const loanSchema = z.object({
  loanAmount: z.number().min(1, "Loan amount must be greater than 0"),
  totalInstallments: z.number().min(1, "Total installments must be at least 1"),
  remainingInstallments: z.number().min(1, "Remaining installments must be at least 1"),
  remainingPrincipal: z.number().min(0, "Remaining principal cannot be negative"),
  emi: z.number().min(1, "EMI must be greater than 0"),
}).refine((data) => {
  return data.remainingPrincipal <= data.loanAmount;
}, {
  message: "Remaining principal cannot exceed loan amount",
  path: ["remainingPrincipal"],
}).refine((data) => {
  return data.remainingInstallments <= data.totalInstallments;
}, {
  message: "Remaining installments cannot exceed total installments",
  path: ["remainingInstallments"],
});

type LoanFormValues = z.infer<typeof loanSchema>;

export default function LoanPage() {
  const [calculation, setCalculation] = useState<{
    loanAmount: number;
    totalInstallments: number;
    remainingInstallments: number;
    remainingPrincipal: number;
    emi: number;
    totalInterestPaid: number;
    totalAmountPaid: number;
    remainingAmount: number;
    xirr: number;
    remainingMonths: number;
    remainingYears: number;
    totalInterestOverLoan: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
  });

  const watchedLoanAmount = watch("loanAmount");
  const watchedTotalInstallments = watch("totalInstallments");
  const watchedRemainingInstallments = watch("remainingInstallments");
  const watchedRemainingPrincipal = watch("remainingPrincipal");
  const watchedEmi = watch("emi");

  // Save form values to localStorage
  useEffect(() => {
    const formData = {
      loanAmount: watchedLoanAmount,
      totalInstallments: watchedTotalInstallments,
      remainingInstallments: watchedRemainingInstallments,
      remainingPrincipal: watchedRemainingPrincipal,
      emi: watchedEmi,
    };
    localStorage.setItem('loan-calculator-form', JSON.stringify(formData));
  }, [watchedLoanAmount, watchedTotalInstallments, watchedRemainingInstallments, watchedRemainingPrincipal, watchedEmi]);

  // Load saved values on mount
  useEffect(() => {
    const saved = localStorage.getItem('loan-calculator-form');
    if (saved) {
      try {
        const formData = JSON.parse(saved);
        if (formData.loanAmount) setValue("loanAmount", formData.loanAmount);
        if (formData.totalInstallments) setValue("totalInstallments", formData.totalInstallments);
        if (formData.remainingInstallments) setValue("remainingInstallments", formData.remainingInstallments);
        if (formData.remainingPrincipal) setValue("remainingPrincipal", formData.remainingPrincipal);
        if (formData.emi) setValue("emi", formData.emi);
      } catch (error) {
        console.error('Failed to load loan calculator form data:', error);
      }
    }
  }, []); // setValue is stable, no need to include it

  // Real-time calculation
  const realTimeCalculation = () => {
    if (!watchedLoanAmount || !watchedTotalInstallments || !watchedRemainingInstallments || watchedRemainingPrincipal === undefined || !watchedEmi) {
      return null;
    }

    return calculateLoanDetailsWithTotal(
      watchedLoanAmount,
      watchedTotalInstallments,
      watchedRemainingInstallments,
      watchedRemainingPrincipal,
      watchedEmi
    );
  };

  const realTimeResult = realTimeCalculation();

  const calculateLoan = (data: LoanFormValues) => {
    const { loanAmount, totalInstallments, remainingInstallments, remainingPrincipal, emi } = data;

    const result = calculateLoanDetailsWithTotal(loanAmount, totalInstallments, remainingInstallments, remainingPrincipal, emi);
    setCalculation({
      loanAmount,
      totalInstallments,
      remainingInstallments,
      remainingPrincipal,
      emi,
      ...result,
    });
  };

  const resetCalculator = () => {
    setCalculation(null);
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
              <Link href="/sip">
                <Button variant="outline" size="sm">SIP Calculator</Button>
              </Link>
              <Link href="/fd">
                <Button variant="outline" size="sm">FD Calculator</Button>
              </Link>
              <Link href="/export">
                <Button variant="outline" size="sm">Export/Import</Button>
              </Link>
            </div>
          </div>
          <h1 className="text-4xl font-bold">Loan Calculator</h1>
          <p className="text-muted-foreground">
            Calculate loan XIRR, total interest paid, and remaining time from EMI details.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Loan Calculator
              </CardTitle>
              <CardDescription>
                Enter your loan details to calculate XIRR and interest information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(calculateLoan)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Original Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    step="0.01"
                    {...register("loanAmount", { valueAsNumber: true })}
                    placeholder="500000"
                  />
                  {errors.loanAmount && (
                    <p className="text-sm text-red-500">{errors.loanAmount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalInstallments">Total Installments</Label>
                  <Input
                    id="totalInstallments"
                    type="number"
                    {...register("totalInstallments", { valueAsNumber: true })}
                    placeholder="60"
                  />
                  {errors.totalInstallments && (
                    <p className="text-sm text-red-500">{errors.totalInstallments.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remainingInstallments">Remaining Installments</Label>
                  <Input
                    id="remainingInstallments"
                    type="number"
                    {...register("remainingInstallments", { valueAsNumber: true })}
                    placeholder="36"
                  />
                  {errors.remainingInstallments && (
                    <p className="text-sm text-red-500">{errors.remainingInstallments.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remainingPrincipal">Remaining Principal Amount</Label>
                  <Input
                    id="remainingPrincipal"
                    type="number"
                    step="0.01"
                    {...register("remainingPrincipal", { valueAsNumber: true })}
                    placeholder="350000"
                  />
                  {errors.remainingPrincipal && (
                    <p className="text-sm text-red-500">{errors.remainingPrincipal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emi">Monthly EMI</Label>
                  <Input
                    id="emi"
                    type="number"
                    step="0.01"
                    {...register("emi", { valueAsNumber: true })}
                    placeholder="15000"
                  />
                  {errors.emi && (
                    <p className="text-sm text-red-500">{errors.emi.message}</p>
                  )}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                {calculation ? "Calculation Result" : "Live Preview"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {realTimeResult && !calculation && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Loan Amount:</p>
                      <p className="font-semibold">{watchedLoanAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Installments:</p>
                      <p className="font-semibold">{watchedTotalInstallments}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining Principal:</p>
                      <p className="font-semibold">{watchedRemainingPrincipal?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining EMIs:</p>
                      <p className="font-semibold">{watchedRemainingInstallments}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">EMI Amount:</p>
                      <p className="font-semibold">{watchedEmi?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground">XIRR:</p>
                        <p className="text-lg font-bold text-blue-600">
                          {realTimeResult.xirr.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Interest Paid:</p>
                        <p className="text-lg font-bold text-red-600">
                          {realTimeResult.totalInterestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining Time:</p>
                        <p className="text-lg font-bold text-green-600">
                          {realTimeResult.remainingMonths} months
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Remaining:</p>
                        <p className="text-lg font-bold text-orange-600">
                          {realTimeResult.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {calculation && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Original Loan Amount:</p>
                      <p className="font-semibold">{calculation.loanAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Installments:</p>
                      <p className="font-semibold">{calculation.totalInstallments}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining Principal:</p>
                      <p className="font-semibold">{calculation.remainingPrincipal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining EMIs:</p>
                      <p className="font-semibold">{calculation.remainingInstallments}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">EMI Amount:</p>
                      <p className="font-semibold">{calculation.emi.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-muted-foreground">Loan XIRR (Internal Rate of Return):</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {calculation.xirr.toFixed(2)}% per annum
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-muted-foreground">Total Interest Paid So Far:</p>
                          <p className="text-2xl font-bold text-red-600">
                            {calculation.totalInterestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ({calculation.paidInstallments} installments paid)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-muted-foreground">Total Interest Over Loan Period:</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {calculation.totalInterestOverLoan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            (Total payable: {calculation.totalAmountPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-muted-foreground">Remaining Time:</p>
                          <p className="text-xl font-bold text-green-600">
                            {calculation.remainingMonths} months ({calculation.remainingYears.toFixed(1)} years)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-muted-foreground">Total Amount Remaining to Pay:</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {calculation.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!realTimeResult && !calculation && (
                <p className="text-muted-foreground text-center py-8">
                  Enter loan details to see live calculations
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}