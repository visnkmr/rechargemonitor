"use client";

import { useState } from "react";
import Link from "next/link";
import { XIRRCalculator } from "@/components/xirr-calculator";
import { XIRRHistory } from "@/components/xirr-history";
import { useXIRRCalculations } from "@/hooks/use-xirr-calculations";
import { XIRRCalculation } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function XIRRPage() {
  const { calculations, addCalculation, updateCalculation, deleteCalculation } = useXIRRCalculations();
  const [editingCalculation, setEditingCalculation] = useState<XIRRCalculation | null>(null);

  const handleSaveCalculation = (calculation: XIRRCalculation) => {
    if (editingCalculation) {
      updateCalculation(calculation.id, calculation);
    } else {
      addCalculation(calculation);
    }
  };

  const handleEditCalculation = (calculation: XIRRCalculation) => {
    setEditingCalculation(calculation);
  };

  const handleCancelEdit = () => {
    setEditingCalculation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">XIRR Calculator</h1>
              <p className="text-muted-foreground">
                Calculate XIRR (Extended Internal Rate of Return) or final investment value.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
               <Link href="/">
                 <Button variant="outline">Dashboard</Button>
               </Link>
               <Link href="/recharges">
                 <Button variant="outline">Recharge Monitor</Button>
               </Link>
               <Link href="/fd">
                 <Button variant="outline">FD Calculator</Button>
               </Link>
               <Link href="/loan">
                 <Button variant="outline">Loan Calculator</Button>
               </Link>
               <Link href="/sip">
                 <Button variant="outline">SIP Calculator</Button>
               </Link>
               <Link href="/bills">
                 <Button variant="outline">Bill Manager</Button>
               </Link>
               <Link href="/export">
                 <Button variant="outline">Export/Import</Button>
               </Link>
             </div>
          </div>
        </header>

        <div className="space-y-8">
          <XIRRCalculator
            onSaveCalculation={handleSaveCalculation}
            editingCalculation={editingCalculation}
            onCancelEdit={handleCancelEdit}
          />
          <XIRRHistory
            calculations={calculations}
            onDeleteCalculation={deleteCalculation}
            onEditCalculation={handleEditCalculation}
          />
        </div>
      </div>
    </div>
  );
}