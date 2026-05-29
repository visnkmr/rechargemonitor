"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateInput } from "@/components/ui/date-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Trash2, Bell, Home, Clock } from "lucide-react";
import { useReminders } from "@/hooks/use-reminders";
import { reminderSchema, type ReminderFormValues } from "@/lib/schemas";
import type { Reminder } from "@/lib/types";

function getRemainingText(reminder: Reminder): string {
  let remaining: number;
  if (reminder.type === 'date' && reminder.date) {
    remaining = differenceInDays(reminder.date, new Date());
  } else if (reminder.type === 'days' && reminder.days) {
    const elapsed = differenceInDays(new Date(), reminder.createdAt);
    remaining = Math.max(0, reminder.days - elapsed);
  } else {
    remaining = 0;
  }

  if (remaining <= 0) return "Due now!";
  if (remaining === 1) return "1 day left";
  return `${remaining} days left`;
}

export default function RemindersPage() {
  const { reminders, addReminder, deleteReminder, toggleShowOnHome } = useReminders();
  const [type, setType] = useState<'date' | 'days'>('days');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      text: "",
      type: 'days',
      days: 30,
      showOnHome: true,
    },
  });

  const watchedDate = watch("date");
  const watchedDays = watch("days");

  const calculateCountdown = () => {
    if (type === 'date' && watchedDate) {
      return differenceInDays(watchedDate, new Date());
    }
    if (type === 'days' && watchedDays) {
      return watchedDays;
    }
    return null;
  };

  const onSubmit = (data: ReminderFormValues) => {
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text: data.text,
      type: data.type,
      date: data.date,
      days: data.days,
      showOnHome: data.showOnHome,
      createdAt: new Date(),
    };
    addReminder(reminder);
    reset({ text: "", type: 'days', days: 30, showOnHome: true });
    setType('days');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold">Reminders</h1>
                <p className="text-muted-foreground">
                  Set countdown reminders for important dates.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Add Reminder Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              New Reminder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Reminder Text</Label>
                <Input
                  id="text"
                  placeholder="e.g. Electricity bill due, Birthday..."
                  {...register("text")}
                />
                {errors.text && (
                  <p className="text-sm text-red-500">{errors.text.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reminder Type</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(value: 'date' | 'days') => {
                    setType(value);
                    setValue("type", value);
                    if (value === 'date') {
                      setValue("date", new Date());
                      setValue("days", undefined);
                    } else {
                      setValue("days", 30);
                      setValue("date", undefined);
                    }
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="days" id="days" />
                    <Label htmlFor="days">Countdown from now (days)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="date" />
                    <Label htmlFor="date">Specific date</Label>
                  </div>
                </RadioGroup>
              </div>

              {type === 'days' && (
                <div className="space-y-2">
                  <Label htmlFor="days">Number of Days</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    {...register("days", { valueAsNumber: true })}
                  />
                  {errors.days && (
                    <p className="text-sm text-red-500">{errors.days.message}</p>
                  )}
                </div>
              )}

              {type === 'date' && (
                <div className="space-y-2">
                  <Label>Date</Label>
                  <DateInput
                    date={watchedDate}
                    onDateChange={(d) => setValue("date", d || new Date())}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                  )}
                </div>
              )}

              {calculateCountdown() !== null && calculateCountdown()! > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Countdown</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {calculateCountdown()} days
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Reminders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              All Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <p className="text-muted-foreground">No reminders yet.</p>
            ) : (
              <div className="space-y-3">
                {[...reminders].reverse().map((reminder) => {
                  const remaining = getRemainingText(reminder);
                  const isDue = remaining === "Due now!";
                  return (
                    <div
                      key={reminder.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isDue
                          ? "bg-red-50 border-red-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Bell className={`h-5 w-5 ${isDue ? "text-red-500" : "text-blue-500"}`} />
                        <div>
                          <p className={`font-medium ${isDue ? "text-red-800" : ""}`}>
                            {reminder.text}
                          </p>
                          <p className={`text-sm ${isDue ? "text-red-600" : "text-muted-foreground"}`}>
                            {remaining}
                            {reminder.type === 'date' && reminder.date && !isDue && (
                              <> &middot; {format(reminder.date, "MMM d, yyyy")}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowOnHome(reminder.id)}
                          className={reminder.showOnHome ? "text-blue-600" : "text-gray-400"}
                          title={reminder.showOnHome ? "Show on Home" : "Hide from Home"}
                        >
                          <Home className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
