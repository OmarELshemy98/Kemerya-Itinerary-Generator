import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  ContactRound,
  Mail,
  Phone,
  Search,
  Sparkles,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  totalBookings: number;
  lastBookingDate: string;
}

const clients: Client[] = [
  {
    id: "CLI-1048",
    name: "Sophie Laurent",
    email: "sophie.laurent@example.com",
    phone: "+33 6 12 45 78 90",
    country: "France",
    totalBookings: 4,
    lastBookingDate: "2025-08-21",
  },
  {
    id: "CLI-1047",
    name: "Michael Anderson",
    email: "michael.anderson@example.com",
    phone: "+1 212 555 0198",
    country: "United States",
    totalBookings: 2,
    lastBookingDate: "2025-08-15",
  },
  {
    id: "CLI-1046",
    name: "Elena Rossi",
    email: "elena.rossi@example.com",
    phone: "+39 347 555 2841",
    country: "Italy",
    totalBookings: 1,
    lastBookingDate: "2025-07-30",
  },
  {
    id: "CLI-1045",
    name: "Oliver Williams",
    email: "oliver.williams@example.com",
    phone: "+44 7700 900123",
    country: "United Kingdom",
    totalBookings: 3,
    lastBookingDate: "2025-07-18",
  },
  {
    id: "CLI-1044",
    name: "Nora Schneider",
    email: "nora.schneider@example.com",
    phone: "+49 151 555 7204",
    country: "Germany",
    totalBookings: 1,
    lastBookingDate: "2025-06-29",
  },
  {
    id: "CLI-1043",
    name: "Daniel Cohen",
    email: "daniel.cohen@example.com",
    phone: "+972 52 555 1940",
    country: "Israel",
    totalBookings: 2,
    lastBookingDate: "2025-06-12",
  },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function ClientsPageContent() {
  const repeatClients = clients.filter((client) => client.totalBookings > 1).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#8b7435]">
            <ContactRound className="h-4 w-4" />
            Relationship management
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Clients Directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep client contact details and booking history close at hand.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#C9A962]/20 bg-[#C9A962]/10 px-4 py-3">
          <Sparkles className="h-5 w-5 text-[#8b7435]" />
          <div>
            <p className="text-lg font-bold leading-none text-slate-900">{repeatClients}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Repeat clients</p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ContactRound className="h-4 w-4 text-[#8b7435]" />
            {clients.length} registered clients
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <div className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-400">
              Search coming soon
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-4 py-4">Contact</th>
                  <th className="px-4 py-4">Country</th>
                  <th className="px-4 py-4">Bookings</th>
                  <th className="px-6 py-4">Last booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A962]/15 text-sm font-bold text-[#8b7435]">
                          {client.name.split(" ").map((part) => part[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{client.name}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{client.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-slate-600">
                        <p className="flex items-center gap-2 whitespace-nowrap"><Mail className="h-3.5 w-3.5 text-slate-400" />{client.email}</p>
                        <p className="flex items-center gap-2 whitespace-nowrap text-xs"><Phone className="h-3.5 w-3.5 text-slate-400" />{client.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">{client.country}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{client.totalBookings}</span>
                        {client.totalBookings > 1 && (
                          <Badge className="border-[#C9A962]/30 bg-[#C9A962]/15 text-[#8b7435] hover:bg-[#C9A962]/15">
                            Repeat Client
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="flex items-center gap-2 font-medium text-slate-700"><CalendarDays className="h-4 w-4 text-slate-400" />{formatDate(client.lastBookingDate)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientsPage() {
  return <DashboardLayout><ClientsPageContent /></DashboardLayout>;
}
