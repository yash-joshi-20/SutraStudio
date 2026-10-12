import {
  SUTRA_SERVICES_CONFIG,
  CANONICAL_SERVICES,
  type ServiceDefinition,
  type CanonicalServiceItem,
  findServiceBySlug,
  findServiceById,
  computeItemTotal,
  formatCurrencyINR,
} from "@/config/services";

export type ServiceItem = ServiceDefinition;
export const SUTRA_SERVICES: ServiceItem[] = SUTRA_SERVICES_CONFIG;
export {
  CANONICAL_SERVICES,
  findServiceBySlug,
  findServiceById,
  computeItemTotal,
  formatCurrencyINR,
};
export type { CanonicalServiceItem };
