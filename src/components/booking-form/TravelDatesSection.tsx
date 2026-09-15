"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Calendar, Clock } from "lucide-react";
import type { BookingConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { calculateNights } from "@/lib/utils";

export function TravelDatesSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<any>();

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const flightArrival = watch("flightArrival");
  const nights = calculateNights(startDate, endDate);

  return (
    <div className="space-y-2">
      {/* Start Date & End Date */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs">Start Date *</Label>
          <div className="mt-1.5">
            <Input
              type="date"
              {...register("startDate")}
              className="text-sm"
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.startDate.message as string}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label className="text-xs">End Date *</Label>
          <div className="mt-1.5">
            <Input
              type="date"
              {...register("endDate")}
              className="text-sm"
            />
            {errors.endDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.endDate.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Duration Display */}
      <div className="flex flex-col items-start justify-center rounded-lg bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Duration</p>
        <p className="text-xl font-bold text-slate-900">
          {nights + 1} day{nights + 1 !== 1 ? "s" : ""}
          {nights > 0 ? ` / ${nights} night${nights !== 1 ? "s" : ""}` : ""}
        </p>
      </div>

      {/* Flight Arrival */}
      <div>
        <Label className="text-xs">Flight Arrival (Optional)</Label>
        <div className="mt-1.5 flex items-center gap-2">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <Input
            {...register("flightArrival")}
            placeholder="e.g. Flight MS800 arriving at 14:30"
            className="text-sm"
          />
          {errors.flightArrival && (
            <p className="text-xs text-red-600">
              {errors.flightArrival.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Duration Info */}
      <div className="text-xs text-slate-400">
        <Clock className="inline h-3.5 w-3.5 mr-1" />
        Travel dates determine trip duration and serve as reference for the itinerary timeline.
      </div>
    </div>
  );
}
