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





// ==================== BOOKINGS COMPONENT ====================


export const Customers = ({
  customers,
  deleteItem,
  setSelectedItem,
  setModalType,
  setShowModal,
  filterData,
}: any) => {
  const filteredCustomers = filterData(customers, "customers");

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
            Customer Management ({filteredCustomers.length})
          </h2>
          <button
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
            <Download size={18} />
            Export
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredCustomers.map((customer: any) => (
            <div
              key={customer.id}
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
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.success})`,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: "700",
                    }}
                  >
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        marginBottom: "2px",
                      }}
                    >
                      {customer.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: theme.colors.textSecondary,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Mail size={12} />
                      {customer.email}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: theme.colors.textSecondary,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "2px",
                      }}
                    >
                      <PhoneCall size={12} />
                      {customer.phone}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "600",
                    background:
                      customer.status === "active" ? "#D1FAE5" : "#FEE2E2",
                    color:
                      customer.status === "active"
                        ? theme.colors.success
                        : theme.colors.danger,
                    height: "fit-content",
                  }}
                >
                  {customer.status}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  padding: "16px",
                  background: theme.colors.surface,
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: theme.colors.primary,
                    }}
                  >
                    {customer.bookings}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: theme.colors.textSecondary,
                      marginTop: "4px",
                    }}
                  >
                    Bookings
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
                      fontSize: "20px",
                      fontWeight: "700",
                      color: theme.colors.success,
                    }}
                  >
                    ${customer.totalSpent}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
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
                      fontSize: "13px",
                      fontWeight: "600",
                      color: theme.colors.text,
                    }}
                  >
                    {new Date(customer.joinDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: theme.colors.textSecondary,
                      marginTop: "4px",
                    }}
                  >
                    Joined
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setSelectedItem(customer);
                    setModalType("customer");
                    setShowModal(true);
                  }}
                  style={{
                    flex: 1,
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
                  View Profile
                </button>
                <button
                  onClick={() => deleteItem(customer.id, "customer")}
                  style={{
                    padding: "10px 12px",
                    background: theme.colors.danger,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};