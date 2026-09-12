import { ToursDataProvider } from "@/components/tours-data-provider";
import { ItineraryViewer } from "@/components/itinerary-viewer";

export const dynamic = "force-dynamic";

export default function ItineraryPage({ params }: { params: { id: string } }) {
  return (
    <ToursDataProvider>
      <ItineraryViewer id={params.id} />
    </ToursDataProvider>
  );
}