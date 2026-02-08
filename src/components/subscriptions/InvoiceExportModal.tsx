import { useState } from "react";
import {
  Users,
  Loader2,
  Crown,
  X,
  Calendar,
  Download,
  FileSpreadsheet,
  Calculator,
  Filter,
  CheckCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

import { theme, planPricing, GST_RATE, CGST_RATE, SGST_RATE, IGST_RATE, COMPANY_INFO } from "./constants";
import { getOrCreateInvoiceNumber, parseDateValue, formatDate } from "./utils";
import type { InvoiceExportModalProps, InvoiceItem } from "./types";

export const InvoiceExportModal = ({
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

  const getFilteredSubscriptions = () => {
    return subscriptions.filter((sub) => {
      const plan = (sub.subscription_plan || "free").toLowerCase();
      const isPaid = plan !== "free" && plan !== "none";

      if (exportType === "paid" && !isPaid) return false;

      if (userTypeFilter !== "all" && sub.userType !== userTypeFilter)
        return false;

      if (planFilter !== "all" && plan !== planFilter) return false;

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

      const invoiceData: InvoiceItem[] = filtered.map((sub) => {
        const plan = (sub.subscription_plan || "free").toLowerCase();
        const planPrice = planPricing[plan] || 0;
        const userId = sub.user_id?.$oid || sub.user_id || sub.id || "";

        const userState = (sub.kyc_state || "").toLowerCase();
        const companyState = COMPANY_INFO.state.toLowerCase();
        const isUserInterState = userState && userState !== companyState;
        const useInterState = isInterState || isUserInterState;

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

      const workbook = XLSX.utils.book_new();

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
      summarySheet["!cols"] = [{ wch: 25 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

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

      detailSheet["!cols"] = [
        { wch: 22 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 18 },
        { wch: 14 },
        { wch: 18 },
        { wch: 14 },
        { wch: 18 },
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 25 },
        { wch: 10 },
      ];

      XLSX.utils.book_append_sheet(workbook, detailSheet, "Invoices");

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

      const timestamp = invoiceDate.toISOString().split("T")[0];
      const filename = `subscription-invoices-${timestamp}.xlsx`;

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
