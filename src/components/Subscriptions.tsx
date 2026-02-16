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
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Check,
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
  basic: 99,
  silver: 499,

  gold: 799,
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

// Check if a state value represents Gujarat (handles common variations/typos)
const isGujaratState = (state: string): boolean => {
  if (!state) return false;
  const s = state.trim().toLowerCase();
  return (
    s === "gujarat" ||
    s === "gujrat" ||
    s === "gujrath" ||
    s === "24" ||
    s === "gj"
  );
};

// Check if a pincode belongs to Gujarat (360xxx - 396xxx)
const isGujaratPincode = (pincode: string): boolean => {
  if (!pincode) return false;
  const p = pincode.trim().replace(/\s/g, "");
  if (p.length !== 6 || !/^\d{6}$/.test(p)) return false;
  const prefix = parseInt(p.substring(0, 2), 10);
  return prefix >= 36 && prefix <= 39;
};

// Determine if a customer is from Gujarat using state and pincode
const isCustomerFromGujarat = (state: string, pincode: string): boolean => {
  if (state && state.trim()) return isGujaratState(state);
  return isGujaratPincode(pincode);
};

// Bank details for invoice
const BANK_DETAILS = {
  bank: "BANK OF BARODA",
  branch: "SATLASANA",
  accountNo: "38240200001593",
  ifsc: "BARB0SATLAS",
};

// Invoice number tracking using localStorage, keyed by subscription ID
const INVOICE_STORAGE_KEY = "mento_invoice_data";

interface InvoiceTrackingData {
  counter: number;
  subscriptionInvoices: Record<string, string>;
}

const getInvoiceTrackingData = (): InvoiceTrackingData => {
  try {
    const data = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Migration: handle old format that used userInvoices key
      if (parsed.userInvoices && !parsed.subscriptionInvoices) {
        return {
          counter: parsed.counter || 0,
          subscriptionInvoices: parsed.userInvoices,
        };
      }
      return {
        counter: parsed.counter || 0,
        subscriptionInvoices: parsed.subscriptionInvoices || {},
      };
    }
  } catch {}
  return { counter: 0, subscriptionInvoices: {} };
};

// Get current financial year string (Indian FY: April-March)
// e.g. if current date is Feb 2026, FY is "2025-26"
const getCurrentFinancialYear = (): string => {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed (0=Jan, 3=Apr)
  const year = now.getFullYear();
  const fyStart = month >= 3 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `${fyStart}-${String(fyEnd).slice(2)}`;
};

// Assign sequential invoice numbers to all subscriptions in display order.
// Only assigns new numbers; existing assignments are never changed.
// Uses current financial year in format: MENTO/FY2025-26/00001
const assignInvoiceNumbers = (subscriptions: any[]): void => {
  const data = getInvoiceTrackingData();
  let changed = false;
  const fy = getCurrentFinancialYear();

  for (const sub of subscriptions) {
    const subId = sub.id || sub._id?.$oid || "";
    if (!subId) continue;
    if (data.subscriptionInvoices[subId]) continue;

    data.counter++;
    const sequence = String(data.counter).padStart(5, "0");
    data.subscriptionInvoices[subId] = `MENTO/FY${fy}/${sequence}`;
    changed = true;
  }

  if (changed) {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(data));
  }
};

