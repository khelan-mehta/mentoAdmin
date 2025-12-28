import { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  X,
  Briefcase,
  DollarSign,
  Loader2,
  Search,
  Building,
  Calendar,
  Users,
  Trash2,
  Edit,
  Plus,
  Filter,
  AlertCircle,
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

const API_BASE_URL = "http://localhost:8000/api/v1";

// ==================== JOB DETAIL MODAL ====================
const JobDetailModal = ({ job, onClose, onApprove, onReject, onDelete, isLoading }: any) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!job) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      active: { bg: "#D1FAE5", color: theme.colors.success, label: "Active" },
      pending: { bg: "#FEF3C7", color: theme.colors.warning, label: "Pending" },
      closed: { bg: "#E5E7EB", color: theme.colors.textSecondary, label: "Closed" },
      rejected: { bg: "#FEE2E2", color: theme.colors.danger, label: "Rejected" },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
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
            Job Details
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                {job.title}
              </h3>
              <p style={{ margin: "4px 0 0", color: theme.colors.primary, fontSize: "14px", fontWeight: "500" }}>
                {job.company || "Company Name"}
              </p>
            </div>
            {getStatusBadge(job.status)}
          </div>

          {/* Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <MapPin size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Location</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                {job.location || "Not specified"}
              </p>
            </div>

            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Briefcase size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Job Type</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text, textTransform: "capitalize" }}>
                {job.job_type || "Full-time"}
              </p>
            </div>

            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <DollarSign size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Salary Range</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.success }}>
                {job.salary_min && job.salary_max
                  ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`
                  : "Not disclosed"}
              </p>
            </div>

            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Users size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Applications</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                {job.applications_count || 0} applications
              </p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
              Job Description
            </h4>
            <p style={{ margin: 0, color: theme.colors.textSecondary, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {job.description || "No description provided."}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                Requirements
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", color: theme.colors.textSecondary, lineHeight: "1.8" }}>
                {job.requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Category */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
              Category
            </h4>
            <span
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: `${theme.colors.primary}15`,
                color: theme.colors.primary,
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {job.category || "General"}
            </span>
          </div>

          {/* Rejection Reason */}
          {job.rejection_reason && (
            <div style={{ padding: "16px", background: "#FEE2E2", borderRadius: "8px", marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: theme.colors.danger }}>
                Rejection Reason
              </h4>
              <p style={{ margin: 0, color: theme.colors.danger }}>{job.rejection_reason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: "20px" }}>
            {showDeleteConfirm ? (
              <div style={{ padding: "16px", background: "#FEE2E2", borderRadius: "8px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <AlertCircle size={20} color={theme.colors.danger} />
                  <p style={{ margin: 0, color: theme.colors.danger, fontWeight: "600" }}>
                    Are you sure you want to delete this job?
                  </p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
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
                    onClick={() => onDelete(job.id || job._id?.$oid)}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: "10px",
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
                    {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={16} />}
                    Confirm Delete
                  </button>
                </div>
              </div>
            ) : showRejectForm ? (
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
                    onClick={() => onReject(job.id || job._id?.$oid, rejectionReason)}
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
                    {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={16} />}
                    Confirm Reject
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                  style={{
                    padding: "12px 20px",
                    background: theme.colors.background,
                    color: theme.colors.danger,
                    border: `1px solid ${theme.colors.danger}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                {job.status === "pending" && (
                  <>
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
                      Reject
                    </button>
                    <button
                      onClick={() => onApprove(job.id || job._id?.$oid)}
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
                      {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={16} />}
                      Approve
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ==================== JOBS COMPONENT ====================
export const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeView, setActiveView] = useState<"all" | "pending" | "active" | "closed">("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const statusParam = activeView !== "all" ? `?status=${activeView}` : "";
      const response = await fetch(`${API_BASE_URL}/admin/jobs${statusParam}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data?.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeView]);

  const handleApproveJob = async (jobId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ status: "active" }),
      });
      if (response.ok) {
        setSelectedJob(null);
        fetchJobs();
      }
    } catch (error) {
      console.error("Error approving job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectJob = async (jobId: string, reason: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ status: "rejected", rejection_reason: reason }),
      });
      if (response.ok) {
        setSelectedJob(null);
        fetchJobs();
      }
    } catch (error) {
      console.error("Error rejecting job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        setSelectedJob(null);
        fetchJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { bg: "#D1FAE5", color: theme.colors.success, icon: CheckCircle };
      case "rejected":
        return { bg: "#FEE2E2", color: theme.colors.danger, icon: XCircle };
      case "closed":
        return { bg: "#E5E7EB", color: theme.colors.textSecondary, icon: Clock };
      default:
        return { bg: "#FEF3C7", color: theme.colors.warning, icon: Clock };
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
            Jobs Management
          </h2>

          <div style={{ position: "relative" }}>
            <Search
              size={18}
              color={theme.colors.textSecondary}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search jobs..."
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
            { key: "all", label: "All Jobs" },
            { key: "pending", label: "Pending Review" },
            { key: "active", label: "Active" },
            { key: "closed", label: "Closed" },
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
            <Loader2 size={32} color={theme.colors.primary} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px", color: theme.colors.textSecondary }}>Loading jobs...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Briefcase size={48} color={theme.colors.border} style={{ marginBottom: "16px" }} />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>No Jobs Found</h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery ? "No results match your search." : "There are no job listings to display."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Job Title", "Company", "Location", "Type", "Applications", "Status", "Posted", "Actions"].map((header) => (
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
                {filteredJobs.map((job: any, index: number) => {
                  const statusConfig = getStatusConfig(job.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr
                      key={job.id || job._id?.$oid || index}
                      style={{
                        borderBottom: `1px solid ${theme.colors.border}`,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = theme.colors.background)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px", fontWeight: "600", color: theme.colors.text }}>
                        <div>
                          <div>{job.title}</div>
                          {job.category && (
                            <span style={{ fontSize: "12px", color: theme.colors.primary }}>{job.category}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: theme.colors.textSecondary }}>
                        {job.company || "N/A"}
                      </td>
                      <td style={{ padding: "16px", color: theme.colors.textSecondary }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <MapPin size={14} />
                          {job.location || "Remote"}
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: theme.colors.textSecondary, textTransform: "capitalize" }}>
                        {job.job_type || "Full-time"}
                      </td>
                      <td style={{ padding: "16px", color: theme.colors.text, fontWeight: "600" }}>
                        {job.applications_count || 0}
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
                            background: statusConfig.bg,
                            color: statusConfig.color,
                            textTransform: "capitalize",
                          }}
                        >
                          <StatusIcon size={14} />
                          {job.status || "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", color: theme.colors.textSecondary, fontSize: "13px" }}>
                        {job.created_at
                          ? new Date(job.created_at.$date?.$numberLong || job.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => setSelectedJob(job)}
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
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApprove={handleApproveJob}
          onReject={handleRejectJob}
          onDelete={handleDeleteJob}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};
