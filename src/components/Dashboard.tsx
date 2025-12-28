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
export const Dashboard = ({
  bookings,
  workers,
  customers,
  setActiveTab,
}: any) => {
  const stats = useMemo(() => {
    const totalRevenue = bookings.reduce(
      (sum: any, b: any) => (b.status === "completed" ? sum + b.amount : sum),
      0
    );
    const activeBookings = bookings.filter(
      (b: any) => b.status === "in-progress" || b.status === "pending"
    ).length;

    const avgRating =
      workers.reduce((sum: any, w: any) => sum + w.rating, 0) / workers.length;

    return [
      {
        label: "Total Users",
        value: customers.length,
        change: "+12%",
        icon: Users,
        color: theme.colors.primary,
      },
      {
        label: "Active Jobs",
        value: activeBookings,
        change: "+8%",
        icon: Briefcase,
        color: theme.colors.success,
      },
      {
        label: "Revenue",
        value: `$${totalRevenue.toLocaleString()}`,
        change: "+23%",
        icon: Calendar,
        color: theme.colors.warning,
      },
      {
        label: "Avg Rating",
        value: avgRating.toFixed(1),
        change: "+0.2",
        icon: Star,
        color: "#F59E0B",
      },
    ];
  }, [bookings, workers, customers]);

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: theme.colors.surface,
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: theme.colors.text,
                  marginBottom: "4px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: theme.colors.success,
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {stat.change} from last month
              </div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `${stat.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <stat.icon size={24} color={stat.color} />
            </div>
          </div>
        ))}
      </div>

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
            Recent Bookings
          </h2>
          <button
            onClick={() => setActiveTab("bookings")}
            style={{
              padding: "8px 16px",
              background: theme.colors.primary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            View All
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
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking: any) => (
                <tr
                  key={booking.id}
                  style={{ borderBottom: `1px solid ${theme.colors.border}` }}
                >
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
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: getStatusBg(booking.status),
                        color: getStatusColor(booking.status),
                        textTransform: "capitalize",
                      }}
                    >
                      {booking.status}
                    </span>
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