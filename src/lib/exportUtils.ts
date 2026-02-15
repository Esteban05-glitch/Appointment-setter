import { Prospect } from "@/components/pipeline/types";

/**
 * Converts an array of prospects into a CSV string and triggers a browser download.
 */
export function downloadProspectsCSV(prospects: Prospect[]) {
    if (prospects.length === 0) return;

    // Define headers
    const headers = [
        "ID",
        "Name",
        "Platform",
        "Handle",
        "Status",
        "Priority",
        "Value",
        "Last Contact",
        "Budget Qualified",
        "Authority Qualified",
        "Need Qualified",
        "Timing Qualified"
    ];

    // Map data to rows
    const rows = prospects.map(p => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`, // Escape quotes
        p.platform,
        `"${p.handle.replace(/"/g, '""')}"`,
        p.status,
        p.priority,
        p.value || 0,
        p.lastContact,
        p.qualBudget ? "Yes" : "No",
        p.qualAuthority ? "Yes" : "No",
        p.qualNeed ? "Yes" : "No",
        p.qualTiming ? "Yes" : "No"
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `setter_prospects_${date}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
