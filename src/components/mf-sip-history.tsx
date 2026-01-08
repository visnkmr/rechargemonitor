"use client";

import { MFSIPCalculation } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Target, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

interface MFSIPHistoryProps {
  calculations: MFSIPCalculation[];
  onDeleteCalculation: (id: string) => void;
  onEditCalculation: (calculation: MFSIPCalculation) => void;
  onToggleCalculation: (id: string) => void;
}

export function MFSIPHistory({
  calculations,
  onDeleteCalculation,
  onEditCalculation,
  onToggleCalculation
}: MFSIPHistoryProps) {
  if (calculations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SIP Plans
          </CardTitle>
          <CardDescription>
            Your saved SIP investment plans for this fund
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No SIP plans saved yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          SIP Plans ({calculations.length})
        </CardTitle>
        <CardDescription>
          Your saved SIP investment plans for this fund
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calculations.map((calc) => (
            <div key={calc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{calc.name}</h3>
                    <Badge variant={calc.enabled ? "default" : "secondary"}>
                      {calc.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Amount:</span> ₹{calc.amount.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span> {calc.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {calc.duration} months
                    </div>
                    <div>
                      <span className="font-medium">Start:</span> {format(calc.startDate, "MMM yyyy")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleCalculation(calc.id)}
                    title={calc.enabled ? "Disable SIP" : "Enable SIP"}
                  >
                    {calc.enabled ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditCalculation(calc)}
                    title="Edit SIP"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteCalculation(calc.id)}
                    title="Delete SIP"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Invested</div>
                  <div className="font-semibold text-green-600">
                    ₹{calc.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">
                    {calc.xirr ? `Future Value (${calc.xirr}% XIRR)` : 'Total Installments'}
                  </div>
                  <div className="font-semibold">
                    {calc.futureValue
                      ? `₹${calc.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : calc.totalInstallments
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}