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

// ==================== JOB PROFILE DETAIL MODAL ====================
const JobProfileDetailModal = ({ profile, onClose, onApprove, onReject, isLoading }: any) => {
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
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: theme.colors.text }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
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
                {profile.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                  {profile.full_name}
                </h3>
                <p style={{ margin: "4px 0 0", color: theme.colors.primary, fontSize: "14px", fontWeight: "500" }}>
                  {profile.headline || "Job Seeker"}
                </p>
                <p style={{ margin: "4px 0 0", color: theme.colors.textSecondary, fontSize: "13px" }}>
                  {profile.experience_years ? `${profile.experience_years} years experience` : "Experience not specified"}
                </p>
              </div>
            </div>
            {getStatusBadge(profile.is_verified)}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                About
              </h4>
              <p style={{ margin: 0, color: theme.colors.textSecondary, lineHeight: "1.6" }}>
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
            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <DollarSign size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Expected Salary</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                {profile.expected_salary_min && profile.expected_salary_max
                  ? `₹${profile.expected_salary_min.toLocaleString()} - ₹${profile.expected_salary_max.toLocaleString()}`
                  : "Not specified"}
              </p>
            </div>

            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <MapPin size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Preferred Locations</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                {profile.preferred_locations?.length > 0
                  ? profile.preferred_locations.join(", ")
                  : "Not specified"}
              </p>
            </div>

            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Briefcase size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Job Types</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text, textTransform: "capitalize" }}>
                {profile.preferred_job_types?.length > 0
                  ? profile.preferred_job_types.join(", ")
                  : "Not specified"}
              </p>
            </div>

            <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Star size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Subscription</span>
              </div>
              <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text, textTransform: "capitalize" }}>
                {profile.subscription_plan || "None"}
              </p>
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
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
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text, display: "flex", alignItems: "center", gap: "8px" }}>
                <GraduationCap size={16} />
                Education
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {profile.education.map((edu: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      background: theme.colors.background,
                      borderRadius: "8px",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>{edu.degree}</p>
                    <p style={{ margin: "4px 0 0", color: theme.colors.textSecondary, fontSize: "14px" }}>
                      {edu.institution}
                    </p>
                    {edu.field_of_study && (
                      <p style={{ margin: "4px 0 0", color: theme.colors.textSecondary, fontSize: "13px" }}>
                        {edu.field_of_study}
                      </p>
                    )}
                    <p style={{ margin: "4px 0 0", color: theme.colors.textSecondary, fontSize: "12px" }}>
                      {edu.start_year} - {edu.is_current ? "Present" : edu.end_year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {profile.work_experience && profile.work_experience.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text, display: "flex", alignItems: "center", gap: "8px" }}>
                <Building size={16} />
                Work Experience
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {profile.work_experience.map((exp: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      background: theme.colors.background,
                      borderRadius: "8px",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>{exp.title}</p>
                    <p style={{ margin: "4px 0 0", color: theme.colors.primary, fontSize: "14px" }}>
                      {exp.company}
                    </p>
                    {exp.location && (
                      <p style={{ margin: "4px 0 0", color: theme.colors.textSecondary, fontSize: "13px" }}>
                        {exp.location}
                      </p>
                    )}
                    <p style={{ margin: "4px 0 0", color: theme.colors.textSecondary, fontSize: "12px" }}>
                      {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                    </p>
                    {exp.description && (
                      <p style={{ margin: "8px 0 0", color: theme.colors.textSecondary, fontSize: "13px", lineHeight: "1.5" }}>
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
            <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text, display: "flex", alignItems: "center", gap: "8px" }}>
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
                      onClick={() => onReject(profile.id || profile._id?.$oid, rejectionReason)}
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
                    {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={16} />}
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
  const [activeView, setActiveView] = useState<"all" | "pending" | "verified">("all");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchJobProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/job-seekers`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setJobProfiles(data.data?.profiles || []);
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
      const response = await fetch(`${API_BASE_URL}/admin/job-seekers/${profileId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ is_verified: true }),
      });
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
      const response = await fetch(`${API_BASE_URL}/admin/job-seekers/${profileId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ is_verified: false, rejection_reason: reason }),
      });
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
      profile.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.skills?.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

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
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by name, headline, or skill..."
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
            <p style={{ marginTop: "12px", color: theme.colors.textSecondary }}>Loading profiles...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <User size={48} color={theme.colors.border} style={{ marginBottom: "16px" }} />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>No Job Profiles</h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery ? "No results match your search." : "There are no job seeker profiles to review."}
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
            {filteredProfiles.map((profile: any, index: number) => (
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
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: theme.colors.primary,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      {profile.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: theme.colors.text,
                          marginBottom: "4px",
                        }}
                      >
                        {profile.full_name}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: theme.colors.primary,
                        }}
                      >
                        {profile.headline || "Job Seeker"}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: profile.is_verified ? "#D1FAE5" : "#FEF3C7",
                      color: profile.is_verified ? theme.colors.success : theme.colors.warning,
                    }}
                  >
                    {profile.is_verified ? "Verified" : "Pending"}
                  </span>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {profile.skills?.slice(0, 3).map((skill: string, idx: number) => (
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: theme.colors.textSecondary }}>
                      <Briefcase size={14} />
                      {profile.experience_years ? `${profile.experience_years} yrs exp` : "N/A"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: theme.colors.textSecondary }}>
                      <MapPin size={14} />
                      {profile.preferred_locations?.[0] || "N/A"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: theme.colors.textSecondary }}>
                      <Star size={14} />
                      {profile.subscription_plan || "Free"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: theme.colors.textSecondary }}>
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
            ))}
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
