import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUserServer, isAdmin } from "@/lib/auth/rbac";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { CalendarDays, ContactRound, Mail, Phone, Sparkles } from "lucide-react";

interface ItineraryRow {
  id: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_country: string | null;
  start_date: string | null;
  created_at: string | null;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  totalBookings: number;
  lastBookingDate: string;
}

async function getItineraries(): Promise<ItineraryRow[]> {
  const serverClient = createServerClient();
  const user = await getCurrentUserServer();
  if (!user) return [];

  const client = isAdmin(user) ? getServiceSupabase() || serverClient : serverClient;
  let query = client
    .from("itineraries")
    .select("id, client_name, client_email, client_phone, client_country, start_date, created_at")
    .order("created_at", { ascending: false });

  if (!isAdmin(user)) query = query.eq("user_id", user.id);

  const { data, error } = await query;
  if (error) {
    console.error("Clients page database error:", error);
    return [];
  }
  return (data || []) as ItineraryRow[];
}

function buildClients(rows: ItineraryRow[]): Client[] {
  const grouped = new Map<string, Client>();

  for (const row of rows) {
    const email = row.client_email?.trim().toLowerCase();
    if (!email) continue;

    const bookingDate = row.start_date || row.created_at || "";
    const existing = grouped.get(email);
    if (!existing) {
      grouped.set(email, {
        id: row.id,
        name: row.client_name?.trim() || "Unnamed client",
        email: row.client_email?.trim() || email,
        phone: row.client_phone?.trim() || "Not provided",
        country: row.client_country?.trim() || "Not provided",
        totalBookings: 1,
        lastBookingDate: bookingDate,
      });
      continue;
    }

    existing.totalBookings += 1;
    if (bookingDate > existing.lastBookingDate) existing.lastBookingDate = bookingDate;
    if (existing.name === "Unnamed client" && row.client_name?.trim()) existing.name = row.client_name.trim();
    if (existing.phone === "Not provided" && row.client_phone?.trim()) existing.phone = row.client_phone.trim();
    if (existing.country === "Not provided" && row.client_country?.trim()) existing.country = row.client_country.trim();
  }

  return [...grouped.values()].sort((a, b) => b.lastBookingDate.localeCompare(a.lastBookingDate));
}

function formatDate(date: string) {
  if (!date) return "Not available";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function ClientsPageContent({ clients }: { clients: Client[] }) {
  const repeatClients = clients.filter((client) => client.totalBookings > 1).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#8b7435]"><ContactRound className="h-4 w-4" />Relationship management</div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Clients Directory</h1>
          <p className="mt-1 text-sm text-slate-500">Live client details calculated from your itinerary bookings.</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#C9A962]/20 bg-[#C9A962]/10 px-4 py-3"><Sparkles className="h-5 w-5 text-[#8b7435]" /><div><p className="text-lg font-bold leading-none text-slate-900">{repeatClients}</p><p className="mt-1 text-xs font-medium text-slate-600">Repeat clients</p></div></div>
      </div>
      <Card className="overflow-hidden border-slate-200">
        <div className="border-b border-slate-200 bg-white p-4 sm:px-6"><div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ContactRound className="h-4 w-4 text-[#8b7435]" />{clients.length} registered clients</div></div>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4">Client</th><th className="px-4 py-4">Contact</th><th className="px-4 py-4">Country</th><th className="px-4 py-4">Bookings</th><th className="px-6 py-4">Last booking</th></tr></thead><tbody className="divide-y divide-slate-100">
          {clients.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No client bookings found.</td></tr> : clients.map((client) => <tr key={client.email} className="transition-colors hover:bg-slate-50/80">
            <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A962]/15 text-sm font-bold text-[#8b7435]">{client.name.split(" ").map((part) => part[0]).join("")}</div><div><p className="font-semibold text-slate-900">{client.name}</p><p className="mt-0.5 text-xs text-slate-400">{client.id}</p></div></div></td>
            <td className="px-4 py-4"><div className="space-y-1 text-slate-600"><p className="flex items-center gap-2 whitespace-nowrap"><Mail className="h-3.5 w-3.5 text-slate-400" />{client.email}</p><p className="flex items-center gap-2 whitespace-nowrap text-xs"><Phone className="h-3.5 w-3.5 text-slate-400" />{client.phone}</p></div></td>
            <td className="px-4 py-4 font-medium text-slate-700">{client.country}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><span className="font-semibold text-slate-900">{client.totalBookings}</span>{client.totalBookings > 1 && <Badge className="border-[#C9A962]/30 bg-[#C9A962]/15 text-[#8b7435] hover:bg-[#C9A962]/15">Repeat Client</Badge>}</div></td>
            <td className="px-6 py-4"><p className="flex items-center gap-2 font-medium text-slate-700"><CalendarDays className="h-4 w-4 text-slate-400" />{formatDate(client.lastBookingDate)}</p></td>
          </tr>)}
        </tbody></table></div></CardContent>
      </Card>
    </div>
  );
}

export default async function ClientsPage() {
  const clients = buildClients(await getItineraries());
  return <DashboardLayout><ClientsPageContent clients={clients} /></DashboardLayout>;
}
