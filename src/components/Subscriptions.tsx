import { useState, useEffect } from "react";
import {
  Star,
  Users,
  Briefcase,
  Eye,
  Loader2,
  Search,
  Crown,
  Zap,
  Shield,
  X,
  User,
  MapPin,
  Calendar,
  TrendingUp,
} from "lucide-react";

import { BASE_URL } from "./Constants";

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

const API_BASE_URL = BASE_URL;

// Subscription plan configurations
const planConfig: Record<string, { color: string; bg: string; icon: any }> = {
  free: { color: "#6B7280", bg: "#F3F4F6", icon: User },
  basic: { color: "#3B82F6", bg: "#DBEAFE", icon: Zap },
  premium: { color: "#8B5CF6", bg: "#EDE9FE", icon: Crown },
  gold: { color: "#F59E0B", bg: "#FEF3C7", icon: Crown },
  enterprise: { color: "#10B981", bg: "#D1FAE5", icon: Shield },
};

// ==================== SUBSCRIPTION DETAIL MODAL ====================
const SubscriptionDetailModal = ({ subscription, onClose }: any) => {
  if (!subscription) return null;

  const plan = subscription.subscription_plan?.toLowerCase() || "free";
  const config = planConfig[plan] || planConfig.free;
  const IconComponent = config.icon;

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
          maxWidth: "600px",
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
            position: "sticky",
            top: 0,
            background: theme.colors.surface,
            zIndex: 10,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: theme.colors.text }}>
            Subscription Details
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
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: theme.colors.primary,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700",
                }}
              >
                {subscription.full_name?.charAt(0) || subscription.name?.charAt(0) || "?"}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                  {subscription.full_name || subscription.name}
                </h3>
                <p style={{ margin: "4px 0 0", color: theme.colors.primary, fontSize: "14px", fontWeight: "500" }}>
                  {subscription.headline || subscription.category || "N/A"}
                </p>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "8px",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: subscription.userType === "job_seeker" ? "#DBEAFE" : "#D1FAE5",
                    color: subscription.userType === "job_seeker" ? "#3B82F6" : "#10B981",
                  }}
                >
                  {subscription.userType === "job_seeker" ? <Briefcase size={12} /> : <Users size={12} />}
                  {subscription.userType === "job_seeker" ? "Job Seeker" : "Worker"}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Plan Card */}
          <div
            style={{
              padding: "20px",
              background: config.bg,
              borderRadius: "12px",
              marginBottom: "24px",
              border: `2px solid ${config.color}20`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: config.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent size={24} color="white" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", color: theme.colors.textSecondary }}>Current Plan</p>
                  <p style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: "700", color: config.color, textTransform: "capitalize" }}>
                    {subscription.subscription_plan || "Free"}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "12px", color: theme.colors.textSecondary }}>Status</p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "4px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: "#D1FAE5",
                    color: theme.colors.success,
                  }}
                >
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {subscription.experience_years !== undefined && (
              <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <TrendingUp size={16} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Experience</span>
                </div>
                <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                  {subscription.experience_years} years
                </p>
              </div>
            )}

            {subscription.preferred_locations && subscription.preferred_locations.length > 0 && (
              <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <MapPin size={16} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Location</span>
                </div>
                <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                  {subscription.preferred_locations[0]}
                </p>
              </div>
            )}

            {subscription.profile_views !== undefined && (
              <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <Eye size={16} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Profile Views</span>
                </div>
                <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                  {subscription.profile_views}
                </p>
              </div>
            )}

            {subscription.jobs !== undefined && (
              <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <Briefcase size={16} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Jobs Completed</span>
                </div>
                <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                  {subscription.jobs}
                </p>
              </div>
            )}

            {subscription.rating !== undefined && (
              <div style={{ padding: "16px", background: theme.colors.background, borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <Star size={16} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: "12px", color: theme.colors.textSecondary }}>Rating</span>
                </div>
                <p style={{ margin: 0, fontWeight: "600", color: theme.colors.text }}>
                  {subscription.rating} / 5.0
                </p>
              </div>
            )}
          </div>

          {/* Skills */}
          {subscription.skills && subscription.skills.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                Skills
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {subscription.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      padding: "6px 12px",
                      background: `${theme.colors.primary}15`,
                      color: theme.colors.primary,
                      borderRadius: "16px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== SUBSCRIPTIONS COMPONENT ====================
export const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"all" | "job_seeker" | "worker">("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    basic: 0,
    premium: 0,
    gold: 0,
    enterprise: 0,
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const allSubscriptions: any[] = [];

      // Fetch job seekers
      const jobSeekersResponse = await fetch(`${API_BASE_URL}/admin/job-seekers`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (jobSeekersResponse.ok) {
        const data = await jobSeekersResponse.json();
        const profiles = data.data?.profiles || [];
        profiles.forEach((profile: any) => {
          allSubscriptions.push({
            ...profile,
            id: profile.id || profile._id?.$oid,
            userType: "job_seeker",
            subscription_plan: profile.subscription_plan || "free",
          });
        });
      }

      // Fetch workers
      const workersResponse = await fetch(`${API_BASE_URL}/admin/workers`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (workersResponse.ok) {
        const data = await workersResponse.json();
        const workers = data.data?.workers || [];
        workers.forEach((worker: any) => {
          allSubscriptions.push({
            ...worker,
            id: worker.id || worker._id?.$oid,
            userType: "worker",
            subscription_plan: worker.subscription_plan || "free",
          });
        });
      }

      setSubscriptions(allSubscriptions);

      // Calculate stats
      const newStats = {
        total: allSubscriptions.length,
        free: 0,
        basic: 0,
        premium: 0,
        gold: 0,
        enterprise: 0,
      };
      allSubscriptions.forEach((sub) => {
        const plan = (sub.subscription_plan || "free").toLowerCase();
        if (plan in newStats) {
          (newStats as any)[plan]++;
        } else {
          newStats.free++;
        }
      });
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      (sub.full_name || sub.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.headline || sub.category || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesView = activeView === "all" || sub.userType === activeView;

    const subPlan = (sub.subscription_plan || "free").toLowerCase();
    const matchesPlan = planFilter === "all" || subPlan === planFilter;

    return matchesSearch && matchesView && matchesPlan;
  });

  const getPlanBadge = (plan: string) => {
    const normalizedPlan = (plan || "free").toLowerCase();
    const config = planConfig[normalizedPlan] || planConfig.free;
    const IconComponent = config.icon;

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
          background: config.bg,
          color: config.color,
          textTransform: "capitalize",
        }}
      >
        <IconComponent size={14} />
        {plan || "Free"}
      </span>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total Users", value: stats.total, color: theme.colors.primary, icon: Users },
          { label: "Free", value: stats.free, color: "#6B7280", icon: User },
          { label: "Basic", value: stats.basic, color: "#3B82F6", icon: Zap },
          { label: "Premium", value: stats.premium, color: "#8B5CF6", icon: Crown },
          { label: "Gold", value: stats.gold, color: "#F59E0B", icon: Crown },
          { label: "Enterprise", value: stats.enterprise, color: "#10B981", icon: Shield },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: theme.colors.surface,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: theme.colors.textSecondary }}>{stat.label}</span>
              <stat.icon size={18} color={stat.color} />
            </div>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: stat.color }}>
              {stat.value}
            </p>
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
            flexWrap: "wrap",
            gap: "16px",
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
            All Subscriptions
          </h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
                background: theme.colors.surface,
              }}
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="gold">Gold</option>
              <option value="enterprise">Enterprise</option>
            </select>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                color={theme.colors.textSecondary}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "10px 16px 10px 40px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  width: "250px",
                  outline: "none",
                }}
              />
            </div>
          </div>
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
            { key: "all", label: "All Users", icon: Users },
            { key: "job_seeker", label: "Job Seekers", icon: Briefcase },
            { key: "worker", label: "Workers", icon: Users },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as any)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeView === tab.key ? theme.colors.primary : "transparent",
                color: activeView === tab.key ? "white" : theme.colors.textSecondary,
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader2 size={32} color={theme.colors.primary} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px", color: theme.colors.textSecondary }}>Loading subscriptions...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Star size={48} color={theme.colors.border} style={{ marginBottom: "16px" }} />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>No Subscriptions Found</h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery ? "No results match your search." : "There are no subscriptions to display."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["User", "Type", "Plan", "Details", "Actions"].map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: theme.colors.textSecondary,
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${theme.colors.border}`,
                        background: theme.colors.background,
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub: any, index: number) => (
                  <tr
                    key={sub.id || index}
                    style={{
                      borderBottom: `1px solid ${theme.colors.border}`,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = theme.colors.background)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "16px" }}>
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
                          {(sub.full_name || sub.name || "?").charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: theme.colors.text }}>
                            {sub.full_name || sub.name}
                          </div>
                          <div style={{ fontSize: "13px", color: theme.colors.textSecondary }}>
                            {sub.headline || sub.category || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: sub.userType === "job_seeker" ? "#DBEAFE" : "#D1FAE5",
                          color: sub.userType === "job_seeker" ? "#3B82F6" : "#10B981",
                        }}
                      >
                        {sub.userType === "job_seeker" ? <Briefcase size={12} /> : <Users size={12} />}
                        {sub.userType === "job_seeker" ? "Job Seeker" : "Worker"}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      {getPlanBadge(sub.subscription_plan)}
                    </td>
                    <td style={{ padding: "16px", color: theme.colors.textSecondary, fontSize: "13px" }}>
                      {sub.userType === "job_seeker" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span>{sub.experience_years ? `${sub.experience_years} yrs exp` : "N/A"}</span>
                          <span>{sub.profile_views || 0} profile views</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span>{sub.jobs || 0} jobs completed</span>
                          <span>{sub.rating ? `${sub.rating} rating` : "N/A"}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button
                        onClick={() => setSelectedSubscription(sub)}
                        style={{
                          padding: "8px 16px",
                          background: theme.colors.primary,
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSubscription && (
        <SubscriptionDetailModal
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
        />
      )}
    </div>
  );
};
