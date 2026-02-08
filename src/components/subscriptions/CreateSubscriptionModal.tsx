import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Loader2,
  Search,
  X,
  Check,
} from "lucide-react";

import { theme, API_BASE_URL } from "./constants";

export const CreateSubscriptionModal = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const [userId, setUserId] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("worker");
  const [planName, setPlanName] = useState("silver");
  const [price, setPrice] = useState("99");
  const [durationDays, setDurationDays] = useState("30");
  const [paymentId, setPaymentId] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setUserId("");
      setSubscriptionType("worker");
      setPlanName("silver");
      setPrice("99");
      setDurationDays("30");
      setPaymentId("");
      setAutoRenew(false);
      setUserSearch("");
      setUserResults([]);
      setSelectedUser(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const prices: Record<string, string> = {
      silver: "99",
      gold: "299",
      basic: "99",
      premium: "199",
      job_seeker_premium: "199",
      enterprise: "499",
    };
    setPrice(prices[planName] || "99");
  }, [planName]);

  const searchUsers = async () => {
    if (!userSearch.trim()) return;
    setSearchLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users?search=${encodeURIComponent(userSearch)}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserResults(data.data?.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectUser = (user: any) => {
    const id = user._id?.$oid || user._id || user.id;
    setUserId(id);
    setSelectedUser(user);
    setUserResults([]);
    setUserSearch("");
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!userId.trim()) return;
    onSave({
      user_id: userId,
      subscription_type: subscriptionType,
      plan_name: planName,
      price: parseFloat(price) || 0,
      duration_days: parseInt(durationDays) || 30,
      payment_id: paymentId || undefined,
      auto_renew: autoRenew,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${theme.colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "700",
              color: theme.colors.text,
            }}
          >
            Create Subscription
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={24} color={theme.colors.textSecondary} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* User Search */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              User *
            </label>
            {selectedUser ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.primary}`,
                  background: `${theme.colors.primary}08`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: theme.colors.text,
                      fontSize: "14px",
                    }}
                  >
                    {selectedUser.name || "Unknown"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {selectedUser.mobile} {selectedUser.email ? `| ${selectedUser.email}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserId("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X size={16} color={theme.colors.textSecondary} />
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                    placeholder="Search by name, mobile, or email..."
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.colors.border}`,
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={searchUsers}
                    disabled={searchLoading}
                    style={{
                      padding: "10px 16px",
                      background: theme.colors.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {searchLoading ? (
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Search size={16} />
                    )}
                  </button>
                </div>
                {/* Or manual entry */}
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Or enter User ID directly:
                </div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter MongoDB ObjectId..."
                  style={{
                    marginTop: "4px",
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {/* Search Results */}
                {userResults.length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: "8px",
                      maxHeight: "200px",
                      overflow: "auto",
                    }}
                  >
                    {userResults.map((user: any, idx: number) => (
                      <div
                        key={user._id?.$oid || idx}
                        onClick={() => selectUser(user)}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderBottom:
                            idx < userResults.length - 1
                              ? `1px solid ${theme.colors.border}`
                              : "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            theme.colors.background)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: theme.colors.text,
                          }}
                        >
                          {user.name || "Unknown"}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: theme.colors.textSecondary,
                          }}
                        >
                          {user.mobile}
                          {user.email ? ` | ${user.email}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subscription Type */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Subscription Type *
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { key: "worker", label: "Worker", icon: Users },
                { key: "jobseeker", label: "Job Seeker", icon: Briefcase },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSubscriptionType(opt.key)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: `2px solid ${subscriptionType === opt.key ? theme.colors.primary : theme.colors.border}`,
                    background:
                      subscriptionType === opt.key
                        ? `${theme.colors.primary}10`
                        : "transparent",
                    color:
                      subscriptionType === opt.key
                        ? theme.colors.primary
                        : theme.colors.text,
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <opt.icon size={16} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Name */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Plan *
            </label>
            <select
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                outline: "none",
                background: theme.colors.surface,
              }}
            >
              <option value="silver">Silver - Rs.99</option>
              <option value="gold">Gold - Rs.299</option>
              <option value="basic">Basic - Rs.99</option>
              <option value="premium">Premium - Rs.199</option>
              <option value="enterprise">Enterprise - Rs.499</option>
            </select>
          </div>

          {/* Price and Duration Row */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Price (INR)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Duration (days)
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Payment ID */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
              }}
            >
              Payment ID (optional)
            </label>
            <input
              type="text"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="e.g., pay_xxxxxxxxxxxxxxxx"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Auto Renew */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              Auto-renew subscription
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!userId.trim() || isLoading}
              style={{
                flex: 1,
                padding: "12px",
                background: theme.colors.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: userId.trim() && !isLoading ? "pointer" : "not-allowed",
                opacity: userId.trim() && !isLoading ? 1 : 0.6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isLoading ? (
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Check size={16} />
              )}
              Create Subscription
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
