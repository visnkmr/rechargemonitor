"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Calculator,
  TrendingUp,
  CreditCard,
  FileText,
  ArrowRight,
  Activity,
  DollarSign,
  Calendar,
  Target,
  Wallet,
  Receipt,
  Eye,
  EyeOff
} from "lucide-react";
import { useRecharges } from "@/hooks/use-recharges";
import { useSIPCalculations } from "@/hooks/use-sip-calculations";
import { useFDCalculations } from "@/hooks/use-fd-calculations";
import { useLoanCalculations } from "@/hooks/use-loan-calculations";
import { useXIRRCalculations } from "@/hooks/use-xirr-calculations";
import { useBills } from "@/hooks/use-bills";
import { useExpenses } from "@/hooks/use-expenses";

export default function Home() {
  const { recharges, toggleRecharge } = useRecharges();
  const { calculations: sipCalculations, toggleCalculation } = useSIPCalculations();
  const { calculations: fdCalculations } = useFDCalculations();
  const { calculations: loanCalculations } = useLoanCalculations();
  const { calculations: xirrCalculations } = useXIRRCalculations();
  const { bills, toggleBill } = useBills();
  const { expenses } = useExpenses();
  // Mutual funds are now search-based, no preloaded list

  // Calculate stats
  const activeRecharges = recharges.filter(r => r.remainingDays > 0 && r.enabled);
  const totalRechargeValue = recharges.reduce((sum, r) => sum + r.lastRechargeAmount, 0);
  const totalSIPInvested = sipCalculations.reduce((sum, calc) => sum + calc.totalInvested, 0);
  const totalFDInvested = fdCalculations.reduce((sum, calc) => sum + calc.principal, 0);

  // Calculate monthly spend
  const monthlyRechargeSpend = activeRecharges.filter(r => r.enabled).reduce((sum, r) => sum + (r.perDayCost * 30), 0);

  const monthlySIPSpend = sipCalculations
    .filter(calc => calc.enabled) // Only include enabled SIPs
    .reduce((sum, calc) => {
      // Normalize different frequencies to monthly
      let monthlyAmount = 0;
      switch (calc.frequency) {
        case 'hourly':
          monthlyAmount = calc.amount * 30 * 24; // Approximate
          break;
        case 'daily':
          monthlyAmount = calc.amount * 30;
          break;
        case 'weekly':
          monthlyAmount = calc.amount * 4.33; // Approximate
          break;
        case 'monthly':
          monthlyAmount = calc.amount;
          break;
        case 'quarterly':
          monthlyAmount = calc.amount / 3;
          break;
        case 'yearly':
          monthlyAmount = calc.amount / 12;
          break;
        default:
          monthlyAmount = calc.amount;
      }
      return sum + monthlyAmount;
    }, 0);

  const monthlyLoanSpend = loanCalculations.reduce((sum, calc) => sum + calc.emi, 0);
  const monthlyBillsSpend = bills.filter(bill => bill.enabled).reduce((sum, bill) => sum + (bill.amount * (30 / bill.frequencyDays)), 0);
  const monthlyExpensesSpend = expenses.reduce((sum, expense) => sum + expense.perMonthCost, 0);
  const totalMonthlySpend = monthlyRechargeSpend + monthlySIPSpend + monthlyLoanSpend + monthlyBillsSpend + monthlyExpensesSpend;

  const quickStats = [
    {
      title: "Active Recharges",
      value: activeRecharges.length,
      description: "Currently active plans",
      icon: Smartphone,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Recharge Value",
      value: `₹${totalRechargeValue.toLocaleString()}`,
      description: "All time recharges",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "SIP Calculations",
      value: sipCalculations.length,
      description: "Saved investment plans",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "FD Calculations",
      value: fdCalculations.length,
      description: "Fixed deposit plans",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Loan Calculations",
      value: loanCalculations.length,
      description: "Loan analysis reports",
      icon: CreditCard,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "XIRR Calculations",
      value: xirrCalculations.length,
      description: "XIRR and return calculations",
      icon: TrendingUp,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
     {
       title: "Bills",
       value: bills.length,
       description: "Recurring expenses",
       icon: Receipt,
       color: "text-teal-600",
       bgColor: "bg-teal-50",
     },
     {
       title: "Expenses",
       value: expenses.length,
       description: "Amortized one-time costs",
       icon: Calculator,
       color: "text-orange-600",
       bgColor: "bg-orange-50",
     },

    {
      title: "Monthly Spend",
      value: `₹${totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "Total monthly commitments",
      icon: Wallet,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const tools = [
    {
      title: "Mutual Funds",
      description: "Search and analyze mutual fund performance with XIRR",
      href: "/mutual-funds",
      icon: TrendingUp,
      stats: "Search & Analyze",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Recharge Monitor",
      description: "Track mobile recharges and active plans",
      href: "/recharges",
      icon: Smartphone,
      stats: `${activeRecharges.length} active`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "SIP Calculator",
      description: "Calculate Systematic Investment Plan returns",
      href: "/sip",
      icon: Calculator,
      stats: `${sipCalculations.length} saved`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "FD Calculator",
      description: "Calculate Fixed Deposit maturity amounts",
      href: "/fd",
      icon: TrendingUp,
      stats: `${fdCalculations.length} saved`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Loan Calculator",
      description: "Calculate loan interest and remaining payments",
      href: "/loan",
      icon: CreditCard,
      stats: `${loanCalculations.length} saved`,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "XIRR Calculator",
      description: "Calculate XIRR and investment returns",
      href: "/xirr",
      icon: TrendingUp,
      stats: `${xirrCalculations.length} saved`,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Bill Manager",
      description: "Track recurring bills and expenses",
      href: "/bills",
      icon: Receipt,
      stats: `${bills.length} bills`,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
     {
       title: "Expense Amortization",
       description: "Track one-time expenses and their amortized costs",
       href: "/expenses",
       icon: Calculator,
       stats: `${expenses.length} expenses`,
       color: "text-orange-600",
       bgColor: "bg-orange-50",
     },
     {
       title: "Export/Import",
       description: "Backup and restore your data",
       href: "/export",
       icon: FileText,
       stats: "Tools",
       color: "text-gray-600",
       bgColor: "bg-gray-50",
     },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Financial Dashboard</h1>
              <p className="text-muted-foreground">
                Your complete financial planning and tracking hub
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
              <Activity className="h-4 w-4 mr-1" />
              {activeRecharges.length + sipCalculations.length + fdCalculations.length + loanCalculations.length + xirrCalculations.length + bills.length + expenses.length} Active Items
            </span>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Financial Summary */}
        {(totalRechargeValue > 0 || totalSIPInvested > 0 || totalFDInvested > 0) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
              <CardDescription>
                Overview of your financial commitments and investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {totalRechargeValue > 0 && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Recharges</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{totalRechargeValue.toLocaleString()}
                    </p>
                  </div>
                )}
                {totalSIPInvested > 0 && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">SIP Investments</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{totalSIPInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                {totalFDInvested > 0 && (
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">FD Investments</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{totalFDInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                    <tool.icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-50 text-gray-600 border">
                    {tool.stats}
                  </span>
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={tool.href}>
                  <Button className="w-full">
                    Open Tool
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        {(recharges.length > 0 || sipCalculations.length > 0 || fdCalculations.length > 0 || loanCalculations.length > 0 || bills.length > 0) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest financial activities and calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeRecharges.map((recharge) => (
                  <div key={recharge.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{recharge.nickname}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRecharge(recharge.id)}
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            title={recharge.enabled ? "Exclude from monthly spend" : "Include in monthly spend"}
                          >
                            {recharge.enabled ? (
                              <Eye className="h-3 w-3 text-blue-600" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ₹{recharge.lastRechargeAmount} - {recharge.remainingDays} days remaining
                        </p>
                      </div>
                    </div>
                    <Link href="/recharges">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}

                {sipCalculations.map((calc) => (
                  <div key={calc.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{calc.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCalculation(calc.id)}
                            className="h-6 w-6 p-0 hover:bg-purple-100"
                            title={calc.enabled ? "Exclude from monthly spend" : "Include in monthly spend"}
                          >
                            {calc.enabled ? (
                              <Eye className="h-3 w-3 text-purple-600" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ₹{calc.amount} {calc.frequency} - {calc.duration} months
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          Total Invested: ₹{calc.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <Link href="/sip">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}

                {fdCalculations.map((calc) => (
                  <div key={calc.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">FD Calculation</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{calc.principal.toLocaleString()} at {calc.annualRate}% - {calc.years} years
                        </p>
                      </div>
                    </div>
                    <Link href="/fd">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}

                {loanCalculations.map((calc) => (
                  <div key={calc.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">Loan Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{calc.loanAmount.toLocaleString()} - {calc.remainingInstallments} installments left
                        </p>
                      </div>
                    </div>
                    <Link href="/loan">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}

                {bills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-teal-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{bill.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBill(bill.id)}
                            className="h-6 w-6 p-0 hover:bg-teal-100"
                            title={bill.enabled ? "Exclude from monthly spend" : "Include in monthly spend"}
                          >
                            {bill.enabled ? (
                              <Eye className="h-3 w-3 text-teal-600" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ₹{bill.amount} every {bill.frequencyDays} days
                        </p>
                      </div>
                    </div>
                    <Link href="/bills">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
