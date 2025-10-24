"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { XIRRCalculation } from "@/lib/types";
import { format } from "date-fns";

interface XIRRHistoryProps {
  calculations: XIRRCalculation[];
  onDeleteCalculation: (id: string) => void;
  onEditCalculation: (calculation: XIRRCalculation) => void;
}

export function XIRRHistory({ calculations, onDeleteCalculation, onEditCalculation }: XIRRHistoryProps) {
  if (calculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>XIRR Calculation History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No calculations saved yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">XIRR Calculation History</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {calculations.map((calc) => (
          <Card key={calc.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{calc.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditCalculation(calc)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteCalculation(calc.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Mode:</span>
                  <span>{calc.mode === 'calculateXIRR' ? 'Calculate XIRR' : 'Calculate Final'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Initial Amount:</span>
                  <span>{calc.initialAmount.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Period:</span>
                  <span>{calc.periodYears} years</span>
                </div>
                {calc.mode === 'calculateXIRR' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Final Amount:</span>
                      <span>{calc.finalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-semibold text-green-600">
                      <span>XIRR:</span>
                      <span>{calc.xirr?.toFixed(2)}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">XIRR:</span>
                      <span>{calc.xirr?.toFixed(2)}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-semibold text-green-600">
                      <span>Final Amount:</span>
                      <span>{calc.finalAmount?.toLocaleString()}</span>
                    </div>
                  </>
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