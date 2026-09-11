"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Loader2,
  Map,
  Users,
  DollarSign,
  Eye,
  Plus,
} from "lucide-react";
import { formatCurrency, formatDateShort } from "@/lib/utils";

interface CustomTourData {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  custom_tour_title: string | null;
  client_name: string | null;
  client_phone: string | null;
  travelers_adults: number;
  travelers_children: number;
  travelers_infants: number;
  total_price: number;
  currency: string;
  start_date: string;
  end_date: string;
}

function CustomToursPageContent() {
  const [tours, setTours] = React.useState<CustomTourData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchCustomTours = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/itineraries?type=custom");
      const json = await res.json();
      if (json.ok) {
        setTours(json.itineraries);
      }
    } catch (e) {
      console.error("Failed to fetch custom tours:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCustomTours();
  }, [fetchCustomTours]);

  const filteredTours = React.useMemo(() => {
    if (!searchQuery.trim()) return tours;
    const q = searchQuery.toLowerCase();
    return tours.filter(
      (t) =>
        (t.custom_tour_title && t.custom_tour_title.toLowerCase().includes(q)) ||
        (t.client_name && t.client_name.toLowerCase().includes(q)) ||
        (t.user_email && t.user_email.toLowerCase().includes(q))
    );
  }, [tours, searchQuery]);

  const totalTravelers = (tour: CustomTourData) =>
    tour.travelers_adults + tour.travelers_children + tour.travelers_infants;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Custom Tours</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage all custom tours</p>
        </div>
        <Button variant="gold" size="sm" onClick={() => (window.location.href = "/dashboard")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Tour
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search tours..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Tour Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Travelers</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                </TableCell>
              </TableRow>
            ) : filteredTours.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Map className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No custom tours found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTours.map((tour) => (
                <TableRow key={tour.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{tour.custom_tour_title || "Untitled"}</TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-900">{tour.client_name || "N/A"}</p>
                    {tour.client_phone && <p className="text-xs text-slate-500">{tour.client_phone}</p>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium">{totalTravelers(tour)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-900">{formatDateShort(tour.start_date)}</p>
                    <p className="text-xs text-slate-500">→ {formatDateShort(tour.end_date)}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-semibold">{formatCurrency(tour.total_price, tour.currency)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{tour.user_name || "N/A"}</p>
                    <p className="text-xs text-slate-500">{tour.user_email}</p>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => (window.location.href = `/dashboard?edit=${tour.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function CustomToursPage() {
  return (
    <DashboardLayout>
      <CustomToursPageContent />
    </DashboardLayout>
  );
}