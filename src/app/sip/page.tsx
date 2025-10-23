"use client";

import { SIPCalculator } from "@/components/sip-calculator";
import { SIPHistory } from "@/components/sip-history";
import { useSIPCalculations } from "@/hooks/use-sip-calculations";
import { SIPCalculation } from "@/lib/types";

export default function SIPPage() {
  const { calculations, addCalculation, deleteCalculation } = useSIPCalculations();

  const handleSaveCalculation = (calculation: SIPCalculation) => {
    addCalculation(calculation);
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
          <SIPCalculator onSaveCalculation={handleSaveCalculation} />
          <SIPHistory
            calculations={calculations}
            onDeleteCalculation={deleteCalculation}
          />
        </div>
      </div>
    </div>
  );
}