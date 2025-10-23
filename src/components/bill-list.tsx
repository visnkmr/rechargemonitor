"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { Bill } from "@/hooks/use-bills";
import { format } from "date-fns";

interface BillListProps {
  bills: Bill[];
  onDeleteBill: (id: string) => void;
  onEditBill: (bill: Bill) => void;
}

export function BillList({ bills, onDeleteBill, onEditBill }: BillListProps) {
  if (bills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No bills saved yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Saved Bills</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bills.map((bill) => (
          <Card key={bill.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{bill.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditBill(bill)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteBill(bill.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>₹{bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span>Every {bill.frequencyDays} days</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <span>Monthly Cost:</span>
                  <span>₹{(bill.amount * (30 / bill.frequencyDays)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Created: {format(bill.createdAt, "MMM dd, yyyy HH:mm")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}