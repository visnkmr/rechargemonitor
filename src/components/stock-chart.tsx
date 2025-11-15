"use client";

import { StockWithHistory } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, TrendingUp, TrendingDown } from "lucide-react";
import { StockMiniChart } from "./stock-mini-chart";
import { calculateStockChanges } from "@/lib/financial-utils";

interface StockChartProps {
  stock: StockWithHistory;
  addToWatchlist: (stockId: number) => void;
  removeFromWatchlist: (stockId: number) => void;
  isInWatchlist: (stockId: number) => boolean;
}

export function StockChart({
  stock,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist
}: StockChartProps) {
  const changes = calculateStockChanges(stock.historicalPrices);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{stock.name}</CardTitle>
              <CardDescription>
                Stock ID: {stock.id}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isInWatchlist(stock.id) ? (
                <Button
                  variant="outline"
                  onClick={() => removeFromWatchlist(stock.id)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  In Watchlist
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => addToWatchlist(stock.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Watchlist
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-muted-foreground">Current Price</div>
              <div className="text-2xl font-bold">₹{stock.currentPrice.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                {stock.priceDate.toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">1 Month Change</div>
              <Badge variant={changes.month1 >= 0 ? "default" : "destructive"} className="text-sm">
                {changes.month1 >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {changes.month1.toFixed(2)}%
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">6 Month Change</div>
              <Badge variant={changes.month6 >= 0 ? "default" : "destructive"} className="text-sm">
                {changes.month6 >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {changes.month6.toFixed(2)}%
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">1 Year Change</div>
              <Badge variant={changes.year1 >= 0 ? "default" : "destructive"} className="text-sm">
                {changes.year1 >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {changes.year1.toFixed(2)}%
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Price Chart (1 Year)</h3>
              <StockMiniChart stock={stock} height={300} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium mb-2">52 Week Range</div>
                <div className="text-muted-foreground">
                  ₹{Math.min(...stock.historicalPrices.map(p => p.price)).toFixed(2)} - ₹{Math.max(...stock.historicalPrices.map(p => p.price)).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Average Volume</div>
                <div className="text-muted-foreground">
                  {Math.round(stock.volume.reduce((sum, v) => sum + v.volume, 0) / stock.volume.length).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Current vs DMA50</div>
                <div className="text-muted-foreground">
                  {stock.currentPrice > stock.dma50[stock.dma50.length - 1].dma ? (
                    <span className="text-green-600">Above (+{((stock.currentPrice / stock.dma50[stock.dma50.length - 1].dma - 1) * 100).toFixed(2)}%)</span>
                  ) : (
                    <span className="text-red-600">Below ({((stock.currentPrice / stock.dma50[stock.dma50.length - 1].dma - 1) * 100).toFixed(2)}%)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}