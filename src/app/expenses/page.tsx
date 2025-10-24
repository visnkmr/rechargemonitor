"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft, Plus, Trash2, Calculator } from "lucide-react";
import { useExpenses } from "@/hooks/use-expenses";
import { Expense, ExpenseFormData } from "@/lib/types";
import { format } from "date-fns";

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: "",
    amount: 0,
    date: new Date(),
    dissolutionPeriodYears: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const perDayCost = formData.amount / (formData.dissolutionPeriodYears * 365.25);
    const perMonthCost = formData.amount / (formData.dissolutionPeriodYears * 12);
    const perYearCost = formData.amount / formData.dissolutionPeriodYears;

    const newExpense: Expense = {
      id: Date.now().toString(),
      name: formData.name,
      amount: formData.amount,
      date: formData.date,
      dissolutionPeriodYears: formData.dissolutionPeriodYears,
      perDayCost,
      perMonthCost,
      perYearCost,
      createdAt: new Date(),
    };

    addExpense(newExpense);

    // Reset form
    setFormData({
      name: "",
      amount: 0,
      date: new Date(),
      dissolutionPeriodYears: 5,
    });
  };

  const totalMonthlyCost = expenses.reduce((sum, expense) => sum + expense.perMonthCost, 0);
  const totalYearlyCost = expenses.reduce((sum, expense) => sum + expense.perYearCost, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Expense Amortization</h1>
              <p className="text-muted-foreground">
                Track one-time expenses and their amortized costs over time
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Add Expense Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Expense
              </CardTitle>
              <CardDescription>
                Enter expense details to calculate amortized costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Expense Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Laptop, Vacation, etc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <Label>Date</Label>
                  <DatePicker
                    date={formData.date}
                    onDateChange={(date) => setFormData({ ...formData, date: date || new Date() })}
                  />
                </div>

                <div>
                  <Label htmlFor="dissolutionPeriod">Dissolution Period (Years)</Label>
                  <Input
                    id="dissolutionPeriod"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.dissolutionPeriodYears}
                    onChange={(e) => setFormData({ ...formData, dissolutionPeriodYears: parseFloat(e.target.value) || 5 })}
                    placeholder="5"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate & Save
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Expense Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Summary</CardTitle>
              <CardDescription>
                Total amortized costs across all expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{totalMonthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Yearly Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{totalYearlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {expenses.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses List */}
        {expenses.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>
                All tracked expenses with their amortized costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{expense.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        ₹{expense.amount.toLocaleString()} on {format(expense.date, "PPP")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Amortized over {expense.dissolutionPeriodYears} years
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Per Day</p>
                          <p className="font-medium">₹{expense.perDayCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Per Month</p>
                          <p className="font-medium">₹{expense.perMonthCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Per Year</p>
                          <p className="font-medium">₹{expense.perYearCost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
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