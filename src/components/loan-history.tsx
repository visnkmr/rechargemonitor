"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { LoanCalculation } from "@/hooks/use-loan-calculations";
import { format } from "date-fns";

interface LoanHistoryProps {
  calculations: LoanCalculation[];
  onDeleteCalculation: (id: string) => void;
}

export function LoanHistory({ calculations, onDeleteCalculation }: LoanHistoryProps) {
  if (calculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Calculation History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No calculations saved yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Loan Calculation History</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {calculations.map((calc) => (
          <Card key={calc.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Loan Analysis</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteCalculation(calc.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <span>{calc.loanAmount.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">EMI:</span>
                  <span>{calc.emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span>{calc.remainingInstallments} installments</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Time Left:</span>
                  <span>{calc.remainingYears}y {calc.remainingMonths}m</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <span>Total Interest:</span>
                  <span className="text-red-600">{calc.totalInterestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <span>Total Paid:</span>
                  <span className="text-blue-600">{calc.totalAmountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-semibold text-green-600">
                  <span>XIRR:</span>
                  <span>{calc.xirr.toFixed(2)}%</span>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Created: {format(calc.createdAt, "MMM dd, yyyy HH:mm")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}