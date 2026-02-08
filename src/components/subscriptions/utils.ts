import {
  API_BASE_URL,
  GST_RATE,
  CGST_RATE,
  SGST_RATE,
  IGST_RATE,
  INVOICE_STORAGE_KEY,
} from "./constants";
import type { InvoiceTrackingData } from "./types";

export const getProfilePhotoUrl = (photoPath: string | null | undefined) => {
  if (!photoPath) return null;
  if (photoPath.startsWith("http")) return photoPath;
  return `${API_BASE_URL}${photoPath}`;
};

export const getInvoiceTrackingData = (): InvoiceTrackingData => {
  try {
    const data = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { counter: 0, userInvoices: {} };
};

export const getOrCreateInvoiceNumber = (userId: string): string => {
  const data = getInvoiceTrackingData();
  if (data.userInvoices[userId]) {
    return data.userInvoices[userId];
  }
  data.counter++;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sequence = String(data.counter).padStart(5, "0");
  const invoiceNumber = `MENTO/${year}${month}/${sequence}`;
  data.userInvoices[userId] = invoiceNumber;
  localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(data));
  return invoiceNumber;
};

export const calculateGSTInclusive = (planPrice: number, isInterState: boolean) => {
  if (planPrice === 0) {
    return {
      base: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalGst: 0,
      total: 0,
      roundOff: 0,
    };
  }
  const base = Math.round((planPrice / (1 + GST_RATE / 100)) * 100) / 100;
  if (isInterState) {
    const igst = Math.round(((base * IGST_RATE) / 100) * 100) / 100;
    const roundOff = Math.round((planPrice - base - igst) * 100) / 100;
    return {
      base,
      cgst: 0,
      sgst: 0,
      igst,
      totalGst: igst,
      total: planPrice,
      roundOff,
    };
  } else {
    const cgst = Math.round(((base * CGST_RATE) / 100) * 100) / 100;
    const sgst = Math.round(((base * SGST_RATE) / 100) * 100) / 100;
    const roundOff = Math.round((planPrice - base - cgst - sgst) * 100) / 100;
    return {
      base,
      cgst,
      sgst,
      igst: 0,
      totalGst: cgst + sgst,
      total: planPrice,
      roundOff,
    };
  }
};

export const numberToWords = (num: number): string => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if (num === 0) return "Zero Only";
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  };
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees);
  if (paise > 0) {
    result += " and " + convert(paise) + " Paise";
  }
  return result + " Only";
};

export const getFinancialYearPeriod = (dateValue: any): string => {
  let date: Date;
  try {
    if (dateValue?.$date?.$numberLong) {
      date = new Date(parseInt(dateValue.$date.$numberLong));
    } else if (dateValue?.$date) {
      date = new Date(dateValue.$date);
    } else {
      date = new Date(dateValue);
    }
    if (isNaN(date.getTime())) date = new Date();
  } catch {
    date = new Date();
  }
  const month = date.getMonth();
  const year = date.getFullYear();
  const fyStart = month >= 3 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `01.04.${fyStart} to 31.03.${fyEnd}`;
};

export const fetchKycDetails = async (userId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/admin/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
      },
    });
    if (response.ok) {
      const result = await response.json();
      if (result.data && result.data.kyc_exists !== false) {
        return result.data;
      }
    }
  } catch (err) {
    console.error("Failed to fetch KYC details:", err);
  }
  return null;
};

export const parseDateValue = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  try {
    if (dateValue?.$date?.$numberLong) {
      return new Date(parseInt(dateValue.$date.$numberLong));
    }
    if (dateValue?.$date) {
      return new Date(dateValue.$date);
    }
    const d = new Date(dateValue);
    if (!isNaN(d.getTime())) return d;
  } catch {}
  return null;
};

export const formatDate = (dateValue: any): string => {
  if (!dateValue) return new Date().toISOString().split("T")[0];
  try {
    const parsed = parseDateValue(dateValue);
    if (parsed && !isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};
