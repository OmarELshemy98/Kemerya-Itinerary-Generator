import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ExportExcelButton } from "@/components/export-excel-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserServer, isAdmin } from "@/lib/auth/rbac";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { BookOpen, Globe2, TrendingUp, Users } from "lucide-react";

interface ItineraryRow { client_email: string | null; client_country: string | null; }
interface CountryStats { country: string; flag: string; totalClients: number; totalBookings: number; percentage: number; }

async function getItineraries(): Promise<ItineraryRow[]> {
  const serverClient = createServerClient();
  const user = await getCurrentUserServer();
  if (!user) return [];
  const client = isAdmin(user) ? getServiceSupabase() || serverClient : serverClient;
  let query = client.from("itineraries").select("client_email, client_country");
  if (!isAdmin(user)) query = query.eq("user_id", user.id);
  const { data, error } = await query;
  if (error) { console.error("Countries page database error:", error); return []; }
  return (data || []) as ItineraryRow[];
}

function buildCountryStats(rows: ItineraryRow[]): CountryStats[] {
  const grouped = new Map<string, { displayName: string; bookings: number; emails: Set<string> }>();
  for (const row of rows) {
    const country = row.client_country?.trim();
    if (!country) continue;
    const key = country.toLowerCase();
    const group = grouped.get(key) || { displayName: country, bookings: 0, emails: new Set<string>() };
    group.bookings += 1;
    if (row.client_email?.trim()) group.emails.add(row.client_email.trim().toLowerCase());
    grouped.set(key, group);
  }

  const totalBookings = [...grouped.values()].reduce((sum, group) => sum + group.bookings, 0);
  return [...grouped.entries()]
    .map(([key, group]) => ({ country: group.displayName, flag: key.slice(0, 2).toUpperCase(), totalClients: group.emails.size, totalBookings: group.bookings, percentage: totalBookings ? Math.round((group.bookings / totalBookings) * 100) : 0 }))
    .sort((a, b) => b.totalBookings - a.totalBookings);
}

function CountriesPageContent({ countryStats }: { countryStats: CountryStats[] }) {
  const totalClients = countryStats.reduce((sum, item) => sum + item.totalClients, 0);
  const totalBookings = countryStats.reduce((sum, item) => sum + item.totalBookings, 0);
  const leadingCountry = countryStats[0];
  const exportRows = countryStats.map((item, index) => ({
    Rank: index + 1,
    Country: item.country,
    "Total Clients": item.totalClients,
    "Total Bookings": item.totalBookings,
    "Booking Share": `${item.percentage}%`,
  }));

  return <div className="space-y-6">
    <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#8b7435]"><Globe2 className="h-4 w-4" />Audience insights</div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Country Demographics</h1><p className="mt-1 text-sm text-slate-500">Live booking demographics calculated from your itinerary data.</p></div>
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="border-slate-200"><CardContent className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9A962]/15 text-[#8b7435]"><Users className="h-5 w-5" /></div><div><p className="text-2xl font-bold text-slate-900">{totalClients}</p><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total clients</p></div></CardContent></Card>
      <Card className="border-slate-200"><CardContent className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><BookOpen className="h-5 w-5" /></div><div><p className="text-2xl font-bold text-slate-900">{totalBookings}</p><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total bookings</p></div></CardContent></Card>
      <Card className="border-slate-200"><CardContent className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><TrendingUp className="h-5 w-5" /></div><div><p className="text-lg font-bold text-slate-900">{leadingCountry?.country || "No data"}</p><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Leading market</p></div></CardContent></Card>
    </div>
    <Card className="border-slate-200"><CardHeader className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="flex items-center gap-2 text-lg"><Globe2 className="h-5 w-5 text-[#8b7435]" />Bookings by country</CardTitle><ExportExcelButton rows={exportRows} fileName="Country Demographics" /></CardHeader><CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
      {countryStats.length === 0 ? <p className="text-sm text-slate-500">No country data found in your bookings.</p> : countryStats.map((item, index) => <div key={item.country} className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">{item.flag}</span><div><p className="font-semibold text-slate-900">{item.country}</p><p className="mt-0.5 text-xs text-slate-500">Rank #{index + 1}</p></div></div><span className="text-sm font-bold text-[#8b7435]">{item.percentage}%</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#C9A962]" style={{ width: `${item.percentage}%` }} /></div><div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{item.totalClients} clients</span><span className="font-semibold text-slate-700">{item.totalBookings} bookings</span></div></div>)}
    </CardContent></Card>
  </div>;
}

export default async function CountriesPage() {
  const countryStats = buildCountryStats(await getItineraries());
  return <DashboardLayout><CountriesPageContent countryStats={countryStats} /></DashboardLayout>;
}
