/**
 * SUTRA STUDIO — Unified Admin Client Directory Store & Aggregator
 * Computes live client dossiers combining profile details, Firestore orders,
 * active monthly retainer subscriptions, payments ledger, Drive links, and admin notes.
 */

import { OrdersStore } from "./ordersStore";
import { NotificationsStore } from "./notificationsStore";
import { AuditLogService } from "./auditLogService";

export interface ClientAdminNote {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface ClientProfileRecord {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  tier: "Enterprise" | "Growth" | "Starter";
  status: "Active" | "Disabled" | "Under Review";
  emailVerified: boolean;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    gstin?: string;
  };
  driveFolderId: string;
  driveFolderLink?: string;
  joinedDate: string;
  lastActive: string;
  adminNotes: ClientAdminNote[];
}

const INITIAL_CLIENT_PROFILES: ClientProfileRecord[] = [
  {
    id: "cl-1",
    uid: "usr_mock_001",
    name: "Yash Joshi",
    company: "Studio Living Architecture",
    email: "yash@studioliving.com",
    phone: "+91 98765 43210",
    tier: "Enterprise",
    status: "Active",
    emailVerified: true,
    billingAddress: {
      street: "104, Residency Chambers, Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400021",
      country: "India",
      gstin: "27AAACJ8921K1Z3",
    },
    driveFolderId: "drive_fld_sutra_001",
    driveFolderLink: "https://drive.google.com/drive/folders/drive_fld_sutra_001",
    joinedDate: "August 2026",
    lastActive: "10 mins ago",
    adminNotes: [
      {
        id: "cn_001",
        authorName: "Executive Producer",
        text: "Priority VIP client. Focus on teak wood shaders and dusk architectural passes.",
        createdAt: "2026-09-28T10:00:00.000Z",
      },
    ],
  },
  {
    id: "cl-2",
    uid: "usr_mock_002",
    name: "Aarav Singhania",
    company: "Maison Aura Luxury Fragrances",
    email: "aarav@maisonaura.com",
    phone: "+91 98111 23456",
    tier: "Enterprise",
    status: "Active",
    emailVerified: true,
    billingAddress: {
      street: "Plot 88, Udyog Vihar Phase IV",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122015",
      country: "India",
      gstin: "07AABCM4501D1Z9",
    },
    driveFolderId: "drive_fld_maison_002",
    driveFolderLink: "https://drive.google.com/drive/folders/drive_fld_maison_002",
    joinedDate: "July 2026",
    lastActive: "45 mins ago",
    adminNotes: [],
  },
  {
    id: "cl-3",
    uid: "usr_mock_003",
    name: "Meera Patel",
    company: "Zenith Spatial & Interiors",
    email: "meera@zenithliving.in",
    phone: "+91 99200 88776",
    tier: "Growth",
    status: "Active",
    emailVerified: true,
    billingAddress: {
      street: "42, Ashoka Road",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380009",
      country: "India",
    },
    driveFolderId: "drive_fld_zenith_003",
    driveFolderLink: "https://drive.google.com/drive/folders/drive_fld_zenith_003",
    joinedDate: "September 2026",
    lastActive: "3 hours ago",
    adminNotes: [],
  },
  {
    id: "cl-4",
    uid: "usr_mock_004",
    name: "Karan Verma",
    company: "Shri Naturals D2C",
    email: "growth@shrinaturals.com",
    phone: "+91 97110 33445",
    tier: "Starter",
    status: "Active",
    emailVerified: false,
    billingAddress: {
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
    },
    driveFolderId: "drive_fld_shri_004",
    driveFolderLink: "https://drive.google.com/drive/folders/drive_fld_shri_004",
    joinedDate: "September 2026",
    lastActive: "Yesterday",
    adminNotes: [],
  },
  {
    id: "cl-5",
    uid: "usr_mock_005",
    name: "Devika Rao",
    company: "Vedic Living Heritage Resorts",
    email: "devika@vedicresorts.com",
    phone: "+91 98450 11223",
    tier: "Enterprise",
    status: "Active",
    emailVerified: true,
    billingAddress: {
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
    },
    driveFolderId: "drive_fld_vedic_005",
    driveFolderLink: "https://drive.google.com/drive/folders/drive_fld_vedic_005",
    joinedDate: "August 2026",
    lastActive: "Just now",
    adminNotes: [],
  },
];

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_CLIENT_PROFILES__) {
  globalAny.__SUTRA_CLIENT_PROFILES__ = [...INITIAL_CLIENT_PROFILES];
}

