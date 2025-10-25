"use client";

import { useState } from "react";
import Link from "next/link";
import { MutualFundSearch } from "@/components/mutual-fund-search";
import { MutualFundChart } from "@/components/mutual-fund-chart";
import { MutualFundMiniChart } from "@/components/mutual-fund-mini-chart";
import { MFPurchaseTracker } from "@/components/mf-purchase-tracker";
import { useMutualFunds } from "@/hooks/use-mutual-funds";
import { MutualFundWithHistory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { calculateFundChanges, fetchMutualFundData } from "@/lib/financial-utils";

export default function MutualFundsPage() {
  const {
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
  } = useMutualFunds();

  const [showMiniCharts, setShowMiniCharts] = useState(false);
  const [searchSelectedFunds, setSearchSelectedFunds] = useState<MutualFundWithHistory[]>([]);

  const loadFundForSearchChart = async (schemeCode: number) => {
    // Check if already loaded
    if (searchSelectedFunds.find(f => f.schemeCode === schemeCode)) return;

    try {
      const fund = await fetchMutualFundData(schemeCode);
      if (fund) {
        setSearchSelectedFunds(prev => [...prev, fund]);
      }
    } catch (error) {
      console.error('Error loading fund for search chart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Mutual Funds</h1>
              <p className="text-muted-foreground">
                Search and analyze mutual fund performance with XIRR calculations.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/">
                <Button variant="outline">Dashboard</Button>
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
          <MutualFundSearch
            searchResults={searchResults}
            searching={searching}
            error={error}
            onSearch={searchFunds}
            onSelectFund={loadFund}
            onClearSearch={clearSearch}
            addToWatchlist={addToWatchlist}
            removeFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
            selectedFunds={searchSelectedFunds}
            onLoadFundForChart={loadFundForSearchChart}
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
                <p className="text-muted-foreground">Loading watchlist funds...</p>
              ) : watchlistFunds.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {watchlistFunds.map((fund) => {
                    const changes = calculateFundChanges(fund.historicalPrices);
                    return (
                      <div key={fund.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-sm leading-tight">{fund.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromWatchlist(fund.schemeCode)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {fund.fundHouse} • {fund.category}
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="text-lg font-semibold">₹{fund.currentNav.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              {fund.navDate.toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => loadFund(fund.schemeCode)}
                            className="text-xs"
                          >
                            View Chart
                          </Button>
                        </div>
                        {showMiniCharts && (
                          <div className="mb-3">
                            <MutualFundMiniChart fund={fund} height={40} />
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
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No funds in watchlist</p>
              )}
            </div>
          )}

          {selectedFund ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{selectedFund.name}</h2>
                <Button variant="outline" onClick={clearSelectedFund}>
                  Search Another Fund
                </Button>
              </div>
              <MutualFundChart
                fund={selectedFund}
                addToWatchlist={addToWatchlist}
                removeFromWatchlist={removeFromWatchlist}
                isInWatchlist={isInWatchlist}
              />
              <MFPurchaseTracker
                fund={selectedFund}
                purchases={getPurchasesForFund(selectedFund.schemeCode)}
                onAddPurchase={addPurchase}
                onUpdatePurchase={updatePurchase}
                onDeletePurchase={deletePurchase}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-muted-foreground">
                Search for a mutual fund above to view its historical performance and calculate XIRR.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Data shows the last 1 year of NAV history for accurate analysis.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-lg">Loading fund data...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Fetching historical NAV data for the last year.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}