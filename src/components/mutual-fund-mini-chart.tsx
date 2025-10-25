"use client";

import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { MutualFundWithHistory } from "@/lib/types";

interface MutualFundMiniChartProps {
  fund: MutualFundWithHistory;
  height?: number;
}

export function MutualFundMiniChart({ fund, height = 60 }: MutualFundMiniChartProps) {
  const chartData = useMemo(() => {
    return fund.historicalPrices.map(price => ({
      date: price.date.toISOString().split('T')[0],
      nav: price.nav,
    }));
  }, [fund.historicalPrices]);

  const isPositive = useMemo(() => {
    if (chartData.length < 2) return true;
    const first = chartData[0].nav;
    const last = chartData[chartData.length - 1].nav;
    return last >= first;
  }, [chartData]);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="nav"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}