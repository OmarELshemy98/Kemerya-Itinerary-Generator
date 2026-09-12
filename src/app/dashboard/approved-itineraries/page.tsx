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
import { Search, Loader2, CheckCircle2, Users, DollarSign, Eye, Check, Trash2 } from "lucide-react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { ItineraryDownloader } from "@/components/itinerary-downloader";

interface ApprovedItineraryData {
  id: string;
  user_email: string | null;
  user_name: string | null;
  tour_title: string | null;
  is_custom_tour: boolean;
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
  is_approved: boolean;
}

function ApprovedItinerariesPageContent() {
  const [itineraries, setItineraries] = React.useState<ApprovedItineraryData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [updating, setUpdating] = React.useState<string | null>(null);

  const fetchItineraries = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/itineraries?type=approved");
      const json = await res.json();
      if (json.ok) setItineraries(json.itineraries);
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchItineraries(); }, [fetchItineraries]);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/itineraries/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_approved: !currentStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        setItineraries((prev) => prev.map((i) => (i.id === id ? { ...i, is_approved: !currentStatus } : i)));
      }
    } catch (e) {
      console.error("Failed to update:", e);
    } finally {
      setUpdating(null);
    }
  };

  const deleteItinerary = async (id: string) => {
    if (!window.confirm("Delete this itinerary? This action cannot be undone.")) return;
    setUpdating(id);
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
      setUpdating(null);
    }
  };

  const filtered = searchQuery.trim()
    ? itineraries.filter((i) =>
        (i.tour_title && i.tour_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (i.custom_tour_title && i.custom_tour_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (i.client_name && i.client_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : itineraries;

  const totalT = (item: ApprovedItineraryData) => item.travelers_adults + item.travelers_children + item.travelers_infants;
  const approvedCount = itineraries.filter((i) => i.is_approved).length;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Approved Itineraries</h1>
          <p className="mt-1 text-sm text-slate-500">Mark itineraries as approved when completed</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">{approvedCount} of {itineraries.length} Approved</span>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search itineraries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-12">Approved</TableHead>
              <TableHead>Tour Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Travelers</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="h-32 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-32 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm text-slate-500">No itineraries found</p></TableCell></TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className={item.is_approved ? "bg-emerald-50/30" : ""}>
                  <TableCell>
                    <button onClick={() => toggleApproval(item.id, item.is_approved)} disabled={updating === item.id} className={`flex h-6 w-6 items-center justify-center rounded border-2 transition-colors ${item.is_approved ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white hover:border-emerald-400"}`}>
                      {item.is_approved && <Check className="h-4 w-4" />}
                    </button>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{item.is_custom_tour ? item.custom_tour_title || "Custom Tour" : item.tour_title || "Standard Tour"}</TableCell>
                  <TableCell><p className="text-sm">{item.client_name || "N/A"}</p></TableCell>
                  <TableCell><div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-slate-400" /><span className="text-sm font-medium">{totalT(item)}</span></div></TableCell>
                  <TableCell><p className="text-sm">{formatDateShort(item.start_date)}</p><p className="text-xs text-slate-500">→ {formatDateShort(item.end_date)}</p></TableCell>
                  <TableCell><div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-emerald-500" /><span className="text-sm font-semibold">{formatCurrency(item.total_price, item.currency)}</span></div></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <ItineraryDownloader id={item.id} />
                      <Button variant="ghost" size="sm" onClick={() => (window.location.href = `/itinerary/${item.id}`)} title="View / edit"><Eye className="h-4 w-4" /></Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItinerary(item.id)}
                        disabled={updating === item.id}
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
    </div>
  );
}

export default function ApprovedItinerariesPage() {
  return <DashboardLayout><ApprovedItinerariesPageContent /></DashboardLayout>;
}