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
  Wallet
} from "lucide-react";
import { useRecharges } from "@/hooks/use-recharges";
import { useSIPCalculations } from "@/hooks/use-sip-calculations";
import { useFDCalculations } from "@/hooks/use-fd-calculations";
import { useLoanCalculations } from "@/hooks/use-loan-calculations";

export default function Home() {
  const { recharges } = useRecharges();
  const { calculations: sipCalculations } = useSIPCalculations();
  const { calculations: fdCalculations } = useFDCalculations();
  const { calculations: loanCalculations } = useLoanCalculations();

  // Calculate stats
  const activeRecharges = recharges.filter(r => r.remainingDays > 0);
  const totalRechargeValue = recharges.reduce((sum, r) => sum + r.lastRechargeAmount, 0);
  const totalSIPInvested = sipCalculations.reduce((sum, calc) => sum + calc.totalInvested, 0);
  const totalFDInvested = fdCalculations.reduce((sum, calc) => sum + calc.principal, 0);

  // Calculate monthly spend
  const monthlyRechargeSpend = activeRecharges.reduce((sum, r) => sum + (r.perDayCost * 30), 0);

  const monthlySIPSpend = sipCalculations.reduce((sum, calc) => {
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
  const totalMonthlySpend = monthlyRechargeSpend + monthlySIPSpend + monthlyLoanSpend;

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
              {activeRecharges.length + sipCalculations.length + fdCalculations.length + loanCalculations.length} Active Items
            </span>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
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
        {(recharges.length > 0 || sipCalculations.length > 0 || fdCalculations.length > 0 || loanCalculations.length > 0) && (
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
                      <div>
                        <p className="font-medium">{recharge.nickname}</p>
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
                      <div>
                        <p className="font-medium">{calc.name}</p>
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
