"use client";

import { useState } from "react";
import Link from "next/link";
import { RechargeForm } from "@/components/recharge-form";
import { ActiveRecharges } from "@/components/active-recharges";
import { RechargeHistory } from "@/components/recharge-history";
import { useRecharges } from "@/hooks/use-recharges";
import { Recharge } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { recharges, addRecharge, updateRecharge } = useRecharges();
  const [showHistory, setShowHistory] = useState(false);

  const handleUpdateRecharge = (id: string, updatedRecharge: Recharge) => {
    updateRecharge(id, updatedRecharge);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Recharge Monitor</h1>
              <p className="text-muted-foreground">
                Track your mobile recharges and monitor active plans.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/sip">
                <Button variant="outline">SIP Calculator</Button>
              </Link>
              <Link href="/export">
                <Button variant="outline">Export/Import</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="mb-8 flex gap-4">
          <RechargeForm onSubmit={addRecharge} />
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide History" : "Show History"}
          </Button>
        </div>

        <ActiveRecharges recharges={recharges} onUpdateRecharge={handleUpdateRecharge} />

        {showHistory && (
          <div className="mt-8">
            <RechargeHistory recharges={recharges} onUpdateRecharge={handleUpdateRecharge} />
          </div>
        )}
      </div>
    </div>
  );
}
