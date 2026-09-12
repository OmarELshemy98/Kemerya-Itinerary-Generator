"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Calendar,
  User,
  Users,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";

interface ItineraryData {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  tour_id: string | null;
  tour_title: string | null;
  is_custom_tour: boolean;
  custom_tour_title: string | null;
  custom_tour_description: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_whatsapp: string | null;
  travelers_adults: number;
  travelers_children: number;
  travelers_infants: number;
  total_price: number;
  currency: string;
  price_per_person: number | null;
  start_date: string;
  end_date: string;
  notes: string | null;
  special_requests: string | null;
  is_approved: boolean;
  created_at: string;
}

function ItinerariesPageContent() {
  const [itineraries, setItineraries] = React.useState<ItineraryData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState<"all" | "today" | "week" | "month">("all");
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const fetchItineraries = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/itineraries");
      const json = await res.json();
      if (json.ok) {
        setItineraries(json.itineraries);
      }
    } catch (e) {
      console.error("Failed to fetch itineraries:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  const deleteItinerary = async (id: string) => {
    if (!window.confirm("Delete this itinerary? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/itineraries?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        setItineraries((prev) => prev.filter((i) => i.id !== id));
      } else {
        window.alert(json.error || "Failed to delete itinerary");
      }
    } catch (e) {
      console.error("Failed to delete itinerary:", e);
      window.alert("Failed to delete itinerary");
    } finally {
      setDeleting(null);
    }
  };

  // Filter itineraries based on search query and date filter
  const filteredItineraries = React.useMemo(() => {
    let filtered = itineraries;

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((i) => {
        const created = new Date(i.created_at);
        switch (dateFilter) {
          case "today":
            return created >= startOfDay;
          case "week": {
            const weekAgo = new Date(startOfDay);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created >= weekAgo;
          }
          case "month": {
            const monthAgo = new Date(startOfDay);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return created >= monthAgo;
          }
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          (i.tour_title && i.tour_title.toLowerCase().includes(q)) ||
          (i.custom_tour_title && i.custom_tour_title.toLowerCase().includes(q)) ||
          (i.client_name && i.client_name.toLowerCase().includes(q)) ||
          (i.client_email && i.client_email.toLowerCase().includes(q)) ||
          (i.user_name && i.user_name.toLowerCase().includes(q)) ||
          (i.user_email && i.user_email.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [itineraries, searchQuery, dateFilter]);

  const totalTravelers = (i: ItineraryData) =>
    i.travelers_adults + i.travelers_children + i.travelers_infants;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Itineraries</h1>
          <p className="text-sm text-slate-500">
            View all created itineraries with details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {filteredItineraries.length} itinerary
            {filteredItineraries.length !== 1 ? "ies" : ""}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by tour, client name, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {(["all", "today", "week", "month"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  dateFilter === f
                    ? "bg-[#C9A962] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {f === "all" ? "All Time" : f === "today" ? "Today" : f === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Itineraries Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Created</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Tour / Itinerary</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Travelers</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-500">Loading itineraries...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItineraries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-500">
                      {searchQuery || dateFilter !== "all"
                        ? "No itineraries match your filters"
                        : "No itineraries created yet"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItineraries.map((itinerary) => (
                <TableRow key={itinerary.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(itinerary.created_at).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(itinerary.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                        <span className="text-xs font-medium text-slate-600">
                          {(itinerary.user_name || itinerary.user_email || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {itinerary.user_name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {itinerary.user_email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {itinerary.is_custom_tour
                            ? itinerary.custom_tour_title || "Custom Tour"
                            : itinerary.tour_title || "Unknown Tour"}
                        </p>
                        {itinerary.is_custom_tour && (
                          <Badge variant="outline" className="mt-1 text-[10px] text-purple-600 border-purple-200 bg-purple-50">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {itinerary.client_name ? (
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {itinerary.client_name}
                        </p>
                        {itinerary.client_email && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="h-3 w-3" />
                            {itinerary.client_email}
                          </div>
                        )}
                        {itinerary.client_phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="h-3 w-3" />
                            {itinerary.client_phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">No client info</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {totalTravelers(itinerary)}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({itinerary.travelers_adults}A
                        {itinerary.travelers_children > 0 && `, ${itinerary.travelers_children}C`}
                        {itinerary.travelers_infants > 0 && `, ${itinerary.travelers_infants}I`})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-slate-900">
                        {formatDateShort(itinerary.start_date)}
                      </p>
                      <p className="text-xs text-slate-500">
                        → {formatDateShort(itinerary.end_date)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(itinerary.total_price, itinerary.currency)}
                      </span>
                    </div>
                    {itinerary.price_per_person && (
                      <p className="text-xs text-slate-500">
                        {formatCurrency(itinerary.price_per_person, itinerary.currency)}/pax
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        itinerary.is_approved
                          ? "flex w-fit items-center gap-1 text-emerald-700 border-emerald-200 bg-emerald-50"
                          : "flex w-fit items-center gap-1 text-amber-700 border-amber-200 bg-amber-50"
                      }
                    >
                      {itinerary.is_approved ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {itinerary.is_approved ? "Approved" : "Hold"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => (window.location.href = `/dashboard?edit=${itinerary.id}`)}
                        title="View / edit"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItinerary(itinerary.id)}
                        disabled={deleting === itinerary.id}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete itinerary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      {!loading && filteredItineraries.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">
              {filteredItineraries.length}
            </p>
            <p className="text-xs text-slate-500">Total Itineraries</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">
              {filteredItineraries.reduce((sum, i) => sum + i.total_price, 0).toLocaleString()}{" "}
              <span className="text-sm font-normal">
                {filteredItineraries[0]?.currency || "USD"}
              </span>
            </p>
            <p className="text-xs text-slate-500">Total Value</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">
              {filteredItineraries.reduce((sum, i) => sum + totalTravelers(i), 0)}
            </p>
            <p className="text-xs text-slate-500">Total Travelers</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-purple-600">
              {filteredItineraries.filter((i) => i.is_custom_tour).length}
            </p>
            <p className="text-xs text-slate-500">Custom Tours</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItinerariesPage() {
  return (
    <DashboardLayout>
      <ItinerariesPageContent />
    </DashboardLayout>
  );
}