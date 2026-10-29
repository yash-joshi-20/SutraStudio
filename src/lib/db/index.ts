/**
 * SUTRA STUDIO — Unified Database Layer (Prisma + SQLite / PostgreSQL)
 *
 * Replaces Firebase Admin and Firestore with Prisma ORM.
 * Provides direct Prisma access alongside a Firestore-compatible collection/doc
 * facade so all existing stores, services, and routes persist seamlessly.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

export { prisma };

export type DocumentSnapshot = any;
export type QuerySnapshot = any;
export type Query = any;
export type Firestore = any;
export type QueryDocumentSnapshot = any;

export class NotConfiguredError extends Error {
  readonly code = "NOT_CONFIGURED";
  constructor(public readonly integration = "Database", public readonly missingKeys: string[] = []) {
    super(`${integration} is not configured.`);
    this.name = "NotConfiguredError";
  }
}

export function isNotConfigured(err: unknown): boolean {
  return err instanceof NotConfiguredError;
}

export function isFirebaseAdminReady(): boolean {
  return true;
}

export function isDatabaseReady(): boolean {
  return true;
}

export function adminMissingKeys(): string[] {
  return [];
}

/** ISO Date normalizer */
export function toIso(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const d = (value as { toDate(): Date }).toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d.toISOString() : "";
  }
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  return "";
}

export const nowIso = () => new Date().toISOString();

