"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recharge } from "@/lib/types";
import { TrendingUp, DollarSign, History } from "lucide-react";

interface RechargeStatsProps {
  recharges: Recharge[];
}

export function RechargeStats({ recharges }: RechargeStatsProps) {
  // Calculate active recharges total (recharges with remaining days > 0)
  const activeRechargesTotal = recharges
    .filter(recharge => recharge.remainingDays > 0)
    .reduce((total, recharge) => total + recharge.lastRechargeAmount, 0);

  // Calculate total spent across all history
  const totalSpent = recharges.reduce((total, recharge) => total + recharge.lastRechargeAmount, 0);

  // Count active recharges
  const activeRechargesCount = recharges.filter(recharge => recharge.remainingDays > 0).length;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Recharges</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeRechargesCount}</div>
          <p className="text-xs text-muted-foreground">
            Total Value: {activeRechargesTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {recharges.length} recharge{recharges.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average per Recharge</CardTitle>
          <History className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {recharges.length > 0
              ? (totalSpent / recharges.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '0.00'
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Per recharge amount
          </p>
        </CardContent>
      </Card>
    </div>
  );
}