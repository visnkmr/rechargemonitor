"use client";

import { useState } from "react";
import { SIPCalculator } from "@/components/sip-calculator";
import { SIPHistory } from "@/components/sip-history";
import { useSIPCalculations } from "@/hooks/use-sip-calculations";
import { SIPCalculation } from "@/lib/types";

export default function SIPPage() {
  const { calculations, addCalculation, updateCalculation, deleteCalculation } = useSIPCalculations();
  const [editingCalculation, setEditingCalculation] = useState<SIPCalculation | null>(null);

  const handleSaveCalculation = (calculation: SIPCalculation) => {
    if (editingCalculation) {
      updateCalculation(calculation.id, calculation);
    } else {
      addCalculation(calculation);
    }
  };

  const handleEditCalculation = (calculation: SIPCalculation) => {
    setEditingCalculation(calculation);
  };

  const handleCancelEdit = () => {
    setEditingCalculation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">SIP Calculator</h1>
          <p className="text-muted-foreground">
            Calculate your Systematic Investment Plan totals and track your investment history.
          </p>
        </header>

        <div className="space-y-8">
          <SIPCalculator
            onSaveCalculation={handleSaveCalculation}
            editingCalculation={editingCalculation}
            onCancelEdit={handleCancelEdit}
          />
          <SIPHistory
            calculations={calculations}
            onDeleteCalculation={deleteCalculation}
            onEditCalculation={handleEditCalculation}
          />
        </div>
      </div>
    </div>
  );
}