import { useState } from "react";
import {
  Star,
  Users,
  Briefcase,
  Eye,
  Loader2,
  Crown,
  Zap,
  Shield,
  X,
  User,
  MapPin,
  TrendingUp,
  PhoneCall,
  Mail,
  FileText,
} from "lucide-react";
import { jsPDF } from "jspdf";

import {
  theme,
  planConfig,
  planPricing,
  GST_RATE,
  CGST_RATE,
  SGST_RATE,
  IGST_RATE,
  COMPANY_INFO,
  BANK_DETAILS,
} from "./constants";
import {
  getProfilePhotoUrl,
  getOrCreateInvoiceNumber,
  calculateGSTInclusive,
  numberToWords,
  getFinancialYearPeriod,
  fetchKycDetails,
} from "./utils";

export const SubscriptionDetailModal = ({ subscription, onClose }: any) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!subscription) return null;

  const plan = subscription.subscription_plan?.toLowerCase() || "free";
  const config = planConfig[plan] || planConfig.free;
  const IconComponent = config.icon;
  const profilePhotoUrl = getProfilePhotoUrl(subscription.user_photo);

  const generateInvoicePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const userId =
        subscription.user_id?.$oid ||
        subscription.user_id ||
        subscription.id ||
        "";
      let kycData: any = null;
      if (userId) {
        kycData = await fetchKycDetails(userId);
      }

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

      const isInterState =
        customerState.toLowerCase() !== COMPANY_INFO.state.toLowerCase();

      const planPrice = planPricing[plan] || 0;
      const gst = calculateGSTInclusive(planPrice, isInterState);

      const invoiceNumber = getOrCreateInvoiceNumber(userId);
      const invoiceDate = new Date();
      const invoiceDateStr = `${String(invoiceDate.getDate()).padStart(2, "0")}-${String(invoiceDate.getMonth() + 1).padStart(2, "0")}-${invoiceDate.getFullYear()}`;

      const period = getFinancialYearPeriod(
        subscription.subscription_expires_at || subscription.created_at,
      );

      const planDisplayName =
        "MENTO " + (subscription.subscription_plan || "Free").toUpperCase();

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const LM = 10;
      const RM = pageWidth - 10;
      const TW = RM - LM;
      const MID = LM + TW / 2;

      doc.setDrawColor(0);
      doc.setLineWidth(0.3);

      let y = 10;

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

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TAX INVOICE", pageWidth / 2, y + 4, { align: "center" });
      y += 7;

      const invRowH = 14;
      doc.rect(LM, y, TW, invRowH);
      doc.line(MID - 5, y, MID - 5, y + invRowH);

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

      const buyerH = 38;
      doc.rect(LM, y, TW, buyerH);
      doc.line(MID, y, MID, y + buyerH);

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

      const itemRowH = 40;
      doc.rect(LM, y, TW, itemRowH);
      for (let i = 0; i < colX.length; i++) {
        doc.line(colX[i], y, colX[i], y + itemRowH);
      }
      doc.line(RM, y, RM, y + itemRowH);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const itemY = y + 10;
      doc.text("1", colX[0] + 8, itemY, { align: "center" });
      doc.text(planDisplayName, colX[1] + 2, itemY);
      doc.text("998314", colX[2] + 2, itemY);
      doc.text("1.000", colX[3] + 2, itemY);
      doc.text("1", colX[4] + 2, itemY);
      doc.text(gst.base.toFixed(2), colX[5] + 2, itemY);
      doc.text(gst.base.toFixed(2), colX[6] + 2, itemY);

      const subTotalY = y + itemRowH;
      doc.rect(LM, subTotalY, TW, 7);
      for (let i = 0; i < colX.length; i++) {
        doc.line(colX[i], subTotalY, colX[i], subTotalY + 7);
      }
      doc.line(RM, subTotalY, RM, subTotalY + 7);
      doc.setFont("helvetica", "bold");
      doc.text(gst.base.toFixed(2), colX[6] + 2, subTotalY + 5);
      y = subTotalY + 7;

      const gstSummaryH = 40;
      doc.rect(LM, y, TW, gstSummaryH);
      const gstDivX = LM + 110;
      doc.line(gstDivX, y, gstDivX, y + gstSummaryH);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Amount In Words:", LM + 2, y + 6);
      doc.setFont("helvetica", "normal");
      doc.text(numberToWords(Math.round(gst.total)), LM + 35, y + 6);

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

      const bankH = 50;
      doc.rect(LM, y, TW, bankH);
      doc.line(MID, y, MID, y + bankH);

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

      doc.setFont("helvetica", "normal");
      doc.text("For,", MID + 2, y + 6);
      doc.setFont("helvetica", "bold");
      doc.text(COMPANY_INFO.name, MID + 20, y + 12);
      doc.setFont("helvetica", "italic");
      doc.text("Authorised Signature", RM - 5, y + bankH - 5, {
        align: "right",
      });
      y += bankH;

      const termsH = 12;
      doc.rect(LM, y, TW, termsH);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Terms:", LM + 2, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text("Subject to Satlasana Jurisdiction Only", LM + 2, y + 10);
      y += termsH;

      const footerH = 8;
      doc.rect(LM, y, TW, footerH);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("E.& O.E.", LM + 2, y + 5);
      doc.setFont("helvetica", "italic");
      doc.text("This is Computer Generate Invoice", pageWidth / 2, y + 5, {
        align: "center",
      });

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
