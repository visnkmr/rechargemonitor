"use client";

import { useState } from "react";
import { MutualFundWithHistory, MFSIPCalculation } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MFPurchaseTracker } from "@/components/mf-purchase-tracker";
import { MFSIPCalculator } from "@/components/mf-sip-calculator";
import { MFSIPHistory } from "@/components/mf-sip-history";
import { MFPurchase } from "@/lib/types";

interface MFFinancialTrackerProps {
  fund: MutualFundWithHistory;
  purchases: MFPurchase[];
  sipCalculations: MFSIPCalculation[];
  onAddPurchase: (purchase: Omit<MFPurchase, 'id' | 'createdAt'>) => void;
  onUpdatePurchase: (id: string, purchase: Partial<MFPurchase>) => void;
  onDeletePurchase: (id: string) => void;
  onAddSIPCalculation: (calculation: MFSIPCalculation) => void;
  onUpdateSIPCalculation: (id: string, calculation: Partial<MFSIPCalculation>) => void;
  onDeleteSIPCalculation: (id: string) => void;
  onToggleSIPCalculation: (id: string) => void;
}

export function MFFinancialTracker({
  fund,
  purchases,
  sipCalculations,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase,
  onAddSIPCalculation,
  onUpdateSIPCalculation,
  onDeleteSIPCalculation,
  onToggleSIPCalculation
}: MFFinancialTrackerProps) {
  const [editingSIP, setEditingSIP] = useState<MFSIPCalculation | null>(null);

  const handleSaveSIP = (calculation: MFSIPCalculation) => {
    onAddSIPCalculation(calculation);
    setEditingSIP(null);
  };

  const handleEditSIP = (calculation: MFSIPCalculation) => {
    setEditingSIP(calculation);
  };

  const handleCancelEditSIP = () => {
    setEditingSIP(null);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sip" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sip">SIP Calculator</TabsTrigger>
          <TabsTrigger value="purchases">One-time Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="sip" className="space-y-6">
          <MFSIPCalculator
            fund={fund}
            onSaveCalculation={handleSaveSIP}
            editingCalculation={editingSIP}
            onCancelEdit={handleCancelEditSIP}
          />
          <MFSIPHistory
            calculations={sipCalculations}
            onDeleteCalculation={onDeleteSIPCalculation}
            onEditCalculation={handleEditSIP}
            onToggleCalculation={onToggleSIPCalculation}
          />
        </TabsContent>

        <TabsContent value="purchases">
          <MFPurchaseTracker
            fund={fund}
            purchases={purchases}
            onAddPurchase={onAddPurchase}
            onUpdatePurchase={onUpdatePurchase}
            onDeletePurchase={onDeletePurchase}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}