import { ChevronLeft, ChevronRight } from "lucide-react";

const theme = {
  colors: {
    primary: "#0EA5E9",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
  },
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "24px",
        padding: "16px",
        background: theme.colors.background,
        borderRadius: "8px",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontSize: "14px",
            color: theme.colors.textSecondary,
          }}
        >
          Items per page:
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: `1px solid ${theme.colors.border}`,
            fontSize: "14px",
            background: theme.colors.surface,
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span
          style={{
            fontSize: "14px",
            color: theme.colors.textSecondary,
            marginLeft: "8px",
          }}
        >
          Showing {startItem} - {endItem} of {totalItems}
        </span>
      </div>

      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: "8px 12px",
            background: currentPage === 1 ? theme.colors.border : theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "6px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            opacity: currentPage === 1 ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              style={{
                padding: "8px 12px",
                background: currentPage === page ? theme.colors.primary : theme.colors.surface,
                color: currentPage === page ? "white" : theme.colors.text,
                border: `1px solid ${currentPage === page ? theme.colors.primary : theme.colors.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: currentPage === page ? "600" : "400",
                cursor: "pointer",
                minWidth: "40px",
              }}
            >
              {page}
            </button>
          ) : (
            <span
              key={index}
              style={{
                padding: "8px 12px",
                color: theme.colors.textSecondary,
                fontSize: "14px",
              }}
            >
              {page}
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 12px",
            background: currentPage === totalPages ? theme.colors.border : theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "6px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            opacity: currentPage === totalPages ? 0.5 : 1,
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
