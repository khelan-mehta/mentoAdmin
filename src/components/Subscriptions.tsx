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
  FileText,
  Calculator,
  Filter,
  CheckCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

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

// Plan pricing configuration (in INR) - these are INCLUSIVE of GST
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

// Company details for invoice (matching tax invoice format)
const COMPANY_INFO = {
  name: "MENTO SERVICES",
  address: "336, MOMINVAS, MUMANVAS, MAHESANA",
  district: "MAHESANA",
  pincode: "384330",
  city: "MAHESANA",
  state: "Gujarat",
  stateCode: "24",
  phone: "9316483819",
  gstin: "24GNCPR9725J1ZG",
};

// Bank details for invoice
const BANK_DETAILS = {
  bank: "BANK OF BARODA",
  branch: "SATLASANA",
  accountNo: "38240200001593",
  ifsc: "BARB0SATLAS",
};

// Invoice number tracking using localStorage
const INVOICE_STORAGE_KEY = "mento_invoice_data";

interface InvoiceTrackingData {
  counter: number;
  userInvoices: Record<string, string>;
}

const getInvoiceTrackingData = (): InvoiceTrackingData => {
  try {
    const data = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { counter: 0, userInvoices: {} };
};

const getOrCreateInvoiceNumber = (userId: string): string => {
  const data = getInvoiceTrackingData();
  if (data.userInvoices[userId]) {
    return data.userInvoices[userId];
  }
  data.counter++;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sequence = String(data.counter).padStart(5, "0");
  const invoiceNumber = `MENTO/${year}${month}/${sequence}`;
  data.userInvoices[userId] = invoiceNumber;
  localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(data));
  return invoiceNumber;
};

// Calculate GST (plan price is INCLUSIVE of GST - base is derived)
const calculateGSTInclusive = (planPrice: number, isInterState: boolean) => {
  if (planPrice === 0) {
    return {
      base: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalGst: 0,
      total: 0,
      roundOff: 0,
    };
  }
  const base = Math.round((planPrice / (1 + GST_RATE / 100)) * 100) / 100;
  if (isInterState) {
    const igst = Math.round(((base * IGST_RATE) / 100) * 100) / 100;
    const roundOff = Math.round((planPrice - base - igst) * 100) / 100;
    return {
      base,
      cgst: 0,
      sgst: 0,
      igst,
      totalGst: igst,
      total: planPrice,
      roundOff,
    };
  } else {
    const cgst = Math.round(((base * CGST_RATE) / 100) * 100) / 100;
    const sgst = Math.round(((base * SGST_RATE) / 100) * 100) / 100;
    const roundOff = Math.round((planPrice - base - cgst - sgst) * 100) / 100;
    return {
      base,
      cgst,
      sgst,
      igst: 0,
      totalGst: cgst + sgst,
      total: planPrice,
      roundOff,
    };
  }
};

// Number to words (Indian format)
const numberToWords = (num: number): string => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if (num === 0) return "Zero Only";
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  };
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees);
  if (paise > 0) {
    result += " and " + convert(paise) + " Paise";
  }
  return result + " Only";
};

// Get financial year period string
const getFinancialYearPeriod = (dateValue: any): string => {
  let date: Date;
  try {
    if (dateValue?.$date?.$numberLong) {
      date = new Date(parseInt(dateValue.$date.$numberLong));
    } else if (dateValue?.$date) {
      date = new Date(dateValue.$date);
    } else {
      date = new Date(dateValue);
    }
    if (isNaN(date.getTime())) date = new Date();
  } catch {
    date = new Date();
  }
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();
  const fyStart = month >= 3 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `01.04.${fyStart} to 31.03.${fyEnd}`;
};

// Fetch KYC details for a user
const fetchKycDetails = async (userId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/admin/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
      },
    });
    if (response.ok) {
      const result = await response.json();
      if (result.data && result.data.kyc_exists !== false) {
        return result.data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch KYC details:", err);
  }
  return null;
};