// Get the invoice number for a subscription (must be pre-assigned via assignInvoiceNumbers)
const getInvoiceNumber = (subscriptionId: string): string => {
  const data = getInvoiceTrackingData();
  return data.subscriptionInvoices[subscriptionId] || "";
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
  const [gstType, setGstType] = useState<"auto" | "intra" | "inter">("auto");

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

      const invoiceDate = new Date();

      // Create invoice data with GST-inclusive calculation (full precision, no rounding)
      const invoiceData: InvoiceItem[] = filtered.map((sub) => {
        const plan = (sub.subscription_plan || "free").toLowerCase();
        const planPrice = planPricing[plan] || 0;
        const subId = sub.id || sub._id?.$oid || "";

        // Determine inter/intra state per subscription using state + pincode
        const userState = (sub.kyc_state || "").trim();
        const userPincode = (sub.kyc_pincode || sub.user_pincode || "").trim();
        let useInterState: boolean;
        if (gstType === "auto") {
          // Auto-detect: Gujarat customers → intra-state (CGST+SGST), others → inter-state (IGST)
          // Falls back to pincode (Gujarat: 36xxxx-39xxxx) if state is missing
          useInterState = !isCustomerFromGujarat(userState, userPincode);
        } else {
          // Manual override: force intra or inter for all
          useInterState = gstType === "inter";
        }

        // Full-precision GST calculation (plan price is inclusive of GST)
        const base = planPrice > 0 ? planPrice / (1 + GST_RATE / 100) : 0;
        const cgstAmt = useInterState ? 0 : (base * CGST_RATE) / 100;
        const sgstAmt = useInterState ? 0 : (base * SGST_RATE) / 100;
        const igstAmt = useInterState ? (base * IGST_RATE) / 100 : 0;
        const totalGstAmt = cgstAmt + sgstAmt + igstAmt;

        return {
          invoiceNumber:
            getInvoiceNumber(subId) ||
              `MENTO/FY${getCurrentFinancialYear()}/00000`,
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
          gstType === "auto"
            ? "Auto (Per customer state - Gujarat: CGST+SGST, Others: IGST)"
            : gstType === "inter"
              ? "Inter-State (IGST)"
              : "Intra-State (CGST + SGST)",
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
                  {[
                    { key: "auto", label: "Auto (By Customer State)" },
                    { key: "intra", label: "Intra-State (CGST + SGST)" },
                    { key: "inter", label: "Inter-State (IGST)" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setGstType(option.key as any)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: `2px solid ${gstType === option.key ? theme.colors.primary : theme.colors.border}`,
                        background:
                          gstType === option.key
                            ? `${theme.colors.primary}10`
                            : "transparent",
                        color:
                          gstType === option.key
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
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  {gstType === "auto"
                    ? "Gujarat (by state or pincode 36xxxx-39xxxx): CGST + SGST, Others: IGST"
                    : gstType === "intra"
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

                  <option value="basic">Basic</option>
                  <option value="silver">Silver</option>

                  <option value="gold">Gold</option>
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
      const customerState = (
        kycData?.state ||
        subscription.kyc_state ||
        ""
      ).trim();
      const customerPincode =
        kycData?.pincode ||
        subscription.kyc_pincode ||
        subscription.user_pincode ||
        "";
      const customerDistrict =
        kycData?.city || subscription.kyc_city || subscription.user_city || "";

      // Determine inter/intra state GST based on customer's state + pincode
      // Gujarat customers → intra-state (CGST+SGST), others → inter-state (IGST)
      // If state is unknown, fall back to pincode (Gujarat: 36xxxx-39xxxx)
      const isInterState = !isCustomerFromGujarat(
        customerState,
        customerPincode,
      );

      // GST-inclusive calculation
      const planPrice = planPricing[plan] || 0;
      const gst = calculateGSTInclusive(planPrice, isInterState);

      // Get persistent invoice number from frontend sequential assignment
      const subId = subscription.id || subscription._id?.$oid || "";
      const invoiceDate = new Date();
      const invoiceNumber =
        getInvoiceNumber(subId) ||
        `MENTO/FY${getCurrentFinancialYear()}/00000`;
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
      const displayState = customerState || COMPANY_INFO.state;
      doc.setFont("helvetica", "bold");
      doc.text("State:", LM + 2, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text(displayState, LM + 18, y + 5);
      doc.setFont("helvetica", "bold");
      doc.text("State Code", LM + 58, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text(!isInterState ? "24" : "", LM + 82, y + 5);
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
      // Build tax rows: only include CGST/SGST for intra-state (Gujarat),
      // only include IGST for inter-state (non-Gujarat). Skip rows with 0 value.
      const taxRows: Array<{ label: string; rate: string; amount: string }> =
        [];
      if (!isInterState) {
        // Gujarat (intra-state): SGST + CGST only
        if (gst.sgst > 0)
          taxRows.push({
            label: "SGST",
            rate: `${SGST_RATE}.00%`,
            amount: gst.sgst.toFixed(2),
          });
        if (gst.cgst > 0)
          taxRows.push({
            label: "CGST",
            rate: `${CGST_RATE}.00%`,
            amount: gst.cgst.toFixed(2),
          });
      } else {
        // Non-Gujarat (inter-state): IGST only
        if (gst.igst > 0)
          taxRows.push({
            label: "IGST",
            rate: `${IGST_RATE}%`,
            amount: gst.igst.toFixed(2),
          });
      }
      taxRows.push({
        label: "Round Off",
        rate: "",
        amount: gst.roundOff.toFixed(2),
      });
      // +1 for Net Amount row at the end
      const gstSummaryH = 6 + (taxRows.length + 1) * 8 + 2;

      doc.rect(LM, y, TW, gstSummaryH);
      const gstDivX = LM + 110;
      doc.line(gstDivX, y, gstDivX, y + gstSummaryH);

      // Left side: Amount in words
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Amount In Words:", LM + 2, y + 6);
      doc.setFont("helvetica", "normal");
      doc.text(numberToWords(Math.round(gst.total)), LM + 35, y + 6);

      // Right side: GST breakdown (only non-zero tax rows)
      let gstY = y + 6;
      const gstLabelX = gstDivX + 2;
      const gstPctX = gstDivX + 28;
      const gstAmtX = RM - 2;

      doc.setFont("helvetica", "bold");
      for (const row of taxRows) {
        doc.text(row.label, gstLabelX, gstY);
        if (row.rate) doc.text(row.rate, gstPctX, gstY);
        doc.text(row.amount, gstAmtX, gstY, { align: "right" });
        doc.line(gstDivX, gstY + 2, RM, gstY + 2);
        gstY += 8;
      }

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

// ==================== CREATE/EDIT SUBSCRIPTION MODAL ====================
const CreateSubscriptionModal = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const [userId, setUserId] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("worker");
  const [planName, setPlanName] = useState("silver");
  const [price, setPrice] = useState("99");
  const [durationDays, setDurationDays] = useState("30");
  const [paymentId, setPaymentId] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);

  // Search user state
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setUserId("");
      setSubscriptionType("worker");
      setPlanName("silver");
      setPrice("99");
      setDurationDays("30");
      setPaymentId("");
      setAutoRenew(false);
      setUserSearch("");
      setUserResults([]);
      setSelectedUser(null);
    }
  }, [isOpen]);

  // Update price when plan changes
  useEffect(() => {
    const prices: Record<string, string> = {
      silver: "99",
      gold: "299",
      basic: "99",
      premium: "199",
      job_seeker_premium: "199",
      enterprise: "499",
    };
    setPrice(prices[planName] || "99");
  }, [planName]);

  const searchUsers = async () => {
    if (!userSearch.trim()) return;
    setSearchLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users?search=${encodeURIComponent(userSearch)}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setUserResults(data.data?.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectUser = (user: any) => {
    const id = user._id?.$oid || user._id || user.id;
    setUserId(id);
    setSelectedUser(user);
    setUserResults([]);
    setUserSearch("");
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!userId.trim()) return;
    onSave({
      user_id: userId,
      subscription_type: subscriptionType,
      plan_name: planName,
      price: parseFloat(price) || 0,
      duration_days: parseInt(durationDays) || 30,
      payment_id: paymentId || undefined,
      auto_renew: autoRenew,
    });
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
          maxWidth: "560px",
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
            Create Subscription
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
          {/* User Search */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              User *
            </label>
            {selectedUser ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.primary}`,
                  background: `${theme.colors.primary}08`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: theme.colors.text,
                      fontSize: "14px",
                    }}
                  >
                    {selectedUser.name || "Unknown"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {selectedUser.mobile}{" "}
                    {selectedUser.email ? `| ${selectedUser.email}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserId("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X size={16} color={theme.colors.textSecondary} />
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                    placeholder="Search by name, mobile, or email..."
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.colors.border}`,
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={searchUsers}
                    disabled={searchLoading}
                    style={{
                      padding: "10px 16px",
                      background: theme.colors.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {searchLoading ? (
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Search size={16} />
                    )}
                  </button>
                </div>
                {/* Or manual entry */}
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Or enter User ID directly:
                </div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter MongoDB ObjectId..."
                  style={{
                    marginTop: "4px",
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {/* Search Results */}
                {userResults.length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: "8px",
                      maxHeight: "200px",
                      overflow: "auto",
                    }}
                  >
                    {userResults.map((user: any, idx: number) => (
                      <div
                        key={user._id?.$oid || idx}
                        onClick={() => selectUser(user)}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderBottom:
                            idx < userResults.length - 1
                              ? `1px solid ${theme.colors.border}`
                              : "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            theme.colors.background)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: theme.colors.text,
                          }}
                        >
                          {user.name || "Unknown"}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: theme.colors.textSecondary,
                          }}
                        >
                          {user.mobile}
                          {user.email ? ` | ${user.email}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subscription Type */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Subscription Type *
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { key: "worker", label: "Worker", icon: Users },
                { key: "jobseeker", label: "Job Seeker", icon: Briefcase },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSubscriptionType(opt.key)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: `2px solid ${subscriptionType === opt.key ? theme.colors.primary : theme.colors.border}`,
                    background:
                      subscriptionType === opt.key
                        ? `${theme.colors.primary}10`
                        : "transparent",
                    color:
                      subscriptionType === opt.key
                        ? theme.colors.primary
                        : theme.colors.text,
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <opt.icon size={16} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Name */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Plan *
            </label>
            <select
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
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
              <option value="silver">Silver - Rs.99</option>
              <option value="gold">Gold - Rs.299</option>
              <option value="basic">Basic - Rs.99</option>
              <option value="premium">Premium - Rs.199</option>
              <option value="enterprise">Enterprise - Rs.499</option>
            </select>
          </div>

          {/* Price and Duration Row */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Price (INR)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Duration (days)
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Payment ID */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Payment ID (optional)
            </label>
            <input
              type="text"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="e.g., pay_xxxxxxxxxxxxxxxx"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Auto Renew */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              Auto-renew subscription
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!userId.trim() || isLoading}
              style={{
                flex: 1,
                padding: "12px",
                background: theme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: userId.trim() && !isLoading ? "pointer" : "not-allowed",
                opacity: userId.trim() && !isLoading ? 1 : 0.6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isLoading ? (
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Check size={16} />
              )}
              Create Subscription
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ==================== DELETE SUBSCRIPTION MODAL ====================
const DeleteSubscriptionModal = ({
  isOpen,
  onClose,
  onConfirm,
  subscription,
  isLoading,
}: any) => {
  if (!isOpen) return null;

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
          maxWidth: "400px",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertCircle size={28} color={theme.colors.danger} />
          </div>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "18px",
              fontWeight: "700",
              color: theme.colors.text,
            }}
          >
            Delete Subscription?
          </h3>
          <p
            style={{
              margin: 0,
              color: theme.colors.textSecondary,
              fontSize: "14px",
            }}
          >
            This will remove the subscription for{" "}
            <strong>{subscription?.user_name || "this user"}</strong> and reset
            their plan to free. This action cannot be undone.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px",
              background: theme.colors.danger,
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {isLoading ? (
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Trash2 size={16} />
            )}
            Delete
          </button>
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteSubModal, setShowDeleteSubModal] = useState(false);
  const [deleteSubTarget, setDeleteSubTarget] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
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

      // Pre-assign sequential invoice numbers in display order
      assignInvoiceNumbers(allSubscriptions);

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

  const handleCreateSubscription = async (data: any) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchSubscriptions();
      } else {
        const errData = await response.json().catch(() => null);
        alert(errData?.message || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Failed to create subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!deleteSubTarget) return;
    const subId =
      deleteSubTarget._id?.$oid || deleteSubTarget._id || deleteSubTarget.id;
    if (!subId) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admin/subscriptions/${subId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        },
      );

      if (response.ok) {
        setShowDeleteSubModal(false);
        setDeleteSubTarget(null);
        fetchSubscriptions();
      } else {
        const errData = await response.json().catch(() => null);
        alert(errData?.message || "Failed to delete subscription");
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch data only once on mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filter subscriptions based on search, view, and plan filters
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const subId = sub.id || sub._id?.$oid || "";
      const invoiceNum = getInvoiceNumber(subId);
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
        (sub.user_city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoiceNum.includes(searchQuery);

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
            {/* Create Subscription Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                background: theme.colors.primary,
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
              <Plus size={18} />
              Create Subscription
            </button>

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

              <option value="basic">Basic</option>

              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
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
                placeholder="Search by name, phone, email, invoice #..."
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
                    "Invoice #",
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
                      <td style={{ padding: "16px" }}>
                        {(() => {
                          const subId = sub.id || sub._id?.$oid || "";
                          const invNum = getInvoiceNumber(subId);
                          return invNum ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                background: "#EEF2FF",
                                color: "#4F46E5",
                                fontFamily: "monospace",
                              }}
                            >
                              {invNum}
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: "12px",
                                color: theme.colors.textSecondary,
                              }}
                            >
                              --
                            </span>
                          );
                        })()}
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

      {showCreateModal && (
        <CreateSubscriptionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateSubscription}
          isLoading={actionLoading}
        />
      )}

      {showDeleteSubModal && (
        <DeleteSubscriptionModal
          isOpen={showDeleteSubModal}
          onClose={() => {
            setShowDeleteSubModal(false);
            setDeleteSubTarget(null);
          }}
          onConfirm={handleDeleteSubscription}
          subscription={deleteSubTarget}
          isLoading={actionLoading}
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
