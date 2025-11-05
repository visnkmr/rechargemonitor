"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { MutualFundSearch } from "@/components/mutual-fund-search";
import { useMutualFunds } from "@/hooks/use-mutual-funds";
import { MutualFundWithHistory, MFAPIDataPoint } from "@/lib/types";

interface SelectedETF {
  schemeCode: number;
  schemeName: string;
  weightage: number;
}

interface PurchaseRecord {
  date: string;
  amount: number;
  nav: number;
  units: number;
  dayChange: number;
}

interface SimulationResult {
  etfCode: number;
  etfName: string;
  weightage: number;
  totalInvested: number;
  units: number;
  currentValue: number;
  gain: number;
  gainPct: number;
  skippedDays: number;
  investmentDays: number;
  avgNav: number;
  purchases: PurchaseRecord[];
}

interface NavDataItem {
  date: string;
  nav: number;
  change: number;
}

export default function ETFSimulationPage() {
  const [selectedETFs, setSelectedETFs] = useState<SelectedETF[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(10000);
  const [timeFrameDays, setTimeFrameDays] = useState<number>(365);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [expandedETFs, setExpandedETFs] = useState<Set<number>>(new Set());
  const [searchSelectedFunds, setSearchSelectedFunds] = useState<MutualFundWithHistory[]>([]);

  const {
    searchResults,
    searching,
    error: searchError,
    searchFunds,
    clearSearch
  } = useMutualFunds();

  const loadFundForSearchChart = async (schemeCode: number) => {
    if (searchSelectedFunds.find(f => f.schemeCode === schemeCode)) return;

    try {
      const response = await fetch(`/api/mutual-funds/${schemeCode}`);
      if (response.ok) {
        const fund = await response.json();
        setSearchSelectedFunds(prev => [...prev, fund]);
      }
    } catch (error) {
      console.error('Error loading fund for search chart:', error);
    }
  };

  const handleFundSelect = (schemeCode: number, schemeName: string) => {
    if (selectedETFs.find(etf => etf.schemeCode === schemeCode)) {
      setError("ETF already selected");
      return;
    }

    const newETF: SelectedETF = {
      schemeCode,
      schemeName,
      weightage: 0
    };

    setSelectedETFs(prev => [...prev, newETF]);
    clearSearch();
  };

  const removeETF = (schemeCode: number) => {
    setSelectedETFs(prev => prev.filter(etf => etf.schemeCode !== schemeCode));
  };

  const updateWeightage = (schemeCode: number, weightage: number) => {
    setSelectedETFs(prev => 
      prev.map(etf => 
        etf.schemeCode === schemeCode ? { ...etf, weightage } : etf
      )
    );
  };

  const getTotalWeightage = () => {
    return selectedETFs.reduce((sum, etf) => sum + etf.weightage, 0);
  };

  const fetchNavData = async (schemeCode: number, days: number = 365): Promise<NavDataItem[]> => {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch NAV data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'SUCCESS') {
      throw new Error(`API returned error: ${data.message || 'Unknown error'}`);
    }
    
    const navData = data.data.map((item: MFAPIDataPoint) => {
      const [day, month, year] = item.date.split('-');
      const formattedDate = `${year}-${month}-${day}`;
      return {
        date: formattedDate,
        nav: parseFloat(item.nav)
      };
    });
    
    navData.sort((a: NavDataItem, b: NavDataItem) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const latestDate = new Date(navData[navData.length - 1].date);
    const cutoffDate = new Date(latestDate);
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredNavData = navData.filter((item: NavDataItem) => 
      new Date(item.date) >= cutoffDate
    );

    // Calculate daily changes
    return filteredNavData.map((item: NavDataItem, index: number) => ({
      ...item,
      change: index === 0 ? 0 : ((item.nav - filteredNavData[index - 1].nav) / filteredNavData[index - 1].nav) * 100
    }));
  };

  const runSimulation = async () => {
    if (selectedETFs.length === 0) {
      setError("Please select at least one ETF");
      return;
    }

    const totalWeightage = getTotalWeightage();
    if (Math.abs(totalWeightage - 100) > 0.01) {
      setError("Total weightage must equal 100%");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const allNavData: { [key: number]: NavDataItem[] } = {};
      
      // Fetch NAV data for all selected ETFs
      for (const etf of selectedETFs) {
        allNavData[etf.schemeCode] = await fetchNavData(etf.schemeCode, timeFrameDays);
      }

      const simulationResults: SimulationResult[] = [];

      for (const etf of selectedETFs) {
        const navData = allNavData[etf.schemeCode];
        const etfAmount = (totalAmount * etf.weightage) / 100;
        
        let totalInvested = 0;
        let totalUnits = 0;
        let skippedDays = 0;
        let accumulatedAmount = 0;
        const dailyInvestment = etfAmount / timeFrameDays;
        const purchases: PurchaseRecord[] = [];

        for (let i = 1; i < navData.length; i++) {
          const dayChange = navData[i].change;
          
          if (dayChange < 0) {
            // Invest today's amount plus any accumulated amount
            const investmentAmount = dailyInvestment + accumulatedAmount;
            const units = investmentAmount / navData[i].nav;
            totalUnits += units;
            totalInvested += investmentAmount;
            
            // Record purchase
            purchases.push({
              date: navData[i].date,
              amount: investmentAmount,
              nav: navData[i].nav,
              units: units,
              dayChange: dayChange
            });
            
            accumulatedAmount = 0;
          } else {
            // Skip today and accumulate the amount
            accumulatedAmount += dailyInvestment;
            skippedDays++;
          }
        }

        const latestNav = navData[navData.length - 1].nav;
        const currentValue = totalUnits * latestNav;
        const gain = currentValue - totalInvested;
        const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
        const avgNav = totalUnits > 0 ? totalInvested / totalUnits : 0;

        simulationResults.push({
          etfCode: etf.schemeCode,
          etfName: etf.schemeName,
          weightage: etf.weightage,
          totalInvested,
          units: totalUnits,
          currentValue,
          gain,
          gainPct,
          skippedDays,
          investmentDays: navData.length - 1 - skippedDays,
          avgNav,
          purchases
        });
      }

      setResults(simulationResults);

    } catch {
      setError("Failed to run simulation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTotalInvested = () => results.reduce((sum, r) => sum + r.totalInvested, 0);
  const getTotalCurrentValue = () => results.reduce((sum, r) => sum + r.currentValue, 0);
  const getTotalGain = () => getTotalCurrentValue() - getTotalInvested();
  const getTotalGainPct = () => getTotalInvested() > 0 ? (getTotalGain() / getTotalInvested()) * 100 : 0;

  const toggleETFExpansion = (etfCode: number) => {
    setExpandedETFs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(etfCode)) {
        newSet.delete(etfCode);
      } else {
        newSet.add(etfCode);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">ETF Simulation</h1>
              <p className="text-muted-foreground">
                Simulate ETF investment strategy with negative-day purchasing and accumulated amount distribution.
              </p>
            </div>
            <Link href="/mutual-funds">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mutual Funds
              </Button>
            </Link>
          </div>
        </header>

        <div className="space-y-8">
          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Simulation Configuration
              </CardTitle>
              <CardDescription>
                Configure ETFs, weightage, and simulation parameters for the negative-day investment strategy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalAmount">Total Investment Amount (₹)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    min="1000"
                    step="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="timeFrame">Time Frame (Days)</Label>
                  <Input
                    id="timeFrame"
                    type="number"
                    value={timeFrameDays}
                    onChange={(e) => setTimeFrameDays(Number(e.target.value))}
                    min="30"
                    max="1825"
                    step="30"
                  />
                </div>
              </div>

              {/* Selected ETFs */}
              <div>
                <Label>Selected ETFs (Total Weightage: {getTotalWeightage()}%)</Label>
                {selectedETFs.length === 0 ? (
                  <div className="mt-2 p-4 border rounded-md bg-gray-50 text-center text-gray-500">
                    No ETFs selected. Search and add ETFs below.
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {selectedETFs.map((etf) => (
                      <div key={etf.schemeCode} className="flex items-center gap-2 p-3 border rounded-md">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{etf.schemeName}</div>
                          <div className="text-xs text-gray-500">Code: {etf.schemeCode}</div>
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            value={etf.weightage}
                            onChange={(e) => updateWeightage(etf.schemeCode, Number(e.target.value))}
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Weightage %"
                          />
                        </div>
                        <div className="text-sm font-medium w-12 text-right">{etf.weightage}%</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeETF(etf.schemeCode)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={runSimulation} disabled={loading || selectedETFs.length === 0} className="w-full md:w-auto">
                {loading ? "Running Simulation..." : "Run Simulation"}
              </Button>
            </CardContent>
          </Card>

          {/* ETF Search */}
          <MutualFundSearch
            searchResults={searchResults}
            searching={searching}
            error={searchError}
            onSearch={searchFunds}
            onSelectFund={(schemeCode) => {
              const fund = searchResults.find(f => f.schemeCode === schemeCode);
              if (fund) {
                handleFundSelect(schemeCode, fund.schemeName);
              }
            }}
            onClearSearch={clearSearch}
            addToWatchlist={() => {}}
            removeFromWatchlist={() => {}}
            isInWatchlist={() => false}
            selectedFunds={searchSelectedFunds}
            onLoadFundForChart={loadFundForSearchChart}
          />

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <>
              {/* Results Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Simulation Results Summary</CardTitle>
                  <CardDescription>
                    Overall performance of the negative-day investment strategy across all selected ETFs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-muted-foreground">Total Invested</div>
                      <div className="font-medium">₹{getTotalInvested().toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Current Value</div>
                      <div className="font-medium">₹{getTotalCurrentValue().toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Gain/Loss</div>
                      <div className={`font-medium ${getTotalGain() >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ₹{Math.abs(getTotalGain()).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Return %</div>
                      <Badge variant={getTotalGain() >= 0 ? "default" : "destructive"}>
                        {getTotalGainPct().toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed ETF Results</CardTitle>
                  <CardDescription>
                    Individual ETF performance with investment and skip day statistics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ETF Name</TableHead>
                        <TableHead>Weightage</TableHead>
                        <TableHead>Invested</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Avg NAV</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Gain/Loss</TableHead>
                        <TableHead>Return %</TableHead>
                        <TableHead>Investment Days</TableHead>
                        <TableHead>Skipped Days</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.etfCode}>
                          <TableCell className="font-medium">{result.etfName}</TableCell>
                          <TableCell>{result.weightage}%</TableCell>
                          <TableCell>₹{result.totalInvested.toLocaleString()}</TableCell>
                          <TableCell>{result.units.toFixed(4)}</TableCell>
                          <TableCell>₹{result.avgNav.toFixed(2)}</TableCell>
                          <TableCell>₹{result.currentValue.toLocaleString()}</TableCell>
                          <TableCell className={result.gain >= 0 ? "text-green-600" : "text-red-600"}>
                            ₹{Math.abs(result.gain).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={result.gainPct >= 0 ? "default" : "destructive"}>
                              {result.gainPct.toFixed(2)}%
                            </Badge>
                          </TableCell>
                          <TableCell>{result.investmentDays}</TableCell>
                          <TableCell>{result.skippedDays}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleETFExpansion(result.etfCode)}
                            >
                              {expandedETFs.has(result.etfCode) ? "Hide" : "Show"} Purchases
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Purchase History for Expanded ETFs */}
                  {results.map((result) => (
                    expandedETFs.has(result.etfCode) && (
                      <div key={`purchases-${result.etfCode}`} className="mt-6 border rounded-lg p-4 bg-gray-50">
                        <h3 className="text-lg font-semibold mb-4">
                          Purchase History - {result.etfName}
                        </h3>
                        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Total Purchases</div>
                            <div className="font-medium">{result.purchases.length}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Total Invested</div>
                            <div className="font-medium">₹{result.totalInvested.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Total Units</div>
                            <div className="font-medium">{result.units.toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Average NAV</div>
                            <div className="font-medium">₹{result.avgNav.toFixed(2)}</div>
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Purchase Date</TableHead>
                              <TableHead>Amount Invested</TableHead>
                              <TableHead>Purchase NAV</TableHead>
                              <TableHead>Units Purchased</TableHead>
                              <TableHead>Day Change %</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.purchases.map((purchase, index) => (
                              <TableRow key={index}>
                                <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                <TableCell>₹{purchase.amount.toLocaleString()}</TableCell>
                                <TableCell>₹{purchase.nav.toFixed(2)}</TableCell>
                                <TableCell>{purchase.units.toFixed(4)}</TableCell>
                                <TableCell className="text-green-600">
                                  {purchase.dayChange.toFixed(2)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}