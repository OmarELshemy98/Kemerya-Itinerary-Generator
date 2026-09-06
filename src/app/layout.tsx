import type { Metadata } from "next";
import "./globals.css";
import { AppFooter } from "@/components/app-footer";

export const metadata: Metadata = {
  title: "Kemerya Tours - Itinerary Dashboard",
  description:
    "Professional itinerary generator for Kemerya Tours - Create beautiful PDF itineraries for your clients.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
        <AppFooter />
      </body>
    </html>
  );
}
