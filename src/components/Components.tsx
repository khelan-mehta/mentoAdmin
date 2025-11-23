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

export const Sidebar = ({
  onLogout,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}: any) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "workers", label: "Workers", icon: Users },
    { id: "customers", label: "Customers", icon: Users },
    { id: "services", label: "Services", icon: Briefcase },
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
            <img
              src="../src/assets/image.png"
              alt="Logo"
              className="w-24 self-center"
            />
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

// ==================== SERVICES COMPONENT ====================
export const Services = ({ services, filterData }: any) => {
  const filteredServices = filterData(services, "services");

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
            Service Categories ({filteredServices.length})
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
            Add Service
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredServices.map((service: any) => (
            <div
              key={service.id}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.success}15)`,
                borderRadius: "12px",
                padding: "24px",
                border: `1px solid ${theme.colors.border}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `${theme.colors.primary}20`,
                  zIndex: 0,
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        marginBottom: "4px",
                      }}
                    >
                      {service.name}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {service.category}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: theme.colors.surface,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Briefcase size={24} color={theme.colors.primary} />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "16px",
                    padding: "16px",
                    background: theme.colors.surface,
                    borderRadius: "8px",
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
                      Base Price
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: theme.colors.success,
                      }}
                    >
                      ${service.basePrice}
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
                      Bookings
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: theme.colors.primary,
                      }}
                    >
                      {service.bookings}
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
                      Workers
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: theme.colors.text,
                      }}
                    >
                      {service.workers}
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
                      <Star size={14} fill="#F59E0B" color="#F59E0B" />
                      {service.rating}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
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
                    }}
                  >
                    <Edit
                      size={16}
                      style={{ verticalAlign: "middle", marginRight: "6px" }}
                    />
                    Edit
                  </button>
                  <button
                    style={{
                      padding: "10px 12px",
                      background: theme.colors.surface,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <Activity size={16} color={theme.colors.text} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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

export const TopBar = ({
  searchQuery,
  setSearchQuery,
  notifications,
  setNotifications,
}: any) => {
  return (
    <div
      style={{
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
        <Search
          size={20}
          color={theme.colors.textSecondary}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 40px",
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={() => setNotifications(0)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: theme.colors.background,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Bell size={20} color={theme.colors.text} />
          {notifications > 0 && (
            <span
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: theme.colors.danger,
              }}
            />
          )}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: theme.colors.primary,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            A
          </div>
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Admin User
            </div>
            <div
              style={{ fontSize: "12px", color: theme.colors.textSecondary }}
            >
              admin@mentoservice.com
            </div>
          </div>
          <ChevronDown size={16} color={theme.colors.textSecondary} />
        </div>
      </div>
    </div>
  );
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
