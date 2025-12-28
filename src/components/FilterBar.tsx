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









// ==================== FILTER BAR COMPONENT ====================
export const FilterBar = ({
  type,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  setSearchQuery,
}: any) => (
  <div
    style={{
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
      alignItems: "center",
    }}
  >
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      style={{
        padding: "8px 12px",
        border: `1px solid ${theme.colors.border}`,
        borderRadius: "8px",
        fontSize: "14px",
        background: theme.colors.surface,
        cursor: "pointer",
      }}
    >
      <option value="all">All Status</option>
      {type === "bookings" ? (
        <>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </>
      ) : (
        <>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </>
      )}
    </select>

    {type === "bookings" && (
      <select
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        style={{
          padding: "8px 12px",
          border: `1px solid ${theme.colors.border}`,
          borderRadius: "8px",
          fontSize: "14px",
          background: theme.colors.surface,
          cursor: "pointer",
        }}
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    )}

    {type === "workers" && (
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        style={{
          padding: "8px 12px",
          border: `1px solid ${theme.colors.border}`,
          borderRadius: "8px",
          fontSize: "14px",
          background: theme.colors.surface,
          cursor: "pointer",
        }}
      >
        <option value="all">All Categories</option>
        <option value="Plumbing">Plumbing</option>
        <option value="Electrical">Electrical</option>
        <option value="Cleaning">Cleaning</option>
        <option value="Painting">Painting</option>
        <option value="Appliance Repair">Appliance Repair</option>
        <option value="Carpentry">Carpentry</option>
      </select>
    )}

    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      style={{
        padding: "8px 12px",
        border: `1px solid ${theme.colors.border}`,
        borderRadius: "8px",
        fontSize: "14px",
        background: theme.colors.surface,
        cursor: "pointer",
      }}
    >
      <option value="date">Sort by Date</option>
      {type === "bookings" && <option value="amount">Sort by Amount</option>}
      {type === "workers" && (
        <>
          <option value="rating">Sort by Rating</option>
          <option value="jobs">Sort by Jobs</option>
          <option value="earnings">Sort by Earnings</option>
        </>
      )}
      {type === "customers" && (
        <>
          <option value="bookings">Sort by Bookings</option>
          <option value="totalSpent">Sort by Spending</option>
        </>
      )}
    </select>

    <button
      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      style={{
        padding: "8px 16px",
        border: `1px solid ${theme.colors.border}`,
        borderRadius: "8px",
        fontSize: "14px",
        background: theme.colors.surface,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {sortOrder === "asc" ? "↑" : "↓"}{" "}
      {sortOrder === "asc" ? "Ascending" : "Descending"}
    </button>

    <button
      onClick={() => {
        setStatusFilter("all");
        setCategoryFilter("all");
        setDateFilter("all");
        setSortBy("date");
        setSortOrder("desc");
        setSearchQuery("");
      }}
      style={{
        padding: "8px 16px",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        background: theme.colors.danger,
        color: "white",
        cursor: "pointer",
        marginLeft: "auto",
      }}
    >
      Reset Filters
    </button>
  </div>
);