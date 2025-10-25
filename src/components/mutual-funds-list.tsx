"use client";

import { MutualFundWithHistory } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MutualFundsListProps {
  mutualFunds: MutualFundWithHistory[];
  selectedFund: MutualFundWithHistory | null;
  onSelectFund: (fund: MutualFundWithHistory) => void;
}

export function MutualFundsList({ mutualFunds, selectedFund, onSelectFund }: MutualFundsListProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mutual Funds</CardTitle>
        <CardDescription>
          Select a fund to view historical performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mutualFunds.map((fund) => (
            <div
              key={fund.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedFund?.id === fund.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectFund(fund)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm leading-tight">{fund.name}</h3>
                <Badge className={getRiskColor(fund.riskLevel)}>
                  {fund.riskLevel}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Category:</strong> {fund.category}</p>
                <p><strong>Fund House:</strong> {fund.fundHouse}</p>
                <p><strong>Current NAV:</strong> ₹{fund.currentNav.toFixed(2)}</p>
                <p><strong>AUM:</strong> ₹{fund.aum.toLocaleString()} Cr</p>
                <p><strong>Expense Ratio:</strong> {fund.expenseRatio}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}