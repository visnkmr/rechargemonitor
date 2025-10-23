"use client";

import { useState, useEffect } from "react";
import { SIPCalculation } from "@/lib/types";

const STORAGE_KEY = "sip-calculations";

type StoredSIPCalculation = Omit<SIPCalculation, 'startDate' | 'createdAt'> & {
  startDate: string;
  createdAt: string;
};

function loadSIPCalculationsFromStorage(): SIPCalculation[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: StoredSIPCalculation[] = JSON.parse(stored);
      return parsed.map((calc) => ({
        ...calc,
        startDate: new Date(calc.startDate),
        createdAt: new Date(calc.createdAt),
      }));
    } catch (error) {
      console.error("Failed to parse SIP calculations from localStorage", error);
      return [];
    }
  }
  return [];
}

export function useSIPCalculations() {
  const [calculations, setCalculations] = useState<SIPCalculation[]>(loadSIPCalculationsFromStorage);

  // Save to localStorage whenever calculations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
  }, [calculations]);

  const addCalculation = (calculation: SIPCalculation) => {
    setCalculations((current) => [calculation, ...current]);
  };

  const deleteCalculation = (id: string) => {
    setCalculations((current) => current.filter(calc => calc.id !== id));
  };

  return { calculations, addCalculation, deleteCalculation };
}