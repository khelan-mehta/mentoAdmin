import { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Trash2,
  Star,
  PhoneCall,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  X,
  User,
  Calendar,
  CreditCard,
  Loader2,
} from "lucide-react";

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

import { BASE_URL } from "./Constants";
const API_BASE_URL = BASE_URL;

// ==================== KYC DETAIL MODAL ====================
const KycDetailModal = ({ kyc, onClose, onApprove, onReject, isLoading }: any) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!kyc) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { bg: "#FEF3C7", color: "#F59E0B", label: "Pending" },
      submitted: { bg: "#DBEAFE", color: "#3B82F6", label: "Submitted" },
      underreview: { bg: "#E0E7FF", color: "#6366F1", label: "Under Review" },
      approved: { bg: "#D1FAE5", color: "#10B981", label: "Approved" },
      rejected: { bg: "#FEE2E2", color: "#EF4444", label: "Rejected" },
    };
    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    return (
      <span
        style={{
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          background: config.bg,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
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
          maxWidth: "800px",
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
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: theme.colors.text }}>
            KYC Details
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
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                {kyc.full_name}
              </h3>
              <p style={{ margin: "4px 0 0", color: theme.colors.textSecondary, fontSize: "14px" }}>
                User ID: {kyc.user_id?.$oid || kyc.user_id || "N/A"}
              </p>
            </div>
            {getStatusBadge(kyc.status)}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Calendar size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Date of Birth</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                {kyc.date_of_birth ? new Date(kyc.date_of_birth.$date?.$numberLong || kyc.date_of_birth).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <CreditCard size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Document Type</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text, textTransform: "capitalize" }}>
                {kyc.document_type}
              </p>
            </div>

            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <FileText size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Document Number</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                {kyc.document_number}
              </p>
            </div>

            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <MapPin size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Location</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                {kyc.city}, {kyc.state} - {kyc.pincode}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
              Address
            </h4>
            <p style={{ margin: 0, color: theme.colors.textSecondary, lineHeight: "1.5" }}>
              {kyc.address}
            </p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
              Documents
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              {kyc.document_front_image && (
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: "12px", color: theme.colors.textSecondary }}>Front Image</p>
                  <img
                    src={kyc.document_front_image.startsWith("http") ? kyc.document_front_image : `${API_BASE_URL.replace("/api/v1", "")}${kyc.document_front_image}`}
                    alt="Document Front"
                    style={{ width: "100%", borderRadius: "8px", border: `1px solid ${theme.colors.border}` }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              {kyc.document_back_image && (
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: "12px", color: theme.colors.textSecondary }}>Back Image</p>
                  <img
                    src={kyc.document_back_image.startsWith("http") ? kyc.document_back_image : `${API_BASE_URL.replace("/api/v1", "")}${kyc.document_back_image}`}
                    alt="Document Back"
                    style={{ width: "100%", borderRadius: "8px", border: `1px solid ${theme.colors.border}` }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              {kyc.selfie_image && (
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: "12px", color: theme.colors.textSecondary }}>Selfie</p>
                  <img
                    src={kyc.selfie_image.startsWith("http") ? kyc.selfie_image : `${API_BASE_URL.replace("/api/v1", "")}${kyc.selfie_image}`}
                    alt="Selfie"
                    style={{ width: "100%", borderRadius: "8px", border: `1px solid ${theme.colors.border}` }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          {kyc.rejection_reason && (
            <div style={{ padding: "16px", background: "#FEE2E2", borderRadius: "8px", marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: theme.colors.danger }}>
                Rejection Reason
              </h4>
              <p style={{ margin: 0, color: theme.colors.danger }}>{kyc.rejection_reason}</p>
            </div>
          )}

          {(kyc.status === "submitted" || kyc.status === "underreview") && (
            <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: "20px" }}>
              {showRejectForm ? (
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.colors.border}`,
                      fontSize: "14px",
                      minHeight: "80px",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button
                      onClick={() => setShowRejectForm(false)}
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
                      onClick={() => onReject(kyc._id?.$oid || kyc.id, rejectionReason)}
                      disabled={!rejectionReason.trim() || isLoading}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: theme.colors.danger,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: rejectionReason.trim() && !isLoading ? "pointer" : "not-allowed",
                        opacity: rejectionReason.trim() && !isLoading ? 1 : 0.6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                      Confirm Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setShowRejectForm(true)}
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
                    <XCircle size={16} />
                    Reject KYC
                  </button>
                  <button
                    onClick={() => onApprove(kyc._id?.$oid || kyc.id)}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: theme.colors.success,
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
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Approve KYC
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== WORKERS COMPONENT ====================
export const Workers = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeView, setActiveView] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/workers`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWorkers(data.data?.workers || []);
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const fetchKycSubmissions = async () => {
    try {
      setLoading(true);
      const statusParam = activeView !== "all" ? `?status=${activeView}` : "";
      const response = await fetch(`${API_BASE_URL}/kyc/admin/submissions${statusParam}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setKycSubmissions(data.data?.submissions || []);
      }
    } catch (error) {
      console.error("Error fetching KYC submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    fetchKycSubmissions();
  }, [activeView]);

  const handleApproveKyc = async (kycId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/kyc/admin/${kycId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });
      if (response.ok) {
        setSelectedKyc(null);
        fetchKycSubmissions();
      }
    } catch (error) {
      console.error("Error approving KYC:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectKyc = async (kycId: string, reason: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/kyc/admin/${kycId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ status: "rejected", rejection_reason: reason }),
      });
      if (response.ok) {
        setSelectedKyc(null);
        fetchKycSubmissions();
      }
    } catch (error) {
      console.error("Error rejecting KYC:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSubmissions = kycSubmissions.filter((kyc) =>
    kyc.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kyc.document_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle size={16} color={theme.colors.success} />;
      case "rejected":
        return <XCircle size={16} color={theme.colors.danger} />;
      default:
        return <Clock size={16} color={theme.colors.warning} />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "#D1FAE5";
      case "rejected":
        return "#FEE2E2";
      default:
        return "#FEF3C7";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return theme.colors.success;
      case "rejected":
        return theme.colors.danger;
      default:
        return theme.colors.warning;
    }
  };

  return (
    <div style={{ padding: "24px" }}>
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
            Worker KYC Management
          </h2>

          <input
            type="text"
            placeholder="Search by name or document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: `1px solid ${theme.colors.border}`,
              fontSize: "14px",
              width: "280px",
              outline: "none",
            }}
          />
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
            { key: "all", label: "All Submissions" },
            { key: "submitted", label: "Pending Review" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as any)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeView === tab.key ? theme.colors.primary : "transparent",
                color: activeView === tab.key ? "white" : theme.colors.textSecondary,
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader2 size={32} color={theme.colors.primary} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px", color: theme.colors.textSecondary }}>Loading submissions...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <FileText size={48} color={theme.colors.border} style={{ marginBottom: "16px" }} />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>No KYC Submissions</h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery ? "No results match your search." : "There are no KYC submissions to review."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Document Type", "Document Number", "City", "Status", "Submitted", "Actions"].map((header) => (
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
                {filteredSubmissions.map((kyc: any, index: number) => (
                  <tr
                    key={kyc._id?.$oid || index}
                    style={{
                      borderBottom: `1px solid ${theme.colors.border}`,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = theme.colors.background)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "16px", fontWeight: "600", color: theme.colors.text }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: theme.colors.primary,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "700",
                          }}
                        >
                          {kyc.full_name?.charAt(0) || "?"}
                        </div>
                        {kyc.full_name}
                      </div>
                    </td>
                    <td style={{ padding: "16px", color: theme.colors.textSecondary, textTransform: "capitalize" }}>
                      {kyc.document_type}
                    </td>
                    <td style={{ padding: "16px", color: theme.colors.textSecondary, fontFamily: "monospace" }}>
                      {kyc.document_number}
                    </td>
                    <td style={{ padding: "16px", color: theme.colors.textSecondary }}>
                      {kyc.city}, {kyc.state}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: getStatusBg(kyc.status),
                          color: getStatusColor(kyc.status),
                          textTransform: "capitalize",
                        }}
                      >
                        {getStatusIcon(kyc.status)}
                        {kyc.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: theme.colors.textSecondary, fontSize: "13px" }}>
                      {kyc.created_at ? new Date(kyc.created_at.$date?.$numberLong || kyc.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button
                        onClick={() => setSelectedKyc(kyc)}
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
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedKyc && (
        <KycDetailModal
          kyc={selectedKyc}
          onClose={() => setSelectedKyc(null)}
          onApprove={handleApproveKyc}
          onReject={handleRejectKyc}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};
