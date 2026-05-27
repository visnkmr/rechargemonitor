"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RechargeForm } from "@/components/recharge-form";
import { Recharge } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface ActiveRechargesProps {
  recharges: Recharge[];
  onUpdateRecharge: (id: string, recharge: Recharge) => void;
  onDeleteRecharge: (id: string) => void;
}

export function ActiveRecharges({ recharges, onUpdateRecharge, onDeleteRecharge }: ActiveRechargesProps) {
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
                <div className="flex gap-1">
                  <RechargeForm
                    recharge={recharge}
                    onSubmit={(updatedRecharge) => onUpdateRecharge(recharge.id, updatedRecharge)}
                    trigger={<Button variant="outline" size="sm">Edit</Button>}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteRecharge(recharge.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Phone: {recharge.phoneNumber}
                </p>
                <p className="text-sm">
                  Remaining Days: {recharge.remainingDays}
                </p>
                <p className="text-sm">
                  Per Day Cost: {recharge.perDayCost.toFixed(2)}
                </p>
                {recharge.endDate && (
                  <p className="text-sm text-muted-foreground">
                    End Date: {recharge.endDate.toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}