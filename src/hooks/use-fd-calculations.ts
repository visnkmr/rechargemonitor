"use client";

import { useState, useEffect } from "react";

export interface FDCalculation {
  id: string;
  principal: number;
  annualRate: number;
  years: number;
  compoundingFrequency: number;
  maturityAmount: number;
  totalInterest: number;
  xirr?: number;
  xirrMaturityAmount?: number;
  createdAt: Date;
}

const STORAGE_KEY = "fd-calculations";

type StoredFDCalculation = Omit<FDCalculation, 'createdAt'> & {
  createdAt: string;
};

function loadFDCalculationsFromStorage(): FDCalculation[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: StoredFDCalculation[] = JSON.parse(stored);
      return parsed.map((calc) => ({
        ...calc,
        createdAt: new Date(calc.createdAt),
      }));
    } catch (error) {
      console.error("Failed to parse FD calculations from localStorage", error);
      return [];
    }
  }
  return [];
}

export function useFDCalculations() {
  const [calculations, setCalculations] = useState<FDCalculation[]>(loadFDCalculationsFromStorage);

  // Save to localStorage whenever calculations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
  }, [calculations]);

  const addCalculation = (calculation: FDCalculation) => {
    setCalculations((current) => [calculation, ...current]);
  };

  const deleteCalculation = (id: string) => {
    setCalculations((current) => current.filter(calc => calc.id !== id));
  };

  return { calculations, addCalculation, deleteCalculation };
}