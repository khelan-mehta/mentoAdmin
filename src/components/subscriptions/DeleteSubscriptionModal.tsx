import { Loader2, Trash2, AlertCircle } from "lucide-react";

import { theme } from "./constants";

export const DeleteSubscriptionModal = ({
  isOpen,
  onClose,
  onConfirm,
  subscription,
  isLoading,
}: any) => {
  if (!isOpen) return null;

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
          maxWidth: "400px",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertCircle size={28} color={theme.colors.danger} />
          </div>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "18px",
              fontWeight: "700",
              color: theme.colors.text,
            }}
          >
            Delete Subscription?
          </h3>
          <p
            style={{
              margin: 0,
              color: theme.colors.textSecondary,
              fontSize: "14px",
            }}
          >
            This will remove the subscription for{" "}
            <strong>{subscription?.user_name || "this user"}</strong> and reset
            their plan to free. This action cannot be undone.
          </p>
        </div>
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
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px",
              background: theme.colors.danger,
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
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
              <Trash2 size={16} />
            )}
            Delete
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
