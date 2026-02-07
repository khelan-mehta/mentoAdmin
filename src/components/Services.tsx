import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  FolderTree,
  X,
  AlertCircle,
  Check,
  Layers,
  Package,
} from "lucide-react";
import { iconMap } from "./iconMap";
import { BASE_URL } from "./Constants";
import { Pagination } from "./Pagination";
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

// ==================== SERVICE ADD/EDIT MODAL ====================
const ServiceModal = ({
  isOpen,
  onClose,
  onSave,
  service,
  categories,
  isLoading,
}: any) => {
  const [name, setName] = useState(service?.name || "");
  const [serviceCategory, setServiceCategory] = useState(
    service?.serviceCategory || service?.service_category || ""
  );
  const [newCategory, setNewCategory] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [description, setDescription] = useState(service?.description || "");
  const [price, setPrice] = useState(service?.price || "0");
  const [rating, setRating] = useState(service?.rating || "0.0");
  const [icon, setIcon] = useState(service?.icon || "");
  const [color, setColor] = useState(service?.color || "#0EA5E9");

  useEffect(() => {
    if (service) {
      setName(service.name || "");
      setServiceCategory(
        service.serviceCategory || service.service_category || ""
      );
      setDescription(service.description || "");
      setPrice(service.price || "0");
      setRating(service.rating || "0.0");
      setIcon(service.icon || "");
      setColor(service.color || "#0EA5E9");
      setNewCategory("");
      setUseNewCategory(false);
    } else {
      setName("");
      setServiceCategory(categories[0] || "");
      setDescription("");
      setPrice("0");
      setRating("0.0");
      setIcon("");
      setColor("#0EA5E9");
      setNewCategory("");
      setUseNewCategory(false);
    }
  }, [service, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const category = useNewCategory ? newCategory.trim() : serviceCategory;
    if (!name.trim() || !category) return;

    onSave({
      name: name.trim(),
      service_category: category,
      description: description || undefined,
      price: price || "0",
      rating: rating || "0.0",
      icon: icon || undefined,
      color: color || "#0EA5E9",
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
          maxWidth: "540px",
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
            {service ? "Edit" : "Add"} Service
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
          {/* Service Name */}
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
              Service Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter service name"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* Category */}
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
              Category *
            </label>
            {!useNewCategory ? (
              <div>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    fontSize: "14px",
                    outline: "none",
                    background: theme.colors.surface,
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((cat: string) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setUseNewCategory(true)}
                  style={{
                    marginTop: "8px",
                    background: "none",
                    border: "none",
                    color: theme.colors.primary,
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  + Create new category
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    setUseNewCategory(false);
                    setNewCategory("");
                  }}
                  style={{
                    marginTop: "8px",
                    background: "none",
                    border: "none",
                    color: theme.colors.textSecondary,
                    fontSize: "13px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Use existing category
                </button>
              </div>
            )}
          </div>

          {/* Description */}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                minHeight: "80px",
                resize: "vertical",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* Price and Rating Row */}
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
                Price
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
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
                Rating
              </label>
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="0.0"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Icon and Color Row */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
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
                Icon (name)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g., wrench"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
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
                Color
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    cursor: "pointer",
                    padding: "2px",
                  }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
            </div>
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
              onClick={handleSubmit}
              disabled={
                !name.trim() ||
                (!serviceCategory && !newCategory.trim()) ||
                isLoading
              }
              style={{
                flex: 1,
                padding: "12px",
                background: theme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor:
                  name.trim() &&
                  (serviceCategory || newCategory.trim()) &&
                  !isLoading
                    ? "pointer"
                    : "not-allowed",
                opacity:
                  name.trim() &&
                  (serviceCategory || newCategory.trim()) &&
                  !isLoading
                    ? 1
                    : 0.6,
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
              {service ? "Update" : "Create"}
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
  itemName,
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
            Delete {itemName}?
          </h3>
          <p
            style={{
              margin: 0,
              color: theme.colors.textSecondary,
              fontSize: "14px",
            }}
          >
            This action cannot be undone. Are you sure you want to delete this
            service?
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

// ==================== SERVICES COMPONENT ====================
export const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/services?limit=200`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data.data?.services || []);
        setCategories(data.data?.categories || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async (data: any) => {
    try {
      setActionLoading(true);
      const serviceId =
        selectedService?._id?.$oid || selectedService?._id || selectedService?.id;
      const url = serviceId
        ? `${API_BASE_URL}/admin/services/${serviceId}`
        : `${API_BASE_URL}/admin/services`;
      const method = serviceId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowServiceModal(false);
        setSelectedService(null);
        fetchServices();
      } else {
        const errData = await response.json().catch(() => null);
        alert(errData?.message || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admin/services/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchServices();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredServices = services.filter((svc) => {
    const matchesSearch =
      svc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (svc.serviceCategory || svc.service_category || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const svcCategory = svc.serviceCategory || svc.service_category || "";
    const matchesCategory =
      categoryFilter === "all" || svcCategory === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Group by category for display
  const groupedServices: Record<string, any[]> = {};
  filteredServices.forEach((svc) => {
    const cat = svc.serviceCategory || svc.service_category || "Uncategorized";
    if (!groupedServices[cat]) groupedServices[cat] = [];
    groupedServices[cat].push(svc);
  });
  const sortedCategoryKeys = Object.keys(groupedServices).sort();

  // Flat pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Group paginated services by category
  const paginatedGrouped: Record<string, any[]> = {};
  paginatedServices.forEach((svc) => {
    const cat = svc.serviceCategory || svc.service_category || "Uncategorized";
    if (!paginatedGrouped[cat]) paginatedGrouped[cat] = [];
    paginatedGrouped[cat].push(svc);
  });
  const paginatedCategoryKeys = Object.keys(paginatedGrouped).sort();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

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
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: theme.colors.text,
                margin: 0,
              }}
            >
              Services Management
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: theme.colors.textSecondary,
              }}
            >
              {filteredServices.length} services across{" "}
              {sortedCategoryKeys.length} categories
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

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
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "10px 16px 10px 40px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  width: "220px",
                  outline: "none",
                }}
              />
            </div>
            <button
              onClick={() => {
                setSelectedService(null);
                setShowServiceModal(true);
              }}
              style={{
                padding: "10px 20px",
                background: theme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Plus size={18} />
              Add Service
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader2
              size={32}
              color={theme.colors.primary}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <p style={{ marginTop: "12px", color: theme.colors.textSecondary }}>
              Loading services...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Package
              size={48}
              color={theme.colors.border}
              style={{ marginBottom: "16px" }}
            />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>
              No Services
            </h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery
                ? "No results match your search."
                : "Start by adding your first service."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Service", "Category", "Price", "Rating", "Color", "Actions"].map(
                    (header) => (
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
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedServices.map((svc: any, index: number) => {
                  const svcId = svc._id?.$oid || svc._id || svc.id;
                  const svcCategory =
                    svc.serviceCategory || svc.service_category || "";
                  const Icon =
                    svc.icon && iconMap[svc.icon] ? iconMap[svc.icon] : Package;

                  return (
                    <tr
                      key={svcId || index}
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
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              background: `${svc.color || theme.colors.primary}15`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon
                              size={20}
                              color={svc.color || theme.colors.primary}
                            />
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                color: theme.colors.text,
                                fontSize: "14px",
                              }}
                            >
                              {svc.name}
                            </div>
                            {svc.description && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: theme.colors.textSecondary,
                                  marginTop: "2px",
                                  maxWidth: "250px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {svc.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: `${theme.colors.primary}15`,
                            color: theme.colors.primary,
                          }}
                        >
                          {svcCategory}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          color: theme.colors.text,
                          fontWeight: "500",
                        }}
                      >
                        {svc.price && svc.price !== "0"
                          ? `Rs.${svc.price}`
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          color: theme.colors.text,
                        }}
                      >
                        {svc.rating && svc.rating !== "0.0"
                          ? svc.rating
                          : "-"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "6px",
                              background: svc.color || "#0EA5E9",
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              color: theme.colors.textSecondary,
                            }}
                          >
                            {svc.color || "#0EA5E9"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <button
                            onClick={() => {
                              setSelectedService(svc);
                              setShowServiceModal(true);
                            }}
                            style={{
                              padding: "6px 10px",
                              background: theme.colors.surface,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: theme.colors.primary,
                            }}
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget({
                                id: svcId,
                                name: svc.name,
                              });
                              setShowDeleteModal(true);
                            }}
                            style={{
                              padding: "6px 10px",
                              background: theme.colors.surface,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: theme.colors.danger,
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredServices.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredServices.length}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedService(null);
        }}
        onSave={handleSaveService}
        service={selectedService}
        categories={categories}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name}
        isLoading={actionLoading}
      />
    </div>
  );
};
