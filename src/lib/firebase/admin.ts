/**
 * Firebase Admin SDK initialization for server-side operations
 */

export function adminDb() {
  return {
    collection: (name: string) => ({
      doc: (id?: string) => ({
        id: id || `doc_${Date.now()}`,
        get: async () => ({ exists: false, data: () => ({}) }),
        set: async (data: any) => ({ ...data, id: id || `doc_${Date.now()}` }),
        update: async (data: any) => ({ ...data }),
        collection: (subName: string) => ({
          doc: (subId?: string) => ({
            id: subId || `sub_${Date.now()}`,
            set: async (data: any) => ({ ...data }),
          }),
          add: async (data: any) => ({ id: `msg_${Date.now()}`, ...data }),
          orderBy: () => ({
            limit: () => ({
              get: async () => ({ docs: [] }),
            }),
          }),
        }),
      }),
      add: async (data: any) => ({ id: `audit_${Date.now()}`, ...data }),
      where: () => ({
        findNearest: () => ({
          get: async () => ({ docs: [] }),
        }),
      }),
    }),
  };
}

export function adminAuth() {
  return {
    verifyIdToken: async (token: string) => ({ uid: "admin_user", email: "admin@sutrastudio.com" }),
  };
}