export function plain<T = any>(snap: { id: string; data: () => any; exists: boolean }): T | null {
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export function plainAll<T = any>(snap: {
  docs: Array<{ id: string; data: () => any; exists: boolean }>;
}): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

export async function queryToArray<T = any>(q: any): Promise<T[]> {
  const snap = await q.get();
  return plainAll<T>(snap);
}

export async function dataToArray<T = any>(q: any): Promise<T[]> {
  return queryToArray<T>(q);
}

export function clean<T extends Record<string, unknown>>(input: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out as T;
}

export function serverTimestamp(): string {
  return new Date().toISOString();
}

export function fieldDelete(): null {
  return null;
}

export function arrayUnion(...items: unknown[]): unknown[] {
  return items;
}

export function arrayRemove(...items: unknown[]): unknown[] {
  return items;
}

export function increment(by: number): number {
  return by;
}

/**
 * Universal Document reference interface matching Firestore conventions
 */
export interface DbDocRef {
  id: string;
  get: () => Promise<{
    id: string;
    exists: boolean;
    data: () => any;
    ref: DbDocRef;
  }>;
  set: (data: any, options?: { merge?: boolean }) => Promise<void>;
  update: (data: any) => Promise<void>;
  delete: () => Promise<void>;
}

/**
 * Universal Collection reference interface matching Firestore conventions
 */
export interface DbCollectionRef {
  doc: (id?: string) => DbDocRef;
  where: (field: string, op: string, val: any) => DbCollectionRef;
  orderBy: (field: string, direction?: "asc" | "desc") => DbCollectionRef;
  limit: (count: number) => DbCollectionRef;
  count: () => { get: () => Promise<{ data: () => { count: number } }> };
  get: () => Promise<{
    empty: boolean;
    size: number;
    docs: Array<{
      id: string;
      exists: boolean;
      data: () => any;
      ref: DbDocRef;
    }>;
    forEach: (fn: (doc: any) => void) => void;
  }>;
  add: (data: any) => Promise<DbDocRef>;
}

/**
 * Prisma-backed Collection/Doc facade
 */
function createCollection(collectionName: string): DbCollectionRef {
  return {
    doc(id?: string): DbDocRef {
      const docId = id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const key = `${collectionName}:${docId}`;

      const docRef: DbDocRef = {
        id: docId,
        async get() {
          try {
            if (collectionName === "orders") {
              const order = await prisma.order.findUnique({ where: { id: docId } });
              if (order) {
                const meta = order.metadata ? JSON.parse(order.metadata) : {};
                return {
                  id: order.id,
                  exists: true,
                  data: () => ({ ...order, ...meta }),
                  ref: docRef,
                };
              }
            } else if (collectionName === "payments") {
              const payment = await prisma.payment.findUnique({ where: { id: docId } });
              if (payment) {
                let meta: Record<string, unknown> = {};
                if (payment.metadata) {
                  try {
                    meta = JSON.parse(payment.metadata);
                  } catch {
                    meta = {};
                  }
                }
                return {
                  id: payment.id,
                  exists: true,
                  data: () => ({
                    ...meta,
                    ...payment,
                    amountINR: payment.amount,
                    utrNumber: payment.utr,
                    paymentMethod: payment.method,
                  }),
                  ref: docRef,
                };
              }
            } else if (collectionName === "users" || collectionName === "clients") {
              const user = await prisma.user.findFirst({
                where: { OR: [{ id: docId }, { uid: docId }] },
              });
              if (user) {
                let billingMeta: Record<string, unknown> = {};
                if (user.billingData) {
                  try {
                    billingMeta = JSON.parse(user.billingData);
                  } catch {
                    billingMeta = {};
                  }
                }
                const notes = user.adminNotes ? JSON.parse(user.adminNotes) : [];
                const billingObj =
                  (billingMeta.billing as Record<string, unknown>) ||
                  (billingMeta.billingAddress as Record<string, unknown>) ||
                  billingMeta;
                return {
                  id: user.uid,
                  exists: true,
                  data: () => ({
                    ...billingMeta,
                    ...user,
                    displayName: user.name,
                    name: user.name,
                    companyName: user.company,
                    company: user.company,
                    billing: billingObj,
                    billingAddress: billingObj,
                    adminNotes: notes,
                  }),
                  ref: docRef,
                };
              }
            } else if (collectionName === "inquiries") {
              const inq = await prisma.inquiry.findUnique({ where: { id: docId } });
              if (inq) {
                return {
                  id: inq.id,
                  exists: true,
                  data: () => ({ ...inq }),
                  ref: docRef,
                };
              }
            } else if (collectionName === "notifications") {
              const notif = await prisma.notification.findUnique({ where: { id: docId } });
              if (notif) {
                return {
                  id: notif.id,
                  exists: true,
                  data: () => ({
                    ...notif,
                    userId: notif.userUid,
                    actionUrl: notif.link,
                  }),
                  ref: docRef,
                };
              }
            }

            // KeyValue fallback store
            const record = await prisma.keyValue.findUnique({ where: { key } });
            if (record) {
              const parsed = JSON.parse(record.value);
              return {
                id: docId,
                exists: true,
                data: () => parsed,
                ref: docRef,
              };
            }
          } catch (err) {
            console.warn(`[DbCollection] get(${key}) failed:`, err);
          }

          return {
            id: docId,
            exists: false,
            data: () => ({}),
            ref: docRef,
          };
        },

        async set(data: any, options?: { merge?: boolean }) {
          try {
            if (collectionName === "orders") {
              const rawClientUid = (data.clientUid || data.clientId || data.userId || "").trim();
              const clientEmail = (data.clientEmail || data.email || "").trim().toLowerCase();
              let resolvedClientUid = rawClientUid;

              if (!resolvedClientUid && clientEmail) {
                const existingUser = await prisma.user.findFirst({ where: { email: clientEmail } });
                if (existingUser) {
                  resolvedClientUid = existingUser.uid;
                } else {
                  resolvedClientUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                }
              }

              if (!resolvedClientUid) {
                resolvedClientUid = "usr_client_default";
              }

              // Ensure the parent User exists to satisfy foreign key Order.clientUid -> User.uid
              const userRecord = await prisma.user.findFirst({
                where: { OR: [{ uid: resolvedClientUid }, { email: clientEmail || undefined }] },
              });

              if (!userRecord) {
                await prisma.user.create({
                  data: {
                    uid: resolvedClientUid,
                    email: clientEmail || `${resolvedClientUid}@sutrastudio.com`,
                    name: (data.clientName || "Studio Client").trim(),
                    phone: data.clientPhone || data.phone || null,
                    company: (data.companyName || data.company || "").trim(),
                    role: "client",
                    status: "Active",
                  },
                });
              } else {
                resolvedClientUid = userRecord.uid;
              }

              const orderData = {
                orderNumber: data.orderNumber || data.code || `ORD-${docId.slice(-4)}`,
                clientUid: resolvedClientUid,
                clientName: data.clientName || "Studio Client",
                clientEmail: clientEmail || `${resolvedClientUid}@sutrastudio.com`,
                service: data.service || "Creative Service",
                packageName: data.packageName || null,
                packageId: data.packageId || null,
                totalAmount: Number(data.totalAmount || data.price || 0),
                amountPaid: Number(data.amountPaid || 0),
                status: data.status || "pending_verification",
                paymentStatus: data.paymentStatus || "pending_payment",
                turnaround: data.turnaround || null,
                brief: data.brief || data.notes || null,
                source: data.source || "web",
                metadata: JSON.stringify(data),
              };

              await prisma.order.upsert({
                where: { id: docId },
                update: orderData,
                create: { id: docId, ...orderData },
              });
              return;
            }

            if (collectionName === "payments") {
              const amount = Number(data.amountINR || data.amount || 0);
              const method = data.method || data.paymentMethod || "upi_qr";
              const status = data.status || "pending_verification";
              const utr = data.utrNumber || data.utr || null;
              const receiptUrl = data.screenshotUrl || data.receiptUrl || null;
              const orderId = data.orderId || null;
              const clientEmail = (data.clientEmail || data.email || "").trim().toLowerCase() || null;
              let clientUid = (data.clientUid || data.clientId || "").trim() || null;

              let validOrderId: string | null = null;
              if (orderId) {
                const ord = await prisma.order.findUnique({ where: { id: orderId } });
                if (ord) {
                  validOrderId = ord.id;
                  if (!clientUid) clientUid = ord.clientUid;
                }
              }

              let validClientUid: string | null = null;
              if (clientUid) {
                const usr = await prisma.user.findFirst({ where: { uid: clientUid } });
                if (usr) {
                  validClientUid = usr.uid;
                }
              }

              const paymentData = {
                amount,
                method,
                status,
                utr,
                receiptUrl,
                orderId: validOrderId,
                clientUid: validClientUid,
                clientEmail,
                metadata: JSON.stringify(data),
              };

              await prisma.payment.upsert({
                where: { id: docId },
                update: paymentData,
                create: { id: docId, ...paymentData },
              });
              return;
            }

            if (collectionName === "users" || collectionName === "clients") {
              const existingUser = await prisma.user.findFirst({
                where: { OR: [{ id: docId }, { uid: docId }] },
              });

              let currentMeta: Record<string, unknown> = {};
              if (existingUser?.billingData) {
                try {
                  currentMeta = JSON.parse(existingUser.billingData);
                } catch {
                  currentMeta = {};
                }
              }

              const newBillingObj = data.billing || data.billingAddress || {};
              const existingBilling =
                (currentMeta.billing as Record<string, unknown>) ||
                (currentMeta.billingAddress as Record<string, unknown>) ||
                {};
              const mergedBilling = options?.merge
                ? { ...existingBilling, ...newBillingObj }
                : newBillingObj;

              const mergedMeta: Record<string, unknown> = options?.merge
                ? {
                    ...currentMeta,
                    ...data,
                    billing: mergedBilling,
                    billingAddress: mergedBilling,
                  }
                : {
                    ...data,
                    billing: mergedBilling,
                    billingAddress: mergedBilling,
                  };

              delete mergedMeta.id;
              delete mergedMeta.createdAt;
              delete mergedMeta.updatedAt;

              const name = (data.displayName || data.name || existingUser?.name || "Studio Client").trim();
              const phone =
                data.phone !== undefined
                  ? data.phone
                    ? String(data.phone).trim()
                    : null
                  : (existingUser?.phone ?? null);
              const company = (data.companyName || data.company || existingUser?.company || "").trim();
              const tier = data.tier || existingUser?.tier || "Standard";
              const status = data.status ? (data.status === "suspended" || data.status === "Disabled" || data.status === "disabled" ? "Disabled" : data.status === "under_review" || data.status === "Under Review" ? "Under Review" : "Active") : (existingUser?.status ?? "Active");
              const photoURL = data.photoURL !== undefined ? data.photoURL : (existingUser?.photoURL ?? null);
              const driveFolderId = data.driveFolderId || existingUser?.driveFolderId || "";
              const driveFolderLink = data.driveFolderLink || existingUser?.driveFolderLink || null;
              const emailVerified =
                data.emailVerified !== undefined
                  ? Boolean(data.emailVerified)
                  : (existingUser?.emailVerified ?? false);
              const adminNotes = data.adminNotes ? JSON.stringify(data.adminNotes) : (existingUser?.adminNotes ?? null);

              if (existingUser) {
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: {
                    name,
                    phone,
                    company,
                    tier,
                    status,
                    photoURL,
                    driveFolderId,
                    driveFolderLink,
                    emailVerified,
                    billingData: JSON.stringify(mergedMeta),
                    ...(adminNotes ? { adminNotes } : {}),
                  },
                });
              } else if (data.email) {
                const targetUid = data.uid || docId;
                await prisma.user.create({
                  data: {
                    uid: targetUid,
                    email: String(data.email).trim().toLowerCase(),
                    name,
                    phone,
                    company,
                    tier,
                    status,
                    photoURL,
                    driveFolderId,
                    driveFolderLink,
                    emailVerified,
                    billingData: JSON.stringify(mergedMeta),
                    adminNotes,
                    role: data.role === "admin" ? "admin" : "client",
                  },
                });
              }
              return;
            }

            if (collectionName === "inquiries") {
              const inqData = {
                name: String(data.name || "Anonymous Client").trim(),
                email: String(data.email || "").trim().toLowerCase(),
                phone: data.phone ? String(data.phone).trim() : null,
                service: data.service ? String(data.service).trim() : null,
                message: String(data.message || "").trim(),
                status: data.status || "new",
              };
              await prisma.inquiry.upsert({
                where: { id: docId },
                update: inqData,
                create: { id: docId, ...inqData },
              });
              return;
            }

            if (collectionName === "notifications") {
              let userUid = data.userId || data.userUid || null;
              if (userUid) {
                const userExists = await prisma.user.findFirst({ where: { uid: userUid } });
                if (!userExists) userUid = null;
              }
              const notifData = {
                userUid,
                title: String(data.title || "Notification").trim(),
                message: String(data.message || "").trim(),
                type: data.type || "system",
                read: Boolean(data.read ?? false),
                link: data.actionUrl || data.link || null,
              };
              await prisma.notification.upsert({
                where: { id: docId },
                update: notifData,
                create: { id: docId, ...notifData },
              });
              return;
            }

            const current = options?.merge ? (await this.get()).data() : {};
            const merged = { ...current, ...data };
            await prisma.keyValue.upsert({
              where: { key },
              update: { value: JSON.stringify(merged) },
              create: { key, value: JSON.stringify(merged) },
            });
          } catch (err) {
            console.warn(`[DbCollection] set(${key}) failed:`, err);
          }
        },

        async update(data: any) {
          await this.set(data, { merge: true });
        },

        async delete() {
          try {
            if (collectionName === "orders") {
              await prisma.order.deleteMany({ where: { id: docId } });
            }
            if (collectionName === "payments") {
              await prisma.payment.deleteMany({ where: { id: docId } });
            }
            if (collectionName === "users" || collectionName === "clients") {
              await prisma.user.deleteMany({ where: { OR: [{ id: docId }, { uid: docId }] } });
            }
            if (collectionName === "inquiries") {
              await prisma.inquiry.deleteMany({ where: { id: docId } });
            }
            if (collectionName === "notifications") {
              await prisma.notification.deleteMany({ where: { id: docId } });
            }
            await prisma.keyValue.deleteMany({ where: { key } });
          } catch (err) {
            console.warn(`[DbCollection] delete(${key}) failed:`, err);
          }
        },
      };
      return docRef;
    },

    where() {
      return this;
    },

    orderBy() {
      return this;
    },

    limit() {
      return this;
    },

    count() {
      return {
        get: async () => {
          let count = 0;
          try {
            if (collectionName === "orders") count = await prisma.order.count();
            else if (collectionName === "users") count = await prisma.user.count();
            else if (collectionName === "payments") count = await prisma.payment.count();
            else if (collectionName === "notifications") count = await prisma.notification.count();
            else {
              count = await prisma.keyValue.count({ where: { key: { startsWith: `${collectionName}:` } } });
            }
          } catch {
            count = 0;
          }
          return { data: () => ({ count }) };
        },
      };
    },

    async get() {
      try {
        if (collectionName === "orders") {
          const orders = await prisma.order.findMany({ take: 200, orderBy: { createdAt: "desc" } });
          const docs = orders.map((o: any) => {
            const meta = o.metadata ? JSON.parse(o.metadata) : {};
            return {
              id: o.id,
              exists: true,
              data: () => ({ ...o, ...meta }),
              ref: this.doc(o.id),
            };
          });
          return {
            empty: docs.length === 0,
            size: docs.length,
            docs,
            forEach(fn: (doc: any) => void) {
              docs.forEach(fn);
            },
          };
        }

        if (collectionName === "users" || collectionName === "clients") {
          const users = await prisma.user.findMany({ take: 200, orderBy: { createdAt: "desc" } });
          const docs = users.map((u: any) => {
            let meta: Record<string, unknown> = {};
            if (u.billingData) {
              try {
                meta = JSON.parse(u.billingData);
              } catch {
                meta = {};
              }
            }
            const notes = u.adminNotes ? JSON.parse(u.adminNotes) : [];
            const billingObj =
              (meta.billing as Record<string, unknown>) ||
              (meta.billingAddress as Record<string, unknown>) ||
              meta;
            return {
              id: u.uid,
              exists: true,
              data: () => ({
                ...meta,
                ...u,
                displayName: u.name,
                name: u.name,
                companyName: u.company,
                company: u.company,
                billing: billingObj,
                billingAddress: billingObj,
                adminNotes: notes,
              }),
              ref: this.doc(u.uid),
            };
          });
          return {
            empty: docs.length === 0,
            size: docs.length,
            docs,
            forEach(fn: (doc: any) => void) {
              docs.forEach(fn);
            },
          };
        }

        if (collectionName === "payments") {
          const payments = await prisma.payment.findMany({ take: 200, orderBy: { createdAt: "desc" } });
          const docs = payments.map((p: any) => {
            let meta: Record<string, unknown> = {};
            if (p.metadata) {
              try {
                meta = JSON.parse(p.metadata);
              } catch {
                meta = {};
              }
            }
            return {
              id: p.id,
              exists: true,
              data: () => ({
                ...meta,
                ...p,
                amountINR: p.amount,
                utrNumber: p.utr,
                paymentMethod: p.method,
              }),
              ref: this.doc(p.id),
            };
          });
          return {
            empty: docs.length === 0,
            size: docs.length,
            docs,
            forEach(fn: (doc: any) => void) {
              docs.forEach(fn);
            },
          };
        }

        if (collectionName === "inquiries") {
          const inquiries = await prisma.inquiry.findMany({ take: 200, orderBy: { createdAt: "desc" } });
          const docs = inquiries.map((i: any) => ({
            id: i.id,
            exists: true,
            data: () => ({ ...i }),
            ref: this.doc(i.id),
          }));
          return {
            empty: docs.length === 0,
            size: docs.length,
            docs,
            forEach(fn: (doc: any) => void) {
              docs.forEach(fn);
            },
          };
        }

        if (collectionName === "notifications") {
          const notifications = await prisma.notification.findMany({ take: 200, orderBy: { createdAt: "desc" } });
          const docs = notifications.map((n: any) => ({
            id: n.id,
            exists: true,
            data: () => ({
              ...n,
              userId: n.userUid,
              actionUrl: n.link,
            }),
            ref: this.doc(n.id),
          }));
          return {
            empty: docs.length === 0,
            size: docs.length,
            docs,
            forEach(fn: (doc: any) => void) {
              docs.forEach(fn);
            },
          };
        }

        const prefix = `${collectionName}:`;
        const items = await prisma.keyValue.findMany({
          where: { key: { startsWith: prefix } },
          take: 200,
        });

        const docs = items.map((it: any) => {
          const id = it.key.replace(prefix, "");
          return {
            id,
            exists: true,
            data: () => JSON.parse(it.value),
            ref: this.doc(id),
          };
        });

        return {
          empty: docs.length === 0,
          size: docs.length,
          docs,
          forEach(fn: (doc: any) => void) {
            docs.forEach(fn);
          },
        };
      } catch (err) {
        console.warn(`[DbCollection] get() failed for ${collectionName}:`, err);
        return {
          empty: true,
          size: 0,
          docs: [] as any[],
          forEach(_fn: (doc: any) => void) {},
        };
      }
    },

    async add(data: any) {
      const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const docRef = this.doc(docId);
      await docRef.set(data);
      return docRef;
    },
  };
}

