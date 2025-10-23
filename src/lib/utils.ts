import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string in ddmmyyyy format and return a Date object
 * @param dateString - String in ddmmyyyy format (e.g., "01012000" for Jan 1, 2000)
 * @returns Date object or null if invalid
 */
export function parseDDMMYYYY(dateString: string): Date | null {
  // Remove any non-digit characters
  const cleanString = dateString.replace(/\D/g, '');

  // Must be exactly 8 digits
  if (cleanString.length !== 8) {
    return null;
  }

  const day = parseInt(cleanString.substring(0, 2), 10);
  const month = parseInt(cleanString.substring(2, 4), 10);
  const year = parseInt(cleanString.substring(4, 8), 10);

  // Validate ranges
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
    return null;
  }

  // Create date and check if it's valid (handles invalid dates like Feb 30)
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

/**
 * Format a date to ddmmyyyy string format
 * @param date - Date object
 * @returns String in ddmmyyyy format
 */
export function formatToDDMMYYYY(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${day}${month}${year}`;
}