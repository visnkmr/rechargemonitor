"use client";

import { useState, useEffect } from "react";
import { Expense } from "@/lib/types";

const STORAGE_KEY = "expenses";

type StoredExpense = Omit<Expense, 'date' | 'createdAt'> & {
  date: string;
  createdAt: string;
};

function loadExpensesFromStorage(): Expense[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: StoredExpense[] = JSON.parse(stored);
      return parsed.map((expense) => ({
        ...expense,
        date: new Date(expense.date),
        createdAt: new Date(expense.createdAt),
      }));
    } catch (error) {
      console.error("Failed to parse expenses from localStorage", error);
      return [];
    }
  }
  return [];
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpensesFromStorage);

  // Save to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Expense) => {
    setExpenses((current) => [expense, ...current]);
  };

  const updateExpense = (id: string, updatedExpense: Expense) => {
    setExpenses((current) => current.map(expense =>
      expense.id === id ? updatedExpense : expense
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses((current) => current.filter(expense => expense.id !== id));
  };

  return { expenses, addExpense, updateExpense, deleteExpense };
}