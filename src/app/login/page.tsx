"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Loader2, Compass, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0F172A]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,98,0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(201,169,98,0.08),_transparent_40%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,169,98,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,98,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className={cn(
            "w-full max-w-md transition-all duration-700",
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-3xl bg-[#C9A962]/10 blur-2xl" />
              <div className="relative h-24 w-64 rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-[#C9A962]/20 flex items-center justify-center">
                <Image
                  src="/logo-kemerya.png"
                  alt="Kemerya Tours"
                  fill
                  className="object-contain p-1"
                  sizes="256px"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl kemerya-gold-gradient shadow-lg flex items-center justify-center">
                <Compass className="h-5 w-5 text-[#0F172A]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Welcome Back
                </h1>
                <p className="text-xs text-[#C9A962] tracking-[0.2em] uppercase mt-0.5">
                  Kemerya Operations Portal
                </p>
              </div>
            </div>
          </div>

          <Card className="border-[#C9A962]/20 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white font-semibold">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Enter your credentials to access the itinerary dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-xs font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@kemeryatours.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11 pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#C9A962]/50 focus:ring-[#C9A962]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300 text-xs font-medium">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#C9A962]/50 focus:ring-[#C9A962]/20"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full h-11 kemerya-gold-gradient text-[#0F172A] font-semibold rounded-lg shadow-lg hover:opacity-95 transition-opacity"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#C9A962]/20" />
            <span className="tracking-wider uppercase">Kemerya Tours</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#C9A962]/20" />
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-600 tracking-wide">
            Protected by enterprise-grade security · © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A962]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
