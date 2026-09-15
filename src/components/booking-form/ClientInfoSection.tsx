"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { User, Mail, Phone, Globe, MessageCircle, Map } from "lucide-react";
import type { BookingConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ClientInfoSectionProps {
  bookingRef: string;
  isCustomMode: boolean;
}

export function ClientInfoSection({ bookingRef, isCustomMode }: ClientInfoSectionProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<any>();

  const countryValue = watch("country");

  return (
    <div className="space-y-2">
      {/* Client Name */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-xs">Client Name *</Label>
          <div className="mt-1.5">
            <Input
              {...register("clientName")}
              placeholder="e.g. Mohamed Ali"
              className="text-sm"
            />
            {errors.clientName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.clientName.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs">Email *</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <Input
              {...register("email")}
              type="email"
              placeholder="client@example.com"
              className="text-sm"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message as string}</p>
            )}
          </div>
        </div>
        <div>
          <Label className="text-xs">Phone</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <Input
              {...register("phone")}
              type="tel"
              placeholder="+20 123 456 7890"
              className="text-sm"
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message as string}</p>
            )}
          </div>
        </div>
      </div>

      {/* Country, WhatsApp, Meeting Point */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label className="text-xs">Country *</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <Input
              {...register("country")}
              placeholder="e.g. Egypt"
              className="text-sm"
            />
            {errors.country && (
              <p className="text-xs text-red-600">{errors.country.message as string}</p>
            )}
          </div>
        </div>
        <div>
          <Label className="text-xs">WhatsApp</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <Input
              {...register("whatsapp")}
              placeholder="+20 123 456 7890"
              className="text-sm"
            />
            {errors.whatsapp && (
              <p className="text-xs text-red-600">{errors.whatsapp.message as string}</p>
            )}
          </div>
        </div>
        <div>
          <Label className="text-xs">Meeting Point</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Map className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <Input
              {...register("meetingPoint")}
              placeholder="e.g. Cairo Airport (CAI)"
              className="text-sm"
            />
            {errors.meetingPoint && (
              <p className="text-xs text-red-600">
                {errors.meetingPoint.message as string}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
