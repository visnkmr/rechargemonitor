"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RechargeForm } from "@/components/recharge-form";
import { Recharge } from "@/lib/types";

interface ActiveRechargesProps {
  recharges: Recharge[];
  onUpdateRecharge: (id: string, recharge: Recharge) => void;
}

export function ActiveRecharges({ recharges, onUpdateRecharge }: ActiveRechargesProps) {
  const activeRecharges = recharges.filter((r) => r.remainingDays > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Active Recharges</h2>
      {activeRecharges.length === 0 ? (
        <p className="text-muted-foreground">No active recharges.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeRecharges.map((recharge) => (
            <Card key={recharge.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>{recharge.nickname}</CardTitle>
                <RechargeForm
                  recharge={recharge}
                  onSubmit={(updatedRecharge) => onUpdateRecharge(recharge.id, updatedRecharge)}
                  trigger={<Button variant="outline" size="sm">Edit</Button>}
                />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Phone: {recharge.phoneNumber}
                </p>
                <p className="text-sm">
                  Remaining Days: {recharge.remainingDays}
                </p>
                <p className="text-sm">
                  Per Day Cost: ${recharge.perDayCost.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}