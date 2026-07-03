"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateInput } from "@/components/ui/date-input";
import {
  ArrowLeft, Plus, Trash2, Calculator, TrendingUp, AlertTriangle,
  DollarSign, BadgeIndianRupee, Save, Pencil, X, FolderOpen
} from "lucide-react";
import { calculateMTFOrders, type MTFOrderInput, type MTFCalculationResult } from "@/lib/financial-utils";

interface MTFOrder {
  id: string;
  date: Date | undefined;
  quantity: number;
  price: number;
  interestRate: number;
}

interface SerializedMTFOrder {
  id: string;
  date: string | null;
  quantity: number;
  price: number;
  interestRate: number;
}

interface SavedMTFEntry {
  id: string;
  stockName: string;
  currentPrice: number;
  marginPercent: number;
  orders: SerializedMTFOrder[];
  createdAt: string;
  updatedAt: string;
}

const emptyOrder = (): MTFOrder => ({
  id: crypto.randomUUID(),
  date: undefined,
  quantity: 0,
  price: 0,
  interestRate: 12,
});

const PORTFOLIO_KEY = "stock-margin-portfolio";

function loadPortfolio(): SavedMTFEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PORTFOLIO_KEY);
  if (!stored) return [];
  try { return JSON.parse(stored); } catch { return []; }
}

function savePortfolio(entries: SavedMTFEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(entries));
}

function deserializeOrders(data: SerializedMTFOrder[]): MTFOrder[] {
  if (!data || data.length === 0) return [emptyOrder()];
  return data.map(o => ({ ...o, date: o.date ? new Date(o.date) : undefined }));
}

function serializeOrders(orders: MTFOrder[]): SerializedMTFOrder[] {
  return orders.map(o => ({
    id: o.id, quantity: o.quantity, price: o.price,
    interestRate: o.interestRate,
    date: o.date ? o.date.toISOString() : null,
  }));
}

function entryResult(entry: SavedMTFEntry): MTFCalculationResult | null {
  const today = new Date();
  const orders: MTFOrderInput[] = entry.orders
    .filter(o => o.date && o.quantity > 0 && o.price > 0)
    .map(o => ({
      id: o.id,
      date: new Date(o.date!),
      quantity: o.quantity,
      price: o.price,
      interestRate: o.interestRate,
    }));
  if (orders.length === 0 || entry.currentPrice <= 0) return null;
  return calculateMTFOrders(orders, entry.currentPrice, entry.marginPercent);
}

