import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe2, Users, BookOpen, TrendingUp } from "lucide-react";

interface CountryStats {
  country: string;
  flag: string;
  totalClients: number;
  totalBookings: number;
}

const countryStats: CountryStats[] = [
  { country: "United States", flag: "US", totalClients: 42, totalBookings: 68 },
  { country: "United Kingdom", flag: "GB", totalClients: 31, totalBookings: 49 },
  { country: "France", flag: "FR", totalClients: 27, totalBookings: 44 },
  { country: "Germany", flag: "DE", totalClients: 22, totalBookings: 35 },
  { country: "Italy", flag: "IT", totalClients: 18, totalBookings: 28 },
  { country: "Canada", flag: "CA", totalClients: 16, totalBookings: 24 },
  { country: "Australia", flag: "AU", totalClients: 13, totalBookings: 19 },
  { country: "Spain", flag: "ES", totalClients: 11, totalBookings: 16 },
];

function CountriesPageContent() {
  const totalClients = countryStats.reduce((sum, item) => sum + item.totalClients, 0);
  const totalBookings = countryStats.reduce((sum, item) => sum + item.totalBookings, 0);
  const leadingCountry = countryStats[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#8b7435]">
          <Globe2 className="h-4 w-4" />
          Audience insights
        </div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Country Demographics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Understand where Kemerya Tours guests are travelling from.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9A962]/15 text-[#8b7435]"><Users className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{totalClients}</p><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total clients</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><BookOpen className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{totalBookings}</p><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total bookings</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-lg font-bold text-slate-900">{leadingCountry.country}</p><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Leading market</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100 px-6 py-5">
          <CardTitle className="flex items-center gap-2 text-lg"><Globe2 className="h-5 w-5 text-[#8b7435]" />Bookings by country</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {countryStats.map((item, index) => {
            const share = Math.round((item.totalBookings / totalBookings) * 100);
            return (
              <div key={item.country} className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">{item.flag}</span>
                    <div><p className="font-semibold text-slate-900">{item.country}</p><p className="mt-0.5 text-xs text-slate-500">Rank #{index + 1}</p></div>
                  </div>
                  <span className="text-sm font-bold text-[#8b7435]">{share}%</span>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#C9A962]" style={{ width: `${share}%` }} /></div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{item.totalClients} clients</span><span className="font-semibold text-slate-700">{item.totalBookings} bookings</span></div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CountriesPage() {
  return <DashboardLayout><CountriesPageContent /></DashboardLayout>;
}
