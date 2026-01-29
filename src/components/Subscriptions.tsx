import { useState, useEffect, useMemo } from "react";
import {
  Star,
  Users,
  Briefcase,
  Eye,
  Loader2,
  Search,
  Crown,
  Zap,
  Shield,
  X,
  User,
  MapPin,
  Calendar,
  TrendingUp,
  PhoneCall,
  Mail,
  Download,
  FileSpreadsheet,
  Calculator,
  Filter,
  CheckCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

import { BASE_URL } from "./Constants";
import { Pagination } from "./Pagination";

// ==================== CONSTANTS ====================
const theme = {
  colors: {
    primary: "#0EA5E9",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    active: "#0EA5E9",
    inactive: "#9CA3AF",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
};

const API_BASE_URL = BASE_URL;

// Helper function to construct full profile photo URL
const getProfilePhotoUrl = (photoPath: string | null | undefined) => {
  if (!photoPath) return null;
  if (photoPath.startsWith("http")) return photoPath;
  return `${API_BASE_URL}${photoPath}`;
};

// Subscription plan configurations
const planConfig: Record<string, { color: string; bg: string; icon: any }> = {
  free: { color: "#6B7280", bg: "#F3F4F6", icon: User },
  basic: { color: "#3B82F6", bg: "#DBEAFE", icon: Zap },
  premium: { color: "#8B5CF6", bg: "#EDE9FE", icon: Crown },
  gold: { color: "#F59E0B", bg: "#FEF3C7", icon: Crown },
  enterprise: { color: "#10B981", bg: "#D1FAE5", icon: Shield },
};

// Plan pricing configuration (in INR)
const planPricing: Record<string, number> = {
  free: 0,
  basic: 99,
  silver: 99,
  premium: 199,
  gold: 299,
  enterprise: 499,
};

// GST Configuration
const GST_RATE = 18; // 18% GST
const CGST_RATE = 9; // 9% CGST (for intra-state)
const SGST_RATE = 9; // 9% SGST (for intra-state)
const IGST_RATE = 18; // 18% IGST (for inter-state)

// Company details for invoice
const COMPANY_INFO = {
  name: "Mento Services Pvt. Ltd.",
  address: "123 Business Park, Sector 5",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  gstin: "27AABCU9603R1ZM",
  pan: "AABCU9603R",
  email: "billing@mento.com",
  phone: "+91 9876543210",
};

// Types for invoice
interface InvoiceItem {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity: string;
  customerPincode: string;
  userType: string;
  planName: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  basePrice: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalGst: number;
  totalAmount: number;
  paymentId: string;
  status: string;
  hsnCode: string;
}

// ==================== INVOICE EXPORT MODAL ====================
interface InvoiceExportModalProps {
  subscriptions: any[];
  onClose: () => void;
}

const InvoiceExportModal = ({
  subscriptions,
  onClose,
}: InvoiceExportModalProps) => {
  const [exportType, setExportType] = useState<"all" | "paid" | "filtered">(
    "paid",
  );
  const [gstType, setGstType] = useState<"intra" | "inter">("intra");

  const [userTypeFilter, setUserTypeFilter] = useState<
    "all" | "worker" | "job_seeker"
  >("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Generate unique invoice number
  const generateInvoiceNumber = (index: number, date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const sequence = String(index + 1).padStart(5, "0");
    return `MENTO/${year}${month}/${sequence}`;
  };

  // Calculate GST amounts
  const calculateGST = (basePrice: number, isInterState: boolean) => {
    if (basePrice === 0) {
      return { cgst: 0, sgst: 0, igst: 0, totalGst: 0, total: 0 };
    }

    if (isInterState) {
      const igst = (basePrice * IGST_RATE) / 100;
      return {
        cgst: 0,
        sgst: 0,
        igst: igst,
        totalGst: igst,
        total: basePrice + igst,
      };
    } else {
      const cgst = (basePrice * CGST_RATE) / 100;
      const sgst = (basePrice * SGST_RATE) / 100;
      return {
        cgst: cgst,
        sgst: sgst,
        igst: 0,
        totalGst: cgst + sgst,
        total: basePrice + cgst + sgst,
      };
    }
  };

  // Filter subscriptions based on criteria
  const getFilteredSubscriptions = () => {
    return subscriptions.filter((sub) => {
      // Filter by paid/unpaid
      const plan = (sub.subscription_plan || "free").toLowerCase();
      const isPaid = plan !== "free" && plan !== "none";

      if (exportType === "paid" && !isPaid) return false;

      // Filter by user type
      if (userTypeFilter !== "all" && sub.userType !== userTypeFilter)
        return false;

      // Filter by plan
      if (planFilter !== "all" && plan !== planFilter) return false;

      // Filter by date range (using created_at or subscription start date if available)

      return true;
    });
  };

  // Format date for display
  // Format date for display
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return new Date().toISOString().split("T")[0];
    try {
      const date = new Date(dateValue.$date || dateValue);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split("T")[0];
      }
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    setIsExporting(true);

    try {
      const filtered = getFilteredSubscriptions();

      if (filtered.length === 0) {
        alert("No subscriptions match the selected criteria");
        setIsExporting(false);
        return;
      }

      const isInterState = gstType === "inter";
      const invoiceDate = new Date();

      // Create invoice data
      const invoiceData: InvoiceItem[] = filtered.map((sub, index) => {
        const plan = (sub.subscription_plan || "free").toLowerCase();
        const basePrice = planPricing[plan] || 0;
        const gst = calculateGST(basePrice, isInterState);

        return {
          invoiceNumber: generateInvoiceNumber(index, invoiceDate),
          invoiceDate: invoiceDate.toISOString().split("T")[0],
          customerName: sub.full_name || sub.name || "N/A",
          customerEmail: sub.user_email || "N/A",
          customerPhone: sub.user_mobile || "N/A",
          customerCity: sub.user_city || "N/A",
          customerPincode: sub.user_pincode || "N/A",
          userType: sub.userType === "job_seeker" ? "Job Seeker" : "Worker",
          planName:
            (sub.subscription_plan || "Free").charAt(0).toUpperCase() +
            (sub.subscription_plan || "free").slice(1),
          subscriptionStartDate: formatDate(
            sub.subscription_starts_at || sub.created_at,
          ),
          subscriptionEndDate: formatDate(sub.subscription_expires_at),
          basePrice: basePrice,
          cgstRate: isInterState ? 0 : CGST_RATE,
          cgstAmount: Math.round(gst.cgst * 100) / 100,
          sgstRate: isInterState ? 0 : SGST_RATE,
          sgstAmount: Math.round(gst.sgst * 100) / 100,
          igstRate: isInterState ? IGST_RATE : 0,
          igstAmount: Math.round(gst.igst * 100) / 100,
          totalGst: Math.round(gst.totalGst * 100) / 100,
          totalAmount: Math.round(gst.total * 100) / 100,
          paymentId: sub.payment_id || "N/A",
          status: "Active",
          hsnCode: "998314", // HSN Code for subscription services
        };
      });

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Invoice Summary
      const summaryData = [
        ["SUBSCRIPTION INVOICE REPORT"],
        [""],
        ["Company Details"],
        ["Company Name", COMPANY_INFO.name],
        ["Address", COMPANY_INFO.address],
        ["City", COMPANY_INFO.city],
        ["State", COMPANY_INFO.state],
        ["Pincode", COMPANY_INFO.pincode],
        ["GSTIN", COMPANY_INFO.gstin],
        ["PAN", COMPANY_INFO.pan],
        ["Email", COMPANY_INFO.email],
        ["Phone", COMPANY_INFO.phone],
        [""],
        ["Report Generated On", invoiceDate.toLocaleString()],
        [
          "GST Type",
          isInterState ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)",
        ],
        ["Total Invoices", filtered.length],
        [""],
        ["Summary"],
        [
          "Total Base Amount (INR)",
          invoiceData.reduce((sum, inv) => sum + inv.basePrice, 0),
        ],
        [
          "Total CGST (INR)",
          invoiceData.reduce((sum, inv) => sum + inv.cgstAmount, 0),
        ],
        [
          "Total SGST (INR)",
          invoiceData.reduce((sum, inv) => sum + inv.sgstAmount, 0),
        ],
        [
          "Total IGST (INR)",
          invoiceData.reduce((sum, inv) => sum + inv.igstAmount, 0),
        ],
        [
          "Total GST (INR)",
          invoiceData.reduce((sum, inv) => sum + inv.totalGst, 0),
        ],
        [
          "Grand Total (INR)",
          invoiceData.reduce((sum, inv) => sum + inv.totalAmount, 0),
        ],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

      // Set column widths for summary
      summarySheet["!cols"] = [{ wch: 25 }, { wch: 40 }];

      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      // Sheet 2: Detailed Invoices
      const invoiceHeaders = [
        "Invoice Number",
        "Invoice Date",
        "Customer Name",
        "Email",
        "Phone",
        "City",
        "Pincode",
        "User Type",
        "Plan Name",
        "HSN Code",
        "Subscription Start",
        "Subscription End",
        "Base Price (INR)",
        "CGST Rate (%)",
        "CGST Amount (INR)",
        "SGST Rate (%)",
        "SGST Amount (INR)",
        "IGST Rate (%)",
        "IGST Amount (INR)",
        "Total GST (INR)",
        "Total Amount (INR)",
        "Payment ID",
        "Status",
      ];

      const invoiceRows = invoiceData.map((inv) => [
        inv.invoiceNumber,
        inv.invoiceDate,
        inv.customerName,
        inv.customerEmail,
        inv.customerPhone,
        inv.customerCity,
        inv.customerPincode,
        inv.userType,
        inv.planName,
        inv.hsnCode,
        inv.subscriptionStartDate,
        inv.subscriptionEndDate,
        inv.basePrice,
        inv.cgstRate,
        inv.cgstAmount,
        inv.sgstRate,
        inv.sgstAmount,
        inv.igstRate,
        inv.igstAmount,
        inv.totalGst,
        inv.totalAmount,
        inv.paymentId,
        inv.status,
      ]);

      const detailSheet = XLSX.utils.aoa_to_sheet([
        invoiceHeaders,
        ...invoiceRows,
      ]);

      // Set column widths for detail
      detailSheet["!cols"] = [
        { wch: 20 }, // Invoice Number
        { wch: 12 }, // Invoice Date
        { wch: 25 }, // Customer Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 15 }, // City
        { wch: 10 }, // Pincode
        { wch: 12 }, // User Type
        { wch: 12 }, // Plan Name
        { wch: 10 }, // HSN Code
        { wch: 15 }, // Sub Start
        { wch: 15 }, // Sub End
        { wch: 15 }, // Base Price
        { wch: 12 }, // CGST Rate
        { wch: 15 }, // CGST Amount
        { wch: 12 }, // SGST Rate
        { wch: 15 }, // SGST Amount
        { wch: 12 }, // IGST Rate
        { wch: 15 }, // IGST Amount
        { wch: 15 }, // Total GST
        { wch: 15 }, // Total Amount
        { wch: 25 }, // Payment ID
        { wch: 10 }, // Status
      ];

      XLSX.utils.book_append_sheet(workbook, detailSheet, "Invoices");

      // Sheet 3: GST Breakup by Plan
      const planBreakup: Record<
        string,
        { count: number; base: number; gst: number; total: number }
      > = {};
      invoiceData.forEach((inv) => {
        const plan = inv.planName;
        if (!planBreakup[plan]) {
          planBreakup[plan] = { count: 0, base: 0, gst: 0, total: 0 };
        }
        planBreakup[plan].count++;
        planBreakup[plan].base += inv.basePrice;
        planBreakup[plan].gst += inv.totalGst;
        planBreakup[plan].total += inv.totalAmount;
      });

      const breakupHeaders = [
        "Plan Name",
        "No. of Subscriptions",
        "Base Amount (INR)",
        "Total GST (INR)",
        "Total Amount (INR)",
      ];
      const breakupRows = Object.entries(planBreakup).map(([plan, data]) => [
        plan,
        data.count,
        Math.round(data.base * 100) / 100,
        Math.round(data.gst * 100) / 100,
        Math.round(data.total * 100) / 100,
      ]);

      // Add total row
      const totalBase = Object.values(planBreakup).reduce(
        (sum, d) => sum + d.base,
        0,
      );
      const totalGst = Object.values(planBreakup).reduce(
        (sum, d) => sum + d.gst,
        0,
      );
      const totalAmount = Object.values(planBreakup).reduce(
        (sum, d) => sum + d.total,
        0,
      );
      breakupRows.push([
        "TOTAL",
        filtered.length,
        Math.round(totalBase * 100) / 100,
        Math.round(totalGst * 100) / 100,
        Math.round(totalAmount * 100) / 100,
      ]);

      const breakupSheet = XLSX.utils.aoa_to_sheet([
        breakupHeaders,
        ...breakupRows,
      ]);
      breakupSheet["!cols"] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
      ];

      XLSX.utils.book_append_sheet(workbook, breakupSheet, "Plan Breakup");

      // Sheet 4: User Type Breakup
      const userTypeBreakup: Record<
        string,
        { count: number; base: number; gst: number; total: number }
      > = {};
      invoiceData.forEach((inv) => {
        const type = inv.userType;
        if (!userTypeBreakup[type]) {
          userTypeBreakup[type] = { count: 0, base: 0, gst: 0, total: 0 };
        }
        userTypeBreakup[type].count++;
        userTypeBreakup[type].base += inv.basePrice;
        userTypeBreakup[type].gst += inv.totalGst;
        userTypeBreakup[type].total += inv.totalAmount;
      });

      const userBreakupHeaders = [
        "User Type",
        "No. of Subscriptions",
        "Base Amount (INR)",
        "Total GST (INR)",
        "Total Amount (INR)",
      ];
      const userBreakupRows = Object.entries(userTypeBreakup).map(
        ([type, data]) => [
          type,
          data.count,
          Math.round(data.base * 100) / 100,
          Math.round(data.gst * 100) / 100,
          Math.round(data.total * 100) / 100,
        ],
      );

      const userBreakupSheet = XLSX.utils.aoa_to_sheet([
        userBreakupHeaders,
        ...userBreakupRows,
      ]);
      userBreakupSheet["!cols"] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        userBreakupSheet,
        "User Type Breakup",
      );

      // Generate filename
      const timestamp = invoiceDate.toISOString().split("T")[0];
      const filename = `subscription-invoices-${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export invoices. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCount = getFilteredSubscriptions().length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${theme.colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: theme.colors.surface,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: `${theme.colors.success}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileSpreadsheet size={20} color={theme.colors.success} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                Export Subscription Invoices
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "13px",
                  color: theme.colors.textSecondary,
                }}
              >
                Generate invoices with GST calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={24} color={theme.colors.textSecondary} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {exportSuccess ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: `${theme.colors.success}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <CheckCircle size={32} color={theme.colors.success} />
              </div>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Export Successful!
              </h3>
              <p style={{ margin: 0, color: theme.colors.textSecondary }}>
                Your invoice file has been downloaded.
              </p>
            </div>
          ) : (
            <>
              {/* Export Type */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: theme.colors.text,
                    marginBottom: "8px",
                  }}
                >
                  <Filter
                    size={14}
                    style={{ marginRight: "6px", verticalAlign: "middle" }}
                  />
                  Export Type
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[
                    { key: "paid", label: "Paid Subscriptions Only" },
                    { key: "all", label: "All Subscriptions" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setExportType(option.key as any)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: `2px solid ${exportType === option.key ? theme.colors.primary : theme.colors.border}`,
                        background:
                          exportType === option.key
                            ? `${theme.colors.primary}10`
                            : "transparent",
                        color:
                          exportType === option.key
                            ? theme.colors.primary
                            : theme.colors.text,
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GST Type */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: theme.colors.text,
                    marginBottom: "8px",
                  }}
                >
                  <Calculator
                    size={14}
                    style={{ marginRight: "6px", verticalAlign: "middle" }}
                  />
                  GST Calculation Type
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setGstType("intra")}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: `2px solid ${gstType === "intra" ? theme.colors.primary : theme.colors.border}`,
                      background:
                        gstType === "intra"
                          ? `${theme.colors.primary}10`
                          : "transparent",
                      color:
                        gstType === "intra"
                          ? theme.colors.primary
                          : theme.colors.text,
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Intra-State (CGST + SGST)
                  </button>
                  <button
                    onClick={() => setGstType("inter")}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: `2px solid ${gstType === "inter" ? theme.colors.primary : theme.colors.border}`,
                      background:
                        gstType === "inter"
                          ? `${theme.colors.primary}10`
                          : "transparent",
                      color:
                        gstType === "inter"
                          ? theme.colors.primary
                          : theme.colors.text,
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Inter-State (IGST)
                  </button>
                </div>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  {gstType === "intra"
                    ? `CGST @ ${CGST_RATE}% + SGST @ ${SGST_RATE}% = ${GST_RATE}% Total`
                    : `IGST @ ${IGST_RATE}%`}
                </p>
              </div>

              {/* User Type Filter */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: theme.colors.text,
                    marginBottom: "8px",
                  }}
                >
                  <Users
                    size={14}
                    style={{ marginRight: "6px", verticalAlign: "middle" }}
                  />
                  User Type
                </label>
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    fontSize: "14px",
                    outline: "none",
                    background: theme.colors.surface,
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="worker">Workers Only</option>
                  <option value="job_seeker">Job Seekers Only</option>
                </select>
              </div>

              {/* Plan Filter */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: theme.colors.text,
                    marginBottom: "8px",
                  }}
                >
                  <Crown
                    size={14}
                    style={{ marginRight: "6px", verticalAlign: "middle" }}
                  />
                  Subscription Plan
                </label>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    fontSize: "14px",
                    outline: "none",
                    background: theme.colors.surface,
                  }}
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="silver">Silver</option>
                  <option value="premium">Premium</option>
                  <option value="gold">Gold</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Preview Count */}
              <div
                style={{
                  padding: "16px",
                  background: theme.colors.background,
                  borderRadius: "8px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Subscriptions to export:
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: theme.colors.primary,
                    }}
                  >
                    {filteredCount}
                  </span>
                </div>
              </div>

              {/* Export Info */}
              <div
                style={{
                  padding: "16px",
                  background: `${theme.colors.primary}10`,
                  borderRadius: "8px",
                  marginBottom: "24px",
                  border: `1px solid ${theme.colors.primary}30`,
                }}
              >
                <h4
                  style={{
                    margin: "0 0 8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: theme.colors.primary,
                  }}
                >
                  Excel File Contents:
                </h4>
                <ul
                  style={{
                    margin: 0,
                    padding: "0 0 0 20px",
                    fontSize: "13px",
                    color: theme.colors.text,
                  }}
                >
                  <li>Summary sheet with company details and totals</li>
                  <li>Detailed invoices with GST breakup</li>
                  <li>Plan-wise breakup summary</li>
                  <li>User type-wise breakup summary</li>
                </ul>
              </div>

              {/* Export Button */}
              <button
                onClick={exportToExcel}
                disabled={isExporting || filteredCount === 0}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  background:
                    filteredCount === 0
                      ? theme.colors.border
                      : theme.colors.success,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: filteredCount === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  opacity: isExporting ? 0.7 : 1,
                }}
              >
                {isExporting ? (
                  <>
                    <Loader2
                      size={18}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Generating Invoices...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Export to Excel
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ==================== SUBSCRIPTION DETAIL MODAL ====================
const SubscriptionDetailModal = ({ subscription, onClose }: any) => {
  if (!subscription) return null;

  const plan = subscription.subscription_plan?.toLowerCase() || "free";
  const config = planConfig[plan] || planConfig.free;
  const IconComponent = config.icon;
  const profilePhotoUrl = getProfilePhotoUrl(subscription.user_photo);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${theme.colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: theme.colors.surface,
            zIndex: 10,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "700",
              color: theme.colors.text,
            }}
          >
            Subscription Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={24} color={theme.colors.textSecondary} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
            }}
          >
            <div
              style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
            >
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={subscription.full_name || subscription.name}
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${theme.colors.border}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: theme.colors.primary,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "700",
                  }}
                >
                  {subscription.full_name?.charAt(0) ||
                    subscription.name?.charAt(0) ||
                    "?"}
                </div>
              )}
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                    color: theme.colors.text,
                  }}
                >
                  {subscription.full_name || subscription.name}
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: theme.colors.primary,
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {subscription.headline || subscription.category || "N/A"}
                </p>
                {/* Contact Information */}
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {subscription.user_mobile && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <PhoneCall size={14} color={theme.colors.primary} />
                      <a
                        href={`tel:${subscription.user_mobile}`}
                        style={{
                          color: theme.colors.text,
                          textDecoration: "none",
                        }}
                      >
                        {subscription.user_mobile}
                      </a>
                    </div>
                  )}
                  {subscription.user_email && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <Mail size={14} color={theme.colors.primary} />
                      <a
                        href={`mailto:${subscription.user_email}`}
                        style={{
                          color: theme.colors.text,
                          textDecoration: "none",
                        }}
                      >
                        {subscription.user_email}
                      </a>
                    </div>
                  )}
                  {(subscription.user_city || subscription.user_pincode) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <MapPin size={14} color={theme.colors.primary} />
                      <span style={{ color: theme.colors.text }}>
                        {[subscription.user_city, subscription.user_pincode]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "8px",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background:
                      subscription.userType === "job_seeker"
                        ? "#DBEAFE"
                        : "#D1FAE5",
                    color:
                      subscription.userType === "job_seeker"
                        ? "#3B82F6"
                        : "#10B981",
                  }}
                >
                  {subscription.userType === "job_seeker" ? (
                    <Briefcase size={12} />
                  ) : (
                    <Users size={12} />
                  )}
                  {subscription.userType === "job_seeker"
                    ? "Job Seeker"
                    : "Worker"}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Plan Card */}
          <div
            style={{
              padding: "20px",
              background: config.bg,
              borderRadius: "12px",
              marginBottom: "24px",
              border: `2px solid ${config.color}20`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: config.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent size={24} color="white" />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Current Plan
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: config.color,
                      textTransform: "capitalize",
                    }}
                  >
                    {subscription.subscription_plan || "Free"}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Status
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "4px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: "#D1FAE5",
                    color: theme.colors.success,
                  }}
                >
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {subscription.experience_years !== undefined && (
              <div
                style={{
                  padding: "16px",
                  background: theme.colors.background,
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <TrendingUp size={16} color={theme.colors.textSecondary} />
                  <span
                    style={{
                      fontSize: "12px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Experience
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {subscription.experience_years} years
                </p>
              </div>
            )}

            {subscription.preferred_locations &&
              subscription.preferred_locations.length > 0 && (
                <div
                  style={{
                    padding: "16px",
                    background: theme.colors.background,
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <MapPin size={16} color={theme.colors.textSecondary} />
                    <span
                      style={{
                        fontSize: "12px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Location
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: "600",
                      color: theme.colors.text,
                    }}
                  >
                    {subscription.preferred_locations[0]}
                  </p>
                </div>
              )}

            {subscription.profile_views !== undefined && (
              <div
                style={{
                  padding: "16px",
                  background: theme.colors.background,
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <Eye size={16} color={theme.colors.textSecondary} />
                  <span
                    style={{
                      fontSize: "12px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Profile Views
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {subscription.profile_views}
                </p>
              </div>
            )}

            {subscription.jobs !== undefined && (
              <div
                style={{
                  padding: "16px",
                  background: theme.colors.background,
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <Briefcase size={16} color={theme.colors.textSecondary} />
                  <span
                    style={{
                      fontSize: "12px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Jobs Completed
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {subscription.jobs}
                </p>
              </div>
            )}

            {subscription.rating !== undefined && (
              <div
                style={{
                  padding: "16px",
                  background: theme.colors.background,
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <Star size={16} color={theme.colors.textSecondary} />
                  <span
                    style={{
                      fontSize: "12px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Rating
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {subscription.rating} / 5.0
                </p>
              </div>
            )}

            {subscription.user_kyc_status && (
              <div
                style={{
                  padding: "16px",
                  background: theme.colors.background,
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <Shield size={16} color={theme.colors.textSecondary} />
                  <span
                    style={{
                      fontSize: "12px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    KYC Status
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: theme.colors.text,
                    textTransform: "capitalize",
                  }}
                >
                  {subscription.user_kyc_status}
                </p>
              </div>
            )}
          </div>

          {/* Skills */}
          {subscription.skills && subscription.skills.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  margin: "0 0 12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Skills
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {subscription.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      padding: "6px 12px",
                      background: `${theme.colors.primary}15`,
                      color: theme.colors.primary,
                      borderRadius: "16px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== SUBSCRIPTIONS COMPONENT ====================
export const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"all" | "job_seeker" | "worker">(
    "all",
  );
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [showInvoiceExportModal, setShowInvoiceExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    basic: 0,
    premium: 0,
    gold: 0,
    enterprise: 0,
  });

  // Helper function to fetch user data by user_id
  const fetchUserData = async (userId: string) => {
    try {
      const userResponse = await fetch(
        `${API_BASE_URL}/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        },
      );
      if (userResponse.ok) {
        const userData = await userResponse.json();
        // Handle both possible response structures
        const user = userData.data?.user || userData.data;
        return {
          user_mobile: user?.mobile,
          user_photo: user?.profile_photo,
          user_email: user?.email,
          user_name: user?.name,
          user_city: user?.city,
          user_pincode: user?.pincode,
          user_kyc_status: user?.kyc_status,
        };
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
    return null;
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const allSubscriptions: any[] = [];

      // Fetch ALL job seekers (no pagination params - we'll paginate client-side)
      const jobSeekersResponse = await fetch(
        `${API_BASE_URL}/admin/job-seekers?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        },
      );
      if (jobSeekersResponse.ok) {
        const data = await jobSeekersResponse.json();
        const profiles = data.data?.profiles || [];

        // Fetch user data for each job seeker
        const profilesWithUserData = await Promise.all(
          profiles.map(async (profile: any) => {
            const userId = profile.user_id?.$oid || profile.user_id;
            const userData = userId ? await fetchUserData(userId) : null;
            return {
              ...profile,
              ...userData,
              id: profile.id || profile._id?.$oid,
              userType: "job_seeker",
              subscription_plan: profile.subscription_plan || "free",
            };
          }),
        );
        allSubscriptions.push(...profilesWithUserData);
      }

      // Fetch ALL workers (no pagination params - we'll paginate client-side)
      const workersResponse = await fetch(
        `${API_BASE_URL}/admin/workers?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        },
      );
      if (workersResponse.ok) {
        const data = await workersResponse.json();
        const workers = data.data?.workers || [];

        // Fetch user data for each worker
        const workersWithUserData = await Promise.all(
          workers.map(async (worker: any) => {
            const userId = worker.user_id?.$oid || worker.user_id;
            const userData = userId ? await fetchUserData(userId) : null;
            return {
              ...worker,
              ...userData,
              id: worker.id || worker._id?.$oid,
              userType: "worker",
              subscription_plan: worker.subscription_plan || "free",
            };
          }),
        );
        allSubscriptions.push(...workersWithUserData);
      }

      setSubscriptions(allSubscriptions);

      // Calculate stats
      const newStats = {
        total: allSubscriptions.length,
        free: 0,
        basic: 0,
        premium: 0,
        gold: 0,
        enterprise: 0,
      };
      allSubscriptions.forEach((sub) => {
        const plan = (sub.subscription_plan || "free").toLowerCase();
        if (plan in newStats) {
          (newStats as any)[plan]++;
        } else {
          newStats.free++;
        }
      });
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data only once on mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filter subscriptions based on search, view, and plan filters
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        (sub.full_name || sub.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (sub.headline || sub.category || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (sub.user_mobile || "").includes(searchQuery) ||
        (sub.user_email || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (sub.user_city || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesView = activeView === "all" || sub.userType === activeView;

      const subPlan = (sub.subscription_plan || "free").toLowerCase();
      const matchesPlan = planFilter === "all" || subPlan === planFilter;

      return matchesSearch && matchesView && matchesPlan;
    });
  }, [subscriptions, searchQuery, activeView, planFilter]);

  // Calculate pagination values
  const totalItems = filteredSubscriptions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSubscriptions.slice(startIndex, endIndex);
  }, [filteredSubscriptions, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeView, planFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPlanBadge = (plan: string) => {
    const normalizedPlan = (plan || "free").toLowerCase();
    const config = planConfig[normalizedPlan] || planConfig.free;
    const IconComponent = config.icon;

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          background: config.bg,
          color: config.color,
          textTransform: "capitalize",
        }}
      >
        <IconComponent size={14} />
        {plan || "Free"}
      </span>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total Users",
            value: stats.total,
            color: theme.colors.primary,
            icon: Users,
          },
          { label: "Free", value: stats.free, color: "#6B7280", icon: User },
          { label: "Basic", value: stats.basic, color: "#3B82F6", icon: Zap },
          {
            label: "Premium",
            value: stats.premium,
            color: "#8B5CF6",
            icon: Crown,
          },
          { label: "Gold", value: stats.gold, color: "#F59E0B", icon: Crown },
          {
            label: "Enterprise",
            value: stats.enterprise,
            color: "#10B981",
            icon: Shield,
          },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: theme.colors.surface,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{ fontSize: "13px", color: theme.colors.textSecondary }}
              >
                {stat.label}
              </span>
              <stat.icon size={18} color={stat.color} />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "700",
                color: stat.color,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: theme.colors.surface,
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: theme.colors.text,
              margin: 0,
            }}
          >
            All Subscriptions
          </h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {/* Export Invoice Button */}
            <button
              onClick={() => setShowInvoiceExportModal(true)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                background: theme.colors.success,
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              <FileSpreadsheet size={18} />
              Export Invoices
            </button>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                background: theme.colors.surface,
              }}
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="gold">Gold</option>
              <option value="enterprise">Enterprise</option>
            </select>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                color={theme.colors.textSecondary}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search by name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "10px 16px 10px 40px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  width: "280px",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: "12px",
          }}
        >
          {[
            { key: "all", label: "All Users", icon: Users },
            { key: "job_seeker", label: "Job Seekers", icon: Briefcase },
            { key: "worker", label: "Workers", icon: Users },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as any)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background:
                  activeView === tab.key ? theme.colors.primary : "transparent",
                color:
                  activeView === tab.key ? "white" : theme.colors.textSecondary,
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader2
              size={32}
              color={theme.colors.primary}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <p style={{ marginTop: "12px", color: theme.colors.textSecondary }}>
              Loading subscriptions...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Star
              size={48}
              color={theme.colors.border}
              style={{ marginBottom: "16px" }}
            />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>
              No Subscriptions Found
            </h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery
                ? "No results match your search."
                : "There are no subscriptions to display."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "User",
                    "Contact",
                    "Type",
                    "Plan",
                    "Details",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: theme.colors.textSecondary,
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${theme.colors.border}`,
                        background: theme.colors.background,
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedSubscriptions.map((sub: any, index: number) => {
                  const profilePhotoUrl = getProfilePhotoUrl(sub.user_photo);

                  return (
                    <tr
                      key={sub.id || index}
                      style={{
                        borderBottom: `1px solid ${theme.colors.border}`,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          theme.colors.background)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          {profilePhotoUrl ? (
                            <img
                              src={profilePhotoUrl}
                              alt={sub.full_name || sub.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: `2px solid ${theme.colors.border}`,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: theme.colors.primary,
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                                fontWeight: "700",
                              }}
                            >
                              {(sub.full_name || sub.name || "?").charAt(0)}
                            </div>
                          )}
                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                color: theme.colors.text,
                              }}
                            >
                              {sub.full_name || sub.name}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: theme.colors.textSecondary,
                              }}
                            >
                              {sub.headline || sub.category || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          {sub.user_mobile && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                color: theme.colors.textSecondary,
                              }}
                            >
                              <PhoneCall size={12} />
                              {sub.user_mobile}
                            </div>
                          )}
                          {sub.user_email && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                color: theme.colors.textSecondary,
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Mail size={12} style={{ flexShrink: 0 }} />
                              {sub.user_email}
                            </div>
                          )}
                          {sub.user_city && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                color: theme.colors.textSecondary,
                              }}
                            >
                              <MapPin size={12} />
                              {sub.user_city}
                            </div>
                          )}
                          {!sub.user_mobile &&
                            !sub.user_email &&
                            !sub.user_city && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: theme.colors.textSecondary,
                                }}
                              >
                                N/A
                              </span>
                            )}
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background:
                              sub.userType === "job_seeker"
                                ? "#DBEAFE"
                                : "#D1FAE5",
                            color:
                              sub.userType === "job_seeker"
                                ? "#3B82F6"
                                : "#10B981",
                          }}
                        >
                          {sub.userType === "job_seeker" ? (
                            <Briefcase size={12} />
                          ) : (
                            <Users size={12} />
                          )}
                          {sub.userType === "job_seeker"
                            ? "Job Seeker"
                            : "Worker"}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        {getPlanBadge(sub.subscription_plan)}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          color: theme.colors.textSecondary,
                          fontSize: "13px",
                        }}
                      >
                        {sub.userType === "job_seeker" ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <span>
                              {sub.experience_years
                                ? `${sub.experience_years} yrs exp`
                                : "N/A"}
                            </span>
                            <span>{sub.profile_views || 0} profile views</span>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <span>{sub.jobs || 0} jobs completed</span>
                            <span>
                              {sub.rating ? `${sub.rating} rating` : "N/A"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => setSelectedSubscription(sub)}
                          style={{
                            padding: "8px 16px",
                            background: theme.colors.primary,
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredSubscriptions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {selectedSubscription && (
        <SubscriptionDetailModal
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
        />
      )}

      {showInvoiceExportModal && (
        <InvoiceExportModal
          subscriptions={subscriptions}
          onClose={() => setShowInvoiceExportModal(false)}
        />
      )}
    </div>
  );
};
