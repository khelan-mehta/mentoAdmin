import { useState, useEffect } from "react";

import { theme } from "./components/Constants";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowLeft } from "lucide-react";
import logo from "./assets/image.png";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Users } from "./components/Users";
import { KYC } from "./components/KYC";
import { WorkerProfiles } from "./components/WorkerProfiles";
import { JobProfiles } from "./components/JobProfiles";
import { Jobs } from "./components/Jobs";
import { Subscriptions } from "./components/Subscriptions";
import { Services } from "./components/Services";
import { SettingsPage } from "./components/SettingsPage";
import { Notifications } from "./components/Notifications";
import {
  getStoredAuth,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  AdminUser,
} from "./services/auth";

// ==================== LOGIN COMPONENT ====================
const LoginPage = ({
  onLogin,
  onSwitchToRegister,
}: {
  onLogin: (user: AdminUser) => void;
  onSwitchToRegister: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setIsLoading(true);

    const result = await apiLogin(email, password);

    if (result.success && result.data) {
      onLogin(result.data.user);
    } else {
      setError(result.message || "Invalid email or password");
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
          <img src={logo} alt="Logo" className="w-48 self-center" />
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
          <h2
            style={{
              margin: "0 0 24px 0",
              fontSize: "24px",
              fontWeight: "700",
              color: theme.colors.text,
              textAlign: "center",
            }}
          >
            Admin Login
          </h2>

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
                  placeholder="admin@example.com"
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

            {/* Register Link */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: "14px" }}>
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToRegister}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.colors.primary,
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Register
                </button>
              </p>
            </div>
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
            2025 Mento Service. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== REGISTER COMPONENT ====================
const RegisterPage = ({
  onRegister,
  onSwitchToLogin,
}: {
  onRegister: (user: AdminUser) => void;
  onSwitchToLogin: () => void;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    const result = await apiRegister(email, password, name);

    if (result.success && result.data) {
      onRegister(result.data.user);
    } else {
      setError(result.message || "Registration failed");
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
          <img src={logo} alt="Logo" className="w-48 self-center" />
        </div>

        {/* Register Card */}
        <div
          style={{
            background: theme.colors.surface,
            borderRadius: "16px",
            padding: "40px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Back to Login */}
          <button
            onClick={onSwitchToLogin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: theme.colors.textSecondary,
              cursor: "pointer",
              padding: 0,
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>

          <h2
            style={{
              margin: "0 0 24px 0",
              fontSize: "24px",
              fontWeight: "700",
              color: theme.colors.text,
              textAlign: "center",
            }}
          >
            Create Admin Account
          </h2>

          <div>
            {/* Name Field */}
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
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <UserIcon
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
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="John Doe"
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

            {/* Email Field */}
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
                  placeholder="admin@example.com"
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
                  placeholder="At least 6 characters"
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

            {/* Confirm Password Field */}
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
                Confirm Password
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
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Confirm your password"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? (
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
              {isLoading ? "Creating Account..." : "Create Account"}
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
            2025 Mento Service. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN ADMIN PANEL COMPONENT ====================
const AdminPanel = () => {
  const [authState, setAuthState] = useState(() => getStoredAuth());
  const [showRegister, setShowRegister] = useState(false);

  const [activeTab, setActiveTab] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);

  const handleLogin = (user: AdminUser) => {
    setAuthState({
      ...getStoredAuth(),
      isAuthenticated: true,
      user,
    });
  };

  const handleLogout = () => {
    apiLogout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
    setActiveTab("users");
  };

  // Show login/register page if not authenticated
  if (!authState.isAuthenticated) {
    if (showRegister) {
      return (
        <RegisterPage
          onRegister={handleLogin}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
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
          user={authState.user}
        />

        <div style={{ flex: 1, overflowY: "auto" }}>
          {activeTab === "users" && <Users />}

          {activeTab === "kyc" && <KYC />}

          {activeTab === "workerProfiles" && <WorkerProfiles />}

          {activeTab === "jobProfiles" && <JobProfiles />}

          {activeTab === "jobs" && <Jobs />}

          {activeTab === "subscriptions" && <Subscriptions />}

          {activeTab === "services" && <Services />}

          {activeTab === "notifications" && <Notifications />}

          {activeTab === "settings" && <SettingsPage />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
