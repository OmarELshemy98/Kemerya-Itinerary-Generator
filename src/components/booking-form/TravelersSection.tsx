"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Users, Minus, Plus } from "lucide-react";
import type { BookingConfig } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const Counter = React.memo(function Counter({ value, onChange, min = 0, max = 999 }: CounterProps) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-2 text-center">
      <span className="text-sm font-medium text-slate-600">{value}</span>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-8 w-8 shrink-0"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-8 w-8 shrink-0"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
});

interface TravelersSectionProps {
  onAdultChange: (value: number) => void;
  onChildChange: (value: number) => void;
  onInfantChange: (value: number) => void;
}

export function TravelersSection({
  onAdultChange,
  onChildChange,
  onInfantChange,
}: TravelersSectionProps) {
  const { watch } = useFormContext<any>();

  const adults = watch("adults");
  const children = watch("children");
  const infants = watch("infants");
  const total = adults + children + infants;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Users className="mt-0.5 h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">Travelers</span>
      </div>

      {/* Adult Counter */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <Users className="mt-0.5 h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">Adults</span>
        </div>
        <Counter value={adults} onChange={onAdultChange} min={1} max={20} />
      </div>

      {/* Children Counter */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <Users className="mt-0.5 h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">Children</span>
        </div>
        <Counter value={children} onChange={onChildChange} min={0} max={20} />
      </div>

      {/* Infant Counter */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <Users className="mt-0.5 h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">Infants</span>
        </div>
        <Counter value={infants} onChange={onInfantChange} min={0} max={20} />
      </div>

      {/* Total Travelers */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Total Travelers</span>
          <Badge variant="gold" className="text-sm font-bold rounded-full px-3 py-1">
            {total}
          </Badge>
        </div>
      </div>
    </div>
  );
}
