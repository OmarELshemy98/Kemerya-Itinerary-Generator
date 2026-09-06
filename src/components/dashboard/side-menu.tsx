"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { KEMERYA_COMPANY_INFO } from "@/data/company";

interface SideMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

interface SideMenuProps {
  userRole: "super_admin" | "admin" | "operator" | "viewer";
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function SideMenu({ userRole, collapsed, onToggle, mobileOpen, onMobileClose }: SideMenuProps) {
  const pathname = usePathname();

  const menuItems: SideMenuItem[] = React.useMemo(() => {
    const items: SideMenuItem[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        path: "/dashboard",
      },
      {
        id: "itineraries",
        label: "Itineraries",
        icon: <FileText className="h-5 w-5" />,
        path: "/dashboard/itineraries",
      },
    ];

    if (userRole === "super_admin" || userRole === "admin") {
      items.push({
        id: "users",
        label: "Users",
        icon: <Users className="h-5 w-5" />,
        path: "/dashboard/users",
      });
    }

    return items;
  }, [userRole]);

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={onMobileClose}
        className="fixed top-4 left-4 z-50 rounded-lg bg-[#0F172A] p-2 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Side menu */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full border-r border-slate-200 bg-white transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                <Image
                  src={KEMERYA_COMPANY_INFO.logo}
                  alt={KEMERYA_COMPANY_INFO.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-slate-900">
                Kemerya
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 p-0 text-slate-500 hover:text-slate-900",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu items */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  window.location.href = item.path;
                  onMobileClose();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-[#C9A962]/10 text-[#8b7435]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-[#C9A962]/20 px-2 py-0.5 text-[10px] font-semibold text-[#8b7435]">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}