export interface ClientDossier {
  profile: ClientProfileRecord;
  orders: any[];
  activeOrdersCount: number;
  completedOrdersCount: number;
  lifetimeVolumeFormatted: string;
  totalSpentINR: number;
  activePlan: {
    planName: string;
    type: "trial" | "active" | "none";
    statusLabel: string;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
    daysRemaining?: number;
    billingCycle?: string;
  } | null;
  notificationsCount: number;
  driveFolderLink: string;
}

export class ClientsStore {
  public static getAll(): ClientProfileRecord[] {
    return globalAny.__SUTRA_CLIENT_PROFILES__ as ClientProfileRecord[];
  }

  public static getAllProfiles(): ClientProfileRecord[] {
    return this.getAll();
  }

  public static findById(idOrUid: string): ClientProfileRecord | undefined {
    return this.findByEmailOrUid(idOrUid);
  }

  public static findByEmailOrUid(emailOrUid: string): ClientProfileRecord | undefined {
    const list = this.getAllProfiles();
    return list.find(
      (c) =>
        c.email.toLowerCase() === emailOrUid.toLowerCase() ||
        c.uid === emailOrUid ||
        c.id === emailOrUid
    );
  }

  public static upsertClient(client: Partial<ClientProfileRecord> & { email: string; name: string }): ClientProfileRecord {
    const list = this.getAllProfiles();
    const existingIndex = list.findIndex((c) => c.email.toLowerCase() === client.email.toLowerCase());

    if (existingIndex >= 0) {
      Object.assign(list[existingIndex], client, {
        lastActive: "Just now",
      });
      return list[existingIndex];
    } else {
      const newRecord: ClientProfileRecord = {
        id: `cl_${Date.now()}`,
        uid: client.uid || `usr_${Date.now()}`,
        name: client.name,
        email: client.email,
        phone: client.phone || "",
        company: client.company || "Studio Client",
        tier: client.tier || "Starter",
        status: client.status || "Active",
        emailVerified: client.emailVerified ?? false,
        billingAddress: client.billingAddress,
        driveFolderId: client.driveFolderId || `drive_fld_${Date.now()}`,
        driveFolderLink:
          client.driveFolderLink || `https://drive.google.com/drive/folders/drive_fld_${Date.now()}`,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        lastActive: "Just now",
        adminNotes: [],
      };
      list.unshift(newRecord);
      return newRecord;
    }
  }

  public static getDossier(clientIdOrEmail: string): ClientDossier | null {
    const profile = this.findByEmailOrUid(clientIdOrEmail);
    if (!profile) return null;

    const allOrders = OrdersStore.getAll();
    const clientOrders = allOrders.filter(
      (o) =>
        o.clientUid === profile.uid ||
        o.clientId === profile.uid ||
        o.clientEmail.toLowerCase() === profile.email.toLowerCase()
    );

    const activeOrders = clientOrders.filter(
      (o) => !["completed", "cancelled", "refunded", "closed"].includes(o.status)
    );
    const completedOrders = clientOrders.filter((o) => o.status === "completed");

    let totalSpent = 0;
    for (const order of clientOrders) {
      if (order.paymentStatus === "paid" || order.status === "completed") {
        totalSpent += order.amountPaid || order.totalAmount || 0;
      }
    }

    // Determine active subscription / trial
    const monthlyPlanOrder = clientOrders.find(
      (o) => o.type === "monthly_plan" && (o.status === "trial" || o.status === "active")
    );

    let activePlan: ClientDossier["activePlan"] = null;
    if (monthlyPlanOrder) {
      const isTrial = monthlyPlanOrder.status === "trial";
      const endTimestamp = isTrial
        ? monthlyPlanOrder.trialEndsAt
        : monthlyPlanOrder.currentPeriodEnd;

      let daysRemaining = 0;
      if (endTimestamp) {
        const diffMs = new Date(endTimestamp).getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      activePlan = {
        planName: monthlyPlanOrder.service,
        type: isTrial ? "trial" : "active",
        statusLabel: isTrial
          ? `3-Day Free Trial (${daysRemaining}d left)`
          : `Active Monthly Retainer (${daysRemaining}d left)`,
        trialEndsAt: monthlyPlanOrder.trialEndsAt,
        currentPeriodEnd: monthlyPlanOrder.currentPeriodEnd,
        daysRemaining,
        billingCycle: monthlyPlanOrder.billingCycle || "monthly",
      };
    }

    const notifs = NotificationsStore.getAll(profile.uid);

    return {
      profile,
      orders: clientOrders,
      activeOrdersCount: activeOrders.length,
      completedOrdersCount: completedOrders.length,
      lifetimeVolumeFormatted: `₹${totalSpent.toLocaleString("en-IN")}`,
      totalSpentINR: totalSpent,
      activePlan,
      notificationsCount: notifs.length,
      driveFolderLink:
        profile.driveFolderLink ||
        `https://drive.google.com/drive/folders/${profile.driveFolderId}`,
    };
  }

  public static getDirectory(query?: string, tier?: string): ClientDossier[] {
    const profiles = this.getAllProfiles();
    let filtered = profiles;

    if (tier && tier !== "All") {
      filtered = filtered.filter((p) => p.tier === tier);
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.driveFolderId.toLowerCase().includes(q)
      );
    }

    return filtered.map((p) => this.getDossier(p.id)!).filter(Boolean);
  }

