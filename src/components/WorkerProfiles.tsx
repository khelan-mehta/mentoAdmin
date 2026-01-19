import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  PhoneCall,
  Mail,
  MapPin,
  X,
  Loader2,
  Search,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  DollarSign,
  Award,
} from "lucide-react";
import { BASE_URL } from "./Constants";

const API_BASE_URL = BASE_URL;

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

// ==================== WORKER DETAIL MODAL ====================
const WorkerDetailModal = ({
  worker,
  onClose,
  onSave,
  isLoading,
  categories,
}: any) => {
  const [formData, setFormData] = useState({
    categories: worker?.categories || [],
    subcategories: worker?.subcategories || [],
    experience_years: worker?.experience_years || 0,
    description: worker?.description || "",
    hourly_rate: worker?.hourly_rate || 0,
    license_number: worker?.license_number || "",
    service_areas: worker?.service_areas || [],
    is_verified: worker?.is_verified || false,
    is_available: worker?.is_available || true,
  });

  useEffect(() => {
    if (worker) {
      setFormData({
        categories: worker.categories || [],
        subcategories: worker.subcategories || [],
        experience_years: worker.experience_years || 0,
        description: worker.description || "",
        hourly_rate: worker.hourly_rate || 0,
        license_number: worker.license_number || "",
        service_areas: worker.service_areas || [],
        is_verified: worker.is_verified || false,
        is_available: worker.is_available || true,
      });
    }
  }, [worker]);

  if (!worker) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(worker.id?.$oid || worker._id?.$oid, formData);
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
            Edit Worker Profile
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
              marginBottom: "24px",
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
                Experience (Years)
              </label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) =>
                  handleInputChange("experience_years", parseInt(e.target.value) || 0)
                }
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
                Hourly Rate ($)
              </label>
              <input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) =>
                  handleInputChange("hourly_rate", parseFloat(e.target.value) || 0)
                }
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
                License Number
              </label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) =>
                  handleInputChange("license_number", e.target.value)
                }
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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                minHeight: "100px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.is_verified}
                onChange={(e) =>
                  handleInputChange("is_verified", e.target.checked)
                }
                style={{ cursor: "pointer" }}
              />
              <span style={{ fontSize: "14px", color: theme.colors.text }}>
                Verified
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) =>
                  handleInputChange("is_available", e.target.checked)
                }
                style={{ cursor: "pointer" }}
              />
              <span style={{ fontSize: "14px", color: theme.colors.text }}>
                Available
              </span>
            </label>
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
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "12px",
                background: theme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
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
              Save Changes
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ==================== DELETE CONFIRMATION MODAL ====================
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  workerName,
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
            <Trash2 size={28} color={theme.colors.danger} />
          </div>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "18px",
              fontWeight: "700",
              color: theme.colors.text,
            }}
          >
            Delete Worker Profile?
          </h3>
          <p
            style={{
              margin: 0,
              color: theme.colors.textSecondary,
              fontSize: "14px",
            }}
          >
            Are you sure you want to delete {workerName}'s profile? This action
            cannot be undone.
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

