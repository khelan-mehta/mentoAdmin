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




// ==================== SERVICES COMPONENT ====================


// ==================== SETTINGS COMPONENT ====================
export const SettingsPage = () => (
  <div style={{ padding: "24px" }}>
    <div style={{ maxWidth: "800px" }}>
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: theme.colors.text,
            marginBottom: "20px",
          }}
        >
          General Settings
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: theme.colors.text,
              marginBottom: "8px",
            }}
          >
            Platform Name
          </label>
          <input
            type="text"
            defaultValue="ServiceApp"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: theme.colors.text,
              marginBottom: "8px",
            }}
          >
            Support Email
          </label>
          <input
            type="email"
            defaultValue="support@serviceapp.com"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: theme.colors.text,
              marginBottom: "8px",
            }}
          >
            Commission Rate (%)
          </label>
          <input
            type="number"
            defaultValue="15"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </div>

        <button
          style={{
            padding: "10px 24px",
            background: theme.colors.primary,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </div>

      <div
        style={{
          background: theme.colors.surface,
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: theme.colors.text,
            marginBottom: "20px",
          }}
        >
          Notification Settings
        </h2>

        {[
          "New Booking",
          "Booking Completed",
          "Worker Registration",
          "Payment Received",
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 0",
              borderBottom:
                idx < 3 ? `1px solid ${theme.colors.border}` : "none",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {item}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: theme.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Receive notifications for {item.toLowerCase()}
              </div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);