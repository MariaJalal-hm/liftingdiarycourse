# UI Coding Standards

This document defines the mandatory UI coding standards for the Lifting Diary project. All contributors must follow these guidelines.

## Component Library: shadcn/ui ONLY

**IMPORTANT: This project exclusively uses [shadcn/ui](https://ui.shadcn.com/) components.**

### Rules

1. **NO custom components** - Do not create custom UI components
2. **Use shadcn/ui for everything** - All UI elements must come from shadcn/ui
3. **Install components as needed** - Use `npx shadcn@latest add <component>` to add new components

### Installing Components

```bash
# Add a single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button card input

# View all available components
npx shadcn@latest add
```

### Available Components

Commonly used shadcn/ui components:

- `button` - Buttons and button variants
- `card` - Card containers (Card, CardHeader, CardContent, CardFooter)
- `input` - Text inputs
- `label` - Form labels
- `select` - Dropdown selects
- `calendar` - Date calendar picker
- `popover` - Popover containers (use with calendar for date picker)
- `table` - Data tables
- `badge` - Status badges
- `dialog` - Modal dialogs
- `alert` - Alert messages
- `skeleton` - Loading skeletons
- `separator` - Visual separators
- `tabs` - Tabbed interfaces

### Example Usage

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WorkoutCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Day</CardTitle>
        <Badge variant="success">Completed</Badge>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

---

## Date Formatting: date-fns ONLY

**All date formatting must use [date-fns](https://date-fns.org/).**

### Required Format

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Oct 2026
23rd Nov 2025
```

### Implementation

```typescript
import { format } from "date-fns";

// Format a date with ordinal day
function formatDate(date: Date): string {
  return format(date, "do MMM yyyy");
}

// Examples:
formatDate(new Date("2025-09-01")); // "1st Sep 2025"
formatDate(new Date("2025-08-02")); // "2nd Aug 2025"
formatDate(new Date("2026-10-03")); // "3rd Oct 2026"
formatDate(new Date("2025-11-23")); // "23rd Nov 2025"
```

### Format Tokens Reference

| Token | Result | Description |
|-------|--------|-------------|
| `do` | 1st, 2nd, 3rd | Day of month with ordinal |
| `MMM` | Jan, Feb, Sep | Abbreviated month name |
| `yyyy` | 2025 | Full year |

### Date Picker Component

Use shadcn/ui's calendar with popover for date selection:

```bash
npx shadcn@latest add calendar popover button
```

```tsx
"use client";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export function DatePicker({ date, onSelect }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "do MMM yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
```

---

## Summary

| Requirement | Standard |
|-------------|----------|
| UI Components | shadcn/ui only |
| Custom Components | **NOT ALLOWED** |
| Date Library | date-fns |
| Date Format | `do MMM yyyy` (e.g., "1st Sep 2025") |
