import { useState } from "react";

import {
  initialBookings,
  initialCustomers,
  initialServices,
  initialWorkers,
  theme,
} from "./components/Constants";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import logo from './assets/image.png';
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { FilterBar } from "./components/FilterBar";
import { Bookings } from "./components/Bookings";
import { Workers } from "./components/Workers";
import { Customers } from "./components/Customers";
import { Services } from "./components/Services";
import { SettingsPage } from "./components/SettingsPage";
import { Modal } from "./components/Modal";

// ==================== LOGIN COMPONENT ====================
const LoginPage = ({ onLogin }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials
  const DEMO_EMAIL = "admin@mentoservice.com";
  const DEMO_PASSWORD = "admin123";

  const handleSubmit = () => {
    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem(
          "user",
          JSON.stringify({ email, name: "Admin User" })
        );
        setIsLoading(false);
        onLogin({ email, name: "Admin User" });
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    }, 800);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.background} 100%)`,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "24px",
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{ textAlign: "center" }}
          className="flex flex-col justify-center items-center"
        >
          <img
            src={logo}
            alt="Logo"
            className="w-48 self-center"
          />
        </div>

        {/* Login Card */}
        <div
          style={{
            background: theme.colors.surface,
            borderRadius: "16px",
            padding: "40px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div>
            {/* Email Field */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={20}
                  color={theme.colors.textSecondary}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="admin@mentoservice.com"
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 44px",
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.border;
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={20}
                  color={theme.colors.textSecondary}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 44px",
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.border;
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  background: `${theme.colors.danger}15`,
                  border: `1px solid ${theme.colors.danger}40`,
                  borderRadius: "8px",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: theme.colors.danger,
                    fontWeight: "500",
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                background: isLoading
                  ? theme.colors.inactive
                  : theme.colors.primary,
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p
            style={{
              fontSize: "13px",
              color: theme.colors.textSecondary,
              margin: 0,
            }}
          >
            © 2025 Mento Service. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN ADMIN PANEL COMPONENT ====================
const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState(initialBookings);
  const [workers, setWorkers] = useState(initialWorkers);
  const [customers, setCustomers] = useState(initialCustomers);
  const [services] = useState<any>(initialServices);
  const [notifications, setNotifications] = useState(3);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab("dashboard");
  };

  // Filtering logic
  const filterData = (data: any, type: any) => {
    let filtered = [...data];

    if (searchQuery) {
      filtered = filtered.filter((item) => {
        const searchLower = searchQuery.toLowerCase();
        if (type === "bookings") {
          return (
            item.customer.toLowerCase().includes(searchLower) ||
            item.service.toLowerCase().includes(searchLower) ||
            item.worker.toLowerCase().includes(searchLower)
          );
        } else if (type === "workers") {
          return (
            item.name.toLowerCase().includes(searchLower) ||
            item.category.toLowerCase().includes(searchLower)
          );
        } else if (type === "customers") {
          return (
            item.name.toLowerCase().includes(searchLower) ||
            item.email.toLowerCase().includes(searchLower)
          );
        } else if (type === "services") {
          return (
            item.name.toLowerCase().includes(searchLower) ||
            item.category.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (categoryFilter !== "all" && type === "workers") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (dateFilter !== "all" && type === "bookings") {
      const today: any = new Date();
      filtered = filtered.filter((item) => {
        const itemDate: any = new Date(item.date);
        const diffDays = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));

        if (dateFilter === "today") return diffDays === 0;
        if (dateFilter === "week") return diffDays <= 7;
        if (dateFilter === "month") return diffDays <= 30;
        return true;
      });
    }

    filtered.sort((a, b) => {
      let aVal, bVal;

      if (sortBy === "date") {
        aVal = new Date(a.date || a.joinDate);
        bVal = new Date(b.date || b.joinDate);
      } else if (
        sortBy === "amount" ||
        sortBy === "earnings" ||
        sortBy === "totalSpent"
      ) {
        aVal = a[sortBy] || 0;
        bVal = b[sortBy] || 0;
      } else if (sortBy === "rating") {
        aVal = a.rating || 0;
        bVal = b.rating || 0;
      } else {
        aVal = a[sortBy] || "";
        bVal = b[sortBy] || "";
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  const updateBookingStatus = (id: any, newStatus: any) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const updateWorkerStatus = (id: any, newStatus: any) => {
    setWorkers(
      workers.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
  };

  const deleteItem = (id: any, type: any) => {
    if (type === "booking") {
      setBookings(bookings.filter((b) => b.id !== id));
    } else if (type === "worker") {
      setWorkers(workers.filter((w) => w.id !== id));
    } else if (type === "customer") {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: theme.colors.background,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          setNotifications={setNotifications}
          user={user}
        />

        <div style={{ flex: 1, overflowY: "auto" }}>
          {activeTab === "dashboard" && (
            <Dashboard
              bookings={bookings}
              workers={workers}
              customers={customers}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "bookings" && (
            <>
              <div style={{ padding: "24px 24px 0" }}>
                <FilterBar
                  type="bookings"
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              <Bookings
                bookings={bookings}
                updateBookingStatus={updateBookingStatus}
                deleteItem={deleteItem}
                setSelectedItem={setSelectedItem}
                setModalType={setModalType}
                setShowModal={setShowModal}
                filterData={filterData}
              />
            </>
          )}

          {activeTab === "workers" && (
            <>
              <div style={{ padding: "24px 24px 0" }}>
                <FilterBar
                  type="workers"
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              <Workers
                workers={workers}
                updateWorkerStatus={updateWorkerStatus}
                deleteItem={deleteItem}
                setSelectedItem={setSelectedItem}
                setModalType={setModalType}
                setShowModal={setShowModal}
                filterData={filterData}
              />
            </>
          )}

          {activeTab === "customers" && (
            <>
              <div style={{ padding: "24px 24px 0" }}>
                <FilterBar
                  type="customers"
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              <Customers
                customers={customers}
                deleteItem={deleteItem}
                setSelectedItem={setSelectedItem}
                setModalType={setModalType}
                setShowModal={setShowModal}
                filterData={filterData}
              />
            </>
          )}

          {activeTab === "services" && (
            <Services services={services} filterData={filterData} />
          )}

          {activeTab === "settings" && <SettingsPage />}
        </div>
      </div>

      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedItem={selectedItem}
        modalType={modalType}
      />
    </div>
  );
};

export default AdminPanel;
