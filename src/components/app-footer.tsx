"use client";

import * as React from "react";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Code2,
  Heart,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import { cn } from "@/lib/utils";

export function AppFooter() {
  const socials = React.useMemo(
    () => [
      {
        name: "Facebook",
        href: KEMERYA_COMPANY_INFO.socialMedia?.facebook,
        icon: Facebook,
        hoverBg: "hover:bg-[#1877F2]/15 hover:text-[#1877F2]",
      },
      {
        name: "Instagram",
        href: KEMERYA_COMPANY_INFO.socialMedia?.instagram,
        icon: Instagram,
        hoverBg: "hover:bg-[#E4405F]/15 hover:text-[#E4405F]",
      },
      {
        name: "YouTube",
        href: KEMERYA_COMPANY_INFO.socialMedia?.youtube,
        icon: Youtube,
        hoverBg: "hover:bg-[#FF0000]/15 hover:text-[#FF0000]",
      },
      {
        name: "X (Twitter)",
        href: KEMERYA_COMPANY_INFO.socialMedia?.twitter,
        icon: Twitter,
        hoverBg: "hover:bg-slate-500/15 hover:text-slate-200",
      },
      {
        name: "Google Business",
        href: KEMERYA_COMPANY_INFO.socialMedia?.googleBusiness,
        icon: MapPin,
        hoverBg: "hover:bg-[#4285F4]/15 hover:text-[#4285F4]",
      },
    ].filter((s) => s.href) as {
      name: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
      hoverBg: string;
    }[],
    []
  );

  return (
    <footer className="mt-auto border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 kemerya-gold-gradient" />
        <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-[#C9A962]/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-[#C9A962]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-44 overflow-hidden rounded-xl bg-white p-2 shadow-md ring-1 ring-[#C9A962]/20">
                  <Image
                    src={KEMERYA_COMPANY_INFO.logo || "/logo-kemerya.png"}
                    alt={KEMERYA_COMPANY_INFO.name}
                    fill
                    className="object-contain"
                    sizes="176px"
                  />
                </div>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-slate-600">
                Crafting premium Egypt travel experiences with passion & excellence.
                Discover iconic landmarks with a trusted local operator since day one.
              </p>
              <div className="space-y-2.5 text-sm text-slate-600">
                <a
                  href={`tel:${KEMERYA_COMPANY_INFO.supportPhone || KEMERYA_COMPANY_INFO.phone}`}
                  className="group inline-flex items-center gap-2 transition-colors hover:text-[#8b7435]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A962]/10 text-[#C9A962] transition-all group-hover:bg-[#C9A962]/20">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Customer Support
                    </span>
                    <span className="font-semibold text-slate-800">
                      {KEMERYA_COMPANY_INFO.supportPhone || KEMERYA_COMPANY_INFO.phone}
                    </span>
                  </div>
                </a>
                <a
                  href={`mailto:${KEMERYA_COMPANY_INFO.email}`}
                  className="group inline-flex items-center gap-2 transition-colors hover:text-[#8b7435]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A962]/10 text-[#C9A962] transition-all group-hover:bg-[#C9A962]/20">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-slate-700">{KEMERYA_COMPANY_INFO.email}</span>
                </a>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9A962]/10 text-[#C9A962]">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-slate-600">{KEMERYA_COMPANY_INFO.address}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Connect & Share Your Journey
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Follow us for daily inspiration & leave a review on Google to share your Kemerya experience!
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {socials.map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.name}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.name}
                        className={cn(
                          "group relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:shadow-md",
                          s.hoverBg
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] transition-transform group-hover:scale-110" />
                      </a>
                    );
                  })}
                  <a
                    href={`https://wa.me/${(
                      KEMERYA_COMPANY_INFO.whatsapp || KEMERYA_COMPANY_INFO.phone
                    ).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="group relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-[#25D366]/15 hover:text-[#25D366] hover:shadow-md"
                  >
                    <MessageCircle className="h-[18px] w-[18px] transition-transform group-hover:scale-110" />
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-[#C9A962]/20 bg-gradient-to-r from-white via-[#C9A962]/[0.04] to-white p-5 shadow-sm">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#C9A962]/15 text-[#8b7435]">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Leave a Review</h4>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Loved your tour? Your feedback on Google Business helps travelers like you find us.
                      </p>
                    </div>
                  </div>
                  <a
                    href={KEMERYA_COMPANY_INFO.socialMedia?.googleBusiness}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#1E293B] hover:shadow-lg active:scale-[0.98]"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#C9A962]" />
                    Write a Review
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200/80 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-slate-700">{KEMERYA_COMPANY_INFO.name}</span>.
                All rights reserved.
              </p>
              {KEMERYA_COMPANY_INFO.developer?.website && (
                <a
                  href={KEMERYA_COMPANY_INFO.developer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A962]/40 hover:shadow-md"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-[#C9A962]" />
                    <span>Designed & Developed with</span>
                    <Heart className="h-3 w-3 fill-red-400 text-red-400" />
                    <span className="font-semibold text-slate-800 transition-colors group-hover:text-[#8b7435]">
                      {KEMERYA_COMPANY_INFO.developer.name}
                    </span>
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
