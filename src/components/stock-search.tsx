"use client";

import { useState } from "react";
import { StockSearchResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Plus, Check } from "lucide-react";

interface StockSearchProps {
  searchResults: StockSearchResult[];
  searching: boolean;
  error: string | null;
  onSearch: (query: string) => void;
  onSelectStock: (stockId: number) => void;
  onClearSearch: () => void;
  addToWatchlist: (stockId: number) => void;
  removeFromWatchlist: (stockId: number) => void;
  isInWatchlist: (stockId: number) => boolean;
}

export function StockSearch({
  searchResults,
  searching,
  error,
  onSearch,
  onSelectStock,
  onClearSearch,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist
}: StockSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSelectStock = (stockId: number) => {
    onSelectStock(stockId);
    setQuery("");
    onClearSearch();
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Stocks</CardTitle>
        <CardDescription>
          Enter a stock name to find and analyze Indian stocks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="e.g., Reliance, TCS, HDFC, Bata..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div
                          className="cursor-pointer"
                          onClick={() => handleSelectStock(result.id)}
                        >
                          <div className="font-medium text-sm">{result.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {result.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectStock(result.id);
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          View
                        </Button>
                        {isInWatchlist(result.id) ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWatchlist(result.id);
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
                              addToWatchlist(result.id);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click on a stock to load its historical data (last 1 year)
              </p>
            </div>
          )}

          {query && !searching && searchResults.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">
              No stocks found. Try a different search term.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}