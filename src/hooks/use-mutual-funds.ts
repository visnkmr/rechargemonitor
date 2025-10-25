"use client";

import { useState, useCallback, useEffect } from "react";
import { MutualFundWithHistory, MutualFundPrice, MFAPIResponse, MFAPISearchResult, WatchlistItem, MFPurchase } from "@/lib/types";

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

// Watchlist storage
const WATCHLIST_STORAGE_KEY = "mf-watchlist";

// Purchase storage
const PURCHASE_STORAGE_KEY = "mf-purchases";

// Load watchlist from localStorage
const loadWatchlistFromStorage = (): WatchlistItem[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
  if (stored) {
    try {
      const parsed: (Omit<WatchlistItem, 'addedAt'> & { addedAt: string })[] = JSON.parse(stored);
      return parsed.map(item => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }));
    } catch (error) {
      console.error("Failed to parse watchlist from localStorage", error);
      return [];
    }
  }
  return [];
};

// Save watchlist to localStorage
const saveWatchlistToStorage = (watchlist: WatchlistItem[]) => {
  if (typeof window === 'undefined') return;

  const serialized = watchlist.map(item => ({
    ...item,
    addedAt: item.addedAt.toISOString()
  }));
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(serialized));
};

// Load purchases from localStorage
const loadPurchasesFromStorage = (): MFPurchase[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(PURCHASE_STORAGE_KEY);
  if (stored) {
    try {
      const parsed: (Omit<MFPurchase, 'purchaseDate' | 'createdAt'> & { purchaseDate: string; createdAt: string })[] = JSON.parse(stored);
      return parsed.map(item => ({
        ...item,
        purchaseDate: new Date(item.purchaseDate),
        createdAt: new Date(item.createdAt)
      }));
    } catch (error) {
      console.error("Failed to parse purchases from localStorage", error);
      return [];
    }
  }
  return [];
};

// Save purchases to localStorage
const savePurchasesToStorage = (purchases: MFPurchase[]) => {
  if (typeof window === 'undefined') return;

  const serialized = purchases.map(item => ({
    ...item,
    purchaseDate: item.purchaseDate.toISOString(),
    createdAt: item.createdAt.toISOString()
  }));
  localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(serialized));
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

// Fetch mutual fund data from MFAPI with all available historical data
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

    // Use all available data (no filtering to 1 year)
    const allData = sortedData;

    if (allData.length === 0) {
      console.warn(`No data available for scheme ${schemeCode}`);
      return null;
    }

    // Convert to our internal format
    const historicalPrices: MutualFundPrice[] = allData.map(item => ({
      date: parseMFAPIDate(item.date),
      nav: parseFloat(item.nav)
    }));

    // Get latest NAV and date
    const latestData = allData[allData.length - 1];
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
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistFunds, setWatchlistFunds] = useState<MutualFundWithHistory[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [purchases, setPurchases] = useState<MFPurchase[]>([]);

  // Load watchlist and purchases on mount
  useEffect(() => {
    const savedWatchlist = loadWatchlistFromStorage();
    setWatchlist(savedWatchlist);

    const savedPurchases = loadPurchasesFromStorage();
    setPurchases(savedPurchases);
  }, []);

  // Load watchlist fund data when watchlist changes
  useEffect(() => {
    const loadWatchlistFunds = async () => {
      if (watchlist.length === 0) {
        setWatchlistFunds([]);
        return;
      }

      setLoadingWatchlist(true);
      try {
        const promises = watchlist.map(item => fetchMutualFundData(item.schemeCode));
        const results = await Promise.all(promises);
        const validFunds = results.filter((fund): fund is MutualFundWithHistory => fund !== null);
        setWatchlistFunds(validFunds);
      } catch (error) {
        console.error('Error loading watchlist funds:', error);
      } finally {
        setLoadingWatchlist(false);
      }
    };

    loadWatchlistFunds();
  }, [watchlist]);

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

  const addToWatchlist = useCallback((schemeCode: number) => {
    const newItem: WatchlistItem = {
      schemeCode,
      addedAt: new Date()
    };

    setWatchlist(prev => {
      // Check if already in watchlist
      if (prev.some(item => item.schemeCode === schemeCode)) {
        return prev;
      }
      const updated = [...prev, newItem];
      saveWatchlistToStorage(updated);
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((schemeCode: number) => {
    setWatchlist(prev => {
      const updated = prev.filter(item => item.schemeCode !== schemeCode);
      saveWatchlistToStorage(updated);
      return updated;
    });
  }, []);

  const isInWatchlist = useCallback((schemeCode: number) => {
    return watchlist.some(item => item.schemeCode === schemeCode);
  }, [watchlist]);

  const addPurchase = useCallback((purchase: Omit<MFPurchase, 'id' | 'createdAt'>) => {
    const newPurchase: MFPurchase = {
      ...purchase,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    setPurchases(prev => {
      const updated = [...prev, newPurchase];
      savePurchasesToStorage(updated);
      return updated;
    });
  }, []);

  const updatePurchase = useCallback((id: string, updates: Partial<MFPurchase>) => {
    setPurchases(prev => {
      const updated = prev.map(purchase =>
        purchase.id === id ? { ...purchase, ...updates } : purchase
      );
      savePurchasesToStorage(updated);
      return updated;
    });
  }, []);

  const deletePurchase = useCallback((id: string) => {
    setPurchases(prev => {
      const updated = prev.filter(purchase => purchase.id !== id);
      savePurchasesToStorage(updated);
      return updated;
    });
  }, []);

  const getPurchasesForFund = useCallback((schemeCode: number) => {
    return purchases.filter(purchase => purchase.schemeCode === schemeCode);
  }, [purchases]);

  return {
    selectedFund,
    searchResults,
    loading,
    searching,
    error,
    watchlist,
    watchlistFunds,
    loadingWatchlist,
    purchases,
    searchFunds,
    loadFund,
    clearSearch,
    clearSelectedFund,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addPurchase,
    updatePurchase,
    deletePurchase,
    getPurchasesForFund
  };
}