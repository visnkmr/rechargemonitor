"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Calculator, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MutualFundSearch } from "@/components/mutual-fund-search";
import { useMutualFunds } from "@/hooks/use-mutual-funds";
import { MutualFundWithHistory } from "@/lib/types";

interface SIPResult {
  installments: number;
  totalInvested: number;
  currentValue: number;
  avgNav: number;
  todayNav: number;
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

interface NavDataItem {
  date: string;
  nav: number;
}

export default function SIPAnalysisPage() {
  const [selectedFund, setSelectedFund] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [bulkAmount, setBulkAmount] = useState<number>(50000);
  const [dateRangeDays, setDateRangeDays] = useState<number>(365);
  const [bulkDateRangeDays, setBulkDateRangeDays] = useState<number>(365);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [sipResults, setSipResults] = useState<{ [key: string]: SIPResult }>({});
  const [bulkResults, setBulkResults] = useState<BulkInvestmentResult[]>([]);
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
      // Fetch real NAV data from MF API
      const navData = await fetchNavData(selectedFund, dateRangeDays);
      
      const results: { [key: string]: SIPResult } = {};
      const latestNav = navData[navData.length - 1].nav;
      
      // Store latestNav globally for use in display
      (window as { latestNav?: number }).latestNav = latestNav;
      
      // Create NAV lookup for consistent data across all strategies
      const navLookup: { [key: string]: number } = {};
      navData.forEach((item: NavDataItem) => {
        navLookup[item.date] = item.nav;
      });
      
      // Daily SIP
      results.daily = calculateSIPResult(navData.map((d: NavDataItem) => d.date), investmentAmount, latestNav, navLookup);
      
      // Weekly SIP
      const weeklyDates = generateWeeklyDates(navData);
      results.weekly = calculateSIPResult(weeklyDates, investmentAmount, latestNav, navLookup);
      
      // Day of month SIPs
      for (let day = 1; day <= 31; day++) {
        const dayDates = navData
          .filter((d: NavDataItem) => new Date(d.date).getDate() === day)
          .map((d: NavDataItem) => d.date);
        
        if (dayDates.length > 0) {
          const dayLabel = `${day}${getDaySuffix(day)} of month`;
          results[dayLabel] = calculateSIPResult(dayDates, investmentAmount, latestNav, navLookup);
        }
      }
      
      // Day of week SIPs
      const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      for (let wd = 0; wd < 7; wd++) {
        const dayDates = navData
          .filter((d: NavDataItem) => new Date(d.date).getDay() === wd)
          .map((d: NavDataItem) => d.date);
        
        if (dayDates.length > 0) {
          results[`Every ${weekdayNames[wd]}`] = calculateSIPResult(dayDates, investmentAmount, latestNav, navLookup);
        }
      }
      
      setSipResults(results);
      
      // Bulk investment analysis
      const bulkInvestmentResults = calculateBulkInvestments(navData, bulkAmount, latestNav);
      setBulkResults(bulkInvestmentResults);
      
    } catch {
      setError("Failed to fetch NAV data or calculate SIP analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNavData = async (schemeCode: string, days: number = 365) => {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch NAV data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'SUCCESS') {
      throw new Error(`API returned error: ${data.message || 'Unknown error'}`);
    }
    
    // Parse the NAV data from the API response
    // The API returns data in format: { "date": "dd-mm-yyyy", "nav": "123.45" }
    // Convert date format from dd-mm-yyyy to yyyy-mm-dd for proper JavaScript Date parsing
    const navData = data.data.map((item: { date: string; nav: string }) => {
      const [day, month, year] = item.date.split('-');
      const formattedDate = `${year}-${month}-${day}`;
      return {
        date: formattedDate,
        nav: parseFloat(item.nav)
      };
    });
    
    // Sort by date to ensure chronological order
    navData.sort((a: { date: string; nav: number }, b: { date: string; nav: number }) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Filter by date range (last N days)
    const latestDate = new Date(navData[navData.length - 1].date);
    const cutoffDate = new Date(latestDate);
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredNavData = navData.filter((item: NavDataItem) => 
      new Date(item.date) >= cutoffDate
    );
    
    return filteredNavData;
  };

  const generateWeeklyDates = (navData: NavDataItem[]) => {
    const dates: string[] = [];
    const firstDate = new Date(navData[0].date);
    const lastDate = new Date(navData[navData.length - 1].date);
    
    // Generate every 7 days from first date (matching Python logic)
    const totalDays = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    for (let i = 0; i <= totalDays / 7; i++) {
      const d = new Date(firstDate);
      d.setDate(d.getDate() + (7 * i));
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

  const calculateSIPResult = (dates: string[], amount: number, latestNav: number, navLookup: { [key: string]: number }): SIPResult => {
    let totalInvested = 0;
    let totalUnits = 0;
    let totalNavCost = 0;
    let installments = 0;
    
    dates.forEach(date => {
      if (navLookup[date]) {
        const nav = navLookup[date];
        const units = amount / nav;
        totalUnits += units;
        totalInvested += amount;
        totalNavCost += nav * units;
        installments++;
      }
    });
    
    // Average NAV = Total NAV Cost / Total Units (matching Python formula)
    const avgNav = totalUnits > 0 ? totalNavCost / totalUnits : 0;
    const currentValue = totalUnits * latestNav;
    const gain = currentValue - totalInvested;
    const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
    
    return {
      installments,
      totalInvested,
      currentValue,
      avgNav,
      todayNav: latestNav,
      gain,
      gainPct
    };
  };

  const calculateBulkInvestments = (navData: NavDataItem[], amount: number, latestNav: number): BulkInvestmentResult[] => {
    const results: BulkInvestmentResult[] = [];
    const latestDate = new Date(navData[navData.length - 1].date);
    const startDate = new Date(latestDate);
    startDate.setDate(startDate.getDate() - bulkDateRangeDays); // Use bulk investment date range
    
    navData.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate >= startDate && itemDate < latestDate) {
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
    
    return results; // Show all results within the date range
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
                Configure parameters for SIP analysis and bulk investment calculations. Set separate date ranges for SIP strategies and bulk investment analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <Label htmlFor="dateRange">SIP Analysis Range (Days)</Label>
                  <Input
                    id="dateRange"
                    type="number"
                    value={dateRangeDays}
                    onChange={(e) => setDateRangeDays(Number(e.target.value))}
                    min="30"
                    max="1825"
                    step="30"
                  />
                </div>
                <div>
                  <Label htmlFor="bulkDateRange">Bulk Investment Range (Days)</Label>
                  <Input
                    id="bulkDateRange"
                    type="number"
                    value={bulkDateRangeDays}
                    onChange={(e) => setBulkDateRangeDays(Number(e.target.value))}
                    min="30"
                    max="1825"
                    step="30"
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
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
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
                            <div className="text-muted-foreground">Avg NAV</div>
                            <div className="font-medium">₹{result.avgNav.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Today NAV</div>
                            <div className="font-medium">₹{result.todayNav.toFixed(2)}</div>
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
                    Historical performance of lumpsum investments over the selected bulk investment date range.
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