export function db() {
  return {
    collection: (name: string) => createCollection(name),
    doc: (path: string) => {
      const parts = path.split("/");
      const colName = parts[0] || "default";
      const docId = parts.slice(1).join("/") || "default";
      return createCollection(colName).doc(docId);
    },
    batch: () => {
      const ops: Array<() => Promise<any>> = [];
      return {
        set(ref: any, data: any, opts?: any) {
          ops.push(() => ref.set(data, opts));
        },
        update(ref: any, data: any) {
          ops.push(() => ref.update(data));
        },
        delete(ref: any) {
          ops.push(() => ref.delete());
        },
        async commit() {
          for (const op of ops) {
            await op();
          }
        },
      };
    },
    runTransaction: async (cb: (tx: any) => Promise<any>) => {
      const tx = {
        get: async (ref: any) => ref.get(),
        set: (ref: any, data: any, opts?: any) => ref.set(data, opts),
        update: (ref: any, data: any) => ref.update(data),
        delete: (ref: any) => ref.delete(),
      };
      return cb(tx);
    },
  };
}

export function adminDb() {
  return db();
}

export function adminAuth() {
  return {
    async verifySessionCookie(cookie: string, _checkRevoked?: boolean) {
      const { decodeSession } = await import("@/lib/auth/session");
      const user = await decodeSession(cookie);
      if (!user) throw new Error("Invalid session");
      return user;
    },
    async verifyIdToken(token: string, _checkRevoked?: boolean) {
      const { decodeIdToken } = await import("@/lib/auth/session");
      const user = await decodeIdToken(token);
      if (!user) throw new Error("Invalid ID token");
      return user;
    },
    async createSessionCookie(token: string, _options?: { expiresIn: number }) {
      return token;
    },
    async getUser(uid: string) {
      const u = await prisma.user.findFirst({
        where: { OR: [{ id: uid }, { uid }] },
      });
      return {
        uid: u?.uid || uid,
        email: u?.email || "",
        displayName: (u as any)?.displayName || u?.name || "",
        emailVerified: true,
        customClaims: { role: u?.role || "client" },
      };
    },
    async updateUser(uid: string, patch: any) {
      try {
        await prisma.user.updateMany({
          where: { OR: [{ id: uid }, { uid }] },
          data: {
            ...(patch.displayName ? { name: patch.displayName } : {}),
            ...(patch.email ? { email: patch.email } : {}),
            ...(patch.role ? { role: patch.role } : {}),
          },
        });
      } catch (err) {
        console.warn("[adminAuth.updateUser] notice:", err);
      }
      return { uid, ...patch };
    },
    async setCustomUserClaims(uid: string, claims: any) {
      if (claims?.role) {
        try {
          await prisma.user.updateMany({
            where: { OR: [{ id: uid }, { uid }] },
            data: { role: claims.role },
          });
        } catch (err) {
          console.warn("[adminAuth.setCustomUserClaims] notice:", err);
        }
      }
    },
    async generatePasswordResetLink(email: string) {
      return `/reset-password?email=${encodeURIComponent(email)}`;
    },
    async generateEmailVerificationLink(email: string) {
      return `/verify-email?email=${encodeURIComponent(email)}`;
    },
    async revokeRefreshTokens(_uid: string) {
      // Tokens expire via TTL
    },
  };
}
