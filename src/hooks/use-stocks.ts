"use client";

import { useState, useEffect, useCallback } from "react";
import { StockSearchResult, StockWithHistory, StockWatchlistItem } from "@/lib/types";

export function useStocks() {
  const [selectedStock, setSelectedStock] = useState<StockWithHistory | null>(null);
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<StockWatchlistItem[]>([]);
  const [watchlistStocks, setWatchlistStocks] = useState<StockWithHistory[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('stockWatchlist');
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        setWatchlist(parsed.map((item: StockWatchlistItem & { addedAt: string; name?: string }) => ({
          id: item.id,
          name: item.name || `Stock ${item.id}`, // Backward compatibility
          addedAt: new Date(item.addedAt)
        })));
      } catch (error) {
        console.error('Error loading watchlist:', error);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('stockWatchlist', JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const fetchStockData = useCallback(async (stockId: number): Promise<StockWithHistory | null> => {
    try {
      const response = await fetch(`http://localhost:3001/api/stocks/${stockId}/chart`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch stock data');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.datasets || data.datasets.length < 4) {
        throw new Error('Invalid stock data format');
      }

      // Get stock name from watchlist first, then search results, then fallback
      const watchlistItem = watchlist.find(item => item.id === stockId);
      const stockName = watchlistItem?.name || searchResults.find(s => s.id === stockId)?.name || `Stock ${stockId}`;

      const stockWithHistory: StockWithHistory = {
        id: stockId,
        name: stockName,
        currentPrice: parseFloat(data.datasets[0].values[data.datasets[0].values.length - 1][1]),
        priceDate: new Date(data.datasets[0].values[data.datasets[0].values.length - 1][0]),
        historicalPrices: data.datasets[0].values.map((value: [string, string]) => ({
          date: new Date(value[0]),
          price: parseFloat(value[1])
        })),
        volume: data.datasets[3].values.map((value: [string, number]) => ({
          date: new Date(value[0]),
          volume: value[1]
        })),
        dma50: data.datasets[1].values.map((value: [string, string]) => ({
          date: new Date(value[0]),
          dma: parseFloat(value[1])
        })),
        dma200: data.datasets[2].values.map((value: [string, string]) => ({
          date: new Date(value[0]),
          dma: parseFloat(value[1])
        }))
      };

      return stockWithHistory;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return null;
    }
  }, [searchResults]);



  // Load watchlist stocks whenever watchlist changes
  useEffect(() => {
    if (watchlist.length > 0) {
      setLoadingWatchlist(true);
      const loadStocks = async () => {
        try {
          const stocks: StockWithHistory[] = [];
          for (const item of watchlist) {
            const stockData = await fetchStockData(item.id);
            if (stockData) {
              stocks.push(stockData);
            }
          }
          setWatchlistStocks(stocks);
        } catch (error) {
          console.error('Error loading watchlist stocks:', error);
        } finally {
          setLoadingWatchlist(false);
        }
      };
      loadStocks();
    } else {
      setWatchlistStocks([]);
    }
  }, [watchlist, fetchStockData]);

  const searchStocks = async (query: string) => {
    if (!query.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const url = `http://localhost:3001/api/stocks/search?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to search stocks: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setError(`Failed to search stocks: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const loadStock = async (stockId: number) => {
    setLoading(true);
    setError(null);

    try {
      const stockData = await fetchStockData(stockId);
      if (stockData) {
        setSelectedStock(stockData);
      } else {
        setError('Failed to load stock data');
      }
    } catch (error) {
      console.error('Error loading stock:', error);
      setError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setError(null);
  };

  const clearSelectedStock = () => {
    setSelectedStock(null);
  };

  const addToWatchlist = (stockId: number) => {
    if (!isInWatchlist(stockId)) {
      const stockName = searchResults.find(s => s.id === stockId)?.name || `Stock ${stockId}`;
      const newItem: StockWatchlistItem = {
        id: stockId,
        name: stockName,
        addedAt: new Date()
      };
      setWatchlist([...watchlist, newItem]);
    }
  };

  const removeFromWatchlist = (stockId: number) => {
    setWatchlist(watchlist.filter(item => item.id !== stockId));
  };

  const isInWatchlist = (stockId: number) => {
    return watchlist.some(item => item.id === stockId);
  };

  return {
    selectedStock,
    searchResults,
    loading,
    searching,
    error,
    watchlist,
    watchlistStocks,
    loadingWatchlist,
    searchStocks,
    loadStock,
    clearSearch,
    clearSelectedStock,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  };
}