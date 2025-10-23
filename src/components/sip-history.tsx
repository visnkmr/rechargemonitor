"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { SIPCalculation } from "@/lib/types";
import { format, addMonths } from "date-fns";

interface SIPHistoryProps {
  calculations: SIPCalculation[];
  onDeleteCalculation: (id: string) => void;
}

export function SIPHistory({ calculations, onDeleteCalculation }: SIPHistoryProps) {
  if (calculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SIP Calculation History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No calculations saved yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">SIP Calculation History</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {calculations.map((calc) => (
          <Card key={calc.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{calc.name}</CardTitle>
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
                  <span className="text-muted-foreground">Amount:</span>
                  <span>${calc.amount.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="capitalize">{calc.frequency}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{format(calc.startDate, "MMM dd, yyyy")}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{calc.duration} months</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Installments:</span>
                  <span>{calc.totalInstallments}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <span>Total Invested:</span>
                  <span>${calc.totalInvested.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  End Date: {format(addMonths(calc.startDate, calc.duration), "MMM dd, yyyy")}
                  <br />
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