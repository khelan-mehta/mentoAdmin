import { useState, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  MapPin,
  X,
  User,
  Briefcase,
  GraduationCap,
  DollarSign,
  Link as LinkIcon,
  Loader2,
  Search,
  Star,
  Building,
  Calendar,
  PhoneCall,
  Mail,
  Shield,
  Hash,
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

// Helper function to construct full profile photo URL
const getProfilePhotoUrl = (photoPath: string | null | undefined) => {
  if (!photoPath) return null;
  if (photoPath.startsWith("http")) return photoPath;
  return `${API_BASE_URL}${photoPath}`;
};

// Helper function to get KYC status color
const getKycStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return { bg: "#D1FAE5", color: theme.colors.success };
    case "pending":
      return { bg: "#FEF3C7", color: theme.colors.warning };
    case "rejected":
      return { bg: "#FEE2E2", color: theme.colors.danger };
    default:
      return { bg: theme.colors.border, color: theme.colors.textSecondary };
  }
};

// ==================== JOB PROFILE DETAIL MODAL ====================
const JobProfileDetailModal = ({
  profile,
  onClose,
  onApprove,
  onReject,
  isLoading,
}: any) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!profile) return null;

  const getStatusBadge = (isVerified: boolean) => {
    return isVerified ? (
      <span
        style={{
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          background: "#D1FAE5",
          color: theme.colors.success,
        }}
      >
        Verified
      </span>
    ) : (
      <span
        style={{
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          background: "#FEF3C7",
          color: theme.colors.warning,
        }}
      >
        Pending Verification
      </span>
    );
  };

  const getKycStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; color: string; label: string }
    > = {
      approved: {
        bg: "#D1FAE5",
        color: theme.colors.success,
        label: "KYC Approved",
      },
      pending: {
        bg: "#FEF3C7",
        color: theme.colors.warning,
        label: "KYC Pending",
      },
      rejected: {
        bg: "#FEE2E2",
        color: theme.colors.danger,
        label: "KYC Rejected",
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "16px",
          fontSize: "11px",
          fontWeight: "600",
          background: config.bg,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
  };

  const profilePhotoUrl = getProfilePhotoUrl(profile.user_photo);

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
          maxWidth: "900px",
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
            Job Seeker Profile
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
                  alt={profile.full_name || profile.user_name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `3px solid ${theme.colors.border}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: theme.colors.primary,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    fontWeight: "700",
                  }}
                >
                  {(profile.full_name || profile.user_name)?.charAt(0) || "?"}
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
                  {profile.full_name ||
                    profile.user_name ||
                    "Name not provided"}
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: theme.colors.primary,
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {profile.headline || "Job Seeker"}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: theme.colors.textSecondary,
                    fontSize: "13px",
                  }}
                >
                  {profile.experience_years
                    ? `${profile.experience_years} years experience`
                    : "Experience not specified"}
                </p>
                {/* Contact Information */}
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {profile.user_mobile && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <PhoneCall size={14} color={theme.colors.primary} />
                      <a
                        href={`tel:${profile.user_mobile}`}
                        style={{
                          color: theme.colors.text,
                          textDecoration: "none",
                        }}
                      >
                        {profile.user_mobile}
                      </a>
                    </div>
                  )}
                  {profile.user_email && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <Mail size={14} color={theme.colors.primary} />
                      <a
                        href={`mailto:${profile.user_email}`}
                        style={{
                          color: theme.colors.text,
                          textDecoration: "none",
                        }}
                      >
                        {profile.user_email}
                      </a>
                    </div>
                  )}
                  {(profile.user_city || profile.user_pincode) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <MapPin size={14} color={theme.colors.primary} />
                      <span style={{ color: theme.colors.text }}>
                        {[profile.user_city, profile.user_pincode]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "flex-end",
              }}
            >
              {getStatusBadge(profile.is_verified)}
              {profile.user_kyc_status &&
                getKycStatusBadge(profile.user_kyc_status)}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                About
              </h4>
              <p
                style={{
                  margin: 0,
                  color: theme.colors.textSecondary,
                  lineHeight: "1.6",
                }}
              >
                {profile.bio}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                <DollarSign size={16} color={theme.colors.textSecondary} />
                <span
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Expected Salary
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {profile.expected_salary_min && profile.expected_salary_max
                  ? `₹${profile.expected_salary_min.toLocaleString()} - ₹${profile.expected_salary_max.toLocaleString()}`
                  : "Not specified"}
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
                <MapPin size={16} color={theme.colors.textSecondary} />
                <span
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Preferred Locations
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {profile.preferred_locations?.length > 0
                  ? profile.preferred_locations.join(", ")
                  : "Not specified"}
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
                  Job Types
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
                {profile.preferred_job_types?.length > 0
                  ? profile.preferred_job_types.join(", ")
                  : "Not specified"}
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
                <Star size={16} color={theme.colors.textSecondary} />
                <span
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Subscription
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
                {profile.subscription_plan || "None"}
              </p>
            </div>

            {profile.user_kyc_status && (
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
                  {profile.user_kyc_status}
                </p>
              </div>
            )}

            {profile.user_pincode && (
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
                  <Hash size={16} color={theme.colors.textSecondary} />
                  <span
                    style={{
                      fontSize: "12px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Pincode
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {profile.user_pincode}
                </p>
              </div>
            )}
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
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
                {profile.skills.map((skill: string, index: number) => (
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

          {/* Education */}
          {profile.education && profile.education.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  margin: "0 0 12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <GraduationCap size={16} />
                Education
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {profile.education.map((edu: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      background: theme.colors.background,
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}
                    >
                      {edu.degree}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: theme.colors.textSecondary,
                        fontSize: "14px",
                      }}
                    >
                      {edu.institution}
                    </p>
                    {edu.field_of_study && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: theme.colors.textSecondary,
                          fontSize: "13px",
                        }}
                      >
                        {edu.field_of_study}
                      </p>
                    )}
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: theme.colors.textSecondary,
                        fontSize: "12px",
                      }}
                    >
                      {edu.start_year} -{" "}
                      {edu.is_current ? "Present" : edu.end_year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {profile.work_experience && profile.work_experience.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  margin: "0 0 12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Building size={16} />
                Work Experience
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {profile.work_experience.map((exp: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      background: theme.colors.background,
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}
                    >
                      {exp.title}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: theme.colors.primary,
                        fontSize: "14px",
                      }}
                    >
                      {exp.company}
                    </p>
                    {exp.location && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: theme.colors.textSecondary,
                          fontSize: "13px",
                        }}
                      >
                        {exp.location}
                      </p>
                    )}
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: theme.colors.textSecondary,
                        fontSize: "12px",
                      }}
                    >
                      {exp.start_date} -{" "}
                      {exp.is_current ? "Present" : exp.end_date}
                    </p>
                    {exp.description && (
                      <p
                        style={{
                          margin: "8px 0 0",
                          color: theme.colors.textSecondary,
                          fontSize: "13px",
                          lineHeight: "1.5",
                        }}
                      >
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <LinkIcon size={16} />
              Links
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {profile.resume_url && (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "10px 16px",
                    background: theme.colors.background,
                    borderRadius: "8px",
                    color: theme.colors.primary,
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <FileText size={16} />
                  Resume
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "10px 16px",
                    background: theme.colors.background,
                    borderRadius: "8px",
                    color: theme.colors.primary,
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <Briefcase size={16} />
                  Portfolio
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "10px 16px",
                    background: theme.colors.background,
                    borderRadius: "8px",
                    color: theme.colors.primary,
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <LinkIcon size={16} />
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!profile.is_verified && (
            <div
              style={{
                borderTop: `1px solid ${theme.colors.border}`,
                paddingTop: "20px",
              }}
            >
              {showRejectForm ? (
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
                        onReject(
                          profile.id || profile._id?.$oid,
                          rejectionReason,
                        )
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
                    Reject Profile
                  </button>
                  <button
                    onClick={() => onApprove(profile.id || profile._id?.$oid)}
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
                    Approve Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ==================== JOB PROFILES COMPONENT ====================
export const JobProfiles = () => {
  const [jobProfiles, setJobProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeView, setActiveView] = useState<"all" | "pending" | "verified">(
    "all",
  );
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchJobProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/job-seekers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const profiles = data.data?.profiles || [];

        // Fetch user data for each profile to get contact number and profile pic
        const profilesWithUserData = await Promise.all(
          profiles.map(async (profile: any) => {
            try {
              const userResponse = await fetch(
                `${API_BASE_URL}/admin/users/${profile.user_id?.$oid || profile.user_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                  },
                },
              );
              if (userResponse.ok) {
                const userData = await userResponse.json();
                // Handle both possible response structures
                const user = userData.data?.user || userData.data;
                return {
                  ...profile,
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
            return profile;
          }),
        );

        setJobProfiles(profilesWithUserData);
      }
    } catch (error) {
      console.error("Error fetching job profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobProfiles();
  }, []);

  const handleApproveProfile = async (profileId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admin/job-seekers/${profileId}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ is_verified: true }),
        },
      );
      if (response.ok) {
        setSelectedProfile(null);
        fetchJobProfiles();
      }
    } catch (error) {
      console.error("Error approving profile:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProfile = async (profileId: string, reason: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admin/job-seekers/${profileId}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            is_verified: false,
            rejection_reason: reason,
          }),
        },
      );
      if (response.ok) {
        setSelectedProfile(null);
        fetchJobProfiles();
      }
    } catch (error) {
      console.error("Error rejecting profile:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProfiles = jobProfiles.filter((profile) => {
    const matchesSearch =
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user_mobile?.includes(searchQuery) ||
      profile.skills?.some((skill: string) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesView =
      activeView === "all" ||
      (activeView === "pending" && !profile.is_verified) ||
      (activeView === "verified" && profile.is_verified);

    return matchesSearch && matchesView;
  });

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
            Job Seeker Profiles
          </h2>

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
              placeholder="Search by name, email, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "10px 16px 10px 40px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                width: "300px",
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
            { key: "all", label: "All Profiles" },
            { key: "pending", label: "Pending Verification" },
            { key: "verified", label: "Verified" },
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
              }}
            >
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
              Loading profiles...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <User
              size={48}
              color={theme.colors.border}
              style={{ marginBottom: "16px" }}
            />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>
              No Job Profiles
            </h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery
                ? "No results match your search."
                : "There are no job seeker profiles to review."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredProfiles.map((profile: any, index: number) => {
              const profilePhotoUrl = getProfilePhotoUrl(profile.user_photo);
              const kycColors = getKycStatusColor(profile.user_kyc_status);

              return (
                <div
                  key={profile.id || profile._id?.$oid || index}
                  style={{
                    background: theme.colors.background,
                    borderRadius: "12px",
                    padding: "20px",
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px" }}>
                      {profilePhotoUrl ? (
                        <img
                          src={profilePhotoUrl}
                          alt={profile.full_name || profile.user_name}
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: `2px solid ${theme.colors.border}`,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            background: theme.colors.primary,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            fontWeight: "700",
                          }}
                        >
                          {(profile.full_name || profile.user_name)?.charAt(
                            0,
                          ) || "?"}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: theme.colors.text,
                            marginBottom: "4px",
                          }}
                        >
                          {profile.full_name ||
                            profile.user_name ||
                            "Name not provided"}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: theme.colors.primary,
                          }}
                        >
                          {profile.headline || "Job Seeker"}
                        </div>
                        {/* Contact info in card */}
                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          {profile.user_mobile && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                color: theme.colors.textSecondary,
                              }}
                            >
                              <PhoneCall size={12} />
                              {profile.user_mobile}
                            </div>
                          )}
                          {profile.user_email && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                color: theme.colors.textSecondary,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "180px",
                              }}
                            >
                              <Mail size={12} style={{ flexShrink: 0 }} />
                              {profile.user_email}
                            </div>
                          )}
                          {profile.user_city && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                color: theme.colors.textSecondary,
                              }}
                            >
                              <MapPin size={12} />
                              {profile.user_city}
                              {profile.user_pincode
                                ? ` - ${profile.user_pincode}`
                                : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        alignItems: "flex-end",
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "600",
                          background: profile.is_verified
                            ? "#D1FAE5"
                            : "#FEF3C7",
                          color: profile.is_verified
                            ? theme.colors.success
                            : theme.colors.warning,
                        }}
                      >
                        {profile.is_verified ? "Verified" : "Pending"}
                      </span>
                      {profile.user_kyc_status && (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "10px",
                            fontWeight: "600",
                            background: kycColors.bg,
                            color: kycColors.color,
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <Shield size={10} />
                          KYC {profile.user_kyc_status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "12px",
                      }}
                    >
                      {profile.skills
                        ?.slice(0, 3)
                        .map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              padding: "4px 10px",
                              background: `${theme.colors.primary}15`,
                              color: theme.colors.primary,
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      {profile.skills?.length > 3 && (
                        <span
                          style={{
                            padding: "4px 10px",
                            background: theme.colors.border,
                            color: theme.colors.textSecondary,
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          +{profile.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        <Briefcase size={14} />
                        {profile.experience_years
                          ? `${profile.experience_years} yrs exp`
                          : "N/A"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        <MapPin size={14} />
                        {profile.preferred_locations?.[0] || "N/A"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        <Star size={14} />
                        {profile.subscription_plan || "Free"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        <Eye size={14} />
                        {profile.profile_views || 0} views
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProfile(profile)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: theme.colors.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Eye size={16} />
                    View Full Profile
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProfile && (
        <JobProfileDetailModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onApprove={handleApproveProfile}
          onReject={handleRejectProfile}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};
