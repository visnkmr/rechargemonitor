"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { FDCalculation } from "@/hooks/use-fd-calculations";
import { format } from "date-fns";

interface FDHistoryProps {
  calculations: FDCalculation[];
  onDeleteCalculation: (id: string) => void;
}

export function FDHistory({ calculations, onDeleteCalculation }: FDHistoryProps) {
  if (calculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>FD Calculation History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No calculations saved yet.</p>
        </CardContent>
      </Card>
    );
  }

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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">FD Calculation History</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {calculations.map((calc) => (
          <Card key={calc.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">FD Calculation</CardTitle>
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
                  <span className="text-muted-foreground">Principal:</span>
                  <span>{calc.principal.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Rate:</span>
                  <span>{calc.annualRate}% p.a.</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{calc.years} years</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Compounding:</span>
                  <span>{getCompoundingLabel(calc.compoundingFrequency)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <span>Maturity Amount:</span>
                  <span className="text-green-600">{calc.maturityAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <span>Total Interest:</span>
                  <span className="text-blue-600">{calc.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {calc.xirr && calc.xirrMaturityAmount && (
                  <div className="grid grid-cols-2 gap-2 font-semibold text-purple-600">
                    <span>At {calc.xirr}% XIRR:</span>
                    <span>{calc.xirrMaturityAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
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