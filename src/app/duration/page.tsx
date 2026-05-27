"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock } from "lucide-react";

type DurationField = "years" | "months" | "weeks" | "days" | "minutes";

const DAYS_IN_YEAR = 365;
const DAYS_IN_MONTH = DAYS_IN_YEAR / 12;
const DAYS_IN_WEEK = 7;
const MINUTES_IN_DAY = 24 * 60;

function toDays(value: number, field: DurationField): number {
  switch (field) {
    case "years": return value * DAYS_IN_YEAR;
    case "months": return value * DAYS_IN_MONTH;
    case "weeks": return value * DAYS_IN_WEEK;
    case "days": return value;
    case "minutes": return value / MINUTES_IN_DAY;
  }
}

function formatVal(value: number): string {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1) {
    const rounded = Math.round(value * 100) / 100;
    if (Number.isInteger(rounded)) return rounded.toString();
    return rounded.toFixed(2);
  }
  return value.toFixed(4);
}

export default function DurationConverterPage() {
  const [values, setValues] = useState({
    years: "",
    months: "",
    weeks: "",
    days: "",
    minutes: "",
  });

  const handleChange = (field: DurationField, raw: string) => {
    if (raw === "" || raw === "-") {
      setValues({ years: "", months: "", weeks: "", days: "", minutes: "" });
      return;
    }
    const num = parseFloat(raw);
    if (isNaN(num)) return;

    const days = toDays(num, field);

    setValues({
      years: field === "years" ? raw : formatVal(days / DAYS_IN_YEAR),
      months: field === "months" ? raw : formatVal(days / DAYS_IN_MONTH),
      weeks: field === "weeks" ? raw : formatVal(days / DAYS_IN_WEEK),
      days: field === "days" ? raw : formatVal(days),
      minutes: field === "minutes" ? raw : formatVal(days * MINUTES_IN_DAY),
    });
  };

  const fields: { key: DurationField; label: string; placeholder: string }[] = [
    { key: "years", label: "Years", placeholder: "Enter years" },
    { key: "months", label: "Months", placeholder: "Enter months" },
    { key: "weeks", label: "Weeks", placeholder: "Enter weeks" },
    { key: "days", label: "Days", placeholder: "Enter days" },
    { key: "minutes", label: "Minutes", placeholder: "Enter minutes" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Duration Converter</h1>
              <p className="text-muted-foreground">
                Convert between years, months, weeks, days, and minutes
              </p>
            </div>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Duration Conversion
            </CardTitle>
            <CardDescription>
              Enter any value to auto-calculate the rest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="number"
                    value={values[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
