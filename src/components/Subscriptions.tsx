import { useState, useEffect, useMemo } from "react";
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
  User,
  MapPin,
  PhoneCall,
  Mail,
  FileSpreadsheet,
  Plus,
} from "lucide-react";

import { Pagination } from "./Pagination";
import { theme, API_BASE_URL, planConfig } from "./subscriptions/constants";
import { getProfilePhotoUrl } from "./subscriptions/utils";
import { InvoiceExportModal } from "./subscriptions/InvoiceExportModal";
import { SubscriptionDetailModal } from "./subscriptions/SubscriptionDetailModal";
import { CreateSubscriptionModal } from "./subscriptions/CreateSubscriptionModal";
import { DeleteSubscriptionModal } from "./subscriptions/DeleteSubscriptionModal";

export const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"all" | "job_seeker" | "worker">(
    "all",
  );
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [showInvoiceExportModal, setShowInvoiceExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteSubModal, setShowDeleteSubModal] = useState(false);
  const [deleteSubTarget, setDeleteSubTarget] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    basic: 0,
    premium: 0,
    gold: 0,
    enterprise: 0,
  });

  const fetchUserData = async (userId: string) => {
    try {
      const authHeader = {
        Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
      };

      const [userResponse, kycResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users/${userId}`, { headers: authHeader }),
        fetch(`${API_BASE_URL}/kyc/admin/user/${userId}`, {
          headers: authHeader,
        }).catch(() => null),
      ]);

      let userData: any = {};
      if (userResponse.ok) {
        const result = await userResponse.json();
        const user = result.data?.user || result.data;
        userData = {
          user_mobile: user?.mobile,
          user_photo: user?.profile_photo,
          user_email: user?.email,
          user_name: user?.name,
          user_city: user?.city,
          user_pincode: user?.pincode,
          user_kyc_status: user?.kyc_status,
        };
      }

      if (kycResponse && kycResponse.ok) {
        const kycResult = await kycResponse.json();
        const kyc = kycResult.data;
        if (kyc && kyc.kyc_exists !== false) {
          userData.kyc_address = kyc.address;
          userData.kyc_city = kyc.city;
          userData.kyc_state = kyc.state;
          userData.kyc_pincode = kyc.pincode;
          userData.kyc_full_name = kyc.full_name;
        }
      }

      return userData;
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
    return null;
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const allSubscriptions: any[] = [];

      const jobSeekersResponse = await fetch(
        `${API_BASE_URL}/admin/job-seekers?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        },
      );
      if (jobSeekersResponse.ok) {
        const data = await jobSeekersResponse.json();
        const profiles = data.data?.profiles || [];

        const profilesWithUserData = await Promise.all(
          profiles.map(async (profile: any) => {
            const userId = profile.user_id?.$oid || profile.user_id;
            const userData = userId ? await fetchUserData(userId) : null;
            return {
              ...profile,
              ...userData,
              id: profile.id || profile._id?.$oid,
              userType: "job_seeker",
              subscription_plan: profile.subscription_plan || "free",
            };
          }),
        );
        allSubscriptions.push(...profilesWithUserData);
      }

      const workersResponse = await fetch(
        `${API_BASE_URL}/admin/workers?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        },
      );
      if (workersResponse.ok) {
        const data = await workersResponse.json();
        const workers = data.data?.workers || [];

        const workersWithUserData = await Promise.all(
          workers.map(async (worker: any) => {
            const userId = worker.user_id?.$oid || worker.user_id;
            const userData = userId ? await fetchUserData(userId) : null;
            return {
              ...worker,
              ...userData,
              id: worker.id || worker._id?.$oid,
              userType: "worker",
              subscription_plan: worker.subscription_plan || "free",
            };
          }),
        );
        allSubscriptions.push(...workersWithUserData);
      }

      setSubscriptions(allSubscriptions);

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

  const handleCreateSubscription = async (data: any) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchSubscriptions();
      } else {
        const errData = await response.json().catch(() => null);
        alert(errData?.message || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Failed to create subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!deleteSubTarget) return;
    const subId = deleteSubTarget._id?.$oid || deleteSubTarget._id || deleteSubTarget.id;
    if (!subId) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admin/subscriptions/${subId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (response.ok) {
        setShowDeleteSubModal(false);
        setDeleteSubTarget(null);
        fetchSubscriptions();
      } else {
        const errData = await response.json().catch(() => null);
        alert(errData?.message || "Failed to delete subscription");
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        (sub.full_name || sub.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (sub.headline || sub.category || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (sub.user_mobile || "").includes(searchQuery) ||
        (sub.user_email || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (sub.user_city || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesView = activeView === "all" || sub.userType === activeView;

      const subPlan = (sub.subscription_plan || "free").toLowerCase();
      const matchesPlan = planFilter === "all" || subPlan === planFilter;

      return matchesSearch && matchesView && matchesPlan;
    });
  }, [subscriptions, searchQuery, activeView, planFilter]);

  const totalItems = filteredSubscriptions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSubscriptions.slice(startIndex, endIndex);
  }, [filteredSubscriptions, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeView, planFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

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
          {
            label: "Total Users",
            value: stats.total,
            color: theme.colors.primary,
            icon: Users,
          },
          { label: "Free", value: stats.free, color: "#6B7280", icon: User },
          { label: "Basic", value: stats.basic, color: "#3B82F6", icon: Zap },
          {
            label: "Premium",
            value: stats.premium,
            color: "#8B5CF6",
            icon: Crown,
          },
          { label: "Gold", value: stats.gold, color: "#F59E0B", icon: Crown },
          {
            label: "Enterprise",
            value: stats.enterprise,
            color: "#10B981",
            icon: Shield,
          },
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{ fontSize: "13px", color: theme.colors.textSecondary }}
              >
                {stat.label}
              </span>
              <stat.icon size={18} color={stat.color} />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "700",
                color: stat.color,
              }}
            >
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
            {/* Create Subscription Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                background: theme.colors.primary,
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              <Plus size={18} />
              Create Subscription
            </button>

            {/* Export Invoice Button */}
            <button
              onClick={() => setShowInvoiceExportModal(true)}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                background: theme.colors.success,
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              <FileSpreadsheet size={18} />
              Export Invoices
            </button>

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
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search by name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "10px 16px 10px 40px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "14px",
                  width: "280px",
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
                background:
                  activeView === tab.key ? theme.colors.primary : "transparent",
                color:
                  activeView === tab.key ? "white" : theme.colors.textSecondary,
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
            <Loader2
              size={32}
              color={theme.colors.primary}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <p style={{ marginTop: "12px", color: theme.colors.textSecondary }}>
              Loading subscriptions...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Star
              size={48}
              color={theme.colors.border}
              style={{ marginBottom: "16px" }}
            />
            <h3 style={{ margin: "0 0 8px", color: theme.colors.text }}>
              No Subscriptions Found
            </h3>
            <p style={{ margin: 0, color: theme.colors.textSecondary }}>
              {searchQuery
                ? "No results match your search."
                : "There are no subscriptions to display."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "User",
                    "Contact",
                    "Type",
                    "Plan",
                    "Details",
                    "Actions",
                  ].map((header) => (
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
                {paginatedSubscriptions.map((sub: any, index: number) => {
                  const profilePhotoUrl = getProfilePhotoUrl(sub.user_photo);

                  return (
                    <tr
                      key={sub.id || index}
                      style={{
                        borderBottom: `1px solid ${theme.colors.border}`,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          theme.colors.background)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          {profilePhotoUrl ? (
                            <img
                              src={profilePhotoUrl}
                              alt={sub.full_name || sub.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: `2px solid ${theme.colors.border}`,
                              }}
                            />
                          ) : (
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
                          )}
                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                color: theme.colors.text,
                              }}
                            >
                              {sub.full_name || sub.name}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: theme.colors.textSecondary,
                              }}
                            >
                              {sub.headline || sub.category || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          {sub.user_mobile && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                color: theme.colors.textSecondary,
                              }}
                            >
                              <PhoneCall size={12} />
                              {sub.user_mobile}
                            </div>
                          )}
                          {sub.user_email && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                color: theme.colors.textSecondary,
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Mail size={12} style={{ flexShrink: 0 }} />
                              {sub.user_email}
                            </div>
                          )}
                          {sub.user_city && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                color: theme.colors.textSecondary,
                              }}
                            >
                              <MapPin size={12} />
                              {sub.user_city}
                            </div>
                          )}
                          {!sub.user_mobile &&
                            !sub.user_email &&
                            !sub.user_city && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: theme.colors.textSecondary,
                                }}
                              >
                                N/A
                              </span>
                            )}
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
                            background:
                              sub.userType === "job_seeker"
                                ? "#DBEAFE"
                                : "#D1FAE5",
                            color:
                              sub.userType === "job_seeker"
                                ? "#3B82F6"
                                : "#10B981",
                          }}
                        >
                          {sub.userType === "job_seeker" ? (
                            <Briefcase size={12} />
                          ) : (
                            <Users size={12} />
                          )}
                          {sub.userType === "job_seeker"
                            ? "Job Seeker"
                            : "Worker"}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        {getPlanBadge(sub.subscription_plan)}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          color: theme.colors.textSecondary,
                          fontSize: "13px",
                        }}
                      >
                        {sub.userType === "job_seeker" ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <span>
                              {sub.experience_years
                                ? `${sub.experience_years} yrs exp`
                                : "N/A"}
                            </span>
                            <span>{sub.profile_views || 0} profile views</span>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <span>{sub.jobs || 0} jobs completed</span>
                            <span>
                              {sub.rating ? `${sub.rating} rating` : "N/A"}
                            </span>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredSubscriptions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {selectedSubscription && (
        <SubscriptionDetailModal
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
        />
      )}

      {showCreateModal && (
        <CreateSubscriptionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateSubscription}
          isLoading={actionLoading}
        />
      )}

      {showDeleteSubModal && (
        <DeleteSubscriptionModal
          isOpen={showDeleteSubModal}
          onClose={() => {
            setShowDeleteSubModal(false);
            setDeleteSubTarget(null);
          }}
          onConfirm={handleDeleteSubscription}
          subscription={deleteSubTarget}
          isLoading={actionLoading}
        />
      )}

      {showInvoiceExportModal && (
        <InvoiceExportModal
          subscriptions={subscriptions}
          onClose={() => setShowInvoiceExportModal(false)}
        />
      )}
    </div>
  );
};
