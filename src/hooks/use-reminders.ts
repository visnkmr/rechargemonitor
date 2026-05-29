"use client";

import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { Reminder } from "@/lib/types";

type StoredReminder = {
  id: string;
  text: string;
  type: 'date' | 'days';
  date?: string;
  days?: number;
  showOnHome: boolean;
  createdAt: string;
};

const STORAGE_KEY = "reminders";

function loadRemindersFromStorage(): Reminder[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: StoredReminder[] = JSON.parse(stored);
      return parsed.map((r) => ({
        ...r,
        date: r.date ? new Date(r.date) : undefined,
        createdAt: new Date(r.createdAt),
      }));
    } catch {
      return [];
    }
  }
  return [];
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(loadRemindersFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = (reminder: Reminder) => {
    setReminders((current) => [...current, reminder]);
  };

  const updateReminder = (id: string, updated: Partial<Reminder>) => {
    setReminders((current) =>
      current.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((current) => current.filter((r) => r.id !== id));
  };

  const toggleShowOnHome = (id: string) => {
    setReminders((current) =>
      current.map((r) =>
        r.id === id ? { ...r, showOnHome: !r.showOnHome } : r
      )
    );
  };

  const getRemainingDays = (reminder: Reminder): number => {
    if (reminder.type === 'date' && reminder.date) {
      return Math.max(0, differenceInDays(reminder.date, new Date()));
    }
    if (reminder.type === 'days' && reminder.days) {
      const elapsed = differenceInDays(new Date(), reminder.createdAt);
      return Math.max(0, reminder.days - elapsed);
    }
    return 0;
  };

  return {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleShowOnHome,
    getRemainingDays,
  };
}
