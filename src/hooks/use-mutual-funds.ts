"use client";

import { useState, useEffect } from "react";
import { MutualFundWithHistory, MutualFundPrice } from "@/lib/types";

// Mock data for mutual funds with historical prices
const mockMutualFunds: MutualFundWithHistory[] = [
  {
    id: "1",
    name: "HDFC Top 100 Fund - Direct Plan",
    schemeCode: "HDFC001",
    category: "Large Cap",
    fundHouse: "HDFC Mutual Fund",
    currentNav: 1250.45,
    navDate: new Date(),
    riskLevel: "Moderate",
    expenseRatio: 0.5,
    aum: 25000,
    historicalPrices: generateHistoricalPrices(1250.45, 365)
  },
  {
    id: "2",
    name: "ICICI Prudential Bluechip Fund - Direct Plan",
    schemeCode: "ICICI001",
    category: "Large Cap",
    fundHouse: "ICICI Prudential Mutual Fund",
    currentNav: 890.32,
    navDate: new Date(),
    riskLevel: "Moderate",
    expenseRatio: 0.6,
    aum: 18000,
    historicalPrices: generateHistoricalPrices(890.32, 365)
  },
  {
    id: "3",
    name: "SBI Small Cap Fund - Direct Plan",
    schemeCode: "SBI001",
    category: "Small Cap",
    fundHouse: "SBI Mutual Fund",
    currentNav: 145.67,
    navDate: new Date(),
    riskLevel: "High",
    expenseRatio: 0.7,
    aum: 8500,
    historicalPrices: generateHistoricalPrices(145.67, 365)
  },
  {
    id: "4",
    name: "Axis Midcap Fund - Direct Plan",
    schemeCode: "AXIS001",
    category: "Mid Cap",
    fundHouse: "Axis Mutual Fund",
    currentNav: 234.89,
    navDate: new Date(),
    riskLevel: "Moderate",
    expenseRatio: 0.55,
    aum: 12000,
    historicalPrices: generateHistoricalPrices(234.89, 365)
  },
  {
    id: "5",
    name: "Kotak Flexicap Fund - Direct Plan",
    schemeCode: "KOTAK001",
    category: "Flexi Cap",
    fundHouse: "Kotak Mahindra Mutual Fund",
    currentNav: 567.12,
    navDate: new Date(),
    riskLevel: "Moderate",
    expenseRatio: 0.45,
    aum: 15000,
    historicalPrices: generateHistoricalPrices(567.12, 365)
  }
];

// Generate historical prices for the past N days
function generateHistoricalPrices(currentNav: number, days: number): MutualFundPrice[] {
  const prices: MutualFundPrice[] = [];
  const basePrice = currentNav * 0.8; // Start from 80% of current price

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Generate somewhat realistic price movement with some volatility
    const volatility = 0.02; // 2% daily volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const trend = (days - i) / days * 0.3; // Slight upward trend over time

    const price = basePrice * (1 + trend + randomChange * Math.sqrt(i / days));
    prices.push({
      date,
      nav: Math.round(price * 100) / 100
    });
  }

  return prices;
}

export function useMutualFunds() {
  const [mutualFunds, setMutualFunds] = useState<MutualFundWithHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadMutualFunds = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setMutualFunds(mockMutualFunds);
      setLoading(false);
    };

    loadMutualFunds();
  }, []);

  const getMutualFundById = (id: string): MutualFundWithHistory | undefined => {
    return mutualFunds.find(fund => fund.id === id);
  };

  return {
    mutualFunds,
    loading,
    getMutualFundById
  };
}