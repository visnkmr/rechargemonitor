"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bill } from "@/hooks/use-bills";

const billSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  frequencyDays: z.number().min(1, "Frequency must be at least 1 day").max(365, "Frequency cannot exceed 365 days"),
});

type BillFormValues = z.infer<typeof billSchema>;

interface BillFormProps {
  onSaveBill: (bill: Bill) => void;
  editingBill?: Bill | null;
  onCancelEdit?: () => void;
}

export function BillForm({ onSaveBill, editingBill, onCancelEdit }: BillFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
  });

  // Handle editing mode
  useEffect(() => {
    if (editingBill) {
      reset({
        name: editingBill.name,
        amount: editingBill.amount,
        frequencyDays: editingBill.frequencyDays,
      });
    } else {
      reset({
        name: "",
        amount: 0,
        frequencyDays: 30,
      });
    }
  }, [editingBill, reset]);

  const saveBill = (data: BillFormValues) => {
    const { name, amount, frequencyDays } = data;

    const bill: Bill = {
      id: editingBill?.id || crypto.randomUUID(),
      name,
      amount,
      frequencyDays,
      createdAt: editingBill?.createdAt || new Date(),
    };

    onSaveBill(bill);

    // If editing, call cancel edit callback
    if (editingBill && onCancelEdit) {
      onCancelEdit();
    } else {
      // Reset form for new bill
      reset({
        name: "",
        amount: 0,
        frequencyDays: 30,
      });
    }
  };

  const resetForm = () => {
    reset({
      name: "",
      amount: 0,
      frequencyDays: 30,
    });
    if (editingBill && onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingBill ? `Edit Bill: ${editingBill.name}` : 'Add New Bill'}
        </CardTitle>
        <CardDescription>
          {editingBill
            ? 'Update your bill information.'
            : 'Add a recurring bill to track your expenses.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(saveBill)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bill Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Electricity Bill"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="1000.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencyDays">Frequency (Days)</Label>
              <Input
                id="frequencyDays"
                type="number"
                {...register("frequencyDays", { valueAsNumber: true })}
                placeholder="30"
              />
              {errors.frequencyDays && (
                <p className="text-sm text-red-500">{errors.frequencyDays.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                How often this bill occurs (e.g., 30 for monthly)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">{editingBill ? 'Update' : 'Save'} Bill</Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              {editingBill ? 'Cancel' : 'Reset'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}