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
  BadgePercent,
  Users,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
} from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { ItineraryDownloader } from "@/components/itinerary-downloader";
import { exportTableToExcel } from "@/lib/export-excel";
import {
  PriceWithOffer,
  activePrice,
  discountPercent,
} from "@/components/offer-price";

interface OfferItineraryData {
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
  offer_price: number | null;
}

function OfferToursPageContent() {
  const [itineraries, setItineraries] = React.useState<OfferItineraryData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [updating, setUpdating] = React.useState<string | null>(null);

  const fetchItineraries = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/itineraries?type=offers");
      const json = await res.json();
      if (json.ok) setItineraries(json.itineraries);
    } catch (e) {
      console.error("Failed to fetch offer itineraries:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

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

  const exportExcel = () => {
    const rows = filtered.map((item) => ({
      "Tour Name": item.is_custom_tour
        ? item.custom_tour_title || "Custom Tour"
        : item.tour_title || "Standard Tour",
      "Client": item.client_name || "N/A",
      "Client Phone": item.client_phone || "",
      "Travelers": `${totalT(item)} (${item.travelers_adults}A${item.travelers_children > 0 ? `, ${item.travelers_children}C` : ""}${item.travelers_infants > 0 ? `, ${item.travelers_infants}I` : ""})`,
      "Dates": `${formatDateShort(item.start_date)} → ${formatDateShort(item.end_date)}`,
      "Offer Price": activePrice(item.total_price, item.offer_price),
      "Original Price": item.total_price,
      "Discount %": discountPercent(item.total_price, item.offer_price),
      "Status": item.is_approved ? "Approved" : "Hold",
    }));
    exportTableToExcel(rows, "Offers Tours");
  };

  const filtered = searchQuery.trim()
    ? itineraries.filter((i) =>
        (i.tour_title && i.tour_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (i.custom_tour_title && i.custom_tour_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (i.client_name && i.client_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : itineraries;

  const totalT = (item: OfferItineraryData) =>
    item.travelers_adults + item.travelers_children + item.travelers_infants;

  const approvedCount = itineraries.filter((i) => i.is_approved).length;
  const totalSaved = itineraries.reduce(
    (sum, i) => sum + Math.max(0, i.total_price - activePrice(i.total_price, i.offer_price)),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offers Tours</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every itinerary running on a special offer — with its approval status
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2">
            <BadgePercent className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              {itineraries.length} Offer{itineraries.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[#C9A962]/10 px-4 py-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-[#8b7435]">
              {approvedCount} Approved · {itineraries.length - approvedCount} Hold
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={exportExcel} title="Export the shown data to an Excel sheet">
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
            Export in Excel Sheet
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search offers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Tour Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Travelers</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Price (Offer)</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
{loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <BadgePercent className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">
                    No offers yet — add an offer price on a booking to see it here
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const pct = discountPercent(item.total_price, item.offer_price);
                return (
                  <TableRow key={item.id} className="hover:bg-emerald-50/30">
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>
                          {item.is_custom_tour
                            ? item.custom_tour_title || "Custom Tour"
                            : item.tour_title || "Standard Tour"}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                        >
                          OFFER
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{item.client_name || "N/A"}</p>
                      {item.client_phone && (
                        <p className="text-xs text-slate-500">{item.client_phone}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium">{totalT(item)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDateShort(item.start_date)}</p>
                      <p className="text-xs text-slate-500">→ {formatDateShort(item.end_date)}</p>
                    </TableCell>
                    <TableCell>
                      <PriceWithOffer
                        totalPrice={item.total_price}
                        offerPrice={item.offer_price}
                        currency={item.currency}
                      />
                    </TableCell>
                    <TableCell>
                      {pct > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          {pct}% off
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.is_approved ? (
                        <Badge
                          variant="outline"
                          className="flex w-fit items-center gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="flex w-fit items-center gap-1 border-amber-200 bg-amber-50 text-amber-700"
                        >
                          <Clock className="h-3 w-3" />
                          Hold
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <ItineraryDownloader id={item.id} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (window.location.href = `/itinerary/${item.id}`)}
                          title="View / edit"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && totalSaved > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4">
          <p className="text-sm text-emerald-800">
            💚 Total customer savings across these offers:{" "}
            <span className="font-black">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: itineraries[0]?.currency || "USD",
                maximumFractionDigits: 0,
              }).format(totalSaved)}
            </span>{" "}
            across {itineraries.length} offer{itineraries.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

export default function OfferToursPage() {
  return (
    <DashboardLayout>
      <OfferToursPageContent />
    </DashboardLayout>
  );
}