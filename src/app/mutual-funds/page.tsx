"use client";


import Link from "next/link";
import { MutualFundSearch } from "@/components/mutual-fund-search";
import { MutualFundChart } from "@/components/mutual-fund-chart";
import { useMutualFunds } from "@/hooks/use-mutual-funds";
import { Button } from "@/components/ui/button";

export default function MutualFundsPage() {
  const {
    selectedFund,
    searchResults,
    loading,
    searching,
    error,
    searchFunds,
    loadFund,
    clearSearch,
    clearSelectedFund
  } = useMutualFunds();

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
          />

          {selectedFund ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{selectedFund.name}</h2>
                <Button variant="outline" onClick={clearSelectedFund}>
                  Search Another Fund
                </Button>
              </div>
              <MutualFundChart fund={selectedFund} />
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