export default function StockMarginPage() {
  const [view, setView] = useState<'portfolio' | 'editor'>('portfolio');
  const [portfolio, setPortfolio] = useState<SavedMTFEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [stockName, setStockName] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [marginPercent, setMarginPercent] = useState<number>(50);
  const [orders, setOrders] = useState<MTFOrder[]>([emptyOrder()]);
  const [calculated, setCalculated] = useState(false);

  useEffect(() => { setPortfolio(loadPortfolio()); }, []);

  useEffect(() => {
    if (view === 'portfolio') savePortfolio(portfolio);
  }, [portfolio, view]);

  const openNew = () => {
    setEditingId(null);
    setStockName("");
    setCurrentPrice(0);
    setMarginPercent(50);
    setOrders([emptyOrder()]);
    setCalculated(false);
    setView('editor');
  };

  const openEdit = (entry: SavedMTFEntry) => {
    setEditingId(entry.id);
    setStockName(entry.stockName);
    setCurrentPrice(entry.currentPrice);
    setMarginPercent(entry.marginPercent);
    setOrders(deserializeOrders(entry.orders));
    setCalculated(false);
    setView('editor');
  };

  const handleSave = () => {
    const serialized: SerializedMTFOrder[] = serializeOrders(orders);
    const now = new Date().toISOString();
    const entry: SavedMTFEntry = {
      id: editingId || crypto.randomUUID(),
      stockName,
      currentPrice,
      marginPercent,
      orders: serialized,
      createdAt: editingId
        ? (portfolio.find(e => e.id === editingId)?.createdAt || now)
        : now,
      updatedAt: now,
    };

    if (editingId) {
      setPortfolio(prev => prev.map(e => e.id === editingId ? entry : e));
    } else {
      setPortfolio(prev => [...prev, entry]);
    }
    setView('portfolio');
  };

  const handleDelete = (id: string) => {
    setPortfolio(prev => prev.filter(e => e.id !== id));
  };

  const handleCancel = () => {
    setView('portfolio');
  };

  const portfolioSummary = useMemo(() => {
    const results = portfolio.map(e => entryResult(e)).filter(Boolean) as MTFCalculationResult[];
    return {
      count: portfolio.length,
      totalInvestment: results.reduce((s, r) => s + r.totalInvestment, 0),
      totalCurrentValue: results.reduce((s, r) => s + r.currentValue, 0),
      totalInterestPaid: results.reduce((s, r) => s + r.totalInterestPaid, 0),
      totalDailyInterest: results.reduce((s, r) => s + r.dailyInterest, 0),
      totalProfitLoss: results.reduce((s, r) => s + r.profitLoss, 0),
    };
  }, [portfolio]);

  if (view === 'editor') {
    return (
      <EditorView
        stockName={stockName} onStockNameChange={setStockName}
        currentPrice={currentPrice} onCurrentPriceChange={setCurrentPrice}
        marginPercent={marginPercent} onMarginPercentChange={setMarginPercent}
        orders={orders} setOrders={setOrders}
        calculated={calculated} setCalculated={setCalculated}
        editingId={editingId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  const fmt = (v: number) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />Back to Home
              </Button>
            </Link>
            <div className="flex gap-2 flex-wrap">
              <Link href="/"><Button variant="outline" size="sm">Dashboard</Button></Link>
              <Link href="/xirr"><Button variant="outline" size="sm">XIRR Calculator</Button></Link>
              <Link href="/fd"><Button variant="outline" size="sm">FD Calculator</Button></Link>
              <Link href="/loan"><Button variant="outline" size="sm">Loan Calculator</Button></Link>
              <Link href="/sip"><Button variant="outline" size="sm">SIP Calculator</Button></Link>
              <Link href="/export"><Button variant="outline" size="sm">Export/Import</Button></Link>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">MTF Stock Margin Calculator</h1>
              <p className="text-muted-foreground">
                Manage margin requirements, interest paid, and leverage for all your MTF stock purchases.
              </p>
            </div>
            <Button onClick={openNew} size="lg">
              <Plus className="h-5 w-5 mr-2" />Add Stock
            </Button>
          </div>
        </header>

        {portfolio.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Stocks Added Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first MTF stock position to track margin, interest, and leverage.
              </p>
              <Button onClick={openNew}>
                <Plus className="h-4 w-4 mr-2" />Add Stock
              </Button>
            </CardContent>
          </Card>
        )}

        {portfolio.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <SummaryCard label="Total Interest Paid" value={fmt(portfolioSummary.totalInterestPaid)} color="red" />
              <SummaryCard label="Daily Interest" value={fmt(portfolioSummary.totalDailyInterest)} color="orange" />
              <SummaryCard label="Total Investment" value={fmt(portfolioSummary.totalInvestment)} color="blue" />
              <SummaryCard label="Current Value" value={fmt(portfolioSummary.totalCurrentValue)} color="green" />
              <SummaryCard
                label="Overall P&amp;L"
                value={`${portfolioSummary.totalProfitLoss >= 0 ? '+' : ''}${fmt(portfolioSummary.totalProfitLoss)}`}
                color={portfolioSummary.totalProfitLoss >= 0 ? 'green' : 'red'}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {portfolio.map(entry => {
                const r = entryResult(entry);
                return (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{entry.stockName || 'Unnamed Stock'}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(entry)} className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} className="h-8 w-8 p-0 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {entry.orders.filter(o => o.date && o.quantity > 0 && o.price > 0).length} order(s)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {r ? (
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div><span className="text-muted-foreground">Invested:</span> <span className="font-semibold">{fmt(r.totalInvestment)}</span></div>
                            <div><span className="text-muted-foreground">Value:</span> <span className="font-semibold">{fmt(r.currentValue)}</span></div>
                            <div><span className="text-muted-foreground">P&amp;L:</span> <span className={`font-semibold ${r.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{r.profitLoss >= 0 ? '+' : ''}{fmt(r.profitLoss)}</span></div>
                            <div><span className="text-muted-foreground">Interest:</span> <span className="font-semibold text-red-600">{fmt(r.totalInterestPaid)}</span></div>
                            <div><span className="text-muted-foreground">Daily Int:</span> <span className="font-semibold text-orange-600">{fmt(r.dailyInterest)}</span></div>
                            <div><span className="text-muted-foreground">Margin:</span> <span className="font-semibold">{r.marginPercent}%</span></div>
                          </div>
                          {r.additionalMarginNeeded > 0 && (
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3" /> Shortfall: {fmt(r.additionalMarginNeeded)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Incomplete data</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    red: 'from-red-50 to-red-100 border-red-200 text-red-700',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-700',
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    green: 'from-green-50 to-green-100 border-green-200 text-green-700',
  };
  return (
    <div className={`rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} border p-3 shadow-sm`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-75">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function EditorView({
  stockName, onStockNameChange,
  currentPrice, onCurrentPriceChange,
  marginPercent, onMarginPercentChange,
  orders, setOrders,
  calculated, setCalculated,
  editingId,
  onSave, onCancel,
}: {
  stockName: string; onStockNameChange: (v: string) => void;
  currentPrice: number; onCurrentPriceChange: (v: number) => void;
  marginPercent: number; onMarginPercentChange: (v: number) => void;
  orders: MTFOrder[]; setOrders: (v: MTFOrder[]) => void;
  calculated: boolean; setCalculated: (v: boolean) => void;
  editingId: string | null;
  onSave: () => void; onCancel: () => void;
}) {
  const addOrder = () => setOrders([...orders, emptyOrder()]);
  const removeOrder = (id: string) => setOrders(orders.filter(o => o.id !== id));
  const updateOrder = (id: string, field: keyof MTFOrder, value: any) =>
    setOrders(orders.map(o => o.id === id ? { ...o, [field]: value } : o));

  const validOrders = useMemo(
    () => orders.filter(o => o.date !== undefined && o.quantity > 0 && o.price > 0),
    [orders]
  );

  const livePreview = useMemo(() => {
    if (validOrders.length === 0 || currentPrice <= 0) return null;
    return calculateMTFOrders(
      validOrders.map(o => ({ id: o.id, date: o.date!, quantity: o.quantity, price: o.price, interestRate: o.interestRate })),
      currentPrice, marginPercent
    );
  }, [validOrders, currentPrice, marginPercent]);

  const leverageMultiplier = marginPercent > 0 ? (100 / marginPercent).toFixed(2) : "∞";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Portfolio
            </Button>
            <div className="flex gap-2 flex-wrap">
              <Link href="/"><Button variant="outline" size="sm">Dashboard</Button></Link>
              <Link href="/xirr"><Button variant="outline" size="sm">XIRR Calculator</Button></Link>
              <Link href="/fd"><Button variant="outline" size="sm">FD Calculator</Button></Link>
              <Link href="/loan"><Button variant="outline" size="sm">Loan Calculator</Button></Link>
              <Link href="/sip"><Button variant="outline" size="sm">SIP Calculator</Button></Link>
              <Link href="/export"><Button variant="outline" size="sm">Export/Import</Button></Link>
            </div>
          </div>
          <h1 className="text-4xl font-bold">{editingId ? 'Edit Stock' : 'Add Stock'}</h1>
          <p className="text-muted-foreground">
            {editingId ? 'Update the MTF purchase orders and details for this stock.' : 'Enter the stock details and MTF purchase orders.'}
          </p>
        </header>

        {livePreview && (
          <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-4 shadow-sm">
                <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Total Interest Paid</p>
                <p className="text-2xl font-bold text-red-700">{livePreview.totalInterestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-4 shadow-sm">
                <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Daily Interest</p>
                <p className="text-2xl font-bold text-orange-700">{livePreview.dailyInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 shadow-sm">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Investment</p>
                <p className="text-2xl font-bold text-blue-700">{livePreview.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-4 shadow-sm">
                <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Current Value</p>
                <p className="text-2xl font-bold text-green-700">{livePreview.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />Stock &amp; Margin Details
                </CardTitle>
                <CardDescription>Enter the stock details and margin percentage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stockName">Stock Name</Label>
                  <Input id="stockName" value={stockName} onChange={e => onStockNameChange(e.target.value)} placeholder="e.g., RELIANCE" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPrice">Current Market Price</Label>
                    <Input id="currentPrice" type="number" step="0.01" value={currentPrice || ""} onChange={e => onCurrentPriceChange(parseFloat(e.target.value) || 0)} placeholder="2500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marginPercent">Margin (%) — Your Contribution</Label>
                    <Input id="marginPercent" type="number" min="1" max="100" step="1" value={marginPercent} onChange={e => onMarginPercentChange(parseFloat(e.target.value) || 0)} placeholder="50" />
                    <p className="text-xs text-muted-foreground">Leverage: {leverageMultiplier}x</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeIndianRupee className="h-5 w-5" />Purchase Orders
                </CardTitle>
                <CardDescription>Add all MTF purchase orders for this stock.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.map((order, index) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Order #{index + 1}</h3>
                      <Button variant="ghost" size="sm" onClick={() => removeOrder(order.id)} className="text-red-600 hover:text-red-700 h-6 w-6 p-0" disabled={orders.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Purchase Date</Label>
                      <DateInput date={order.date} onDateChange={d => updateOrder(order.id, "date", d)} placeholder="ddmmyyyy" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" step="1" min="1" value={order.quantity || ""} onChange={e => updateOrder(order.id, "quantity", parseInt(e.target.value) || 0)} placeholder="10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Buy Price</Label>
                        <Input type="number" step="0.01" min="0.01" value={order.price || ""} onChange={e => updateOrder(order.id, "price", parseFloat(e.target.value) || 0)} placeholder="2000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Interest % (p.a.)</Label>
                        <Input type="number" step="0.1" min="0" value={order.interestRate || ""} onChange={e => updateOrder(order.id, "interestRate", parseFloat(e.target.value) || 0)} placeholder="12" />
                      </div>
                    </div>
                    {order.date && order.quantity > 0 && order.price > 0 && (
                      <p className="text-xs text-muted-foreground">Order Value: {(order.quantity * order.price).toLocaleString()}</p>
                    )}
                  </div>
                ))}

                <Button variant="outline" onClick={addOrder} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />Add Another Order
                </Button>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => setCalculated(true)} className="flex-1">
                    <Calculator className="h-4 w-4 mr-2" />Calculate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />{calculated && livePreview ? "Calculation Results" : "Live Preview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!livePreview && (
                  <p className="text-muted-foreground text-center py-8">Enter stock details and purchase orders to see live calculations</p>
                )}
                {livePreview && <SummaryDisplay result={livePreview} />}
              </CardContent>
            </Card>

            {livePreview && livePreview.orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">Per-Order Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-1">Order</th>
                          <th className="text-right py-2 px-1">Date</th>
                          <th className="text-right py-2 px-1">Qty</th>
                          <th className="text-right py-2 px-1">Price</th>
                          <th className="text-right py-2 px-1">Value</th>
                          <th className="text-right py-2 px-1">Int. Rate</th>
                          <th className="text-right py-2 px-1">Days</th>
                          <th className="text-right py-2 px-1">Interest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {livePreview.orders.map((o, i) => (
                          <tr key={o.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-1 font-medium">#{i + 1}</td>
                            <td className="text-right py-2 px-1">{o.date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                            <td className="text-right py-2 px-1">{o.quantity}</td>
                            <td className="text-right py-2 px-1">{o.price.toLocaleString()}</td>
                            <td className="text-right py-2 px-1">{o.totalValue.toLocaleString()}</td>
                            <td className="text-right py-2 px-1">{o.interestRate}%</td>
                            <td className="text-right py-2 px-1">{o.daysHeld}</td>
                            <td className="text-right py-2 px-1 font-medium text-red-600">{o.interestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-semibold">
                          <td colSpan={4} className="py-2 px-1">Total</td>
                          <td className="text-right py-2 px-1">{livePreview.totalInvestment.toLocaleString()}</td>
                          <td></td>
                          <td></td>
                          <td className="text-right py-2 px-1 text-red-600">{livePreview.totalInterestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button onClick={onSave} size="lg" className="flex-1">
                <Save className="h-4 w-4 mr-2" />{editingId ? 'Update Stock' : 'Save Stock'}
              </Button>
              <Button variant="outline" size="lg" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryDisplay({ result }: { result: MTFCalculationResult }) {
  const fmt = (v: number) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-blue-600 font-medium">Total Investment</p>
          <p className="text-lg font-bold">{fmt(result.totalInvestment)}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs text-green-600 font-medium">Current Value</p>
          <p className="text-lg font-bold">{fmt(result.currentValue)}</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-3">
          <p className="text-xs text-purple-600 font-medium">Avg. Buy Price</p>
          <p className="text-lg font-bold">{fmt(result.averagePrice)}</p>
        </div>
        <div className="rounded-lg bg-indigo-50 p-3">
          <p className="text-xs text-indigo-600 font-medium">Total Quantity</p>
          <p className="text-lg font-bold">{result.totalQuantity}</p>
        </div>
      </div>

      <div className="border-t pt-3">
        <h4 className="text-sm font-semibold mb-2">Margin Analysis</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Your Contribution ({result.marginPercent}%)</p>
            <p className="text-base font-bold text-blue-600">{fmt(result.totalYourContribution)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Broker Contribution</p>
            <p className="text-base font-bold text-orange-600">{fmt(result.totalBrokerContribution)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Your Current Equity</p>
            <p className="text-base font-bold text-green-600">{fmt(result.currentEquity)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Required Margin at Current Value ({result.marginPercent}%)</p>
            <p className="text-base font-bold">{fmt(result.requiredMarginAtCurrentValue)}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">P&amp;L</p>
            <p className={`text-base font-bold ${result.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {result.profitLoss >= 0 ? "+" : ""}{fmt(result.profitLoss)}
              <span className="text-xs ml-1">({result.profitLossPercent >= 0 ? "+" : ""}{result.profitLossPercent.toFixed(2)}%)</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Interest Paid</p>
            <p className="text-base font-bold text-red-600">{fmt(result.totalInterestPaid)}</p>
          </div>
        </div>
      </div>

      {result.additionalMarginNeeded > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Additional Margin Required</p>
            <p className="text-lg font-bold text-red-600">{fmt(result.additionalMarginNeeded)}</p>
            <p className="text-xs text-red-600">Your equity has fallen below the required margin level.</p>
          </div>
        </div>
      )}

      {result.additionalMarginNeeded === 0 && result.totalInvestment > 0 && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-sm font-semibold text-green-800">Margin Requirement Met</p>
          <p className="text-xs text-green-600">Your current equity meets or exceeds the margin requirement.</p>
        </div>
      )}
    </div>
  );
}
