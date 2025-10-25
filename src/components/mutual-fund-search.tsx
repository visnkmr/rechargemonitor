"use client";

import { useState } from "react";
import { MFAPISearchResult, MutualFundWithHistory } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Plus, Check, TrendingUp, TrendingDown } from "lucide-react";
import { MutualFundMiniChart } from "./mutual-fund-mini-chart";
import { calculateFundChanges } from "@/lib/financial-utils";

interface MutualFundSearchProps {
  searchResults: MFAPISearchResult[];
  searching: boolean;
  error: string | null;
  onSearch: (query: string) => void;
  onSelectFund: (schemeCode: number) => void;
  onClearSearch: () => void;
  addToWatchlist: (schemeCode: number) => void;
  removeFromWatchlist: (schemeCode: number) => void;
  isInWatchlist: (schemeCode: number) => boolean;
  selectedFunds?: MutualFundWithHistory[];
  onLoadFundForChart?: (schemeCode: number) => Promise<void>;
}

export function MutualFundSearch({
  searchResults,
  searching,
  error,
  onSearch,
  onSelectFund,
  onClearSearch,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  selectedFunds = [],
  onLoadFundForChart
}: MutualFundSearchProps) {
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<string>("1year");
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSelectFund = (schemeCode: number) => {
    onSelectFund(schemeCode);
    setQuery("");
    onClearSearch();
  };

  const toggleExpanded = async (schemeCode: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(schemeCode)) {
      newExpanded.delete(schemeCode);
    } else {
      newExpanded.add(schemeCode);
      // Load fund data if not already loaded
      if (onLoadFundForChart && !selectedFunds.find(f => f.schemeCode === schemeCode)) {
        await onLoadFundForChart(schemeCode);
      }
    }
    setExpandedResults(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Mutual Funds</CardTitle>
        <CardDescription>
          Enter a fund name or AMC to find and analyze mutual funds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="e.g., HDFC, ICICI, SBI, Axis..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={searching || !query.trim()}>
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            {(searchResults.length > 0 || error) && (
              <Button type="button" variant="outline" onClick={onClearSearch}>
                Clear
              </Button>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Search Results:</h3>
              <div className="max-h-96 overflow-y-auto space-y-1">
                {searchResults.map((result) => {
                  const fundData = selectedFunds.find(f => f.schemeCode === result.schemeCode);
                  const isExpanded = expandedResults.has(result.schemeCode);
                  const changes = fundData ? calculateFundChanges(fundData.historicalPrices) : null;

                  return (
                    <div
                      key={result.schemeCode}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div
                            className="cursor-pointer"
                            onClick={() => handleSelectFund(result.schemeCode)}
                          >
                            <div className="font-medium text-sm">{result.schemeName}</div>
                            <div className="text-xs text-muted-foreground">
                              Scheme Code: {result.schemeCode}
                            </div>
                          </div>
                          {fundData && (
                            <div className="mt-2 text-xs">
                              <span className="font-semibold">₹{fundData.currentNav.toFixed(2)}</span>
                              <span className="text-muted-foreground ml-2">
                                {fundData.navDate.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(result.schemeCode);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            {isExpanded ? 'Hide' : 'Chart'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectFund(result.schemeCode);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            View
                          </Button>
                          {isInWatchlist(result.schemeCode) ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromWatchlist(result.schemeCode);
                              }}
                              className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Added
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToWatchlist(result.schemeCode);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>

                      {isExpanded && fundData && (
                        <div className="mt-3 pt-3 border-t">
                          <MutualFundMiniChart fund={fundData} height={50} />
                          {changes && (
                            <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
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
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Click on a fund to load its historical data (last 1 year)
              </p>
            </div>
          )}

          {query && !searching && searchResults.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">
              No funds found. Try a different search term.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}