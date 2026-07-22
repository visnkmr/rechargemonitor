"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calculator,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  Trash2,
  History,
} from "lucide-react";

const formulas = [
  {
    field: "Remaining Months",
    formula: "=[Total Months] - [Current Installment]",
    inputs: ["Total Months", "Current Installment"],
  },
  {
    field: "To Pay",
    formula:
      "=[Subscription] * [Remaining Months] * IF([Division]=4, 0.85, 0.92)",
    inputs: ["Subscription", "Remaining Months", "Division"],
  },
  {
    field: "Dividend",
    formula: "=([Subscription] * [Current Installment]) - [Amount Paid]",
    inputs: ["Subscription", "Current Installment", "Amount Paid"],
  },
  {
    field: "Over %",
    formula: "=([Current Installment] / [Total Months]) * 100",
    inputs: ["Current Installment", "Total Months"],
  },
  {
    field: "Dividend %",
    formula:
      "=([Dividend] * 100) / ([Current Installment] * [Subscription])",
    inputs: ["Dividend", "Current Installment", "Subscription"],
  },
  {
    field: "At 20% Disc Win",
    formula: "=[Remaining Months] * [Subscription] * 0.8",
    inputs: ["Remaining Months", "Subscription"],
  },
  {
    field: "Multiplier",
    formula: "=[At 20% Disc Win] / [Subscription]",
    inputs: ["At 20% Disc Win", "Subscription"],
  },
  {
    field: "Interest at 20%",
    formula:
      "=([To Pay] - [At 20% Disc Win]) * 1200 / ([Remaining Months] * [At 20% Disc Win])",
    inputs: ["To Pay", "At 20% Disc Win", "Remaining Months"],
  },
  {
    field: "Discount %",
    formula: "=([Auction Discount] * 100) / [Sala]",
    inputs: ["Auction Discount", "Sala"],
  },
  {
    field: "Win-Subscrip-Disc",
    formula: "=[Sala] - [Auction Discount] - [Amount Paid]",
    inputs: ["Sala", "Auction Discount", "Amount Paid"],
  },
  {
    field: "Yield Rate",
    formula:
      '=IF([Auction Discount]="", 100, ([To Pay] - [Win-Subscrip-Disc]) * 1200 / ([Remaining Months] * [Win-Subscrip-Disc]))',
    inputs: ["Auction Discount", "To Pay", "Win-Subscrip-Disc", "Remaining Months"],
  },
  {
    field: "Sala",
    formula: "=[Total Months] * [Subscription]",
    inputs: ["Total Months", "Subscription"],
  },
  {
    field: "Avg Days Factor",
    formula: "=(([Current Installment] - 1) * 30 + 5) / [Current Installment]",
    inputs: ["Current Installment"],
  },
];

const DISCOUNT_STEPS = [30, 27.5, 25, 22.5, 20, 17.5, 15];
const HISTORY_KEY = "formula-calculator-history";

interface HistoryEntry {
  id: string;
  label: string;
  timestamp: number;
  inputs: {
    totalMonths: string;
    currentInstallment: string;
    subscription: string;
    division: string;
    amountPaid: string;
    auctionDiscount: string;
  };
}

function fmt(n: number): string {
  if (isNaN(n) || !isFinite(n)) return "—";
  return n % 1 === 0 ? n.toString() : n.toFixed(4);
}

