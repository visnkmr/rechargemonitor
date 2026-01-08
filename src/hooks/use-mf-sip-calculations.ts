"use client";

import { useState, useEffect } from "react";
import { MFSIPCalculation } from "@/lib/types";

const STORAGE_KEY = "mf-sip-calculations";

type StoredMFSIPCalculation = Omit<MFSIPCalculation, 'startDate' | 'createdAt'> & {
  startDate: string;
  createdAt: string;
};

function loadMFSIPCalculationsFromStorage(): MFSIPCalculation[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: StoredMFSIPCalculation[] = JSON.parse(stored);
      return parsed.map((calc) => ({
        ...calc,
        startDate: new Date(calc.startDate),
        createdAt: new Date(calc.createdAt),
        enabled: calc.enabled ?? true, // Default to enabled for existing calculations
      }));
    } catch (error) {
      console.error("Failed to parse MF SIP calculations from localStorage", error);
      return [];
    }
  }
  return [];
}

export function useMFSIPCalculations() {
  const [calculations, setCalculations] = useState<MFSIPCalculation[]>(loadMFSIPCalculationsFromStorage);

  // Save to localStorage whenever calculations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
  }, [calculations]);

  const addCalculation = (calculation: MFSIPCalculation) => {
    setCalculations((current) => [calculation, ...current]);
  };

  const updateCalculation = (id: string, updatedCalculation: Partial<MFSIPCalculation>) => {
    setCalculations((current) =>
      current.map((calc) =>
        calc.id === id
          ? { ...calc, ...updatedCalculation }
          : calc
      )
    );
  };

  const deleteCalculation = (id: string) => {
    setCalculations((current) => current.filter((calc) => calc.id !== id));
  };

  const toggleCalculation = (id: string) => {
    setCalculations((current) =>
      current.map((calc) =>
        calc.id === id ? { ...calc, enabled: !calc.enabled } : calc
      )
    );
  };

  const getCalculationsForFund = (schemeCode: number) => {
    return calculations.filter(calc => calc.schemeCode === schemeCode);
  };

  return {
    calculations,
    addCalculation,
    updateCalculation,
    deleteCalculation,
    toggleCalculation,
    getCalculationsForFund
  };
}