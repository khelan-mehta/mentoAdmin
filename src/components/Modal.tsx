import { useMemo } from "react";
import {
  Home,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  Calendar,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  PhoneCall,
  Mail,
  MapPin,
  X,
  Activity,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import logo from '../assets/image.png';
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

// ==================== UTILITY FUNCTIONS ====================
const getStatusColor = (status: any) => {
  switch (status) {
    case "completed":
      return theme.colors.success;
    case "in-progress":
      return theme.colors.primary;
    case "pending":
      return theme.colors.warning;
    case "cancelled":
      return theme.colors.danger;
    case "active":
      return theme.colors.success;
    case "inactive":
      return theme.colors.danger;
    default:
      return theme.colors.textSecondary;
  }
};

const getStatusBg = (status: any) => {
  switch (status) {
    case "completed":
      return "#D1FAE5";
    case "in-progress":
      return "#DBEAFE";
    case "pending":
      return "#FEF3C7";
    case "cancelled":
      return "#FEE2E2";
    case "active":
      return "#D1FAE5";
    case "inactive":
      return "#FEE2E2";
    default:
      return "#F3F4F6";
  }
};






// ==================== MODAL COMPONENT ====================
export const Modal = ({
  showModal,
  setShowModal,
  selectedItem,
  modalType,
}: any) => {
  if (!showModal || !selectedItem) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={() => setShowModal(false)}
    >
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: theme.colors.text,
              margin: 0,
            }}
          >
            {modalType === "booking"
              ? "Booking Details"
              : modalType === "worker"
              ? "Worker Details"
              : "Customer Details"}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <X size={24} color={theme.colors.text} />
          </button>
        </div>

        {modalType === "booking" && (
          <div>
            <div
              style={{
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: theme.colors.textSecondary,
                  marginBottom: "4px",
                }}
              >
                Booking ID
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                #{selectedItem.id}
              </div>
            </div>
            <div
              style={{
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: theme.colors.textSecondary,
                  marginBottom: "4px",
                }}
              >
                Customer
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {selectedItem.customer}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: theme.colors.textSecondary,
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <PhoneCall size={14} />
                {selectedItem.phone}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: theme.colors.textSecondary,
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <MapPin size={14} />
                {selectedItem.address}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginBottom: "4px",
                  }}
                >
                  Service
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {selectedItem.service}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginBottom: "4px",
                  }}
                >
                  Worker
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {selectedItem.worker}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginBottom: "4px",
                  }}
                >
                  Date
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: theme.colors.text,
                  }}
                >
                  {new Date(selectedItem.date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginBottom: "4px",
                  }}
                >
                  Amount
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: theme.colors.success,
                  }}
                >
                  ${selectedItem.amount}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: theme.colors.textSecondary,
                  marginBottom: "8px",
                }}
              >
                Status
              </div>
              <span
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background: getStatusBg(selectedItem.status),
                  color: getStatusColor(selectedItem.status),
                  textTransform: "capitalize",
                }}
              >
                {selectedItem.status}
              </span>
            </div>
          </div>
        )}

        {modalType === "worker" && (
          <div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "24px",
                alignItems: "center",
              }}
            >
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
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                {selectedItem.name.charAt(0)}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: theme.colors.text,
                    marginBottom: "4px",
                  }}
                >
                  {selectedItem.name}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  {selectedItem.category}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background:
                        selectedItem.status === "active"
                          ? "#D1FAE5"
                          : "#FEE2E2",
                      color:
                        selectedItem.status === "active"
                          ? theme.colors.success
                          : theme.colors.danger,
                      textTransform: "capitalize",
                    }}
                  >
                    {selectedItem.status}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                padding: "20px",
                background: theme.colors.background,
                borderRadius: "12px",
                marginBottom: "24px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: theme.colors.text,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <Star size={20} fill="#F59E0B" color="#F59E0B" />
                  {selectedItem.rating}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginTop: "4px",
                  }}
                >
                  Rating
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  borderLeft: `1px solid ${theme.colors.border}`,
                  borderRight: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: theme.colors.primary,
                  }}
                >
                  {selectedItem.jobs}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginTop: "4px",
                  }}
                >
                  Jobs Done
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: theme.colors.success,
                  }}
                >
                  ${selectedItem.earnings.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginTop: "4px",
                  }}
                >
                  Total Earnings
                </div>
              </div>
            </div>

            <div
              style={{
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: theme.colors.textSecondary,
                  marginBottom: "8px",
                }}
              >
                Contact Information
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: theme.colors.text,
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <PhoneCall size={16} color={theme.colors.primary} />
                {selectedItem.phone}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: theme.colors.text,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Mail size={16} color={theme.colors.primary} />
                {selectedItem.email}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: theme.colors.textSecondary,
                  marginBottom: "4px",
                }}
              >
                Joined Date
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {new Date(selectedItem.joinDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  background: theme.colors.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <PhoneCall
                  size={16}
                  style={{ verticalAlign: "middle", marginRight: "6px" }}
                />
                Contact Worker
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  background: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Edit
                  size={16}
                  style={{ verticalAlign: "middle", marginRight: "6px" }}
                />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {modalType === "customer" && (
          <div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "24px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.success})`,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                {selectedItem.name.charAt(0)}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: theme.colors.text,
                    marginBottom: "4px",
                  }}
                >
                  {selectedItem.name}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: theme.colors.textSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "4px",
                  }}
                >
                  <Mail size={14} />
                  {selectedItem.email}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: theme.colors.textSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <PhoneCall size={14} />
                  {selectedItem.phone}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                padding: "20px",
                background: theme.colors.background,
                borderRadius: "12px",
                marginBottom: "24px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: theme.colors.primary,
                  }}
                >
                  {selectedItem.bookings}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginTop: "4px",
                  }}
                >
                  Total Bookings
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  borderLeft: `1px solid ${theme.colors.border}`,
                  borderRight: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: theme.colors.success,
                  }}
                >
                  ${selectedItem.totalSpent}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginTop: "4px",
                  }}
                >
                  Total Spent
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: theme.colors.text,
                  }}
                >
                  {new Date(selectedItem.joinDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginTop: "4px",
                  }}
                >
                  Member Since
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: theme.colors.textSecondary,
                  marginBottom: "8px",
                }}
              >
                Account Status
              </div>
              <span
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background:
                    selectedItem.status === "active" ? "#D1FAE5" : "#FEE2E2",
                  color:
                    selectedItem.status === "active"
                      ? theme.colors.success
                      : theme.colors.danger,
                  textTransform: "capitalize",
                }}
              >
                {selectedItem.status}
              </span>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  background: theme.colors.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                View Booking History
              </button>
              <button
                style={{
                  padding: "12px",
                  background: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <Mail size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};