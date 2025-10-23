"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RechargeForm } from "@/components/recharge-form";
import { Recharge } from "@/lib/types";
import { format } from "date-fns";

interface RechargeHistoryProps {
  recharges: Recharge[];
  onUpdateRecharge: (id: string, recharge: Recharge) => void;
}

export function RechargeHistory({ recharges, onUpdateRecharge }: RechargeHistoryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recharge History</h2>
      {recharges.length === 0 ? (
        <p className="text-muted-foreground">No recharge history.</p>
      ) : (
        <div className="space-y-2">
          {recharges.map((recharge) => (
            <Card key={recharge.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">
                  {recharge.nickname} - {recharge.phoneNumber}
                </CardTitle>
                <RechargeForm
                  recharge={recharge}
                  onSubmit={(updatedRecharge) => onUpdateRecharge(recharge.id, updatedRecharge)}
                  trigger={<Button variant="outline" size="sm">Edit</Button>}
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>Amount: ${recharge.lastRechargeAmount.toFixed(2)}</p>
                    <p>Date: {format(recharge.rechargeDate, "PPP")}</p>
                  </div>
                  <div>
                    <p>Plan Days: {recharge.planDays}</p>
                    <p>Per Day Cost: ${recharge.perDayCost.toFixed(2)}</p>
                    <p>Remaining Days: {recharge.remainingDays}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}