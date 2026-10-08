import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { AuditLogService } from "@/lib/services/auditLogService";

export interface ClientDemoRecord {
  id: string;
  projectName: string;
  clientName: string;
  subdomain: string;
  fullUrl: string;
  githubUrl: string;
  renderUrl?: string;
  category: "real_estate" | "ecommerce" | "hospitality" | "saas" | "portfolio" | "other";
  status: "live" | "in_development" | "pending_dns" | "archived";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Initial demo seeded so the user immediately has TrueVibe Property ready to inspect
const SEED_DEMOS: ClientDemoRecord[] = [
  {
    id: "demo_truevibe_prop",
    projectName: "TrueVibe Property & Luxury Estates",
    clientName: "TrueVibe Realty Group",
    subdomain: "truevibe",
    fullUrl: "https://truevibe.sutrastudios.in",
    githubUrl: "https://github.com/yash-joshi-20/truevibe-property",
    renderUrl: "https://truevibe-property.onrender.com",
    category: "real_estate",
    status: "live",
    notes: "Signature Vedic architectural property showcase demo deployed on Render Free Web Service with Cloudflare CNAME routing.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo_sutra_ecom",
    projectName: "Artisan Living & Luxury E-Commerce",
    clientName: "Bespoke Decor Client",
    subdomain: "shop",
    fullUrl: "https://shop.sutrastudios.in",
    githubUrl: "https://github.com/yash-joshi-20/artisan-ecommerce",
    renderUrl: "https://artisan-ecommerce.onrender.com",
    category: "ecommerce",
    status: "in_development",
    notes: "High-speed Next.js luxury catalog with Razorpay UPI payment gateway integration.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let IN_MEMORY_DEMOS: ClientDemoRecord[] = [...SEED_DEMOS];

export async function GET() {
  try {
    let demos: ClientDemoRecord[] = [];

    if (isFirebaseAdminReady()) {
      try {
        const snap = await adminDb().collection("admin_client_demos").get();
        if (!snap.empty) {
          demos = snap.docs.map((d) => d.data() as ClientDemoRecord);
        } else {
          // Seed initial records to Firestore
          const batch = adminDb().batch();
          for (const item of SEED_DEMOS) {
            batch.set(adminDb().collection("admin_client_demos").doc(item.id), item);
          }
          await batch.commit().catch(() => {});
          demos = [...SEED_DEMOS];
        }
      } catch (err) {
        console.warn("[Client Demos GET] Firestore fallback:", err);
        demos = [...IN_MEMORY_DEMOS];
      }
    } else {
      demos = [...IN_MEMORY_DEMOS];
    }

    demos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      count: demos.length,
      demos,
    });
  } catch (error: any) {
    console.error("[Client Demos GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch client demos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectName,
      clientName,
      subdomain,
      githubUrl,
      renderUrl,
      category = "real_estate",
      status = "live",
      notes,
    } = body;

    if (!projectName || !subdomain) {
      return NextResponse.json(
        { success: false, error: "Project name and subdomain prefix are required" },
        { status: 400 }
      );
    }

    const cleanSubdomain = String(subdomain)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "");

    const demoId = `demo_${cleanSubdomain}_${Date.now().toString().slice(-4)}`;
    const fullUrl = `https://${cleanSubdomain}.sutrastudios.in`;

    const newDemo: ClientDemoRecord = {
      id: demoId,
      projectName: String(projectName).trim(),
      clientName: String(clientName || "Bespoke Studio Client").trim(),
      subdomain: cleanSubdomain,
      fullUrl,
      githubUrl: String(githubUrl || "").trim(),
      renderUrl: String(renderUrl || "").trim(),
      category,
      status,
      notes: notes ? String(notes).trim() : "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update memory
    IN_MEMORY_DEMOS = [newDemo, ...IN_MEMORY_DEMOS.filter((d) => d.id !== newDemo.id)];

    // Persist to Firestore
    if (isFirebaseAdminReady()) {
      try {
        await adminDb().collection("admin_client_demos").doc(newDemo.id).set(newDemo);
      } catch (err) {
        console.warn("[Client Demos POST] Firestore write warning:", err);
      }
    }

    AuditLogService.record({
      who: {
        uid: "admin",
        email: "yashjoshi20@zohomail.in",
        name: "Studio Admin",
        role: "admin",
      },
      what: "SYSTEM_CONFIG_UPDATED",
      targetType: "system",
      targetId: newDemo.id,
      targetTitle: newDemo.projectName,
      type: "info",
      note: `Added client demo subdomain: ${newDemo.fullUrl}`,
    });

    return NextResponse.json({
      success: true,
      demo: newDemo,
      message: `Subdomain ${fullUrl} registered successfully`,
    });
  } catch (error: any) {
    console.error("[Client Demos POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create client demo" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing demo id parameter" },
        { status: 400 }
      );
    }

    IN_MEMORY_DEMOS = IN_MEMORY_DEMOS.filter((d) => d.id !== id);

    if (isFirebaseAdminReady()) {
      try {
        await adminDb().collection("admin_client_demos").doc(id).delete();
      } catch (err) {
        console.warn("[Client Demos DELETE] Firestore warning:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Client demo record removed successfully",
    });
  } catch (error: any) {
    console.error("[Client Demos DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete demo record" },
      { status: 500 }
    );
  }
}
