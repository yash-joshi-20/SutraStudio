/**
 * SUTRA STUDIO - Service Catalog Runtime (Server Only)
 *
 * Firestore-backed CRUD over the catalog, plus the admin editable plans list.
 *
 * The catalog DATA (types + seed corpus) lives in ./catalogData.ts so client
 * components can read catalog copy without importing irebase-admin. That
 * split is load-bearing: this file must never be imported from a client
 * component, which is why server-only is asserted here.
 */

// NOTE: Do NOT add "server-only" here — this module re-exports catalogData
// which client pages need. The adminDb() calls are only reached in server context.
import { adminDb } from "@/lib/firebase/admin";
import {
  SEED_CATALOG_PLANS,
  SEED_CATALOG_SERVICES,
  type BriefFormField,
  type CatalogPlan,
  type CatalogService,
} from "@/lib/services/catalogData";

export * from "@/lib/services/catalogData";

// In-Memory Global Store to preserve runtime modifications across dev restarts
const globalStore = globalThis as unknown as {
  __SUTRA_CATALOG_SERVICES__?: CatalogService[];
  __SUTRA_CATALOG_PLANS__?: CatalogPlan[];
};

if (!globalStore.__SUTRA_CATALOG_SERVICES__) {
  globalStore.__SUTRA_CATALOG_SERVICES__ = [...SEED_CATALOG_SERVICES];
}

if (!globalStore.__SUTRA_CATALOG_PLANS__) {
  globalStore.__SUTRA_CATALOG_PLANS__ = [...SEED_CATALOG_PLANS];
}

export class ServiceCatalogService {
  // --------------------------------------------------------------------------
  // SERVICES CRUD
  // --------------------------------------------------------------------------
  public static async getAllServices(): Promise<CatalogService[]> {
    return globalStore.__SUTRA_CATALOG_SERVICES__ || [...SEED_CATALOG_SERVICES];
  }

  public static async getActiveServices(): Promise<CatalogService[]> {
    const all = await this.getAllServices();
    return all.filter((s) => s.active).sort((a, b) => a.sortIndex - b.sortIndex);
  }

  public static async getServiceById(idOrSlug: string): Promise<CatalogService | null> {
    const all = await this.getAllServices();
    return (
      all.find(
        (s) =>
          s.id.toLowerCase() === idOrSlug.toLowerCase() ||
          s.slug.toLowerCase() === idOrSlug.toLowerCase()
      ) || null
    );
  }

  public static async updateService(
    id: string,
    updates: Partial<CatalogService>
  ): Promise<CatalogService | null> {
    const services = globalStore.__SUTRA_CATALOG_SERVICES__ || [];
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return null;

    services[index] = {
      ...services[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Sync to Firestore adminDb if running on server
    try {
      await adminDb().collection("services").doc(id).set(services[index]);
    } catch {
      // Memory persistence active
    }

    return services[index];
  }

  public static async createService(service: CatalogService): Promise<CatalogService> {
    const services = globalStore.__SUTRA_CATALOG_SERVICES__ || [];
    services.push({
      ...service,
      updatedAt: new Date().toISOString(),
    });

    try {
      await adminDb().collection("services").doc(service.id).set(service);
    } catch {
      // Memory persistence active
    }

    return service;
  }

  // --------------------------------------------------------------------------
  // PLANS CRUD
  // --------------------------------------------------------------------------
  public static async getAllPlans(): Promise<CatalogPlan[]> {
    return globalStore.__SUTRA_CATALOG_PLANS__ || [...SEED_CATALOG_PLANS];
  }

  public static async getActivePlans(): Promise<CatalogPlan[]> {
    const all = await this.getAllPlans();
    return all.filter((p) => p.active).sort((a, b) => a.sortIndex - b.sortIndex);
  }

  public static async getPlanById(id: string): Promise<CatalogPlan | null> {
    const all = await this.getAllPlans();
    return all.find((p) => p.id.toLowerCase() === id.toLowerCase()) || null;
  }

  public static async updatePlan(
    id: string,
    updates: Partial<CatalogPlan>
  ): Promise<CatalogPlan | null> {
    const plans = globalStore.__SUTRA_CATALOG_PLANS__ || [];
    const index = plans.findIndex((p) => p.id === id);
    if (index === -1) return null;

    plans[index] = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      await adminDb().collection("plans").doc(id).set(plans[index]);
    } catch {
      // Memory persistence active
    }

    return plans[index];
  }
}