function fmtCurrency(n: number): string {
  if (isNaN(n) || !isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function FormulaCalculatorPage() {
  const [inputs, setInputs] = useState({
    totalMonths: "",
    currentInstallment: "",
    subscription: "",
    division: "",
    amountPaid: "",
    auctionDiscount: "",
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showFormulas, setShowFormulas] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const num = (key: keyof typeof inputs) => {
    const v = parseFloat(inputs[key]);
    return isNaN(v) ? null : v;
  };

  const results = useMemo(() => {
    const totalMonths = num("totalMonths");
    const currentInstallment = num("currentInstallment");
    const subscription = num("subscription");
    const division = num("division");
    const amountPaid = num("amountPaid");
    const auctionDiscount =
      inputs.auctionDiscount === "" ? null : num("auctionDiscount");
    const sala =
      totalMonths !== null && subscription !== null
        ? totalMonths * subscription
        : null;

    const remainingMonths =
      totalMonths !== null && currentInstallment !== null
        ? totalMonths - currentInstallment
        : null;

    const toPay =
      subscription !== null && remainingMonths !== null && division !== null
        ? subscription * remainingMonths * (division === 4 ? 0.85 : 0.92)
        : null;

    const dividend =
      subscription !== null &&
      currentInstallment !== null &&
      amountPaid !== null
        ? subscription * currentInstallment - amountPaid
        : null;

    const overPercent =
      currentInstallment !== null && totalMonths !== null && totalMonths !== 0
        ? (currentInstallment / totalMonths) * 100
        : null;

    const dividendPercent =
      dividend !== null &&
      currentInstallment !== null &&
      subscription !== null &&
      currentInstallment * subscription !== 0
        ? (dividend * 100) / (currentInstallment * subscription)
        : null;

    const at20DiscWin =
      remainingMonths !== null && subscription !== null
        ? remainingMonths * subscription * 0.8
        : null;

    const multiplier =
      at20DiscWin !== null && subscription !== null && subscription !== 0
        ? at20DiscWin / subscription
        : null;

    const interestAt20 =
      toPay !== null &&
      at20DiscWin !== null &&
      remainingMonths !== null &&
      remainingMonths !== 0 &&
      at20DiscWin !== 0
        ? ((toPay - at20DiscWin) * 1200) / (remainingMonths * at20DiscWin)
        : null;

    const discountPercent =
      auctionDiscount !== null && sala !== null && sala !== 0
        ? (auctionDiscount * 100) / sala
        : null;

    const winSubscripDisc =
      sala !== null && auctionDiscount !== null && amountPaid !== null
        ? sala - (auctionDiscount || 0) - amountPaid
        : null;

    const yieldRate =
      auctionDiscount === null
        ? 100
        : toPay !== null &&
            winSubscripDisc !== null &&
            remainingMonths !== null &&
            remainingMonths !== 0 &&
            winSubscripDisc !== 0
          ? ((toPay - winSubscripDisc) * 1200) /
            (remainingMonths * winSubscripDisc)
          : null;

    return {
      remainingMonths,
      toPay,
      dividend,
      overPercent,
      dividendPercent,
      at20DiscWin,
      multiplier,
      interestAt20,
      discountPercent,
      winSubscripDisc,
      yieldRate,
    };
  }, [inputs]);

  const auctionSteps = useMemo(() => {
    const totalMonths = num("totalMonths");
    const subscription = num("subscription");
    const amountPaid = num("amountPaid");
    const remainingMonths = results.remainingMonths;
    const toPay = results.toPay;

    if (totalMonths === null || subscription === null || amountPaid === null) return [];

    const sala = totalMonths * subscription;

    return DISCOUNT_STEPS.map((pct) => {
      const discAmt = sala * (pct / 100);
      const prizeMoney = sala - discAmt;
      const winSub = sala - discAmt - amountPaid;
      const yieldRate =
        toPay !== null &&
        remainingMonths !== null &&
        remainingMonths !== 0 &&
        winSub !== 0
          ? ((toPay - winSub) * 1200) / (remainingMonths * winSub)
          : null;
      return { pct, discAmt, prizeMoney, winSub, yieldRate };
    });
  }, [inputs.totalMonths, inputs.subscription, inputs.amountPaid, results.remainingMonths, results.toPay]);

  const outputFields: {
    key: string;
    label: string;
    value: number | null;
    format?: (n: number) => string;
  }[] = [
    {
      key: "remainingMonths",
      label: "Remaining Months",
      value: results.remainingMonths,
    },
    {
      key: "toPay",
      label: "To Pay",
      value: results.toPay,
      format: (n) => fmtCurrency(n),
    },
    {
      key: "dividend",
      label: "Dividend",
      value: results.dividend,
      format: (n) => fmtCurrency(n),
    },
    {
      key: "overPercent",
      label: "Over %",
      value: results.overPercent,
      format: (n) => `${fmt(n)}%`,
    },
    {
      key: "dividendPercent",
      label: "Dividend %",
      value: results.dividendPercent,
      format: (n) => `${fmt(n)}%`,
    },
    {
      key: "at20DiscWin",
      label: "At 20% Disc Win",
      value: results.at20DiscWin,
      format: (n) => fmtCurrency(n),
    },
    {
      key: "multiplier",
      label: "Multiplier",
      value: results.multiplier,
      format: (n) => `${fmt(n)}x`,
    },
    {
      key: "interestAt20",
      label: "Interest at 20%",
      value: results.interestAt20,
      format: (n) => `${fmt(n)}%`,
    },
    {
      key: "discountPercent",
      label: "Discount %",
      value: results.discountPercent,
      format: (n) => `${fmt(n)}%`,
    },
    {
      key: "winSubscripDisc",
      label: "Win-Subscrip-Disc",
      value: results.winSubscripDisc,
      format: (n) => fmtCurrency(n),
    },
    {
      key: "yieldRate",
      label: "Yield Rate",
      value: results.yieldRate,
      format: (n) => `${fmt(n)}%`,
    },
  ];

  const inputFields: {
    key: keyof typeof inputs;
    label: string;
    placeholder: string;
  }[] = [
    { key: "totalMonths", label: "Total Months", placeholder: "e.g. 60" },
    {
      key: "currentInstallment",
      label: "Current Installment",
      placeholder: "e.g. 12",
    },
    { key: "subscription", label: "Subscription", placeholder: "e.g. 1000" },
    { key: "division", label: "Division", placeholder: "e.g. 4" },
    { key: "amountPaid", label: "Amount Paid", placeholder: "e.g. 12000" },
    {
      key: "auctionDiscount",
      label: "Auction Discount (blank = none)",
      placeholder: "e.g. 5000",
    },
  ];

  const sala = useMemo(() => {
    const totalMonths = num("totalMonths");
    const subscription = num("subscription");
    return totalMonths !== null && subscription !== null
      ? totalMonths * subscription
      : null;
  }, [inputs.totalMonths, inputs.subscription]);

  const clearAll = () => {
    setInputs({
      totalMonths: "",
      currentInstallment: "",
      subscription: "",
      division: "",
      amountPaid: "",
      auctionDiscount: "",
    });
  };

  const saveToHistory = () => {
    const salaLabel = sala !== null ? fmtCurrency(sala) : "?";
    const label = `Sala ${salaLabel} | ${inputs.subscription || "?"} x${inputs.totalMonths || "?"}m | Paid ${inputs.amountPaid || "?"}`;
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      label,
      timestamp: Date.now(),
      inputs: { ...inputs },
    };
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setInputs(entry.inputs);
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const hasAnyInput = Object.values(inputs).some((v) => v !== "");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Formula Calculator</h1>
              <p className="text-muted-foreground">
                Enter values to calculate all derived fields
              </p>
            </div>
          </div>
        </header>

        {/* Inputs & Results Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inputs Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Input Values
                </CardTitle>
                <div className="flex gap-2">
                  {hasAnyInput && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveToHistory}
                      title="Save to history"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
              </div>
              <CardDescription>
                Enter the base values to compute results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {inputFields.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type="number"
                      value={inputs[key]}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                {sala !== null && (
                  <div>
                    <Label>Sala (auto)</Label>
                    <Input
                      value={fmtCurrency(sala)}
                      readOnly
                      className="bg-green-50 font-semibold text-green-700"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Calculated Results
              </CardTitle>
              <CardDescription>Auto-computed from your inputs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {outputFields.map(({ key, label, value, format }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-lg font-semibold">
                        {value !== null
                          ? format
                            ? format(value)
                            : fmt(value)
                          : "—"}
                      </p>
                    </div>
                  </div>
                ))}
                {sala !== null && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-green-50">
                    <div>
                      <p className="text-xs text-muted-foreground">Sala</p>
                      <p className="text-lg font-semibold text-green-700">
                        {fmtCurrency(sala)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auction Discount Step Table */}
        {auctionSteps.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Auction Discount Steps (30% → 15%)
              </CardTitle>
              <CardDescription>
                Prize money, win-subscrip-disc, and yield rate at each discount
                level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Discount %
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Discount ₹
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Prize Money
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Win-Subscrip-Disc
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Yield Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auctionSteps.map((row) => (
                      <tr
                        key={row.pct}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-3 pr-4 font-medium">{row.pct}%</td>
                        <td className="py-3 pr-4">{fmtCurrency(row.discAmt)}</td>
                        <td className="py-3 pr-4 text-green-600 font-medium">
                          {fmtCurrency(row.prizeMoney)}
                        </td>
                        <td className="py-3 pr-4">{fmtCurrency(row.winSub)}</td>
                        <td className="py-3 font-medium">
                          {row.yieldRate !== null
                            ? `${fmt(row.yieldRate)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Copy-Paste Formula Table (Collapsible) */}
        <Card className="mt-6">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setShowFormulas(!showFormulas)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Copy-Paste Formula Table
              </CardTitle>
              <Button variant="ghost" size="sm">
                {showFormulas ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {showFormulas && (
              <CardDescription>
                Reference formulas with inputs — click any formula to copy
              </CardDescription>
            )}
          </CardHeader>
          {showFormulas && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Calculated Field
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Formula
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Inputs Required
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formulas.map((row) => (
                      <tr
                        key={row.field}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium whitespace-nowrap">
                          {row.field}
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() =>
                              handleCopy(row.formula, row.field)
                            }
                            className="flex items-center gap-2 text-left font-mono text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition-colors w-full"
                            title="Click to copy"
                          >
                            <span className="break-all">{row.formula}</span>
                            {copiedField === row.field ? (
                              <Check className="h-3 w-3 text-green-600 shrink-0" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-400 shrink-0" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 text-muted-foreground whitespace-nowrap text-xs">
                          {row.inputs.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* History */}
        <Card className="mt-6">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setHistoryOpen(!historyOpen)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                History ({history.length})
              </CardTitle>
              <Button variant="ghost" size="sm">
                {historyOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {historyOpen && (
              <CardDescription>
                Saved entries — click to recall, trash to delete
              </CardDescription>
            )}
          </CardHeader>
          {historyOpen && (
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No saved entries yet. Fill in values and click the save icon.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <button
                        onClick={() => loadFromHistory(entry)}
                        className="text-left flex-1"
                      >
                        <p className="font-medium text-sm">{entry.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFromHistory(entry.id);
                        }}
                        className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
