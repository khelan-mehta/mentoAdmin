import { User, Zap, Crown, Shield } from "lucide-react";
import { BASE_URL } from "../Constants";

export const theme = {
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

export const API_BASE_URL = BASE_URL;

export const planConfig: Record<string, { color: string; bg: string; icon: any }> = {
  free: { color: "#6B7280", bg: "#F3F4F6", icon: User },
  basic: { color: "#3B82F6", bg: "#DBEAFE", icon: Zap },
  premium: { color: "#8B5CF6", bg: "#EDE9FE", icon: Crown },
  gold: { color: "#F59E0B", bg: "#FEF3C7", icon: Crown },
  enterprise: { color: "#10B981", bg: "#D1FAE5", icon: Shield },
};

export const planPricing: Record<string, number> = {
  free: 0,
  basic: 99,
  silver: 99,
  premium: 199,
  gold: 299,
  enterprise: 499,
};

export const GST_RATE = 18;
export const CGST_RATE = 9;
export const SGST_RATE = 9;
export const IGST_RATE = 18;

export const COMPANY_INFO = {
  name: "MENTO SERVICES",
  address: "336, MOMINVAS, MUMANVAS, MAHESANA",
  district: "MAHESANA",
  pincode: "384330",
  city: "MAHESANA",
  state: "Gujarat",
  stateCode: "24",
  phone: "9316483819",
  gstin: "24GNCPR9725J1ZG",
};

export const BANK_DETAILS = {
  bank: "BANK OF BARODA",
  branch: "SATLASANA",
  accountNo: "38240200001593",
  ifsc: "BARB0SATLAS",
};

export const INVOICE_STORAGE_KEY = "mento_invoice_data";
