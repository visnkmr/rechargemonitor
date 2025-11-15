"use client";

import { StockWithHistory, StockPrice } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StockMiniChartProps {
  stock: StockWithHistory;
  height?: number;
}

export function StockMiniChart({ stock, height = 100 }: StockMiniChartProps) {
  // Prepare data for the chart
  const chartData = stock.historicalPrices.map((price: StockPrice) => ({
    date: price.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: price.price,
    dma50: stock.dma50.find(d => d.date.getTime() === price.date.getTime())?.dma,
    dma200: stock.dma200.find(d => d.date.getTime() === price.date.getTime())?.dma
  })).filter(d => d !== null);

  const formatYAxis = (value: number) => {
    return `₹${value.toFixed(0)}`;
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'price') return [`₹${value.toFixed(2)}`, 'Price'];
    if (name === 'dma50') return [`₹${value.toFixed(2)}`, 'DMA50'];
    if (name === 'dma200') return [`₹${value.toFixed(2)}`, 'DMA200'];
    return [value, name];
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            tickFormatter={formatYAxis}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="price"
          />
          <Line
            type="monotone"
            dataKey="dma50"
            stroke="#f59e0b"
            strokeWidth={1}
            dot={false}
            strokeDasharray="5 5"
            name="dma50"
          />
          <Line
            type="monotone"
            dataKey="dma200"
            stroke="#ef4444"
            strokeWidth={1}
            dot={false}
            strokeDasharray="3 3"
            name="dma200"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}