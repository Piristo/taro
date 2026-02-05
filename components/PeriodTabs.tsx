"use client";

import { cn } from "../lib/utils";

export type PeriodKey = "today" | "week" | "year";

type PeriodTabsProps = {
  value: PeriodKey;
  onChange: (value: PeriodKey) => void;
};

const options: Array<{ id: PeriodKey; label: string }> = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "year", label: "This year" },
];

export default function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <div className="tab-group">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn("tab-button", value === option.id && "tab-button-active")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
