"use client";

import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { Recharge } from "@/lib/types";

type StoredRecharge = Omit<Recharge, 'rechargeDate'> & { rechargeDate: string };

const STORAGE_KEY = "recharges";

function loadRechargesFromStorage(): Recharge[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: StoredRecharge[] = JSON.parse(stored);
      // Parse dates back to Date objects
      return parsed.map((r) => ({
        ...r,
        rechargeDate: new Date(r.rechargeDate),
      }));
    } catch (error) {
      console.error("Failed to parse recharges from localStorage", error);
      return [];
    }
  }
  return [];
}

export function useRecharges() {
  const [recharges, setRecharges] = useState<Recharge[]>(loadRechargesFromStorage);

  // Save to localStorage whenever recharges change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recharges));
  }, [recharges]);

  // Update remaining days periodically
  useEffect(() => {
    const updateRemainingDays = () => {
      setRecharges((current) =>
        current.map((recharge) => {
          const daysPassed = differenceInDays(new Date(), recharge.rechargeDate);
          const remaining = Math.max(0, recharge.planDays - daysPassed);
          return { ...recharge, remainingDays: remaining };
        })
      );
    };

    // Update immediately
    updateRemainingDays();

    // Then update every hour
    const interval = setInterval(updateRemainingDays, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  const addRecharge = (recharge: Recharge) => {
    setRecharges((current) => [...current, recharge]);
  };

  const updateRecharge = (id: string, updatedRecharge: Partial<Recharge>) => {
    setRecharges((current) =>
      current.map((recharge) =>
        recharge.id === id
          ? {
              ...recharge,
              ...updatedRecharge,
              perDayCost: updatedRecharge.lastRechargeAmount
                ? updatedRecharge.lastRechargeAmount / (updatedRecharge.planDays || recharge.planDays)
                : recharge.perDayCost,
              remainingDays: updatedRecharge.planDays
                ? updatedRecharge.planDays - differenceInDays(new Date(), updatedRecharge.rechargeDate || recharge.rechargeDate)
                : recharge.remainingDays,
            }
          : recharge
      )
    );
  };

  return { recharges, addRecharge, updateRecharge };
}