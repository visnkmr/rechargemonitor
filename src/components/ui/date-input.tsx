"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn, parseDDMMYYYY, formatToDDMMYYYY } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateInputProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateInput({ date, onDateChange, placeholder = "Pick a date", className }: DateInputProps) {
  const [inputValue, setInputValue] = React.useState(date ? formatToDDMMYYYY(date) : "");
  const [isOpen, setIsOpen] = React.useState(false);

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

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    setIsOpen(false);
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
    <div className={cn("flex gap-2", className)}>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleInputBlur}
        placeholder="ddmmyyyy (e.g., 01012000)"
        className="flex-1"
        maxLength={8}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}