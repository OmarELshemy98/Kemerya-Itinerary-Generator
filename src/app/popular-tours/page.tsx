import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ExportExcelButton } from "@/components/export-excel-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserServer, isAdmin } from "@/lib/auth/rbac";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { BarChart3, Crown, Medal, Trophy } from "lucide-react";

interface ItineraryRow {
  tour_id: string | null;
  tour_title: string | null;
  is_custom_tour: boolean | null;
  custom_tour_title: string | null;
}

interface PopularTour {
  id: string;
  name: string;
  totalBookings: number;
}

async function getItineraries(): Promise<ItineraryRow[]> {
  const serverClient = createServerClient();
  const user = await getCurrentUserServer();
  if (!user) return [];

  const client = isAdmin(user) ? getServiceSupabase() || serverClient : serverClient;
  let query = client
    .from("itineraries")
    .select("tour_id, tour_title, is_custom_tour, custom_tour_title");

  if (!isAdmin(user)) query = query.eq("user_id", user.id);

  const { data, error } = await query;
  if (error) {
    console.error("Popular tours database error:", error);
    return [];
  }
  return (data || []) as ItineraryRow[];
}

function buildPopularTours(rows: ItineraryRow[]): PopularTour[] {
  const grouped = new Map<string, PopularTour>();

  for (const row of rows) {
    const isCustom = Boolean(row.is_custom_tour);
    const name = isCustom
      ? row.custom_tour_title?.trim() || "Custom Tours"
      : row.tour_title?.trim() || "Untitled Tour";
    const id = isCustom ? `custom:${name.toLowerCase()}` : row.tour_id || `title:${name.toLowerCase()}`;
    const existing = grouped.get(id);

    if (existing) {
      existing.totalBookings += 1;
    } else {
      grouped.set(id, { id, name, totalBookings: 1 });
    }
  }

  return [...grouped.values()].sort((a, b) => b.totalBookings - a.totalBookings);
}

function rankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-amber-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-orange-500" />;
  return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
}

function PopularToursContent({ tours }: { tours: PopularTour[] }) {
  const exportRows = tours.map((tour, index) => ({
    Rank: index + 1,
    "Tour Name": tour.name,
    "Total Bookings": tour.totalBookings,
  }));
  const totalBookings = tours.reduce((sum, tour) => sum + tour.totalBookings, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#8b7435]"><BarChart3 className="h-4 w-4" />Sales insights</div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Popular Tours Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">See which tours are generating the most bookings.</p>
        </div>
        <ExportExcelButton rows={exportRows} fileName="Popular Tours Analytics" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200"><CardContent className="p-5"><p className="text-2xl font-bold text-slate-900">{tours.length}</p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Booked tours</p></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-5"><p className="text-2xl font-bold text-slate-900">{totalBookings}</p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Total bookings</p></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="flex items-center gap-3 p-5"><Crown className="h-6 w-6 text-[#C9A962]" /><div><p className="text-sm font-bold text-slate-900">{tours[0]?.name || "No data"}</p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Best seller</p></div></CardContent></Card>
      </div>

      <Card className="overflow-hidden border-slate-200">
        <CardHeader className="border-b border-slate-100 px-6 py-5"><CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-[#8b7435]" />Tour booking rankings</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"><tr><th className="w-24 px-6 py-4">Rank</th><th className="px-4 py-4">Tour Name</th><th className="px-6 py-4 text-right">Total Bookings</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {tours.length === 0 ? <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">No bookings found.</td></tr> : tours.map((tour, index) => <tr key={tour.id} className="transition-colors hover:bg-slate-50/80"><td className="px-6 py-4"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A962]/10">{rankIcon(index + 1)}</div></td><td className="px-4 py-4 font-semibold text-slate-900">{tour.name}</td><td className="px-6 py-4 text-right"><span className="rounded-full bg-[#C9A962]/15 px-3 py-1 font-bold text-[#8b7435]">{tour.totalBookings}</span></td></tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function PopularToursPage() {
  const tours = buildPopularTours(await getItineraries());
  return <DashboardLayout><PopularToursContent tours={tours} /></DashboardLayout>;
}