// Types for invoice
interface InvoiceItem {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity: string;
  customerState: string;
  customerAddress: string;
  customerPincode: string;
  customerDistrict: string;
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
  roundOff: number;
  paymentId: string;
  status: string;
  sacCode: string;
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
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Parse date from various formats (including subscription response format)
  const parseDateValue = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    try {
      if (dateValue?.$date?.$numberLong) {
        return new Date(parseInt(dateValue.$date.$numberLong));
      }
      if (dateValue?.$date) {
        return new Date(dateValue.$date);
      }
      const d = new Date(dateValue);
      if (!isNaN(d.getTime())) return d;
    } catch {}
    return null;
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

      // Filter by date range (subscription expiry date)
      if (dateFrom || dateTo) {
        const subDate = parseDateValue(
          sub.subscription_expires_at || sub.created_at,
        );
        if (subDate) {
          if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            if (subDate < from) return false;
          }
          if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            if (subDate > to) return false;
          }
        }
      }

      return true;
    });
  };

  // Format date for display
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return new Date().toISOString().split("T")[0];
    try {
      const parsed = parseDateValue(dateValue);
      if (parsed && !isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
      }
      return new Date().toISOString().split("T")[0];
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

      // Create invoice data with GST-inclusive calculation (full precision, no rounding)
      const invoiceData: InvoiceItem[] = filtered.map((sub) => {
        const plan = (sub.subscription_plan || "free").toLowerCase();
        const planPrice = planPricing[plan] || 0;
        const userId = sub.user_id?.$oid || sub.user_id || sub.id || "";

        // Determine inter/intra state from user's KYC state
        const userState = (sub.kyc_state || "").toLowerCase();
        const companyState = COMPANY_INFO.state.toLowerCase();
        const isUserInterState = userState && userState !== companyState;
        const useInterState = isInterState || isUserInterState;

        // Full-precision GST calculation (plan price is inclusive of GST)
        const base = planPrice > 0 ? planPrice / (1 + GST_RATE / 100) : 0;
        const cgstAmt = useInterState ? 0 : (base * CGST_RATE) / 100;
        const sgstAmt = useInterState ? 0 : (base * SGST_RATE) / 100;
        const igstAmt = useInterState ? (base * IGST_RATE) / 100 : 0;
        const totalGstAmt = cgstAmt + sgstAmt + igstAmt;

        return {
          invoiceNumber: getOrCreateInvoiceNumber(userId),
          invoiceDate: invoiceDate.toISOString().split("T")[0],
          customerName: sub.full_name || sub.name || "N/A",
          customerEmail: sub.user_email || "N/A",
          customerPhone: sub.user_mobile || "N/A",
          customerCity: sub.kyc_city || sub.user_city || "N/A",
          customerState: sub.kyc_state || "N/A",
          customerAddress: sub.kyc_address || "N/A",
          customerPincode: sub.kyc_pincode || sub.user_pincode || "N/A",
          customerDistrict: sub.kyc_city || sub.user_city || "N/A",
          userType: sub.userType === "job_seeker" ? "Job Seeker" : "Worker",
          planName:
            (sub.subscription_plan || "Free").charAt(0).toUpperCase() +
            (sub.subscription_plan || "free").slice(1),
          subscriptionStartDate: formatDate(
            sub.subscription_starts_at || sub.created_at,
          ),
          subscriptionEndDate: formatDate(sub.subscription_expires_at),
          basePrice: base,
          cgstRate: useInterState ? 0 : CGST_RATE,
          cgstAmount: cgstAmt,
          sgstRate: useInterState ? 0 : SGST_RATE,
          sgstAmount: sgstAmt,
          igstRate: useInterState ? IGST_RATE : 0,
          igstAmount: igstAmt,
          totalGst: totalGstAmt,
          totalAmount: planPrice,
          roundOff: 0,
          paymentId: sub.payment_id || "N/A",
          status: "Active",
          sacCode: "998314",
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

      // Sheet 2: Detailed Invoices (matching tax invoice format)
      const invoiceHeaders = [
        "Invoice Number",
        "Invoice Date",
        "Customer Name",
        "Email",
        "Phone",
        "City",
        "State",
        "Pincode",
        "User Type",
        "Plan Name",
        "SAC Code",
        "Taxable Amount",
        "CGST Rate (%)",
        "CGST Amount (INR)",
        "SGST Rate (%)",
        "SGST Amount (INR)",
        "IGST Rate (%)",
        "IGST Amount (INR)",
        "Total GST (INR)",
        "Total (INR)",
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
        inv.customerState,
        inv.customerPincode,
        inv.userType,
        inv.planName,
        inv.sacCode,
        inv.basePrice,
        inv.cgstRate || "",
        inv.cgstAmount || "",
        inv.sgstRate || "",
        inv.sgstAmount || "",
        inv.igstRate || "",
        inv.igstAmount || "",
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
        { wch: 22 }, // Invoice Number
        { wch: 12 }, // Invoice Date
        { wch: 20 }, // Customer Name
        { wch: 20 }, // Email
        { wch: 15 }, // Phone
        { wch: 15 }, // City
        { wch: 15 }, // State
        { wch: 10 }, // Pincode
        { wch: 12 }, // User Type
        { wch: 12 }, // Plan Name
        { wch: 10 }, // SAC Code
        { wch: 18 }, // Taxable Amount
        { wch: 14 }, // CGST Rate
        { wch: 18 }, // CGST Amount
        { wch: 14 }, // SGST Rate
        { wch: 18 }, // SGST Amount
        { wch: 14 }, // IGST Rate
        { wch: 18 }, // IGST Amount
        { wch: 18 }, // Total GST
        { wch: 15 }, // Total
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

              {/* Date Range Filter */}
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
                  <Calendar
                    size={14}
                    style={{ marginRight: "6px", verticalAlign: "middle" }}
                  />
                  Date Range (Subscription Expiry)
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: theme.colors.textSecondary,
                        marginBottom: "4px",
                      }}
                    >
                      From
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: `1px solid ${theme.colors.border}`,
                        fontSize: "14px",
                        outline: "none",
                        background: theme.colors.surface,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: theme.colors.textSecondary,
                        marginBottom: "4px",
                      }}
                    >
                      To
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: `1px solid ${theme.colors.border}`,
                        fontSize: "14px",
                        outline: "none",
                        background: theme.colors.surface,
                      }}
                    />
                  </div>
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    style={{
                      marginTop: "8px",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.colors.border}`,
                      background: "transparent",
                      color: theme.colors.textSecondary,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Clear dates
                  </button>
                )}
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!subscription) return null;

  const plan = subscription.subscription_plan?.toLowerCase() || "free";
  const config = planConfig[plan] || planConfig.free;
  const IconComponent = config.icon;
  const profilePhotoUrl = getProfilePhotoUrl(subscription.user_photo);

  const generateInvoicePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Fetch KYC details for location info
      const userId =
        subscription.user_id?.$oid ||
        subscription.user_id ||
        subscription.id ||
        "";
      let kycData: any = null;
      if (userId) {
        kycData = await fetchKycDetails(userId);
      }

      // Get customer location details from KYC or fallback
      const customerName =
        kycData?.full_name ||
        subscription.full_name ||
        subscription.name ||
        "N/A";
      const customerAddress = kycData?.address || "";
      const customerCity = kycData?.city || subscription.user_city || "";
      const customerState = kycData?.state || COMPANY_INFO.state;
      const customerPincode =
        kycData?.pincode || subscription.user_pincode || "";
      const customerDistrict = kycData?.city || subscription.user_city || "";

      // Determine inter/intra state GST
      const isInterState =
        customerState.toLowerCase() !== COMPANY_INFO.state.toLowerCase();

      // GST-inclusive calculation
      const planPrice = planPricing[plan] || 0;
      const gst = calculateGSTInclusive(planPrice, isInterState);

      // Get or create persistent invoice number
      const invoiceNumber = getOrCreateInvoiceNumber(userId);
      const invoiceDate = new Date();
      const invoiceDateStr = `${String(invoiceDate.getDate()).padStart(2, "0")}-${String(invoiceDate.getMonth() + 1).padStart(2, "0")}-${invoiceDate.getFullYear()}`;

      // Subscription period
      const period = getFinancialYearPeriod(
        subscription.subscription_expires_at || subscription.created_at,
      );

      // Plan display name
      const planDisplayName =
        "MENTO " + (subscription.subscription_plan || "Free").toUpperCase();

      // Create PDF (A4: 210 x 297 mm)
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const LM = 10; // left margin
      const RM = pageWidth - 10; // right margin
      const TW = RM - LM; // table width = 190
      const MID = LM + TW / 2; // midpoint

      doc.setDrawColor(0);
      doc.setLineWidth(0.3);

      let y = 10;

      // ===== COMPANY HEADER (no border) =====
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(COMPANY_INFO.name, pageWidth / 2, y + 6, { align: "center" });
      y += 10;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(COMPANY_INFO.address, pageWidth / 2, y + 4, { align: "center" });
      y += 5;
      doc.text(
        `Dist:${COMPANY_INFO.district}, ${COMPANY_INFO.pincode}`,
        pageWidth / 2,
        y + 4,
        { align: "center" },
      );
      y += 5;
      doc.text(`Mo:${COMPANY_INFO.phone}`, pageWidth / 2, y + 4, {
        align: "center",
      });
      y += 5;
      doc.text(`GSTIN : ${COMPANY_INFO.gstin}`, pageWidth / 2, y + 4, {
        align: "center",
      });
      y += 6;

      // TAX INVOICE title
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TAX INVOICE", pageWidth / 2, y + 4, { align: "center" });
      y += 7;

      // ===== INVOICE INFO ROW =====
      const invRowH = 14;
      doc.rect(LM, y, TW, invRowH);
      doc.line(MID - 5, y, MID - 5, y + invRowH); // vertical divider

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice No:", LM + 2, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text(invoiceNumber, LM + 28, y + 5);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice Date:", LM + 2, y + 11);
      doc.setFont("helvetica", "normal");
      doc.text(invoiceDateStr, LM + 32, y + 11);

      doc.setFont("helvetica", "bold");
      doc.text("Period:", MID - 3, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text(period, MID + 12, y + 5);
      y += invRowH;

      // ===== BUYER / CONSIGNEE ROW =====
      const buyerH = 38;
      doc.rect(LM, y, TW, buyerH);
      doc.line(MID, y, MID, y + buyerH);

      // Buyer (left)
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Buyer:", LM + 2, y + 5);
      doc.text("M/S,", LM + 2, y + 11);
      doc.setFont("helvetica", "normal");
      doc.text(customerName.toUpperCase(), LM + 16, y + 11);
      if (customerAddress) {
        doc.text(customerAddress.toUpperCase(), LM + 16, y + 16);
      }
      if (customerCity || customerDistrict) {
        doc.text(
          `${customerCity ? customerCity.toUpperCase() + ", " : ""}${customerDistrict ? customerDistrict.toUpperCase() : ""}`,
          LM + 16,
          y + 21,
        );
      }
      if (customerPincode) {
        doc.text(
          `DIST, ${customerDistrict.toUpperCase()} ${customerPincode}`,
          LM + 16,
          y + 26,
        );
      }

      // Consignee (right)
      doc.setFont("helvetica", "bold");
      doc.text("Consignee:", MID + 2, y + 5);
      doc.text("M/s,", MID + 2, y + 11);
      doc.setFont("helvetica", "normal");
      doc.text(customerName.toUpperCase(), MID + 16, y + 11);
      if (customerAddress) {
        doc.text(customerAddress.toUpperCase(), MID + 16, y + 16);
      }
      if (customerCity || customerDistrict) {
        doc.text(
          `${customerCity ? customerCity.toUpperCase() + ", " : ""}${customerDistrict ? customerDistrict.toUpperCase() : ""}`,
          MID + 16,
          y + 21,
        );
      }
      if (customerPincode) {
        doc.text(
          `DIST, ${customerDistrict.toUpperCase()} ${customerPincode}`,
          MID + 16,
          y + 26,
        );
      }
      y += buyerH;

      // ===== STATE / STATE CODE / GSTIN ROW =====
      const stateRowH = 14;
      doc.rect(LM, y, TW, stateRowH);
      doc.setFont("helvetica", "bold");
      doc.text("State:", LM + 2, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text(customerState, LM + 18, y + 5);
      doc.setFont("helvetica", "bold");
      doc.text("State Code", LM + 58, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text(
        customerState.toLowerCase() === "gujarat" ? "24" : "",
        LM + 82,
        y + 5,
      );
      doc.setFont("helvetica", "bold");
      doc.text("GSTIN:", LM + 2, y + 11);
      y += stateRowH;

      // ===== ITEMS TABLE HEADER =====
      const colX = [
        LM,
        LM + 20,
        LM + 75,
        LM + 105,
        LM + 125,
        LM + 140,
        LM + 160,
        RM,
      ];
      const colHeaders = [
        "Sr.No.",
        "Description Of Goods",
        "SAC Code",
        "Qty.",
        "Unit",
        "Rate",
        "Amount",
      ];
      const headerH = 8;

      doc.setFillColor(240, 240, 240);
      doc.rect(LM, y, TW, headerH, "FD");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      for (let i = 0; i < colHeaders.length; i++) {
        doc.text(colHeaders[i], colX[i] + 2, y + 5.5);
        if (i < colHeaders.length) {
          doc.line(colX[i], y, colX[i], y + headerH);
        }
      }
      doc.line(RM, y, RM, y + headerH);
      y += headerH;

      // ===== ITEMS TABLE ROW =====
      const itemRowH = 40; // enough space for item + empty rows
      doc.rect(LM, y, TW, itemRowH);
      for (let i = 0; i < colX.length; i++) {
        doc.line(colX[i], y, colX[i], y + itemRowH);
      }
      doc.line(RM, y, RM, y + itemRowH);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      // Row data
      const itemY = y + 10;
      doc.text("1", colX[0] + 8, itemY, { align: "center" });
      doc.text(planDisplayName, colX[1] + 2, itemY);
      doc.text("998314", colX[2] + 2, itemY);
      doc.text("1.000", colX[3] + 2, itemY);
      doc.text("1", colX[4] + 2, itemY);
      doc.text(gst.base.toFixed(2), colX[5] + 2, itemY);
      doc.text(gst.base.toFixed(2), colX[6] + 2, itemY);

      // Subtotal line at bottom of item area
      const subTotalY = y + itemRowH;
      doc.rect(LM, subTotalY, TW, 7);
      for (let i = 0; i < colX.length; i++) {
        doc.line(colX[i], subTotalY, colX[i], subTotalY + 7);
      }
      doc.line(RM, subTotalY, RM, subTotalY + 7);
      doc.setFont("helvetica", "bold");
      doc.text(gst.base.toFixed(2), colX[6] + 2, subTotalY + 5);
      y = subTotalY + 7;

      // ===== AMOUNT IN WORDS + GST SUMMARY =====
      const gstSummaryH = 40;
      doc.rect(LM, y, TW, gstSummaryH);
      const gstDivX = LM + 110;
      doc.line(gstDivX, y, gstDivX, y + gstSummaryH);

      // Left side: Amount in words
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Amount In Words:", LM + 2, y + 6);
      doc.setFont("helvetica", "normal");
      doc.text(numberToWords(Math.round(gst.total)), LM + 35, y + 6);

      // Right side: GST breakdown
      let gstY = y + 6;
      const gstLabelX = gstDivX + 2;
      const gstPctX = gstDivX + 28;
      const gstAmtX = RM - 2;

      doc.setFont("helvetica", "bold");
      doc.text("SGST", gstLabelX, gstY);
      doc.text(`${SGST_RATE}.00%`, gstPctX, gstY);
      doc.text(isInterState ? "" : gst.sgst.toFixed(2), gstAmtX, gstY, {
        align: "right",
      });
      doc.line(gstDivX, gstY + 2, RM, gstY + 2);
      gstY += 8;

      doc.text("CGST", gstLabelX, gstY);
      doc.text(`${CGST_RATE}.00%`, gstPctX, gstY);
      doc.text(isInterState ? "" : gst.cgst.toFixed(2), gstAmtX, gstY, {
        align: "right",
      });
      doc.line(gstDivX, gstY + 2, RM, gstY + 2);
      gstY += 8;

      doc.text("IGST", gstLabelX, gstY);
      doc.text(`${IGST_RATE}%`, gstPctX, gstY);
      doc.text(isInterState ? gst.igst.toFixed(2) : "", gstAmtX, gstY, {
        align: "right",
      });
      doc.line(gstDivX, gstY + 2, RM, gstY + 2);
      gstY += 8;

      doc.text("Round Off", gstLabelX, gstY);
      doc.text(gst.roundOff.toFixed(2), gstAmtX, gstY, { align: "right" });
      doc.line(gstDivX, gstY + 2, RM, gstY + 2);
      gstY += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Net Amount", gstLabelX, gstY);
      doc.text(gst.total.toFixed(2), gstAmtX, gstY, { align: "right" });
      y += gstSummaryH;

      // ===== BANK DETAILS + AUTHORISED SIGNATURE =====
      const bankH = 50;
      doc.rect(LM, y, TW, bankH);
      doc.line(MID, y, MID, y + bankH);

      // Left: Bank details
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Bank Deitails:-", LM + 2, y + 6);
      let bankY = y + 12;
      doc.setFont("helvetica", "bold");
      doc.text("BANK", LM + 2, bankY);
      doc.setFont("helvetica", "normal");
      doc.text(BANK_DETAILS.bank, LM + 30, bankY);
      bankY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("BRANCH:", LM + 2, bankY);
      doc.setFont("helvetica", "normal");
      doc.text(BANK_DETAILS.branch, LM + 30, bankY);
      bankY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("A/C", LM + 2, bankY);
      doc.setFont("helvetica", "normal");
      doc.text(BANK_DETAILS.accountNo, LM + 30, bankY);
      bankY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("IFSC", LM + 2, bankY);
      doc.setFont("helvetica", "normal");
      doc.text(BANK_DETAILS.ifsc, LM + 30, bankY);

      // Right: For, Company + Authorised Signature
      doc.setFont("helvetica", "normal");
      doc.text("For,", MID + 2, y + 6);
      doc.setFont("helvetica", "bold");
      doc.text(COMPANY_INFO.name, MID + 20, y + 12);
      doc.setFont("helvetica", "italic");
      doc.text("Authorised Signature", RM - 5, y + bankH - 5, {
        align: "right",
      });
      y += bankH;

      // ===== TERMS =====
      const termsH = 12;
      doc.rect(LM, y, TW, termsH);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Terms:", LM + 2, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text("Subject to Satlasana Jurisdiction Only", LM + 2, y + 10);
      y += termsH;

      // ===== FOOTER =====
      const footerH = 8;
      doc.rect(LM, y, TW, footerH);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("E.& O.E.", LM + 2, y + 5);
      doc.setFont("helvetica", "italic");
      doc.text("This is Computer Generate Invoice", pageWidth / 2, y + 5, {
        align: "center",
      });

      // Save PDF
      doc.save(
        `invoice-${customerName.replace(/\s+/g, "_")}-${invoiceDate.toISOString().split("T")[0]}.pdf`,
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate invoice PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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

          {/* Download Invoice PDF Button */}
          {plan !== "free" && plan !== "none" && (
            <button
              onClick={generateInvoicePdf}
              disabled={isGeneratingPdf}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: theme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: isGeneratingPdf ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
                opacity: isGeneratingPdf ? 0.7 : 1,
              }}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Generating Invoice PDF...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Download Invoice PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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

  // Helper function to fetch user data by user_id (includes KYC location data)
  const fetchUserData = async (userId: string) => {
    try {
      const authHeader = {
        Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
      };

      // Fetch user data and KYC data in parallel
      const [userResponse, kycResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users/${userId}`, { headers: authHeader }),
        fetch(`${API_BASE_URL}/kyc/admin/user/${userId}`, {
          headers: authHeader,
        }).catch(() => null),
      ]);

      let userData: any = {};
      if (userResponse.ok) {
        const result = await userResponse.json();
        const user = result.data?.user || result.data;
        userData = {
          user_mobile: user?.mobile,
          user_photo: user?.profile_photo,
          user_email: user?.email,
          user_name: user?.name,
          user_city: user?.city,
          user_pincode: user?.pincode,
          user_kyc_status: user?.kyc_status,
        };
      }

      // Merge KYC location data if available
      if (kycResponse && kycResponse.ok) {
        const kycResult = await kycResponse.json();
        const kyc = kycResult.data;
        if (kyc && kyc.kyc_exists !== false) {
          userData.kyc_address = kyc.address;
          userData.kyc_city = kyc.city;
          userData.kyc_state = kyc.state;
          userData.kyc_pincode = kyc.pincode;
          userData.kyc_full_name = kyc.full_name;
        }
      }

      return userData;
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
