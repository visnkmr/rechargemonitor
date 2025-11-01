"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Calculator, ArrowLeft, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { MutualFundSearch } from "@/components/mutual-fund-search";
import { useMutualFunds } from "@/hooks/use-mutual-funds";
import { MFAPISearchResult } from "@/lib/types";

interface SIPResult {
  installments: number;
  totalInvested: number;
  currentValue: number;
  avgNav: number;
  gain: number;
  gainPct: number;
}

interface BulkInvestmentResult {
  date: string;
  nav: number;
  units: number;
  currentValue: number;
  gain: number;
  gainPct: number;
}

export default function SIPAnalysisPage() {
  const [selectedFund, setSelectedFund] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [bulkAmount, setBulkAmount] = useState<number>(50000);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [sipResults, setSipResults] = useState<{ [key: string]: SIPResult }>({});
  const [bulkResults, setBulkResults] = useState<BulkInvestmentResult[]>([]);
  const [searchSelectedFunds, setSearchSelectedFunds] = useState<any[]>([]);

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

  const handleFundSelect = (schemeCode: number) => {
    setSelectedFund(schemeCode.toString());
    clearSearch();
  };

  const calculateSIPAnalysis = async () => {
    if (!selectedFund) {
      setError("Please select a fund");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate fetching NAV data (in real app, this would be an API call)
      const mockNavData = generateMockNavData();
      
      const results: { [key: string]: SIPResult } = {};
      const latestNav = mockNavData[mockNavData.length - 1].nav;
      
      // Daily SIP
      results.daily = calculateSIPResult(mockNavData.map(d => d.date), investmentAmount, latestNav);
      
      // Weekly SIP
      const weeklyDates = generateWeeklyDates(mockNavData);
      results.weekly = calculateSIPResult(weeklyDates, investmentAmount, latestNav);
      
      // Day of month SIPs
      for (let day = 1; day <= 31; day++) {
        const dayDates = mockNavData
          .filter(d => new Date(d.date).getDate() === day)
          .map(d => d.date);
        
        if (dayDates.length > 0) {
          const dayLabel = `${day}${getDaySuffix(day)} of month`;
          results[dayLabel] = calculateSIPResult(dayDates, investmentAmount, latestNav);
        }
      }
      
      // Day of week SIPs
      const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      for (let wd = 0; wd < 7; wd++) {
        const dayDates = mockNavData
          .filter(d => new Date(d.date).getDay() === wd)
          .map(d => d.date);
        
        if (dayDates.length > 0) {
          results[`Every ${weekdayNames[wd]}`] = calculateSIPResult(dayDates, investmentAmount, latestNav);
        }
      }
      
      setSipResults(results);
      
      // Bulk investment analysis
      const bulkInvestmentResults = calculateBulkInvestments(mockNavData, bulkAmount, latestNav);
      setBulkResults(bulkInvestmentResults);
      
    } catch (err) {
      setError("Failed to calculate SIP analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateMockNavData = () => {
    const data = [];
    const today = new Date();
    let baseNav = 100;
    
    for (let i = 365; i >= 30; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate NAV fluctuations
      baseNav = baseNav + (Math.random() - 0.5) * 2;
      baseNav = Math.max(baseNav, 50); // Minimum NAV
      
      data.push({
        date: date.toISOString().split('T')[0],
        nav: baseNav
      });
    }
    
    return data;
  };

  const generateWeeklyDates = (navData: any[]) => {
    const dates = [];
    const firstDate = new Date(navData[0].date);
    const lastDate = new Date(navData[navData.length - 1].date);
    
    for (let d = new Date(firstDate); d <= lastDate; d.setDate(d.getDate() + 7)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const getDaySuffix = (day: number) => {
    if (day === 1) return "st";
    if (day === 2) return "nd";
    if (day === 3) return "rd";
    return "th";
  };

  const calculateSIPResult = (dates: string[], amount: number, latestNav: number): SIPResult => {
    let totalInvested = 0;
    let totalUnits = 0;
    let totalNavCost = 0;
    let installments = 0;
    
    // Mock NAV lookup (in real app, this would use actual data)
    const mockNavs: { [key: string]: number } = {};
    dates.forEach(date => {
      mockNavs[date] = 100 + Math.random() * 50; // Random NAV between 100-150
    });
    
    dates.forEach(date => {
      if (mockNavs[date]) {
        const nav = mockNavs[date];
        const units = amount / nav;
        totalUnits += units;
        totalInvested += amount;
        totalNavCost += nav * units;
        installments++;
      }
    });
    
    const avgNav = totalUnits > 0 ? totalNavCost / totalUnits : 0;
    const currentValue = totalUnits * latestNav;
    const gain = currentValue - totalInvested;
    const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
    
    return {
      installments,
      totalInvested,
      currentValue,
      avgNav,
      gain,
      gainPct
    };
  };

  const calculateBulkInvestments = (navData: any[], amount: number, latestNav: number): BulkInvestmentResult[] => {
    const results: BulkInvestmentResult[] = [];
    const startDate = new Date(navData[0].date);
    const endDate = new Date(navData[navData.length - 1].date);
    endDate.setMonth(endDate.getMonth() - 1);
    
    navData.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate >= startDate && itemDate <= endDate) {
        const units = amount / item.nav;
        const currentValue = units * latestNav;
        const gain = currentValue - amount;
        const gainPct = (gain / amount) * 100;
        
        results.push({
          date: item.date,
          nav: item.nav,
          units,
          currentValue,
          gain,
          gainPct
        });
      }
    });
    
    return results.slice(-10); // Show last 10 results
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">SIP Analysis</h1>
              <p className="text-muted-foreground">
                Analyze Systematic Investment Plan strategies and bulk investment timing.
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
                Analysis Configuration
              </CardTitle>
              <CardDescription>
                Configure parameters for SIP analysis and bulk investment calculations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fund">Selected Fund</Label>
                  <div className="p-2 border rounded-md bg-gray-50 min-h-[40px] flex items-center">
                    {selectedFund ? (
                      <span className="text-sm">Fund Code: {selectedFund}</span>
                    ) : (
                      <span className="text-sm text-gray-500">Search and select a fund below</span>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="investment">SIP Amount (₹)</Label>
                  <Input
                    id="investment"
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    min="100"
                    step="100"
                  />
                </div>
                <div>
                  <Label htmlFor="bulk">Bulk Investment (₹)</Label>
                  <Input
                    id="bulk"
                    type="number"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(Number(e.target.value))}
                    min="1000"
                    step="1000"
                  />
                </div>
              </div>
              <Button onClick={calculateSIPAnalysis} disabled={loading} className="w-full md:w-auto">
                {loading ? "Calculating..." : "Run Analysis"}
              </Button>
            </CardContent>
          </Card>

          {/* Fund Search */}
          <MutualFundSearch
            searchResults={searchResults}
            searching={searching}
            error={searchError}
            onSearch={searchFunds}
            onSelectFund={handleFundSelect}
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

          {Object.keys(sipResults).length > 0 && (
            <>
              {/* SIP Results */}
              <Card>
                <CardHeader>
                  <CardTitle>SIP Strategy Comparison</CardTitle>
                  <CardDescription>
                    Compare different SIP frequencies and timing strategies.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(sipResults).map(([strategy, result]) => (
                      <div key={strategy} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{strategy}</h3>
                          <Badge variant={result.gain >= 0 ? "default" : "destructive"}>
                            {result.gain >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {result.gainPct.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Installments</div>
                            <div className="font-medium">{result.installments}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Total Invested</div>
                            <div className="font-medium">₹{result.totalInvested.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Current Value</div>
                            <div className="font-medium">₹{result.currentValue.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Gain/Loss</div>
                            <div className={`font-medium ${result.gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                              ₹{Math.abs(result.gain).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Investment Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Investment Analysis</CardTitle>
                  <CardDescription>
                    Historical performance of lumpsum investments over the last year.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investment Date</TableHead>
                        <TableHead>NAV on Date</TableHead>
                        <TableHead>Units Bought</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Gain/Loss</TableHead>
                        <TableHead>Return %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(result.date).toLocaleDateString()}</TableCell>
                          <TableCell>₹{result.nav.toFixed(2)}</TableCell>
                          <TableCell>{result.units.toFixed(4)}</TableCell>
                          <TableCell>₹{result.currentValue.toLocaleString()}</TableCell>
                          <TableCell className={result.gain >= 0 ? "text-green-600" : "text-red-600"}>
                            ₹{Math.abs(result.gain).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={result.gainPct >= 0 ? "default" : "destructive"}>
                              {result.gainPct.toFixed(2)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}