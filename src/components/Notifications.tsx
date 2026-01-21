import { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle,
  Trash2,
  Loader2,
  AlertCircle,
  Users,
  Briefcase,
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

import { BASE_URL } from "./Constants";
const API_BASE_URL = BASE_URL;

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  related_id?: string;
  is_read: boolean;
  created_at: {
    $date?: { $numberLong: string };
  } | string;
}

// ==================== NOTIFICATIONS COMPONENT ====================
export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const isReadParam = filter === "unread" ? "?is_read=false" : "";
      const response = await fetch(`${API_BASE_URL}/notifications${isReadParam}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data?.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data?.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (response.ok) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_worker":
        return <Users size={20} color={theme.colors.primary} />;
      case "new_job_seeker":
        return <Briefcase size={20} color={theme.colors.success} />;
      default:
        return <AlertCircle size={20} color={theme.colors.warning} />;
    }
  };

  const formatDate = (dateField: any) => {
    try {
      let timestamp: number;
      if (typeof dateField === "string") {
        timestamp = new Date(dateField).getTime();
      } else if (dateField?.$date?.$numberLong) {
        timestamp = parseInt(dateField.$date.$numberLong);
      } else {
        return "N/A";
      }

      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch (error) {
      return "N/A";
    }
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
        {/* Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Bell size={24} color={theme.colors.primary} />
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: theme.colors.text,
                margin: 0,
              }}
            >
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: theme.colors.danger,
                  color: "white",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={actionLoading}
              style={{
                padding: "8px 16px",
                background: theme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: actionLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <CheckCircle size={14} />
              Mark All as Read
            </button>
          )}
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
            { key: "all", label: "All Notifications" },
            { key: "unread", label: "Unread" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: filter === tab.key ? theme.colors.primary : "transparent",
                color: filter === tab.key ? "white" : theme.colors.textSecondary,
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

        {/* Notifications List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader2 size={32} color={theme.colors.primary} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px", color: theme.colors.textSecondary }}>Loading notifications...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Bell size={48} color={theme.colors.border} style={{ marginBottom: "16px" }} />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>No Notifications</h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {filter === "unread" ? "You're all caught up!" : "No notifications to display."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: "16px",
                  background: notification.is_read ? theme.colors.surface : "#F0F9FF",
                  border: `1px solid ${notification.is_read ? theme.colors.border : theme.colors.primary}20`,
                  borderRadius: "12px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: notification.is_read ? theme.colors.background : `${theme.colors.primary}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getNotificationIcon(notification.notification_type)}
                </div>

                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: "0 0 4px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: theme.colors.text,
                    }}
                  >
                    {notification.title}
                  </h4>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: theme.colors.textSecondary, lineHeight: "1.5" }}>
                    {notification.body}
                  </p>
                  <span style={{ fontSize: "12px", color: theme.colors.inactive }}>
                    {formatDate(notification.created_at)}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={actionLoading}
                      style={{
                        padding: "8px",
                        background: theme.colors.background,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "6px",
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Mark as read"
                    >
                      <CheckCircle size={16} color={theme.colors.success} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    disabled={actionLoading}
                    style={{
                      padding: "8px",
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: "6px",
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Delete"
                  >
                    <Trash2 size={16} color={theme.colors.danger} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
