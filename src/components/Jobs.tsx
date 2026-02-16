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

import { BASE_URL } from "./Constants";
import { Pagination } from "./Pagination";
const API_BASE_URL = BASE_URL;

// ==================== CREATE JOB MODAL ====================
const CreateJobModal = ({ onClose, onCreate, isLoading }: any) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    job_type: "fulltime",
    category: "",
    salary_min: "",
    salary_max: "",
    requirements: [""],
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData((prev) => ({ ...prev, requirements: newRequirements }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, requirements: newRequirements }));
  };

  const handleSubmit = () => {
    const payload = {
      title: formData.title,
      company: formData.company || undefined,
      description: formData.description || undefined,
      location: formData.location || undefined,
      job_type: formData.job_type || undefined,
      category: formData.category || undefined,
      salary_min: formData.salary_min
        ? parseFloat(formData.salary_min)
        : undefined,
      salary_max: formData.salary_max
        ? parseFloat(formData.salary_max)
        : undefined,
      requirements: formData.requirements.filter((r) => r.trim() !== ""),
    };
    onCreate(payload);
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
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "700",
              color: theme.colors.text,
            }}
          >
            Create New Job
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Company name"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Remote, Bangalore"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Job Type
              </label>
              <select
                value={formData.job_type}
                onChange={(e) => handleInputChange("job_type", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                  background: theme.colors.surface,
                }}
              >
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="e.g., Engineering"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Min Salary (₹)
              </label>
              <input
                type="number"
                value={formData.salary_min}
                onChange={(e) =>
                  handleInputChange("salary_min", e.target.value)
                }
                placeholder="e.g., 50000"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Max Salary (₹)
              </label>
              <input
                type="number"
                value={formData.salary_max}
                onChange={(e) =>
                  handleInputChange("salary_max", e.target.value)
                }
                placeholder="e.g., 100000"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

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
              Job Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the job role, responsibilities, etc."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                minHeight: "120px",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

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
              Requirements
            </label>
            {formData.requirements.map((req, index) => (
              <div
                key={index}
                style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
              >
                <input
                  type="text"
                  value={req}
                  onChange={(e) =>
                    handleRequirementChange(index, e.target.value)
                  }
                  placeholder={`Requirement ${index + 1}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    fontSize: "14px",
                  }}
                />
                {formData.requirements.length > 1 && (
                  <button
                    onClick={() => removeRequirement(index)}
                    style={{
                      padding: "10px",
                      background: theme.colors.danger,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addRequirement}
              style={{
                padding: "8px 16px",
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Plus size={14} />
              Add Requirement
            </button>
          </div>

          <div
            style={{
              borderTop: `1px solid ${theme.colors.border}`,
              paddingTop: "20px",
              display: "flex",
              gap: "12px",
            }}
          >
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
              disabled={!formData.title.trim() || isLoading}
              style={{
                flex: 1,
                padding: "12px",
                background: theme.colors.success,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor:
                  !formData.title.trim() || isLoading
                    ? "not-allowed"
                    : "pointer",
                opacity: !formData.title.trim() || isLoading ? 0.6 : 1,
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
                <Plus size={16} />
              )}
              Create Job
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ==================== JOB DETAIL MODAL ====================
const JobDetailModal = ({
  job,
  onClose,
  onApprove,
  onReject,
  onDelete,
  onCloseJob,
  isLoading,
}: any) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  if (!job) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      active: { bg: "#D1FAE5", color: theme.colors.success, label: "Active" },
      pending: { bg: "#FEF3C7", color: theme.colors.warning, label: "Pending" },
      closed: {
        bg: "#E5E7EB",
        color: theme.colors.textSecondary,
        label: "Closed",
      },
      rejected: {
        bg: "#FEE2E2",
        color: theme.colors.danger,
        label: "Rejected",
      },
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
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "700",
              color: theme.colors.text,
            }}
          >
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                {job.title}
              </h3>
              <p
                style={{
                  margin: "4px 0 0",
                  color: theme.colors.primary,
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
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
                {job.location || "Not specified"}
              </p>
            </div>

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
                  Job Type
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
                {job.job_type || "Full-time"}
              </p>
            </div>

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
                <DollarSign size={16} color={theme.colors.textSecondary} />
                <span
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Salary Range
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontWeight: "600",
                  color: theme.colors.success,
                }}
              >
                {job.salary_min && job.salary_max
                  ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`
                  : "Not disclosed"}
              </p>
            </div>

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
                <Users size={16} color={theme.colors.textSecondary} />
                <span
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Applications
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {job.applications_count || 0} applications
              </p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Job Description
            </h4>
            <p
              style={{
                margin: 0,
                color: theme.colors.textSecondary,
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {job.description || "No description provided."}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  margin: "0 0 12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Requirements
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: theme.colors.textSecondary,
                  lineHeight: "1.8",
                }}
              >
                {job.requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Category */}
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
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
            <div
              style={{
                padding: "16px",
                background: "#FEE2E2",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.danger,
                }}
              >
                Rejection Reason
              </h4>
              <p style={{ margin: 0, color: theme.colors.danger }}>
                {job.rejection_reason}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              borderTop: `1px solid ${theme.colors.border}`,
              paddingTop: "20px",
            }}
          >
            {showDeleteConfirm ? (
              <div
                style={{
                  padding: "16px",
                  background: "#FEE2E2",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <AlertCircle size={20} color={theme.colors.danger} />
                  <p
                    style={{
                      margin: 0,
                      color: theme.colors.danger,
                      fontWeight: "600",
                    }}
                  >
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
                    {isLoading ? (
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Confirm Delete
                  </button>
                </div>
              </div>
            ) : showRejectForm ? (
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
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
                    fontFamily: "inherit",
                  }}
                />
                <div
                  style={{ display: "flex", gap: "12px", marginTop: "12px" }}
                >
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
                    onClick={() =>
                      onReject(job.id || job._id?.$oid, rejectionReason)
                    }
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
                      cursor:
                        rejectionReason.trim() && !isLoading
                          ? "pointer"
                          : "not-allowed",
                      opacity: rejectionReason.trim() && !isLoading ? 1 : 0.6,
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
                      <XCircle size={16} />
                    )}
                    Confirm Reject
                  </button>
                </div>
              </div>
            ) : showCloseConfirm ? (
              <div
                style={{
                  padding: "16px",
                  background: "#F3F4F6",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <AlertCircle size={20} color={theme.colors.textSecondary} />
                  <p
                    style={{
                      margin: 0,
                      color: theme.colors.text,
                      fontWeight: "600",
                    }}
                  >
                    Are you sure you want to close this job?
                  </p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setShowCloseConfirm(false)}
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
                    onClick={() => onCloseJob(job.id || job._id?.$oid)}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: theme.colors.textSecondary,
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
                      <XCircle size={16} />
                    )}
                    Confirm Close
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
                {job.status === "active" && (
                  <button
                    onClick={() => setShowCloseConfirm(true)}
                    disabled={isLoading}
                    style={{
                      padding: "12px 20px",
                      background: theme.colors.background,
                      color: theme.colors.textSecondary,
                      border: `1px solid ${theme.colors.textSecondary}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <XCircle size={16} />
                    Close Job
                  </button>
                )}
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
                      {isLoading ? (
                        <Loader2
                          size={16}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <CheckCircle size={16} />
                      )}
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
  const [activeView, setActiveView] = useState<
    "all" | "pending" | "active" | "closed"
  >("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());
      if (activeView !== "all") params.append("status", activeView);

      const response = await fetch(`${API_BASE_URL}/admin/jobs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data?.jobs || []);
        const pagination = data.data?.pagination;
        if (pagination) {
          setTotalItems(pagination.total || 0);
          setTotalPages(pagination.pages || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeView, currentPage, itemsPerPage]);

  const handleApproveJob = async (jobId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admin/jobs/${jobId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ status: "active" }),
        },
      );
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
      const response = await fetch(
        `${API_BASE_URL}/admin/jobs/${jobId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            status: "rejected",
            rejection_reason: reason,
          }),
        },
      );
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
          Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
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

  const handleCloseJob = async (jobId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admin/jobs/${jobId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ status: "closed" }),
        },
      );
      if (response.ok) {
        setSelectedJob(null);
        fetchJobs();
      }
    } catch (error) {
      console.error("Error closing job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateJob = async (jobData: any) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(jobData),
      });
      if (response.ok) {
        setShowCreateModal(false);
        fetchJobs();
      }
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          bg: "#D1FAE5",
          color: theme.colors.success,
          icon: CheckCircle,
        };
      case "rejected":
        return { bg: "#FEE2E2", color: theme.colors.danger, icon: XCircle };
      case "closed":
        return {
          bg: "#E5E7EB",
          color: theme.colors.textSecondary,
          icon: Clock,
        };
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
        {/* Header Section */}
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

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "10px 16px",
                background: theme.colors.success,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Plus size={16} />
              Create Job
            </button>
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
        </div>

        {/* Filter Tabs - Now in its own section */}
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
                background:
                  activeView === tab.key
                    ? theme.colors.primary
                    : "transparent",
                color:
                  activeView === tab.key
                    ? "white"
                    : theme.colors.textSecondary,
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

        {/* Content Section - Now properly separated */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader2
              size={32}
              color={theme.colors.primary}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <p
              style={{ marginTop: "12px", color: theme.colors.textSecondary }}
            >
              Loading jobs...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Briefcase
              size={48}
              color={theme.colors.border}
              style={{ marginBottom: "16px" }}
            />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>
              No Jobs Found
            </h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery
                ? "No results match your search."
                : "There are no job listings to display."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Job Title",
                    "Company",
                    "Location",
                    "Type",
                    "Applications",
                    "Status",
                    "Posted",
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
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          theme.colors.background)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "16px",
                          fontWeight: "600",
                          color: theme.colors.text,
                        }}
                      >
                        <div>
                          <div>{job.title}</div>
                          {job.category && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: theme.colors.primary,
                              }}
                            >
                              {job.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {job.company || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <MapPin size={14} />
                          {job.location || "Remote"}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          color: theme.colors.textSecondary,
                          textTransform: "capitalize",
                        }}
                      >
                        {job.job_type || "Full-time"}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          color: theme.colors.text,
                          fontWeight: "600",
                        }}
                      >
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
                      <td
                        style={{
                          padding: "16px",
                          color: theme.colors.textSecondary,
                          fontSize: "13px",
                        }}
                      >
                        {job.created_at
                          ? new Date(
                              job.created_at.$date?.$numberLong ||
                                job.created_at,
                            ).toLocaleDateString()
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

        {!loading && filteredJobs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || Math.ceil(totalItems / itemsPerPage)}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateJob}
          isLoading={actionLoading}
        />
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApprove={handleApproveJob}
          onReject={handleRejectJob}
          onDelete={handleDeleteJob}
          onCloseJob={handleCloseJob}
          isLoading={actionLoading}
        />
      )}        
    </div>
  );
};