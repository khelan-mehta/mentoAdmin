import { useState, useEffect } from "react";
import { Bell, Check, X, UserPlus, Briefcase } from "lucide-react";
import { theme } from "./Constants";

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  reference_id: string;
  reference_type: string;
  is_read: boolean;
  created_at: number;
}

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationCountChange: (count: number) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const Notifications = ({ isOpen, onClose, onNotificationCountChange }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const isReadFilter = activeFilter === "unread" ? "false" : "";
      const response = await fetch(
        `${API_BASE_URL}/admin/notifications?is_read=${isReadFilter}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications || []);

        // Fetch unread count
        const countResponse = await fetch(`${API_BASE_URL}/admin/notifications/unread-count`);
        const countData = await countResponse.json();
        if (countData.success) {
          onNotificationCountChange(countData.data.unread_count);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, activeFilter]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/notifications/mark-all-read`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "newworker":
        return <Briefcase size={20} color={theme.colors.primary} />;
      case "newjobseeker":
        return <UserPlus size={20} color={theme.colors.success} />;
      case "newuser":
        return <UserPlus size={20} color={theme.colors.warning} />;
      default:
        return <Bell size={20} color={theme.colors.textSecondary} />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.3)",
          zIndex: 999,
        }}
      />

      {/* Notifications Panel */}
      <div
        style={{
          position: "fixed",
          top: "70px",
          right: "20px",
          width: "420px",
          maxHeight: "600px",
          background: theme.colors.surface,
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: `1px solid ${theme.colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.colors.text }}>
              Notifications
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: theme.colors.textSecondary }}>
              {notifications.filter((n) => !n.is_read).length} unread
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: "6px 12px",
                  background: theme.colors.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: theme.colors.background,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={theme.colors.text} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: `1px solid ${theme.colors.border}`,
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            onClick={() => setActiveFilter("all")}
            style={{
              padding: "6px 16px",
              background: activeFilter === "all" ? theme.colors.primary : theme.colors.background,
              color: activeFilter === "all" ? "white" : theme.colors.text,
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("unread")}
            style={{
              padding: "6px 16px",
              background: activeFilter === "unread" ? theme.colors.primary : theme.colors.background,
              color: activeFilter === "unread" ? "white" : theme.colors.text,
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "450px",
          }}
        >
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: theme.colors.textSecondary }}>Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Bell size={48} color={theme.colors.inactive} style={{ marginBottom: "12px" }} />
              <p style={{ color: theme.colors.textSecondary, fontSize: "14px" }}>
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${theme.colors.border}`,
                  background: notification.is_read ? "transparent" : `${theme.colors.primary}05`,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${theme.colors.background}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = notification.is_read
                    ? "transparent"
                    : `${theme.colors.primary}05`;
                }}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: `${theme.colors.primary}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: "600",
                          color: theme.colors.text,
                        }}
                      >
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: theme.colors.success,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                          title="Mark as read"
                        >
                          <Check size={14} color="white" />
                        </button>
                      )}
                    </div>
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: "13px",
                        color: theme.colors.textSecondary,
                        lineHeight: "1.5",
                      }}
                    >
                      {notification.message}
                    </p>
                    <span
                      style={{
                        fontSize: "12px",
                        color: theme.colors.inactive,
                      }}
                    >
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
