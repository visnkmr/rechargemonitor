"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft, Plus, Trash2, Save, Edit, Calendar, Type, Eye, EyeOff } from "lucide-react";
import { useExpenses } from "@/hooks/use-expenses";
import { Expense, ExpenseFormData } from "@/lib/types";
import { format } from "date-fns";

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, toggleExpense } = useExpenses();
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: "",
    amount: 0,
    date: new Date(),
    dissolutionPeriodYears: 5,
    enabled: true,
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [useDatePicker, setUseDatePicker] = useState(false);
  const [dateText, setDateText] = useState("");

  // Live calculation of amortized costs
  const calculatedCosts = useMemo(() => {
    if (formData.amount <= 0 || formData.dissolutionPeriodYears <= 0) {
      return {
        perDayCost: 0,
        perMonthCost: 0,
        perYearCost: 0,
      };
    }

    const perDayCost = formData.amount / (formData.dissolutionPeriodYears * 365.25);
    const perMonthCost = formData.amount / (formData.dissolutionPeriodYears * 12);
    const perYearCost = formData.amount / formData.dissolutionPeriodYears;

    return {
      perDayCost,
      perMonthCost,
      perYearCost,
    };
  }, [formData.amount, formData.dissolutionPeriodYears]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExpense) {
      // Update existing expense
      const updatedExpense: Expense = {
        ...editingExpense,
        name: formData.name,
        amount: formData.amount,
        date: formData.date,
        dissolutionPeriodYears: formData.dissolutionPeriodYears,
        perDayCost: calculatedCosts.perDayCost,
        perMonthCost: calculatedCosts.perMonthCost,
        perYearCost: calculatedCosts.perYearCost,
        enabled: formData.enabled ?? editingExpense.enabled,
      };
      updateExpense(editingExpense.id, updatedExpense);
      setEditingExpense(null);
    } else {
      // Add new expense
      const newExpense: Expense = {
        id: Date.now().toString(),
        name: formData.name,
        amount: formData.amount,
        date: formData.date,
        dissolutionPeriodYears: formData.dissolutionPeriodYears,
        perDayCost: calculatedCosts.perDayCost,
        perMonthCost: calculatedCosts.perMonthCost,
        perYearCost: calculatedCosts.perYearCost,
        createdAt: new Date(),
        enabled: formData.enabled ?? true,
      };
      addExpense(newExpense);
    }

    // Reset form
    setFormData({
      name: "",
      amount: 0,
      date: new Date(),
      dissolutionPeriodYears: 5,
    });
    setDateText("");
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
      dissolutionPeriodYears: expense.dissolutionPeriodYears,
      enabled: expense.enabled,
    });
    setDateText(format(expense.date, "yyyy-MM-dd"));
    setUseDatePicker(false);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setFormData({
      name: "",
      amount: 0,
      date: new Date(),
      dissolutionPeriodYears: 5,
      enabled: true,
    });
    setDateText("");
  };

  const handleDateTextChange = (value: string) => {
    setDateText(value);
    // Try to parse the date
    const parsedDate = new Date(value);
    if (!isNaN(parsedDate.getTime())) {
      setFormData(prev => ({ ...prev, date: parsedDate }));
    }
  };

  const enabledExpenses = expenses.filter(expense => expense.enabled);
  const totalMonthlyCost = enabledExpenses.reduce((sum, expense) => sum + expense.perMonthCost, 0);
  const totalYearlyCost = enabledExpenses.reduce((sum, expense) => sum + expense.perYearCost, 0);

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
           {/* Add/Edit Expense Form */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 {editingExpense ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                 {editingExpense ? "Edit Expense" : "Add New Expense"}
               </CardTitle>
               <CardDescription>
                 {editingExpense
                   ? "Update expense details and recalculate amortized costs"
                   : "Enter expense details to calculate amortized costs"
                 }
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
                   <div className="flex items-center justify-between mb-2">
                     <Label>Date</Label>
                     <div className="flex gap-1">
                       <Button
                         type="button"
                         variant={useDatePicker ? "default" : "outline"}
                         size="sm"
                         onClick={() => setUseDatePicker(true)}
                         className="h-7 px-2"
                       >
                         <Calendar className="h-3 w-3 mr-1" />
                         Picker
                       </Button>
                       <Button
                         type="button"
                         variant={!useDatePicker ? "default" : "outline"}
                         size="sm"
                         onClick={() => setUseDatePicker(false)}
                         className="h-7 px-2"
                       >
                         <Type className="h-3 w-3 mr-1" />
                         Text
                       </Button>
                     </div>
                   </div>
                   {useDatePicker ? (
                     <DatePicker
                       date={formData.date}
                       onDateChange={(date) => {
                         setFormData({ ...formData, date: date || new Date() });
                         setDateText(format(date || new Date(), "yyyy-MM-dd"));
                       }}
                     />
                   ) : (
                     <Input
                       type="date"
                       value={dateText}
                       onChange={(e) => handleDateTextChange(e.target.value)}
                       placeholder="YYYY-MM-DD"
                     />
                   )}
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

                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="enabled"
                     checked={formData.enabled ?? true}
                     onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                   />
                   <Label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                     Include in expense summary calculations
                   </Label>
                 </div>

                 {/* Live Calculation Display */}
                 {formData.amount > 0 && formData.dissolutionPeriodYears > 0 && (
                   <div className="p-4 bg-blue-50 rounded-lg border">
                     <h4 className="font-medium text-blue-900 mb-3">Amortized Costs</h4>
                     <div className="grid grid-cols-3 gap-4 text-sm">
                       <div className="text-center">
                         <p className="text-blue-700 font-medium">Per Day</p>
                         <p className="text-lg font-bold text-blue-900">
                           ₹{calculatedCosts.perDayCost.toFixed(2)}
                         </p>
                       </div>
                       <div className="text-center">
                         <p className="text-blue-700 font-medium">Per Month</p>
                         <p className="text-lg font-bold text-blue-900">
                           ₹{calculatedCosts.perMonthCost.toFixed(2)}
                         </p>
                       </div>
                       <div className="text-center">
                         <p className="text-blue-700 font-medium">Per Year</p>
                         <p className="text-lg font-bold text-blue-900">
                           ₹{calculatedCosts.perYearCost.toFixed(2)}
                         </p>
                       </div>
                     </div>
                   </div>
                 )}

                 <div className="flex gap-2">
                   <Button
                     type="submit"
                     className="flex-1"
                     disabled={!formData.name.trim() || formData.amount <= 0}
                   >
                     <Save className="h-4 w-4 mr-2" />
                     {editingExpense ? "Update Expense" : "Save Expense"}
                   </Button>
                   {editingExpense && (
                     <Button
                       type="button"
                       variant="outline"
                       onClick={handleCancelEdit}
                       className="flex-1"
                     >
                       Cancel
                     </Button>
                   )}
                 </div>
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
                   <p className="text-sm text-muted-foreground">Active Expenses</p>
                   <p className="text-2xl font-bold text-purple-600">
                     {enabledExpenses.length} / {expenses.length}
                   </p>
                   <p className="text-xs text-muted-foreground">
                     enabled / total
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
                         <div className="flex items-center gap-2">
                           <h3 className="font-medium">{expense.name}</h3>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => toggleExpense(expense.id)}
                             className="h-6 w-6 p-0 hover:bg-gray-100"
                             title={expense.enabled ? "Exclude from monthly spend" : "Include in monthly spend"}
                           >
                             {expense.enabled ? (
                               <Eye className="h-3 w-3 text-green-600" />
                             ) : (
                               <EyeOff className="h-3 w-3 text-gray-400" />
                             )}
                           </Button>
                         </div>
                         <div className="flex gap-1">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleEditExpense(expense)}
                             className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => deleteExpense(expense.id)}
                             className="text-red-600 hover:text-red-700 hover:bg-red-50"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
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