import { SUTRA_SERVICES } from "@/data/servicesData";

export async function getCatalogText(): Promise<string> {
  return SUTRA_SERVICES.map((s, index) => {
    return `${index + 1}. **${s.name}** (Starting from ${s.startingPrice})
   - Discipline: ${s.category} • Tagline: ${s.tagline}
   - Description: ${s.description}
   - Deliverables: ${s.deliverables.join(", ")}
   - Turnaround: ${s.turnaround} | Format: ${s.mediaFormat}`;
  }).join("\n\n");
}
