import {
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  UserCheck,
  FolderTree,
  ClipboardList,
} from "lucide-react";
import logo from "../assets/image.png";
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


export const Sidebar = ({
  onLogout,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}: any) => {
  const menuItems = [
    { id: "workers", label: "Workers", icon: UserCheck },
    { id: "jobProfiles", label: "Job Profiles", icon: Users },
    { id: "jobs", label: "Jobs", icon: ClipboardList },
    { id: "services", label: "Services", icon: FolderTree },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div
      style={{
        width: sidebarOpen ? "260px" : "80px",
        background: theme.colors.surface,
        borderRight: `1px solid ${theme.colors.border}`,
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: `1px solid ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
        }}
      >
        {sidebarOpen && (
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: theme.colors.primary,
            }}
          >
            <img src={logo} alt="Logo" className="w-24 self-center" />
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          <Menu size={20} color={theme.colors.text} />
        </button>
      </div>

      <div style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              width: "100%",
              padding: "14px 20px",
              background:
                activeTab === item.id
                  ? `${theme.colors.primary}15`
                  : "transparent",
              border: "none",
              borderLeft:
                activeTab === item.id
                  ? `3px solid ${theme.colors.primary}`
                  : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "4px",
              transition: "all 0.2s",
            }}
          >
            <item.icon
              size={20}
              color={
                activeTab === item.id
                  ? theme.colors.primary
                  : theme.colors.textSecondary
              }
            />
            {sidebarOpen && (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: activeTab === item.id ? "600" : "500",
                  color:
                    activeTab === item.id
                      ? theme.colors.primary
                      : theme.colors.text,
                }}
              >
                {item.label}
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "16px",
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        <button
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: theme.colors.danger,
          }}
          onClick={onLogout}
        >
          <LogOut size={20} />
          {sidebarOpen && (
            <span style={{ fontSize: "14px", fontWeight: "600" }}>Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};
