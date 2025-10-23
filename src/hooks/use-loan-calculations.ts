"use client";

import { useState, useEffect } from "react";

export interface LoanCalculation {
  id: string;
  loanAmount: number;
  totalInstallments: number;
  remainingInstallments: number;
  remainingPrincipal: number;
  emi: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  remainingAmount: number;
  xirr: number;
  remainingMonths: number;
  remainingYears: number;
  totalInterestOverLoan: number;
  totalAmountPayable: number;
  paidInstallments: number;
  createdAt: Date;
}

const STORAGE_KEY = "loan-calculations";

type StoredLoanCalculation = Omit<LoanCalculation, 'createdAt'> & {
  createdAt: string;
};

function loadLoanCalculationsFromStorage(): LoanCalculation[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: StoredLoanCalculation[] = JSON.parse(stored);
      return parsed.map((calc) => ({
        ...calc,
        createdAt: new Date(calc.createdAt),
      }));
    } catch (error) {
      console.error("Failed to parse loan calculations from localStorage", error);
      return [];
    }
  }
  return [];
}

export function useLoanCalculations() {
  const [calculations, setCalculations] = useState<LoanCalculation[]>(loadLoanCalculationsFromStorage);

  // Save to localStorage whenever calculations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
  }, [calculations]);

  const addCalculation = (calculation: LoanCalculation) => {
    setCalculations((current) => [calculation, ...current]);
  };

  const deleteCalculation = (id: string) => {
    setCalculations((current) => current.filter(calc => calc.id !== id));
  };

  return { calculations, addCalculation, deleteCalculation };
}