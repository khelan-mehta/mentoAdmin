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


// ==================== ADD/EDIT MODAL ====================
const CategoryModal = ({
  isOpen,
  onClose,
  onSave,
  category,
  type,
  parentCategoryId,
  isLoading,
}: any) => {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [icon, setIcon] = useState(category?.icon || "");
  const [order, setOrder] = useState(category?.order || 0);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
      setIcon(category.icon || "");
      setOrder(category.order || 0);
    } else {
      setName("");
      setDescription("");
      setIcon("");
      setOrder(0);
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const data: any = {
      name,
      description: description || undefined,
      order: parseInt(order) || 0,
      is_active: true,
    };

    if (type === "category") {
      data.icon = icon || undefined;
    } else {
      data.main_category_id = parentCategoryId;
    }

    onSave(data);
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
          maxWidth: "500px",
          overflow: "hidden",
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
            {category ? "Edit" : "Add"}{" "}
            {type === "category" ? "Category" : "Sub-Category"}
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
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${
                type === "category" ? "category" : "sub-category"
              } name`}
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

          {type === "category" && (
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
                Icon (emoji or icon name)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g., wrench or plumbing"
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
          )}

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Display Order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
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
              disabled={!name.trim() || isLoading}
              style={{
                flex: 1,
                padding: "12px",
                background: theme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: name.trim() && !isLoading ? "pointer" : "not-allowed",
                opacity: name.trim() && !isLoading ? 1 : 0.6,
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
              {category ? "Update" : "Create"}
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
            item?
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
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: string;
    id: string;
    name: string;
  } | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSaveCategory = async (data: any) => {
    try {
      setActionLoading(true);
      const url = selectedCategory
        ? `${API_BASE_URL}/admin/categories/${selectedCategory.id}`
        : `${API_BASE_URL}/admin/categories`;
      const method = selectedCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowCategoryModal(false);
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSubcategory = async (data: any) => {
    try {
      setActionLoading(true);
      const url = selectedSubcategory
        ? `${API_BASE_URL}/admin/subcategories/${selectedSubcategory.id}`
        : `${API_BASE_URL}/admin/subcategories`;
      const method = selectedSubcategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowSubcategoryModal(false);
        setSelectedSubcategory(null);
        setParentCategoryId(null);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving subcategory:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);
      const endpoint =
        deleteTarget.type === "category" ? "categories" : "subcategories";
      const response = await fetch(
        `${API_BASE_URL}/admin/${endpoint}/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subcategories?.some((sub: any) =>
        sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
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
            marginBottom: "24px",
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
            Services & Categories Management
          </h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
                placeholder="Search categories..."
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
                setSelectedCategory(null);
                setShowCategoryModal(true);
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
              Add Category
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
              Loading categories...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <FolderTree
              size={48}
              color={theme.colors.border}
              style={{ marginBottom: "16px" }}
            />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>
              No Categories
            </h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery
                ? "No results match your search."
                : "Start by adding your first category."}
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {paginatedCategories.map((category: any) => (
              <div
                key={category.id}
                style={{
                  background: theme.colors.background,
                  borderRadius: "12px",
                  border: `1px solid ${theme.colors.border}`,
                  overflow: "hidden",
                }}
              >
                {/* Category Header */}
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onClick={() => toggleCategory(category.id)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = theme.colors.surface)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: `${theme.colors.primary}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {(() => {
                        const Icon =
                          category.icon && iconMap[category.icon]
                            ? iconMap[category.icon]
                            : Layers;

                        return <Icon size={22} color={theme.colors.primary} />;
                      })()}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "700",
                          color: theme.colors.text,
                          fontSize: "15px",
                        }}
                      >
                        {category.name}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: theme.colors.textSecondary,
                          marginTop: "2px",
                        }}
                      >
                        {category.subcategories?.length || 0} sub-categories
                        {category.description && ` - ${category.description}`}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setParentCategoryId(category.id);
                        setSelectedSubcategory(null);
                        setShowSubcategoryModal(true);
                      }}
                      style={{
                        padding: "8px 12px",
                        background: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: theme.colors.primary,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Plus size={14} />
                      Sub-category
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(category);
                        setShowCategoryModal(true);
                      }}
                      style={{
                        padding: "8px",
                        background: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <Edit size={16} color={theme.colors.textSecondary} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({
                          type: "category",
                          id: category.id,
                          name: category.name,
                        });
                        setShowDeleteModal(true);
                      }}
                      style={{
                        padding: "8px",
                        background: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={16} color={theme.colors.danger} />
                    </button>
                    {expandedCategories.has(category.id) ? (
                      <ChevronUp size={20} color={theme.colors.textSecondary} />
                    ) : (
                      <ChevronDown
                        size={20}
                        color={theme.colors.textSecondary}
                      />
                    )}
                  </div>
                </div>

                {/* Subcategories */}
                {expandedCategories.has(category.id) &&
                  category.subcategories &&
                  category.subcategories.length > 0 && (
                    <div
                      style={{
                        borderTop: `1px solid ${theme.colors.border}`,
                        background: theme.colors.surface,
                      }}
                    >
                      {category.subcategories.map((sub: any, index: number) => (
                        <div
                          key={sub.id}
                          style={{
                            padding: "12px 20px 12px 80px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom:
                              index < category.subcategories.length - 1
                                ? `1px solid ${theme.colors.border}`
                                : "none",
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
                              {sub.name}
                            </div>
                            {sub.description && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: theme.colors.textSecondary,
                                  marginTop: "2px",
                                }}
                              >
                                {sub.description}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <button
                              onClick={() => {
                                setParentCategoryId(category.id);
                                setSelectedSubcategory(sub);
                                setShowSubcategoryModal(true);
                              }}
                              style={{
                                padding: "6px",
                                background: "transparent",
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              <Edit
                                size={14}
                                color={theme.colors.textSecondary}
                              />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget({
                                  type: "subcategory",
                                  id: sub.id,
                                  name: sub.name,
                                });
                                setShowDeleteModal(true);
                              }}
                              style={{
                                padding: "6px",
                                background: "transparent",
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={14} color={theme.colors.danger} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Empty subcategories message */}
                {expandedCategories.has(category.id) &&
                  (!category.subcategories ||
                    category.subcategories.length === 0) && (
                    <div
                      style={{
                        borderTop: `1px solid ${theme.colors.border}`,
                        padding: "24px",
                        textAlign: "center",
                        background: theme.colors.surface,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: theme.colors.textSecondary,
                          fontSize: "14px",
                        }}
                      >
                        No sub-categories yet.{" "}
                        <button
                          onClick={() => {
                            setParentCategoryId(category.id);
                            setSelectedSubcategory(null);
                            setShowSubcategoryModal(true);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: theme.colors.primary,
                            fontWeight: "600",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Add one now
                        </button>
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCategories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredCategories.length}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setSelectedCategory(null);
        }}
        onSave={handleSaveCategory}
        category={selectedCategory}
        type="category"
        isLoading={actionLoading}
      />

      {/* Subcategory Modal */}
      <CategoryModal
        isOpen={showSubcategoryModal}
        onClose={() => {
          setShowSubcategoryModal(false);
          setSelectedSubcategory(null);
          setParentCategoryId(null);
        }}
        onSave={handleSaveSubcategory}
        category={selectedSubcategory}
        type="subcategory"
        parentCategoryId={parentCategoryId}
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
