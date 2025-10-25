"use client";

import { useState } from "react";
import Link from "next/link";
import { MutualFundsList } from "@/components/mutual-funds-list";
import { MutualFundChart } from "@/components/mutual-fund-chart";
import { useMutualFunds } from "@/hooks/use-mutual-funds";
import { MutualFundWithHistory } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function MutualFundsPage() {
  const { mutualFunds, loading, error } = useMutualFunds();
  const [selectedFund, setSelectedFund] = useState<MutualFundWithHistory | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center py-8">
            <p className="text-lg">Loading mutual funds...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center py-8">
            <p className="text-lg text-red-600">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              The MFAPI service might be temporarily unavailable. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Mutual Funds</h1>
              <p className="text-muted-foreground">
                Track mutual fund performance and calculate XIRR for selected periods.
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MutualFundsList
              mutualFunds={mutualFunds}
              selectedFund={selectedFund}
              onSelectFund={setSelectedFund}
            />
          </div>
          <div className="lg:col-span-2">
            {selectedFund ? (
              <MutualFundChart fund={selectedFund} />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-muted-foreground">
                  Select a mutual fund from the list to view its historical performance and calculate XIRR.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}