// ==================== WORKER PROFILES COMPONENT ====================
export const WorkerProfiles = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterVerified === "verified") params.append("is_verified", "true");
      if (filterVerified === "unverified") params.append("is_verified", "false");

      const response = await fetch(
        `${API_BASE_URL}/admin/workers?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWorkers(data.data?.workers || []);
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchWorkers();
    fetchCategories();
  }, [filterVerified]);

  const handleSaveWorker = async (workerId: string, formData: any) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSelectedWorker(null);
        fetchWorkers();
      }
    } catch (error) {
      console.error("Error updating worker:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWorker = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);
      const workerId = deleteTarget.id?.$oid || deleteTarget._id?.$oid;
      const response = await fetch(`${API_BASE_URL}/admin/workers/${workerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchWorkers();
      }
    } catch (error) {
      console.error("Error deleting worker:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      worker.user_id?.toString().toLowerCase().includes(searchLower) ||
      worker.categories?.some((cat: string) => cat.toLowerCase().includes(searchLower)) ||
      worker.subcategories?.some((sub: string) => sub.toLowerCase().includes(searchLower)) ||
      worker.description?.toLowerCase().includes(searchLower);

    return matchesSearch;
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
            Worker Profiles Management
          </h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                width: "220px",
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
            { key: "all", label: "All Workers" },
            { key: "verified", label: "Verified" },
            { key: "unverified", label: "Unverified" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterVerified(tab.key as any)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background:
                  filterVerified === tab.key ? theme.colors.primary : "transparent",
                color:
                  filterVerified === tab.key ? "white" : theme.colors.textSecondary,
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
              Loading workers...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <User size={48} color={theme.colors.border} style={{ marginBottom: "16px" }} />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>
              No Worker Profiles
            </h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery
                ? "No results match your search."
                : "There are no worker profiles to display."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "User Name",
                    "Contact",
                    "Categories",
                    "Experience",
                    "Hourly Rate",
                    "Rating",
                    "Status",
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
                {filteredWorkers.map((worker: any, index: number) => (
                  <tr
                    key={worker.id?.$oid || worker._id?.$oid || index}
                    style={{
                      borderBottom: `1px solid ${theme.colors.border}`,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = theme.colors.background)
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
                        fontSize: "14px",
                      }}
                    >
                      {worker.user_name || "N/A"}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        color: theme.colors.textSecondary,
                        fontSize: "13px",
                      }}
                    >
                      {worker.user_mobile || worker.user_email || "N/A"}
                    </td>
                    <td style={{ padding: "16px", color: theme.colors.textSecondary }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {worker.categories?.slice(0, 2).map((cat: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              padding: "2px 8px",
                              borderRadius: "12px",
                              background: `${theme.colors.primary}15`,
                              color: theme.colors.primary,
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                          >
                            {cat}
                          </span>
                        ))}
                        {worker.categories?.length > 2 && (
                          <span
                            style={{
                              padding: "2px 8px",
                              fontSize: "11px",
                              color: theme.colors.textSecondary,
                            }}
                          >
                            +{worker.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px", color: theme.colors.textSecondary }}>
                      {worker.experience_years || 0} years
                    </td>
                    <td style={{ padding: "16px", color: theme.colors.textSecondary }}>
                      ${worker.hourly_rate || 0}/hr
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Star size={14} color={theme.colors.warning} fill={theme.colors.warning} />
                        <span style={{ fontWeight: "600", color: theme.colors.text }}>
                          {worker.rating?.toFixed(1) || "0.0"}
                        </span>
                        <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>
                          ({worker.total_reviews || 0})
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {worker.is_verified ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              background: "#D1FAE5",
                              color: theme.colors.success,
                            }}
                          >
                            <CheckCircle size={12} />
                            Verified
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              background: "#FEE2E2",
                              color: theme.colors.danger,
                            }}
                          >
                            <XCircle size={12} />
                            Unverified
                          </span>
                        )}
                        {worker.is_available && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              background: "#DBEAFE",
                              color: theme.colors.primary,
                            }}
                          >
                            Available
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => setSelectedWorker(worker)}
                          style={{
                            padding: "8px 12px",
                            background: theme.colors.primary,
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(worker);
                            setShowDeleteModal(true);
                          }}
                          style={{
                            padding: "8px",
                            background: theme.colors.danger,
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedWorker && (
        <WorkerDetailModal
          worker={selectedWorker}
          categories={categories}
          onClose={() => setSelectedWorker(null)}
          onSave={handleSaveWorker}
          isLoading={actionLoading}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteWorker}
        workerName={
          deleteTarget?.user_id?.$oid?.substring(0, 8) || "this worker"
        }
        isLoading={actionLoading}
      />
    </div>
  );
};
