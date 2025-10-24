"use client";

import { useState, useEffect } from "react";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  frequencyDays: number; // Frequency in days
  createdAt: Date;
  enabled: boolean; // Whether to include in monthly spend calculations
}

const STORAGE_KEY = "bills";

type StoredBill = Omit<Bill, 'createdAt'> & {
  createdAt: string;
  enabled?: boolean; // For backward compatibility
};

function loadBillsFromStorage(): Bill[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: StoredBill[] = JSON.parse(stored);
      return parsed.map((bill) => ({
        ...bill,
        createdAt: new Date(bill.createdAt),
        enabled: bill.enabled !== undefined ? bill.enabled : true,
      }));
    } catch (error) {
      console.error("Failed to parse bills from localStorage", error);
      return [];
    }
  }
  return [];
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>(loadBillsFromStorage);

  // Save to localStorage whenever bills change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  }, [bills]);

  const addBill = (bill: Bill) => {
    setBills((current) => [bill, ...current]);
  };

  const updateBill = (id: string, updatedBill: Bill) => {
    setBills((current) => current.map(bill =>
      bill.id === id ? updatedBill : bill
    ));
  };

  const deleteBill = (id: string) => {
    setBills((current) => current.filter(bill => bill.id !== id));
  };

  const toggleBill = (id: string) => {
    setBills((current) => current.map(bill =>
      bill.id === id ? { ...bill, enabled: !bill.enabled } : bill
    ));
  };

  return { bills, addBill, updateBill, deleteBill, toggleBill };
}