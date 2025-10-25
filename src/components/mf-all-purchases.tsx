"use client";

import { useState, useEffect } from "react";
import { MFPurchase } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";


interface FundData {
  name: string;
  currentNav: number;
}

interface MFAllPurchasesProps {
  purchases: MFPurchase[];
}

export function MFAllPurchases({ purchases }: MFAllPurchasesProps) {
  const [fundData, setFundData] = useState<Map<number, FundData>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFundData = async () => {
      if (purchases.length === 0) return;

      const uniqueSchemeCodes = [...new Set(purchases.map(p => p.schemeCode))];
      const newFundData = new Map<number, FundData>();

      setLoading(true);
      try {
        const promises = uniqueSchemeCodes.map(async (schemeCode) => {
          try {
            const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
            if (!response.ok) return null;

            const data = await response.json();
            if (data.status !== 'SUCCESS' || !data.data || data.data.length === 0) return null;

            const latestData = data.data[data.data.length - 1];
            return {
              schemeCode,
              name: data.meta.scheme_name,
              currentNav: parseFloat(latestData.nav)
            };
          } catch (error) {
            console.error(`Error fetching data for scheme ${schemeCode}:`, error);
            return null;
          }
        });

        const results = await Promise.all(promises);
        results.forEach(result => {
          if (result) {
            newFundData.set(result.schemeCode, {
              name: result.name,
              currentNav: result.currentNav
            });
          }
        });

        setFundData(newFundData);
      } catch (error) {
        console.error('Error loading fund data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFundData();
  }, [purchases]);

  if (purchases.length === 0) {
    return null;
  }

  // Calculate totals across all funds
  const totalInvested = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalCurrentValue = purchases.reduce((sum, p) => {
    const fund = fundData.get(p.schemeCode);
    return sum + (fund ? p.units * fund.currentNav : 0);
  }, 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Purchases</CardTitle>
        <CardDescription>
          Overview of all your mutual fund investments across different funds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-xl font-bold text-blue-600">
              ₹{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-xl font-bold text-green-600">
              ₹{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`text-center p-4 rounded-lg ${totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-sm text-muted-foreground">Gain/Loss</p>
            <p className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGainLoss >= 0 ? '+' : ''}₹{totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`text-center p-4 rounded-lg ${totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-sm text-muted-foreground">Gain/Loss %</p>
            <p className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGainLossPercentage >= 0 ? '+' : ''}{totalGainLossPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading fund data...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Current NAV</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Gain/Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases
                  .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
                  .map((purchase) => {
                    const fund = fundData.get(purchase.schemeCode);
                    const currentNav = fund?.currentNav || 0;
                    const currentValue = purchase.units * currentNav;
                    const gainLoss = currentValue - purchase.amount;


                    return (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">
                          {fund?.name || `Scheme ${purchase.schemeCode}`}
                        </TableCell>
                        <TableCell>{purchase.purchaseDate.toLocaleDateString()}</TableCell>
                        <TableCell>₹{purchase.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>{purchase.units.toFixed(4)}</TableCell>
                        <TableCell>₹{currentNav.toFixed(4)}</TableCell>
                        <TableCell>₹{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <Badge variant={gainLoss >= 0 ? "default" : "destructive"}>
                            {gainLoss >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {gainLoss >= 0 ? '+' : ''}₹{gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}