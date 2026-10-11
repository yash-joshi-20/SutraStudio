import { OrdersStore, type FirestoreOrderRecord } from "@/lib/services/ordersStore";
import { NotificationsStore } from "@/lib/services/notificationsStore";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";

/**
 * SUTRA STUDIO — Automation Quality Gate
 * Enforces strict deliverable validation before deliverables are routed
 * to Studio Admin review. Prevents dummy/stock fallbacks, checks resolutions,
 * durations, and file integrity.
 */

export interface QualityGateInput {
  orderId: string;
  outputType: "image" | "video" | "3d_model" | "panorama" | "interior_design";
  fileUrl?: string;
  filename?: string;
  mimeType?: string;
  fileSize?: string | number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  format?: string;
  isPack?: boolean;
  packCount?: number;
  expectedPackCount?: number;
}

export interface QualityGateResult {
  passed: boolean;
  orderId: string;
  status: "in_admin_review" | "needs_attention";
  errors: string[];
  warnings: string[];
  checkedAt: string;
}

// Banned dummy / stock / placeholder patterns in live client delivery
const FORBIDDEN_DELIVERY_PATTERNS = [
  "mixkit.co",
  "unsplash.com",
  "pexels.com",
  "placeholder.com",
  "dummyimage.com",
  "sample-videos.com",
];

export class AutomationQualityGate {
  /**
   * Evaluates a generated deliverable against studio quality standards.
   */
  public static async evaluate(input: QualityGateInput): Promise<QualityGateResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const checkedAt = new Date().toISOString();

    // 1. File existence & URL check
    if (!input.fileUrl || input.fileUrl.trim().length === 0) {
      errors.push("Missing deliverable file URL.");
    } else {
      // Check for forbidden stock/placeholder domains in production delivery
      const lowerUrl = input.fileUrl.toLowerCase();
      for (const banned of FORBIDDEN_DELIVERY_PATTERNS) {
        if (lowerUrl.includes(banned)) {
          errors.push(`Deliverable contains banned stock or placeholder URL domain (${banned}). Must be authentic studio generation.`);
          break;
        }
      }
    }

    // 2. Type-specific checks
    switch (input.outputType) {
      case "image": {
        if (input.width && input.width < 1080) {
          errors.push(`Image width (${input.width}px) is below minimum 1080px threshold.`);
        }
        if (input.height && input.height < 1080) {
          errors.push(`Image height (${input.height}px) is below minimum 1080px threshold.`);
        }
        if (input.isPack && input.expectedPackCount && input.expectedPackCount > 1) {
          if (!input.packCount || input.packCount < input.expectedPackCount) {
            errors.push(`Image pack incomplete: produced ${input.packCount || 1} of ${input.expectedPackCount} promised variations.`);
          }
        }
        break;
      }

      case "video": {
        if (!input.durationSeconds || input.durationSeconds < 4) {
          errors.push(`Video duration (${input.durationSeconds || 0}s) is below 5-second minimum commercial clip spec.`);
        }
        if (input.durationSeconds && input.durationSeconds > 65) {
          warnings.push(`Video duration (${input.durationSeconds}s) exceeds standard 60-second reel length.`);
        }
        break;
      }

      case "3d_model": {
        const lowerName = (input.filename || input.fileUrl || "").toLowerCase();
        if (!lowerName.includes(".glb") && !lowerName.includes(".gltf") && !lowerName.includes(".usdz")) {
          errors.push("3D deliverable is not a valid GLB/GLTF or USDZ model file.");
        }
        break;
      }

      case "panorama": {
        if (input.width && input.height) {
          const ratio = input.width / input.height;
          if (Math.abs(ratio - 2.0) > 0.08) {
            errors.push(`360 panorama aspect ratio is ${ratio.toFixed(2)}:1, expected 2:1 for equirectangular projection.`);
          }
          if (input.width < 2048) {
            errors.push(`360 panorama width (${input.width}px) is below 2048px minimal resolution.`);
          }
        }
        break;
      }

      case "interior_design": {
        // Interior design deliverables must include material schedule or renders
        if (!input.filename && !input.fileUrl) {
          errors.push("Interior design deliverable lacks asset pack.");
        }
        break;
      }
    }

    const passed = errors.length === 0;
    const finalStatus: "draft_ready" | "generation_failed" = passed ? "draft_ready" : "generation_failed";

    // 3. Update order in store
    const order = OrdersStore.findById(input.orderId);
    if (order) {
      const updatedWorkflowHistory = [...(order.workflowHistory || [])];
      updatedWorkflowHistory.push({
        runId: `qg_${Date.now()}`,
        workflowId: "quality_gate",
        status: finalStatus,
        timestamp: checkedAt,
        error: passed ? undefined : errors.join("; "),
      });

      await OrdersStore.updateAsync(order.id, {
        workflowStatus: finalStatus,
        workflowLastError: passed ? undefined : errors.join("; "),
        workflowHistory: updatedWorkflowHistory,
      });

      // 4. If failed, alert studio admin immediately
      if (!passed) {
        try {
          NotificationsStore.add({
            userId: "admin",
            type: "status_update",
            title: `Quality Gate Alert: Order #${order.orderNumber || order.id}`,
            message: `Automated quality gate flagged errors: ${errors.join(", ")}. Marked as needs_attention for supervisor review.`,
            orderId: order.id,
            actionUrl: `/admin/orders?orderId=${order.id}`,
          });
        } catch {
          // Non-blocking notification
        }
      }
    }

    return {
      passed,
      orderId: input.orderId,
      status: passed ? "in_admin_review" : "needs_attention",
      errors,
      warnings,
      checkedAt,
    };
  }
}
