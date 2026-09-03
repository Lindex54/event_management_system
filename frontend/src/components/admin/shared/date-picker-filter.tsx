"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePickerFilter({ value, onChange, label = "Select date" }: {
  value?: Date;
  onChange: (date?: Date) => void;
  label?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 justify-start bg-surface font-normal">
          <CalendarDays /> {value ? format(value, "MMM d, yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
