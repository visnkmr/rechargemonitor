"use client";

import { useState } from "react";
import Link from "next/link";
import { StockSearch } from "@/components/stock-search";
import { StockChart } from "@/components/stock-chart";
import { StockMiniChart } from "@/components/stock-mini-chart";
import { useStocks } from "@/hooks/use-stocks";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { calculateStockChanges, calculateVolatilityStats, calculateVolumeStats } from "@/lib/financial-utils";

export default function StocksPage() {
  const {
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
  } = useStocks();

  const [showMiniCharts, setShowMiniCharts] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Stocks</h1>
              <p className="text-muted-foreground">
                Search and analyze stock performance with technical indicators.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/mutual-funds">
                <Button variant="outline">Mutual Funds</Button>
              </Link>
              <Link href="/recharges">
                <Button variant="outline">Recharge Monitor</Button>
              </Link>
              <Link href="/fd">
                <Button variant="outline">FD Calculator</Button>
              </Link>
              <Link href="/loan">
                <Button variant="outline">Loan Calculator</Button>
              </Link>
              <Link href="/sip">
                <Button variant="outline">SIP Calculator</Button>
              </Link>
              <Link href="/xirr">
                <Button variant="outline">XIRR Calculator</Button>
              </Link>
              <Link href="/sip-analysis">
                <Button variant="outline">SIP Analysis</Button>
              </Link>
              <Link href="/bills">
                <Button variant="outline">Bill Manager</Button>
              </Link>
              <Link href="/export">
                <Button variant="outline">Export/Import</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          <StockSearch
            searchResults={searchResults}
            searching={searching}
            error={error}
            onSearch={searchStocks}
            onSelectStock={loadStock}
            onClearSearch={clearSearch}
            addToWatchlist={addToWatchlist}
            removeFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />

          {watchlist.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Watchlist ({watchlist.length})</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMiniCharts(!showMiniCharts)}
                >
                  {showMiniCharts ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Charts
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Charts
                    </>
                  )}
                </Button>
              </div>
              {loadingWatchlist ? (
                <p className="text-muted-foreground">Loading watchlist stocks...</p>
              ) : watchlistStocks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {watchlistStocks.map((stock) => {
                     const changes = calculateStockChanges(stock.historicalPrices);
                     const volatilityStats = calculateVolatilityStats(stock.historicalPrices);
                     const volumeStats = calculateVolumeStats(stock.volume);
                     return (
                      <div key={stock.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-sm leading-tight">{stock.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromWatchlist(stock.id)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="text-lg font-semibold">₹{stock.currentPrice.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              {stock.priceDate.toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => loadStock(stock.id)}
                            className="text-xs"
                          >
                            View Chart
                          </Button>
                        </div>
                        {showMiniCharts && (
                          <div className="mb-3">
                            <StockMiniChart stock={stock} height={40} />
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="text-center">
                            <div className="text-muted-foreground">1M</div>
                            <Badge variant={changes.month1 >= 0 ? "default" : "destructive"} className="text-xs h-5">
                              {changes.month1 >= 0 ? <TrendingUp className="h-2 w-2 mr-1" /> : <TrendingDown className="h-2 w-2 mr-1" />}
                              {changes.month1.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">6M</div>
                            <Badge variant={changes.month6 >= 0 ? "default" : "destructive"} className="text-xs h-5">
                              {changes.month6 >= 0 ? <TrendingUp className="h-2 w-2 mr-1" /> : <TrendingDown className="h-2 w-2 mr-1" />}
                              {changes.month6.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">1Y</div>
                            <Badge variant={changes.year1 >= 0 ? "default" : "destructive"} className="text-xs h-5">
                              {changes.year1 >= 0 ? <TrendingUp className="h-2 w-2 mr-1" /> : <TrendingDown className="h-2 w-2 mr-1" />}
                              {changes.year1.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-medium mb-2">Volatility (%)</div>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div className="text-center">
                              <div className="text-muted-foreground">2D</div>
                              <div className="font-mono">{volatilityStats.day2.toFixed(2)}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">3D</div>
                              <div className="font-mono">{volatilityStats.day3.toFixed(2)}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">4D</div>
                              <div className="font-mono">{volatilityStats.day4.toFixed(2)}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">5D</div>
                              <div className="font-mono">{volatilityStats.day5.toFixed(2)}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">2W</div>
                              <div className="font-mono">{volatilityStats.week2.toFixed(2)}%</div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-medium mb-2">Volume (Avg)</div>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div className="text-center">
                              <div className="text-muted-foreground">1D</div>
                              <div className="font-mono">{(volumeStats.day1 / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">2D</div>
                              <div className="font-mono">{(volumeStats.day2 / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">3D</div>
                              <div className="font-mono">{(volumeStats.day3 / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">4D</div>
                              <div className="font-mono">{(volumeStats.day4 / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">5D</div>
                              <div className="font-mono">{(volumeStats.day5 / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">2W</div>
                              <div className="font-mono">{(volumeStats.week2 / 1000000).toFixed(2)}M</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground">1M</div>
                              <div className="font-mono">{(volumeStats.month / 1000000).toFixed(2)}M</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No stocks in watchlist</p>
              )}
            </div>
           )}

           {selectedStock ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{selectedStock.name}</h2>
                <Button variant="outline" onClick={clearSelectedStock}>
                  Search Another Stock
                </Button>
              </div>
              <StockChart
                stock={selectedStock}
                addToWatchlist={addToWatchlist}
                removeFromWatchlist={removeFromWatchlist}
                isInWatchlist={isInWatchlist}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-muted-foreground">
                Search for a stock above to view its historical performance and technical indicators.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Data shows the last 1 year of price history with DMA50, DMA200, and volume indicators.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-lg">Loading stock data...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Fetching historical price data for the last year.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}