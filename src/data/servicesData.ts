import {
  SUTRA_SERVICES_CONFIG,
  type ServiceDefinition,
  findServiceBySlug,
} from "@/config/services";

export type ServiceItem = ServiceDefinition;
export const SUTRA_SERVICES: ServiceItem[] = SUTRA_SERVICES_CONFIG;
export { findServiceBySlug };
