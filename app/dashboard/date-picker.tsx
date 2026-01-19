"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  dateString: string; // ISO date string (yyyy-MM-dd)
}

export function DatePicker({ dateString }: DatePickerProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const date = parseISO(dateString);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setOpen(false);
      // Use window.location for full page navigation to work better with Clerk
      window.location.href = `/dashboard?date=${format(newDate, "yyyy-MM-dd")}`;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {mounted ? format(date, "do MMM yyyy") : dateString}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
        />
      </PopoverContent>
    </Popover>
  );
}
