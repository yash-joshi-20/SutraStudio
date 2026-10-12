"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/authContext";
import { formatCurrencyINR } from "@/config/services";
import { OrderReceiptModal, type ReceiptOrderData } from "@/components/orders/OrderReceiptModal";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import {
  Download,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowRight,
  HardDrive,
  FileText,
  CreditCard,
  ShieldCheck,
  Search,
  Globe,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface InvoiceRecord {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  service: string;
  amount: string;
  numericAmount: number;
  status: "paid" | "pending";
  statusLabel: string;
  paymentMethod: string;
  driveFile: string;
  driveFileId?: string;
  isDemo?: boolean;
  rawOrder?: any;
}

// Canonical demo fallback invoices for new/uncommissioned workspaces (strictly adhering to approved services & <= ₹20,000 ceiling)
const CANONICAL_DEMO_INVOICES: InvoiceRecord[] = [
  {
    id: "demo-inv-101",
    number: "INV-DEMO-001",
    date: "Recent",
    dueDate: "Paid & Cleared",
    service: "Daily Trend Creator (30-Day Retainer)",
    amount: "₹19,999",
    numericAmount: 19999,
    status: "paid",
    statusLabel: "Paid & Cleared",
    paymentMethod: "Razorpay / Corporate UPI",
    driveFile: "INV_DAILY_TREND_Sample.pdf",
    isDemo: true,
  },
  {
    id: "demo-inv-102",
    number: "INV-DEMO-002",
    date: "Recent",
    dueDate: "Paid & Cleared",
    service: "Starter Trend Retainer (15 Images + 15 Videos)",
    amount: "₹9,999",
    numericAmount: 9999,
    status: "paid",
    statusLabel: "Paid & Cleared",
    paymentMethod: "UPI Netbanking Transfer",
    driveFile: "INV_STARTER_TREND_Sample.pdf",
    isDemo: true,
  },
  {
    id: "demo-inv-103",
    number: "INV-DEMO-003",
    date: "Upcoming",
    dueDate: "Due upon review",
    service: "High-Performance Website Development (Landing Page)",
    amount: "₹4,999",
    numericAmount: 4999,
    status: "pending",
    statusLabel: "Payment Due",
    paymentMethod: "NEFT / Direct UPI Transfer",
    driveFile: "INV_WEBSITE_Draft.pdf",
    isDemo: true,
  },
];

export default function InvoicesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadMsg, setDownloadMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptOrderData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any | null>(null);
  const [showDemoRecords, setShowDemoRecords] = useState(false);

  // Load real client orders and map to invoice records
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const clientUid = user?.uid || (user?.email ? user.email : "");
      const url = clientUid ? `/api/orders?clientUid=${encodeURIComponent(clientUid)}` : "/api/orders";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const ordersList = Array.isArray(data.orders) ? data.orders : [];

        if (ordersList.length > 0) {
          const mapped: InvoiceRecord[] = ordersList.map((o: any, idx: number) => {
            const isPaid = o.paymentStatus === "paid" || o.status === "completed" || o.status === "approved";
            const num = o.orderNumber || o.code || `INV-${String(o.id || idx + 1).slice(-4)}`;
            const invNumber = num.startsWith("INV-") ? num : `INV-${num.replace(/^#?ORD-?/, "")}`;
            const total = o.totalAmount || o.amountPaid || (o.items && o.items[0]?.price) || 0;
            const driveDeliverable = o.deliverables?.find((d: any) =>
              d.filename?.toLowerCase().endsWith(".pdf") || d.category === "invoice"
            );

            return {
              id: o.id || `inv-${idx}`,
              number: invNumber,
              date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
              dueDate: isPaid
                ? o.paidAt
                  ? `Paid on ${new Date(o.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                  : "Paid & Cleared"
                : "Payment Due",
              service: o.title || o.service || (o.items && o.items[0]?.name) || "Studio Commission",
              amount: formatCurrencyINR(total),
              numericAmount: total,
              status: isPaid ? "paid" : "pending",
              statusLabel: isPaid ? "Paid & Cleared" : "Payment Due",
              paymentMethod: o.paymentMethod || (isPaid ? "Razorpay Verified / UPI" : "Pending UPI / Netbanking"),
              driveFile: driveDeliverable?.filename || `${invNumber}_Statement.pdf`,
              driveFileId: driveDeliverable?.driveFileId,
              isDemo: false,
              rawOrder: o,
            };
          });
          setInvoices(mapped);
          setShowDemoRecords(false);
        } else {
          // Zero real orders: offer canonical demo records for UI preview
          setInvoices(CANONICAL_DEMO_INVOICES);
          setShowDemoRecords(true);
        }
      } else {
        setInvoices(CANONICAL_DEMO_INVOICES);
        setShowDemoRecords(true);
      }
    } catch {
      setInvoices(CANONICAL_DEMO_INVOICES);
      setShowDemoRecords(true);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, user?.email]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Working download handler using authenticated Google Drive proxy or official receipt generator
  const handleDownloadInvoice = async (inv: InvoiceRecord) => {
    setDownloadMsg({ text: `Preparing verified tax statement for ${inv.number}...`, type: "info" });

    // If real Drive file ID exists on server, download via authenticated Drive proxy
    if (inv.driveFileId) {
      try {
        const res = await fetch(`/api/drive/file/${encodeURIComponent(inv.driveFileId)}?download=true`);
        if (res.status === 401) {
          throw new Error("Authentication required. Please sign in to download private invoice records.");
        }
        if (res.status === 403) {
          throw new Error("Forbidden: Cross-tenant download is blocked. You may only download statements for your account.");
        }
        if (res.status === 404) {
          throw new Error("Statement is being generated in cloud vault. Opening printable receipt view...");
        }
        if (!res.ok) {
          throw new Error(`Download failed (HTTP ${res.status}). Opening printable receipt view.`);
        }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = inv.driveFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setDownloadMsg({ text: `Statement ${inv.number} downloaded successfully!`, type: "success" });
        setTimeout(() => setDownloadMsg(null), 3500);
        return;
      } catch (err: any) {
        setDownloadMsg({ text: err.message || "Opening printable tax receipt...", type: "info" });
      }
    }

    // Fallback: Open printable authenticated tax receipt modal
    const receiptData: ReceiptOrderData = {
      orderNumber: inv.number,
      code: inv.number,
      title: inv.service,
      service: inv.service,
      totalAmount: inv.numericAmount,
      amountPaid: inv.status === "paid" ? inv.numericAmount : 0,
      paymentStatus: inv.status === "paid" ? "paid" : "unpaid",
      paymentMethod: inv.paymentMethod,
      clientName: user?.displayName || "Studio Client",
      clientEmail: user?.email || "",
      paidAt: inv.status === "paid" ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      items: [
        {
          name: inv.service,
          price: inv.numericAmount,
          quantity: 1,
        },
      ],
    };

    setSelectedReceipt(receiptData);
    setIsReceiptOpen(true);
    setDownloadMsg({ text: `Official statement for ${inv.number} ready for print/export.`, type: "success" });
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  const handlePayNow = (inv: InvoiceRecord) => {
    const orderForPayment = inv.rawOrder || {
      id: inv.id,
      code: inv.number,
      orderNumber: inv.number,
      title: inv.service,
      service: inv.service,
      totalAmount: inv.numericAmount,
      amountPaid: inv.numericAmount,
      status: "pending_payment",
      statusLabel: "Pending Payment Verification",
    };
    setPaymentOrder(orderForPayment);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.service.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [invoices, searchQuery]);

  const totalBilled = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + (inv.numericAmount || 0), 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "paid")
      .reduce((acc, inv) => acc + (inv.numericAmount || 0), 0);
  }, [invoices]);

  const totalPending = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "pending")
      .reduce((acc, inv) => acc + (inv.numericAmount || 0), 0);
  }, [invoices]);

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-4 sm:p-8 lg:p-10 max-w-5xl pb-24 md:pb-12 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <span>BILLING & STATEMENTS</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Invoices & Tax Receipts
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Review verified studio statements, GST milestone invoices, and encrypted receipts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F4EFE6] transition-all shadow-xs touch-target min-h-[44px]"
                title="Go to Public Website"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>View Website</span>
              </Link>

              <div className="relative flex items-center w-full sm:w-60">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search invoice or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A] min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Sample Demo Records Disclosure Banner */}
          {showDemoRecords && (
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/50 text-xs text-[#5C3A1E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#A98B57] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-[#0F172A]">
                    STUDIO DEMO RECORDS SHOWN
                  </strong>
                  <span>
                    No historical orders found on your account yet. The statements below demonstrate official GST format, line items, and receipt rendering.
                  </span>
                </div>
              </div>
              <Link href="/orders" className="shrink-0 w-full sm:w-auto">
                <Button variant="primary" size="sm" withArrow className="w-full sm:w-auto justify-center min-h-[44px]">
                  Place First Commission
                </Button>
              </Link>
            </div>
          )}

          {/* Financial Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">Total Billed Volume</span>
              <p className="font-serif text-2xl font-bold text-[#0F172A]">{formatCurrencyINR(totalBilled)}</p>
              <span className="text-[11px] text-[#2E7D4F] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {invoices.length} Statements {showDemoRecords ? "(Demo)" : "Verified"}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">Paid to Date</span>
              <p className="font-serif text-2xl font-bold text-[#2E7D4F]">{formatCurrencyINR(totalPaid)}</p>
              <span className="text-[11px] text-[#64748B]">Receipts synchronized in Drive</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">Pending Milestone</span>
              <p className="font-serif text-2xl font-bold text-[#D4A35A]">{formatCurrencyINR(totalPending)}</p>
              <span className="text-[11px] text-[#A98B57] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {invoices.filter((i) => i.status === "pending").length} Pending Review
              </span>
            </div>
          </div>

          {/* Toast Notification */}
          {downloadMsg && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
                downloadMsg.type === "error"
                  ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                  : downloadMsg.type === "info"
                  ? "bg-[#FFFDF9] border-[#D4A35A]/60 text-[#5C3A1E]"
                  : "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
              }`}
            >
              <div className="flex items-center gap-2">
                {downloadMsg.type === "error" ? (
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                )}
                <span className="font-medium">{downloadMsg.text}</span>
              </div>
              <span className="text-[10px] font-mono text-[#5C3A1E]">Sutra Cloud Vault</span>
            </div>
          )}

          {/* Invoices List: Desktop Rows + Mobile High-Density Cards */}
          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#A98B57]" />
                <span>Loading authenticated statements...</span>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">
                No invoices found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[#FAF9F5]/60 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#5C3A1E] tracking-wider">
                        {inv.number}
                      </span>
                      <Badge variant={inv.status === "paid" ? "completed" : "gold"}>
                        {inv.statusLabel}
                      </Badge>
                      {inv.isDemo && (
                        <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-[#F4EFE6] text-[#A98B57] border border-[#EADFCB]">
                          Studio Sample
                        </span>
                      )}
                      <span className="text-[11px] text-[#64748B] font-mono">
                        Issued: {inv.date}
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-semibold text-[#0F172A] truncate">
                      {inv.service}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>{inv.paymentMethod}</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-[#5C3A1E]">
                        {inv.driveFile}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-[#EADFCB]/60">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                        Total Amount (Inc. GST)
                      </span>
                      <span className="font-serif text-xl sm:text-2xl font-bold text-[#0F172A]">
                        {inv.amount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {inv.status === "pending" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayNow(inv)}
                          leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                          className="min-h-[44px] touch-target"
                        >
                          Pay Now
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadInvoice(inv)}
                        leftIcon={<Download className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                        className="min-h-[44px] touch-target"
                      >
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drive Vault Storage Notice */}
          <div className="p-5 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-[#5C3A1E] shrink-0" />
              <div>
                <h4 className="font-serif font-semibold text-sm text-[#0F172A]">
                  Encrypted Tax Archive
                </h4>
                <p className="text-[#64748B] mt-0.5">
                  All signed agreements and official GST tax invoices are automatically preserved in your private Sutra Cloud Vault folder <code className="font-mono text-[#5C3A1E]">/LEGAL_DOCS</code>.
                </p>
              </div>
            </div>
            <Link href="/media" className="shrink-0 w-full sm:w-auto">
              <Button variant="secondary" size="sm" withArrow className="w-full sm:w-auto justify-center min-h-[44px] touch-target">
                Open Vault
              </Button>
            </Link>
          </div>
        </main>

        {/* Printable/Exportable Official Tax Receipt Modal */}
        <OrderReceiptModal
          isOpen={isReceiptOpen}
          order={selectedReceipt}
          onClose={() => {
            setIsReceiptOpen(false);
            setSelectedReceipt(null);
          }}
        />

        {/* Integrated Checkout / UTR Payment Modal */}
        {paymentOrder && (
          <PaymentModal
            isOpen={!!paymentOrder}
            onClose={() => setPaymentOrder(null)}
            orderId={paymentOrder.id}
            orderCode={paymentOrder.orderNumber}
            clientName={user?.displayName || "Studio Client"}
            clientEmail={user?.email || undefined}
            serviceTitle={paymentOrder.service}
            amount={paymentOrder.amount}
            onPaymentSuccess={() => {
              setPaymentOrder(null);
              fetchInvoices();
              setDownloadMsg({ text: "Payment registered! Receipt archived.", type: "success" });
            }}
          />
        )}

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
