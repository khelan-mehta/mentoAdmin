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
export const Bookings = ({
  bookings,
  updateBookingStatus,
  deleteItem,
  setSelectedItem,
  setModalType,
  setShowModal,
  filterData,
}: any) => {
  const filteredBookings = filterData(bookings, "bookings");

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
            All Bookings ({filteredBookings.length})
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

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: theme.colors.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: theme.colors.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  CUSTOMER
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: theme.colors.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  SERVICE
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: theme.colors.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  WORKER
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: theme.colors.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  DATE
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: theme.colors.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  AMOUNT
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: theme.colors.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: theme.colors.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking: any) => (
                <tr
                  key={booking.id}
                  style={{ borderBottom: `1px solid ${theme.colors.border}` }}
                >
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    #{booking.id}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      color: theme.colors.text,
                      fontWeight: "600",
                    }}
                  >
                    {booking.customer}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      color: theme.colors.text,
                    }}
                  >
                    {booking.service}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      color: theme.colors.text,
                    }}
                  >
                    {booking.worker}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {new Date(booking.date).toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: "14px",
                      color: theme.colors.text,
                      fontWeight: "600",
                    }}
                  >
                    ${booking.amount}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        updateBookingStatus(booking.id, e.target.value)
                      }
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: getStatusBg(booking.status),
                        color: getStatusColor(booking.status),
                        border: "none",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => {
                          setSelectedItem(booking);
                          setModalType("booking");
                          setShowModal(true);
                        }}
                        style={{
                          padding: "6px",
                          background: theme.colors.primary,
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "6px",
                          color: "white",
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem(booking.id, "booking")}
                        style={{
                          padding: "6px",
                          background: theme.colors.danger,
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "6px",
                          color: "white",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};