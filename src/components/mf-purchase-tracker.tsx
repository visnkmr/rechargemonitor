"use client";

import { useState, useEffect } from "react";
import { MFPurchase, MFPurchaseFormData, MutualFundWithHistory } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { calculatePercentageChange } from "@/lib/financial-utils";

interface MFPurchaseTrackerProps {
  fund: MutualFundWithHistory;
  purchases: MFPurchase[];
  onAddPurchase: (purchase: Omit<MFPurchase, 'id' | 'createdAt'>) => void;
  onUpdatePurchase: (id: string, purchase: Partial<MFPurchase>) => void;
  onDeletePurchase: (id: string) => void;
}

export function MFPurchaseTracker({
  fund,
  purchases,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase
}: MFPurchaseTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<MFPurchase | null>(null);
  const [formData, setFormData] = useState<MFPurchaseFormData>({
    purchaseDate: new Date(),
    amount: 0
  });

  // Calculate units based on NAV at purchase date
  const calculateUnits = (amount: number, purchaseDate: Date): { units: number; navAtPurchase: number } => {
    // Find the NAV closest to the purchase date (on or before)
    const sortedPrices = fund.historicalPrices.sort((a, b) => b.date.getTime() - a.date.getTime());

    for (const price of sortedPrices) {
      if (price.date <= purchaseDate) {
        const units = amount / price.nav;
        return { units, navAtPurchase: price.nav };
      }
    }

    // If no historical data found, use current NAV
    const units = amount / fund.currentNav;
    return { units, navAtPurchase: fund.currentNav };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { units, navAtPurchase } = calculateUnits(formData.amount, formData.purchaseDate);

    if (editingPurchase) {
      onUpdatePurchase(editingPurchase.id, {
        purchaseDate: formData.purchaseDate,
        amount: formData.amount,
        units,
        navAtPurchase
      });
    } else {
      onAddPurchase({
        schemeCode: fund.schemeCode,
        purchaseDate: formData.purchaseDate,
        amount: formData.amount,
        units,
        navAtPurchase
      });
    }

    setIsDialogOpen(false);
    setEditingPurchase(null);
    setFormData({ purchaseDate: new Date(), amount: 0 });
  };

  const handleEdit = (purchase: MFPurchase) => {
    setEditingPurchase(purchase);
    setFormData({
      purchaseDate: purchase.purchaseDate,
      amount: purchase.amount
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this purchase record?')) {
      onDeletePurchase(id);
    }
  };

  const openAddDialog = () => {
    setEditingPurchase(null);
    setFormData({ purchaseDate: new Date(), amount: 0 });
    setIsDialogOpen(true);
  };

  // Calculate totals
  const totalInvested = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalUnits = purchases.reduce((sum, p) => sum + p.units, 0);
  const currentValue = totalUnits * fund.currentNav;
  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Purchase Tracker</CardTitle>
            <CardDescription>
              Track your {fund.name} investments and monitor performance
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
                </DialogTitle>
                <DialogDescription>
                  Enter the purchase details for {fund.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate.toISOString().split('T')[0]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      purchaseDate: new Date(e.target.value)
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Investment Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Enter amount invested"
                    required
                  />
                </div>
                {formData.amount > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Units to be purchased: <strong>{calculateUnits(formData.amount, formData.purchaseDate).units.toFixed(4)}</strong>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      NAV at purchase: <strong>₹{calculateUnits(formData.amount, formData.purchaseDate).navAtPurchase.toFixed(4)}</strong>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button type="submit">
                    {editingPurchase ? 'Update' : 'Add'} Purchase
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {purchases.length > 0 && (
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
                ₹{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        )}

        {purchases.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>NAV at Purchase</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Gain/Loss</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => {
                  const currentValue = purchase.units * fund.currentNav;
                  const gainLoss = currentValue - purchase.amount;
                  const gainLossPercentage = calculatePercentageChange(purchase.amount, currentValue);

                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>{purchase.purchaseDate.toLocaleDateString()}</TableCell>
                      <TableCell>₹{purchase.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{purchase.units.toFixed(4)}</TableCell>
                      <TableCell>₹{purchase.navAtPurchase.toFixed(4)}</TableCell>
                      <TableCell>₹{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge variant={gainLoss >= 0 ? "default" : "destructive"}>
                          {gainLoss >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {gainLoss >= 0 ? '+' : ''}₹{gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(purchase)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(purchase.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No purchases recorded yet.</p>
            <p className="text-sm">Click &quot;Add Purchase&quot; to start tracking your investments.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}