  public static toggleClientStatus(params: {
    clientId: string;
    newStatus: "Active" | "Disabled" | "Under Review";
    reason?: string;
    adminUser: { uid: string; email: string; name: string; role: string };
  }): { success: boolean; profile?: ClientProfileRecord; error?: string } {
    const profile = this.findByEmailOrUid(params.clientId);
    if (!profile) return { success: false, error: "Client not found." };

    const beforeStatus = profile.status;
    profile.status = params.newStatus;

    AuditLogService.record({
      who: params.adminUser,
      what: "CLIENT_STATUS_TOGGLED",
      targetType: "client",
      targetId: profile.id,
      targetTitle: `${profile.name} (${profile.company})`,
      before: { status: beforeStatus },
      after: { status: params.newStatus },
      note: params.reason || `Client account status switched from ${beforeStatus} to ${params.newStatus}.`,
      type: params.newStatus === "Disabled" ? "warning" : "info",
    });

    return { success: true, profile };
  }

  public static resendVerification(params: {
    clientId: string;
    adminUser: { uid: string; email: string; name: string; role: string };
  }): { success: boolean; message: string; error?: string } {
    const profile = this.findByEmailOrUid(params.clientId);
    if (!profile) return { success: false, message: "", error: "Client not found." };

    AuditLogService.record({
      who: params.adminUser,
      what: "CLIENT_VERIFICATION_RESENT",
      targetType: "client",
      targetId: profile.id,
      targetTitle: `${profile.name} (${profile.email})`,
      before: { emailVerified: profile.emailVerified },
      after: { verificationDispatchedAt: new Date().toISOString() },
      note: `Verification email re-dispatched to ${profile.email}.`,
      type: "info",
    });

    return {
      success: true,
      message: `Verification link successfully dispatched to ${profile.email}.`,
    };
  }

  public static addAdminNote(params: {
    clientId: string;
    noteText: string;
    adminUser: { uid: string; email: string; name: string; role: string };
  }): { success: boolean; note?: ClientAdminNote; error?: string } {
    const profile = this.findByEmailOrUid(params.clientId);
    if (!profile) return { success: false, error: "Client not found." };

    if (!params.noteText.trim()) {
      return { success: false, error: "Note text cannot be empty." };
    }

    const newNote: ClientAdminNote = {
      id: `cn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorName: params.adminUser.name || "Studio Administrator",
      text: params.noteText.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!profile.adminNotes) profile.adminNotes = [];
    profile.adminNotes.unshift(newNote);

    AuditLogService.record({
      who: params.adminUser,
      what: "CLIENT_NOTE_ADDED",
      targetType: "client",
      targetId: profile.id,
      targetTitle: `${profile.name} (${profile.company})`,
      before: null,
      after: { noteCount: profile.adminNotes.length },
      note: `Added private note: "${params.noteText.slice(0, 60)}..."`,
      type: "info",
    });

    return { success: true, note: newNote };
  }
}
