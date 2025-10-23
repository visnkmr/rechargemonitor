"use client";

import * as React from "react";

import { parseDDMMYYYY, formatToDDMMYYYY } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DateInputProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateInput({ date, onDateChange, placeholder = "ddmmyyyy (e.g., 01012000)", className }: DateInputProps) {
  const [inputValue, setInputValue] = React.useState(date ? formatToDDMMYYYY(date) : "");

  // Update input value when date prop changes
  React.useEffect(() => {
    if (date) {
      setInputValue(formatToDDMMYYYY(date));
    } else {
      setInputValue("");
    }
  }, [date]);

  const handleInputChange = (value: string) => {
    setInputValue(value);

    // Try to parse the input as ddmmyyyy
    if (value.length === 8) {
      const parsedDate = parseDDMMYYYY(value);
      if (parsedDate) {
        onDateChange?.(parsedDate);
      }
    } else if (value.length === 0) {
      onDateChange?.(undefined);
    }
  };

  const handleInputBlur = () => {
    // Validate on blur
    if (inputValue.length === 8) {
      const parsedDate = parseDDMMYYYY(inputValue);
      if (!parsedDate) {
        // Invalid date, reset to current date value
        setInputValue(date ? formatToDDMMYYYY(date) : "");
      }
    }
  };

  return (
    <Input
      type="text"
      value={inputValue}
      onChange={(e) => handleInputChange(e.target.value)}
      onBlur={handleInputBlur}
      placeholder={placeholder}
      className={className}
      maxLength={8}
    />
  );
}