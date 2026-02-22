"use client";

import * as XLSX from "xlsx";
import { Download } from "lucide-react";

interface HistoryRecord {
    Date: string;
    Target: string;
    Status: string;
}

interface MissedRecord {
    name: string;
    count: number;
}

interface ExportButtonProps {
    historyData: HistoryRecord[];
    missedSummary: MissedRecord[];
}

export default function ExportButton({ historyData, missedSummary }: ExportButtonProps) {
    const handleExport = () => {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(historyData), "Full History");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(missedSummary), "Missed Summary");
        XLSX.writeFile(wb, "Tracker_Report.xlsx");
    };

    return (
        <button 
        onClick={handleExport} 
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center gap-2 active:scale-95 shadow-sm"
        >
        <Download size={18} /> Export XLSX
        </button>
    );
}