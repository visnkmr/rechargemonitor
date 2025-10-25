"use client";

import { useState, useEffect } from "react";
import { MutualFundWithHistory, MutualFundPrice, MFAPIResponse } from "@/lib/types";

// Popular mutual fund scheme codes (Direct Plan variants)
const POPULAR_SCHEME_CODES = [
  100122, // HDFC Balanced Fund - Growth Option
  102529, // ICICI Prudential Bluechip Fund - Direct Plan - Growth
  103504, // SBI Small Cap Fund - Direct Plan - Growth
  120503, // Axis Midcap Fund - Direct Plan - Growth
  112090, // Kotak Flexicap Fund - Direct Plan - Growth
  118989, // Nippon India Large Cap Fund - Direct Plan - Growth Option
  120841, // Mirae Asset Large Cap Fund - Direct Plan - Growth
  120252, // DSP Midcap Fund - Direct Plan - Growth
  120505, // UTI Flexi Cap Fund - Direct Plan - Growth Option
  120468, // Franklin India Flexi Cap Fund - Direct Plan - Growth
];

// Risk level mapping based on category
const getRiskLevel = (category: string): 'Low' | 'Moderate' | 'High' => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('liquid') || categoryLower.includes('ultra short') || categoryLower.includes('short term')) {
    return 'Low';
  }
  if (categoryLower.includes('small cap') || categoryLower.includes('sectoral')) {
    return 'High';
  }
  return 'Moderate';
};

// Parse DD-MM-YYYY date string to Date object
const parseMFAPIDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Fetch mutual fund data from MFAPI
const fetchMutualFundData = async (schemeCode: number): Promise<MutualFundWithHistory | null> => {
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!response.ok) {
      console.warn(`Failed to fetch data for scheme ${schemeCode}: ${response.status}`);
      return null;
    }

    const data: MFAPIResponse = await response.json();

    if (data.status !== 'SUCCESS' || !data.data || data.data.length === 0) {
      console.warn(`Invalid data for scheme ${schemeCode}`);
      return null;
    }

    // Sort data by date (oldest first)
    const sortedData = data.data.sort((a, b) => {
      const dateA = parseMFAPIDate(a.date);
      const dateB = parseMFAPIDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Convert to our internal format
    const historicalPrices: MutualFundPrice[] = sortedData.map(item => ({
      date: parseMFAPIDate(item.date),
      nav: parseFloat(item.nav)
    }));

    // Get latest NAV and date
    const latestData = sortedData[sortedData.length - 1];
    const currentNav = parseFloat(latestData.nav);
    const navDate = parseMFAPIDate(latestData.date);

    const mutualFund: MutualFundWithHistory = {
      id: schemeCode.toString(),
      name: data.meta.scheme_name,
      schemeCode: data.meta.scheme_code,
      category: data.meta.scheme_category,
      fundHouse: data.meta.fund_house,
      currentNav,
      navDate,
      riskLevel: getRiskLevel(data.meta.scheme_category),
      expenseRatio: 0.5, // Default value, would need additional API for actual expense ratio
      aum: 10000, // Default value, would need additional API for actual AUM
      historicalPrices
    };

    return mutualFund;
  } catch (error) {
    console.error(`Error fetching data for scheme ${schemeCode}:`, error);
    return null;
  }
};

export function useMutualFunds() {
  const [mutualFunds, setMutualFunds] = useState<MutualFundWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMutualFunds = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch data for all popular schemes in parallel
        const promises = POPULAR_SCHEME_CODES.map(code => fetchMutualFundData(code));
        const results = await Promise.all(promises);

        // Filter out null results (failed fetches)
        const validFunds = results.filter((fund): fund is MutualFundWithHistory => fund !== null);

        if (validFunds.length === 0) {
          setError('Failed to load mutual fund data. Please try again later.');
        } else {
          setMutualFunds(validFunds);
        }
      } catch (error) {
        console.error('Error loading mutual funds:', error);
        setError('Failed to load mutual fund data. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    loadMutualFunds();
  }, []);

  const getMutualFundById = (id: string): MutualFundWithHistory | undefined => {
    return mutualFunds.find(fund => fund.id === id);
  };

  return {
    mutualFunds,
    loading,
    error,
    getMutualFundById
  };
}