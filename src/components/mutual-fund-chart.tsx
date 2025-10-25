"use client";

import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { MutualFundWithHistory } from "@/lib/types";
import { calculateXIRR } from "@/lib/financial-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MutualFundChartProps {
  fund: MutualFundWithHistory;
}

export function MutualFundChart({ fund }: MutualFundChartProps) {
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  // Prepare chart data
  const chartData = useMemo(() => {
    return fund.historicalPrices.map(price => ({
      date: price.date.toISOString().split('T')[0], // YYYY-MM-DD format
      nav: price.nav,
      fullDate: price.date
    }));
  }, [fund.historicalPrices]);

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
    return {
      xirr,
      startPrice: startPrice.nav,
      endPrice: endPrice.nav,
      percentageChange: ((endPrice.nav - startPrice.nav) / startPrice.nav) * 100
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

  const clearSelection = () => {
    setSelectedRange({ start: null, end: null });
  };

  const formatTooltipValue = (value: number) => `₹${value.toFixed(2)}`;
  const formatTooltipLabel = (label: string) => new Date(label).toLocaleDateString();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
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