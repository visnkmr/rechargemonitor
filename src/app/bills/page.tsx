"use client";

import { useState } from "react";
import Link from "next/link";
import { BillForm } from "@/components/bill-form";
import { BillList } from "@/components/bill-list";
import { useBills } from "@/hooks/use-bills";
import { Bill } from "@/hooks/use-bills";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BillsPage() {
  const { bills, addBill, updateBill, deleteBill } = useBills();
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const handleSaveBill = (bill: Bill) => {
    if (editingBill) {
      updateBill(bill.id, bill);
    } else {
      addBill(bill);
    }
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
  };

  const handleCancelEdit = () => {
    setEditingBill(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold">Bill Manager</h1>
                <p className="text-muted-foreground">
                  Track your recurring bills and expenses.
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/recharges">
                <Button variant="outline">Recharge Monitor</Button>
              </Link>
              <Link href="/sip">
                <Button variant="outline">SIP Calculator</Button>
              </Link>
              <Link href="/fd">
                <Button variant="outline">FD Calculator</Button>
              </Link>
              <Link href="/loan">
                <Button variant="outline">Loan Calculator</Button>
              </Link>
              <Link href="/export">
                <Button variant="outline">Export/Import</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          <BillForm
            onSaveBill={handleSaveBill}
            editingBill={editingBill}
            onCancelEdit={handleCancelEdit}
          />
          <BillList
            bills={bills}
            onDeleteBill={deleteBill}
            onEditBill={handleEditBill}
          />
        </div>
      </div>
    </div>
  );
}