"use client";

import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush } from "recharts";
import { MutualFundWithHistory } from "@/lib/types";
import { calculateXIRR, calculateFundChanges, calculatePercentageChange } from "@/lib/financial-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, TrendingUp, TrendingDown } from "lucide-react";

interface MutualFundChartProps {
  fund: MutualFundWithHistory;
  addToWatchlist?: (schemeCode: number) => void;
  removeFromWatchlist?: (schemeCode: number) => void;
  isInWatchlist?: (schemeCode: number) => boolean;
}

export function MutualFundChart({ fund, addToWatchlist, removeFromWatchlist, isInWatchlist }: MutualFundChartProps) {
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [brushRange, setBrushRange] = useState<[number, number] | null>(null);

  // Prepare chart data
  const chartData = useMemo(() => {
    return fund.historicalPrices.map(price => ({
      date: price.date.toISOString().split('T')[0], // YYYY-MM-DD format
      nav: price.nav,
      fullDate: price.date
    }));
  }, [fund.historicalPrices]);

  // Calculate change indicators
  const changes = useMemo(() => calculateFundChanges(fund.historicalPrices), [fund.historicalPrices]);

  // Calculate XIRR for selected range
  const xirrResult = useMemo(() => {
    if (!selectedRange.start || !selectedRange.end) return null;

    const startPrice = fund.historicalPrices.find(p =>
      p.date.toDateString() === selectedRange.start!.toDateString()
    );
    const endPrice = fund.historicalPrices.find(p =>
      p.date.toDateString() === selectedRange.end!.toDateString()
    );

    if (!startPrice || !endPrice) return null;

    // Cash flows: -initial investment at start, +final value at end
    const cashFlows = [
      { amount: -startPrice.nav, date: startPrice.date },
      { amount: endPrice.nav, date: endPrice.date }
    ];

    const xirr = calculateXIRR(cashFlows);
    const percentageChange = calculatePercentageChange(endPrice.nav, startPrice.nav);

    return {
      xirr,
      startPrice: startPrice.nav,
      endPrice: endPrice.nav,
      percentageChange
    };
  }, [selectedRange, fund.historicalPrices]);

  const handleChartClick = (data: { activeLabel?: string }) => {
    if (!data || !data.activeLabel) return;

    const clickedDate = new Date(data.activeLabel);

    if (!selectedRange.start) {
      setSelectedRange({ start: clickedDate, end: null });
    } else if (!selectedRange.end) {
      if (clickedDate > selectedRange.start) {
        setSelectedRange({ ...selectedRange, end: clickedDate });
      } else {
        setSelectedRange({ start: clickedDate, end: selectedRange.start });
      }
    } else {
      setSelectedRange({ start: clickedDate, end: null });
    }
  };

  const handleBrushChange = (newState: { startIndex?: number; endIndex?: number }) => {
    if (newState && newState.startIndex !== undefined && newState.endIndex !== undefined) {
      setBrushRange([newState.startIndex, newState.endIndex]);
    } else {
      setBrushRange(null);
    }
  };

  const clearSelection = () => {
    setSelectedRange({ start: null, end: null });
  };

  const formatTooltipValue = (value: number) => `₹${value.toFixed(2)}`;
  const formatTooltipLabel = (label: string) => new Date(label).toLocaleDateString();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle>{fund.name}</CardTitle>
              <CardDescription>
                Historical NAV Performance
                {selectedRange.start && (
                  <span className="block mt-1">
                    Selected: {selectedRange.start.toLocaleDateString()}
                    {selectedRange.end && ` to ${selectedRange.end.toLocaleDateString()}`}
                  </span>
                )}
              </CardDescription>
            </div>
            {addToWatchlist && removeFromWatchlist && isInWatchlist && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isInWatchlist(fund.schemeCode)) {
                    removeFromWatchlist(fund.schemeCode);
                  } else {
                    addToWatchlist(fund.schemeCode);
                  }
                }}
                className="ml-4"
              >
                {isInWatchlist(fund.schemeCode) ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Watchlist
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                onClick={handleChartClick}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                />
                <YAxis
                  tickFormatter={(value) => `₹${value.toFixed(0)}`}
                />
                <Tooltip
                  labelFormatter={formatTooltipLabel}
                  formatter={formatTooltipValue}
                />
                <Line
                  type="monotone"
                  dataKey="nav"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                {selectedRange.start && (
                  <ReferenceLine
                    x={selectedRange.start.toISOString().split('T')[0]}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                  />
                )}
                {selectedRange.end && (
                  <ReferenceLine
                    x={selectedRange.end.toISOString().split('T')[0]}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                  />
                )}
                <Brush
                  dataKey="date"
                  height={30}
                  stroke="#2563eb"
                  onChange={handleBrushChange}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={clearSelection} variant="outline" size="sm">
              Clear Selection
            </Button>
            <p className="text-sm text-muted-foreground self-center">
              Click on the chart to select start and end dates for XIRR calculation
            </p>
          </div>

          {/* Change Indicators */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">1D</div>
              <Badge variant={changes.day1 >= 0 ? "default" : "destructive"} className="text-xs">
                {changes.day1 >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {changes.day1.toFixed(2)}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">1W</div>
              <Badge variant={changes.week1 >= 0 ? "default" : "destructive"} className="text-xs">
                {changes.week1 >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {changes.week1.toFixed(2)}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">1M</div>
              <Badge variant={changes.month1 >= 0 ? "default" : "destructive"} className="text-xs">
                {changes.month1 >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {changes.month1.toFixed(2)}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">3M</div>
              <Badge variant={changes.month3 >= 0 ? "default" : "destructive"} className="text-xs">
                {changes.month3 >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {changes.month3.toFixed(2)}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">6M</div>
              <Badge variant={changes.month6 >= 0 ? "default" : "destructive"} className="text-xs">
                {changes.month6 >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {changes.month6.toFixed(2)}%
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">1Y</div>
              <Badge variant={changes.year1 >= 0 ? "default" : "destructive"} className="text-xs">
                {changes.year1 >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {changes.year1.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {xirrResult && (
        <Card>
          <CardHeader>
            <CardTitle>XIRR Calculation</CardTitle>
            <CardDescription>
              Based on selected date range: {selectedRange.start?.toLocaleDateString()} to {selectedRange.end?.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Investment Details</h3>
                <p><strong>Start NAV:</strong> ₹{xirrResult.startPrice.toFixed(2)}</p>
                <p><strong>End NAV:</strong> ₹{xirrResult.endPrice.toFixed(2)}</p>
                <p><strong>Percentage Change:</strong> {xirrResult.percentageChange.toFixed(2)}%</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">XIRR Result</h3>
                <p className="text-2xl font-bold text-green-600">
                  {xirrResult.xirr.toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Annualized rate of return
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}