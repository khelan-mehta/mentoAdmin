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











// ==================== WORKERS COMPONENT ====================
export const Workers = ({
  workers,
  updateWorkerStatus,
  deleteItem,
  setSelectedItem,
  setModalType,
  setShowModal,
  filterData,
}: any) => {
  const filteredWorkers = filterData(workers, "workers");

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
            Workers Management ({filteredWorkers.length})
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
            <Plus size={18} />
            Add Worker
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredWorkers.map((worker: any) => (
            <div
              key={worker.id}
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
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: theme.colors.primary,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                  >
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        marginBottom: "4px",
                      }}
                    >
                      {worker.name}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {worker.category}
                    </div>
                  </div>
                </div>
                <select
                  value={worker.status}
                  onChange={(e) =>
                    updateWorkerStatus(worker.id, e.target.value)
                  }
                  style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "600",
                    background:
                      worker.status === "active" ? "#D1FAE5" : "#FEE2E2",
                    color:
                      worker.status === "active"
                        ? theme.colors.success
                        : theme.colors.danger,
                    border: "none",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
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
                    Rating
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: theme.colors.text,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Star size={16} fill="#F59E0B" color="#F59E0B" />
                    {worker.rating}
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
                    Jobs Done
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: theme.colors.text,
                    }}
                  >
                    {worker.jobs}
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
                    Earnings
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: theme.colors.success,
                    }}
                  >
                    ${worker.earnings.toLocaleString()}
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
                    Joined
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: theme.colors.text,
                    }}
                  >
                    {new Date(worker.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: `1px solid ${theme.colors.border}`,
                  paddingTop: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <PhoneCall size={12} />
                  {worker.phone}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Mail size={12} />
                  {worker.email}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setSelectedItem(worker);
                    setModalType("worker");
                    setShowModal(true);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px",
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
                  View Details
                </button>
                <button
                  onClick={() => deleteItem(worker.id, "worker")}
                  style={{
                    padding: "8px 12px",
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
