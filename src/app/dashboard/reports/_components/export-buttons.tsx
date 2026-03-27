"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Expense {
    id: number;
    expenseDate: Date;
    amount: unknown;
    expenseDetail: string | null;
    description: string | null;
    category: { categoryName: string } | null;
    subCategory: { subCategoryName: string } | null;
    project: { projectName: string } | null;
}

interface Income {
    id: number;
    incomeDate: Date;
    amount: unknown;
    incomeDetail: string | null;
    description: string | null;
    category: { categoryName: string } | null;
    subCategory: { subCategoryName: string } | null;
    project: { projectName: string } | null;
}

interface ExportButtonsProps {
    expenses: Expense[];
    incomes: Income[];
    summary?: {
        totalExpenses: number;
        totalIncome: number;
        netBalance: number;
    };
}

export function ExportButtons({ expenses, incomes, summary }: ExportButtonsProps) {
    const [isExporting, setIsExporting] = useState(false);

    async function exportToExcel() {
        setIsExporting(true);
        try {
            const { utils, writeFile } = await import("xlsx");

            // Create workbook
            const wb = utils.book_new();

            // Summary sheet
            if (summary) {
                const summaryData = [
                    ["Report Summary"],
                    [""],
                    ["Total Income", `₹${summary.totalIncome.toLocaleString("en-IN")}`],
                    ["Total Expenses", `₹${summary.totalExpenses.toLocaleString("en-IN")}`],
                    ["Net Balance", `₹${summary.netBalance.toLocaleString("en-IN")}`],
                    [""],
                    ["Generated on", format(new Date(), "dd MMM yyyy HH:mm")],
                ];
                const summarySheet = utils.aoa_to_sheet(summaryData);
                utils.book_append_sheet(wb, summarySheet, "Summary");
            }

            // Expenses sheet
            if (expenses.length > 0) {
                const expenseData = expenses.map((e) => ({
                    Date: format(new Date(e.expenseDate), "dd MMM yyyy"),
                    Category: e.category?.categoryName || "Uncategorized",
                    Subcategory: e.subCategory?.subCategoryName || "",
                    Project: e.project?.projectName || "",
                    Description: e.description || "",
                    "Payment Mode": e.expenseDetail || "",
                    Amount: Number(e.amount),
                }));
                const expenseSheet = utils.json_to_sheet(expenseData);
                utils.book_append_sheet(wb, expenseSheet, "Expenses");
            }

            // Income sheet
            if (incomes.length > 0) {
                const incomeData = incomes.map((i) => ({
                    Date: format(new Date(i.incomeDate), "dd MMM yyyy"),
                    Category: i.category?.categoryName || "Uncategorized",
                    Subcategory: i.subCategory?.subCategoryName || "",
                    Project: i.project?.projectName || "",
                    Description: i.description || "",
                    "Payment Mode": i.incomeDetail || "",
                    Amount: Number(i.amount),
                }));
                const incomeSheet = utils.json_to_sheet(incomeData);
                utils.book_append_sheet(wb, incomeSheet, "Income");
            }

            // Download
            const fileName = `SmartLedger_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
            writeFile(wb, fileName);
            toast.success("Excel report downloaded successfully");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export to Excel");
        }
        setIsExporting(false);
    }

    async function exportToPDF() {
        setIsExporting(true);
        try {
            const { jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");

            const doc = new jsPDF();

            // Title
            doc.setFontSize(20);
            doc.text("SmartLedger Financial Report", 14, 22);

            doc.setFontSize(10);
            doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 30);

            // Summary
            if (summary) {
                doc.setFontSize(14);
                doc.text("Summary", 14, 45);

                autoTable(doc, {
                    startY: 50,
                    head: [["Metric", "Amount"]],
                    body: [
                        ["Total Income", `₹${summary.totalIncome.toLocaleString("en-IN")}`],
                        ["Total Expenses", `₹${summary.totalExpenses.toLocaleString("en-IN")}`],
                        ["Net Balance", `₹${summary.netBalance.toLocaleString("en-IN")}`],
                    ],
                    theme: "striped",
                    headStyles: { fillColor: [59, 130, 246] },
                });
            }

            // Expenses table
            if (expenses.length > 0) {
                const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 80;
                doc.setFontSize(14);
                doc.text("Expenses", 14, finalY + 15);

                const expenseRows = expenses.slice(0, 30).map((e) => [
                    format(new Date(e.expenseDate), "dd MMM yy"),
                    e.category?.categoryName || "Uncategorized",
                    e.project?.projectName || "-",
                    `₹${Number(e.amount).toLocaleString("en-IN")}`,
                ]);

                autoTable(doc, {
                    startY: finalY + 20,
                    head: [["Date", "Category", "Project", "Amount"]],
                    body: expenseRows,
                    theme: "striped",
                    headStyles: { fillColor: [239, 68, 68] },
                });
            }

            // Income table (add new page if needed)
            if (incomes.length > 0) {
                doc.addPage();
                doc.setFontSize(14);
                doc.text("Income", 14, 20);

                const incomeRows = incomes.slice(0, 30).map((i) => [
                    format(new Date(i.incomeDate), "dd MMM yy"),
                    i.category?.categoryName || "Uncategorized",
                    i.project?.projectName || "-",
                    `₹${Number(i.amount).toLocaleString("en-IN")}`,
                ]);

                autoTable(doc, {
                    startY: 25,
                    head: [["Date", "Category", "Project", "Amount"]],
                    body: incomeRows,
                    theme: "striped",
                    headStyles: { fillColor: [34, 197, 94] },
                });
            }

            // Save
            const fileName = `SmartLedger_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`;
            doc.save(fileName);
            toast.success("PDF report downloaded successfully");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export to PDF");
        }
        setIsExporting(false);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button disabled={isExporting} />}>
                {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Export Report
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToExcel}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export to PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
