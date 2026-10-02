declare module 'server-only' {
  // Empty declaration for server-only marker
}

declare module 'firebase-admin/firestore' {
  export namespace FieldValue {
    export function serverTimestamp(): any;
    export function deleteField(): any;
    export function arrayUnion(...elements: any[]): any;
    export function arrayRemove(...elements: any[]): any;
    export function increment(n: number): any;
    export function vector(values: number[]): any;
  }
  export type FieldValue = any;
  export type Firestore = any;
  export type DocumentReference = any;
  export type CollectionReference = any;
  export type QuerySnapshot = any;
  export type DocumentSnapshot = any;
}

declare module 'firebase-admin/app' {
  export function initializeApp(options?: any, name?: string): any;
  export function getApps(): any[];
  export function getApp(name?: string): any;
  export function cert(serviceAccountPathOrObject: any): any;
}

declare module 'firebase-admin/auth' {
  export function getAuth(app?: any): any;
}

declare module '@/lib/firebase/admin' {
  export function adminDb(): any;
  export function adminAuth(): any;
}

declare module '@/lib/auth/server' {
  export function getSession(): Promise<{ uid: string; email: string; name?: string; role?: string } | null>;
}

declare module '@/lib/auth/shared' {
  export function isStaffRole(role?: string): boolean;
  export function sameOrigin(req: Request): boolean;
}

declare module '@/lib/rate-limit' {
  export function rateLimit(key: string, limit: number, windowMs: number): boolean;
}

declare module '@/lib/chat/history' {
  export interface StoredMessage {
    role: 'user' | 'assistant';
    author?: string;
    content: string;
    createdAt?: any;
  }
  export function toModelMessages(messages: StoredMessage[]): Array<{ role: 'user' | 'assistant'; content: string }>;
}
