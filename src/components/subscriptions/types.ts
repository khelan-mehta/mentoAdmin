export interface InvoiceTrackingData {
  counter: number;
  userInvoices: Record<string, string>;
}

export interface InvoiceItem {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity: string;
  customerState: string;
  customerAddress: string;
  customerPincode: string;
  customerDistrict: string;
  userType: string;
  planName: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  basePrice: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalGst: number;
  totalAmount: number;
  roundOff: number;
  paymentId: string;
  status: string;
  sacCode: string;
}

export interface InvoiceExportModalProps {
  subscriptions: any[];
  onClose: () => void;
}
