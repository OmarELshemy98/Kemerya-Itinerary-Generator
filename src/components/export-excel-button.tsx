"use client";

import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportTableToExcel, type XlsxRow } from "@/lib/export-excel";

interface ExportExcelButtonProps {
  rows: XlsxRow[];
  fileName: string;
}

export function ExportExcelButton({ rows, fileName }: ExportExcelButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportTableToExcel(rows, fileName)}
      disabled={rows.length === 0}
      title={rows.length === 0 ? "There is no data to export" : "Export the shown data to an Excel sheet"}
    >
      <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
      Export in Excel Sheet
    </Button>
  );
}
