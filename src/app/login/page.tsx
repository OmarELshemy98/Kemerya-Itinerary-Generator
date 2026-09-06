"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Lock,
  Loader2,
  Compass,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const loggedOut = searchParams.get("loggedOut");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successHint, setSuccessHint] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    if (loggedOut === "1") setSuccessHint("You have been signed out securely.");
    return () => clearTimeout(t);
  }, [loggedOut]);

  const isFormValid = email.trim().length > 0 && password.length > 0;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return;
      if (!isFormValid) {
        setError("Please enter your email and password.");
        return;
      }
      setLoading(true);
      setError(null);
      setSuccessHint(null);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data.error || "Invalid email or password. Please try again.");
          setLoading(false);
          return;
        }

        setSuccessHint(`Welcome back${data?.user?.full_name ? `, ${data.user.full_name}` : ""}! Redirecting…`);

        await new Promise((r) => setTimeout(r, 450));
        router.replace(next);
        router.refresh();
      } catch (err) {
        setError("Network error. Please check your connection and try again.");
        setLoading(false);
      }
    },
    [email, password, loading, isFormValid, router, next]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0F172A]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,98,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(201,169,98,0.1),_transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.05),_transparent_40%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,169,98,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,98,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className={cn(
            "w-full max-w-md transition-all duration-700 ease-out",
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-3xl bg-[#C9A962]/10 blur-2xl" />
              <div className="relative h-[160px] w-[160px] overflow-hidden rounded-2xl  p-2 shadow-2xl ring-1 ring-[#C9A962]/25">
                <Image
                  src="/logo-kemerya.png"
                  alt="Kemerya Tours"
                  fill
                  className="object-contain"
                  sizes="224px"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl kemerya-gold-gradient shadow-lg ring-1 ring-[#C9A962]/50">
                <Compass className="h-5 w-5 text-[#0F172A]" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                  Welcome Back
                </h1>
                <p className="mt-0.5 text-[11px] font-medium tracking-[0.22em] text-[#C9A962] uppercase">
                  Kemerya Operations Portal
                </p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
            <div className="h-1 w-full kemerya-gold-gradient" />
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-[17px] font-semibold text-white">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-sm text-slate-400">
                Enter your credentials to access the itinerary dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-7">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                  <div
                    role="alert"
                    className="animate-in flex items-start gap-2.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-3 text-sm text-red-200"
                  >
                    <AlertCircle className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-red-300" />
                    <div className="flex-1 leading-relaxed">{error}</div>
                  </div>
                )}

                {successHint && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-200">
                    <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-emerald-300" />
                    <div className="flex-1 leading-relaxed">{successHint}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#C9A962]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@kemeryatours.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={loading}
                      required
                      autoComplete="email"
                      autoFocus
                      className="h-12 rounded-lg border-white/10 bg-white/5 pl-11 pr-3 text-sm text-white placeholder:text-slate-500 shadow-inner transition-all focus:border-[#C9A962]/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-[#C9A962]/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </Label>
                  </div>
                  <div className="relative group">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#C9A962]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={loading}
                      required
                      autoComplete="current-password"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e as unknown as React.FormEvent);
                        }
                      }}
                      className="h-12 rounded-lg border-white/10 bg-white/5 pl-11 pr-12 text-sm text-white placeholder:text-slate-500 shadow-inner transition-all focus:border-[#C9A962]/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-[#C9A962]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A962]/40"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  size="lg"
                  className={cn(
                    "group relative w-full h-12 overflow-hidden rounded-lg font-semibold text-[#0F172A] shadow-lg transition-all duration-300",
                    "kemerya-gold-gradient ring-1 ring-[#C9A962]/60",
                    "hover:shadow-[0_8px_28px_-6px_rgba(201,169,98,0.45)]",
                    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-[18px] w-[18px] animate-spin" />
                        <span>Signing in…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col items-center gap-2 text-xs">
            <div className="flex items-center gap-3 text-slate-500">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9A962]/25" />
              <span className="font-medium tracking-[0.22em] uppercase text-slate-400">
                Kemerya Tours
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9A962]/25" />
            </div>
            <p className="mt-1 text-[10px] tracking-wide text-slate-600">
              Protected by enterprise-grade security · © {new Date().getFullYear()}
            </p>
            <span className="font-medium tracking-[0.22em] uppercase text-slate-400">
               Created By <a href="https://omarelshemy.vercel.app" target="_blank" rel="noopener noreferrer">Omar Elshemy</a>
              </span>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-[#C9A962]" />
            <p className="text-xs text-slate-500 tracking-wider uppercase">Loading…</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
