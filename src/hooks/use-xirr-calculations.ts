"use client";

import { useState, useEffect } from "react";
import { XIRRCalculation } from "@/lib/types";

const STORAGE_KEY = "xirr-calculations";

type StoredXIRRCalculation = Omit<XIRRCalculation, 'createdAt'> & {
  createdAt: string;
};

function loadXIRRCalculationsFromStorage(): XIRRCalculation[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: StoredXIRRCalculation[] = JSON.parse(stored);
      return parsed.map((calc) => ({
        ...calc,
        createdAt: new Date(calc.createdAt),
      }));
    } catch (error) {
      console.error("Failed to parse XIRR calculations from localStorage", error);
      return [];
    }
  }
  return [];
}

export function useXIRRCalculations() {
  const [calculations, setCalculations] = useState<XIRRCalculation[]>(loadXIRRCalculationsFromStorage);

  // Save to localStorage whenever calculations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
  }, [calculations]);

  const addCalculation = (calculation: XIRRCalculation) => {
    setCalculations((current) => [calculation, ...current]);
  };

  const updateCalculation = (id: string, updatedCalculation: Partial<XIRRCalculation>) => {
    setCalculations((current) =>
      current.map((calc) =>
        calc.id === id
          ? { ...calc, ...updatedCalculation }
          : calc
      )
    );
  };

  const deleteCalculation = (id: string) => {
    setCalculations((current) => current.filter(calc => calc.id !== id));
  };

  return { calculations, addCalculation, updateCalculation, deleteCalculation };
}