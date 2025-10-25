"use client";

import { useState, useCallback } from "react";
import { MutualFundWithHistory, MutualFundPrice, MFAPIResponse, MFAPISearchResult } from "@/lib/types";

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

// Search mutual funds by query
const searchMutualFunds = async (query: string): Promise<MFAPISearchResult[]> => {
  try {
    const response = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.warn(`Search failed for query "${query}": ${response.status}`);
      return [];
    }

    const data: MFAPISearchResult[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error searching funds for "${query}":`, error);
    return [];
  }
};

// Fetch mutual fund data from MFAPI and filter to last 1 year
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

    // Filter to last 1 year only
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentData = sortedData.filter(item => {
      const itemDate = parseMFAPIDate(item.date);
      return itemDate >= oneYearAgo;
    });

    if (recentData.length === 0) {
      console.warn(`No data available for scheme ${schemeCode} in the last year`);
      return null;
    }

    // Convert to our internal format
    const historicalPrices: MutualFundPrice[] = recentData.map(item => ({
      date: parseMFAPIDate(item.date),
      nav: parseFloat(item.nav)
    }));

    // Get latest NAV and date
    const latestData = recentData[recentData.length - 1];
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
  const [selectedFund, setSelectedFund] = useState<MutualFundWithHistory | null>(null);
  const [searchResults, setSearchResults] = useState<MFAPISearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFunds = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const results = await searchMutualFunds(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching funds:', error);
      setError('Failed to search funds. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const loadFund = useCallback(async (schemeCode: number) => {
    setLoading(true);
    setError(null);

    try {
      const fund = await fetchMutualFundData(schemeCode);
      if (fund) {
        setSelectedFund(fund);
      } else {
        setError('Failed to load fund data. Please try again.');
      }
    } catch (error) {
      console.error('Error loading fund:', error);
      setError('Failed to load fund data. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  const clearSelectedFund = useCallback(() => {
    setSelectedFund(null);
    setError(null);
  }, []);

  return {
    selectedFund,
    searchResults,
    loading,
    searching,
    error,
    searchFunds,
    loadFund,
    clearSearch,
    clearSelectedFund
  };
}