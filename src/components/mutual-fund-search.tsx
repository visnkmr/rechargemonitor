"use client";

import { useState } from "react";
import { MFAPISearchResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface MutualFundSearchProps {
  searchResults: MFAPISearchResult[];
  searching: boolean;
  error: string | null;
  onSearch: (query: string) => void;
  onSelectFund: (schemeCode: number) => void;
  onClearSearch: () => void;
}

export function MutualFundSearch({
  searchResults,
  searching,
  error,
  onSearch,
  onSelectFund,
  onClearSearch
}: MutualFundSearchProps) {
  const [query, setQuery] = useState("");

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
              <div className="max-h-60 overflow-y-auto space-y-1">
                {searchResults.map((result) => (
                  <div
                    key={result.schemeCode}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectFund(result.schemeCode)}
                  >
                    <div className="font-medium text-sm">{result.schemeName}</div>
                    <div className="text-xs text-muted-foreground">
                      Scheme Code: {result.schemeCode}
                    </div>
                  </div>
                ))}
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