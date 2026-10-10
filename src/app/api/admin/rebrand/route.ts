import { NextResponse } from "next/server";
import { MediaRebrandService } from "@/lib/services/mediaRebrandService";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (!isFirebaseAdminReady()) {
    return NextResponse.json({
      jobs: [],
      message: "Firestore not ready",
    });
  }

  try {
    const db = adminDb();
    if (jobId) {
      const doc = await db.collection("rebrand_jobs").doc(jobId).get();
      if (!doc.exists) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ job: doc.data() });
    }

    const snap = await db.collection("rebrand_jobs").orderBy("createdAt", "desc").limit(20).get();
    const jobs = snap.docs.map((d) => d.data());
    return NextResponse.json({ jobs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const mediaType = (formData.get("mediaType") as string) || "pdf";
    const oldText = (formData.get("oldText") as string) || "";
    const newText = (formData.get("newText") as string) || "Truebuy Property";
    const contactPhone = (formData.get("contactPhone") as string) || "";
    const contactEmail = (formData.get("contactEmail") as string) || "";
    const contactWebsite = (formData.get("contactWebsite") as string) || "";
    const positionZone = (formData.get("positionZone") as any) || "top-right";
    const logoFile = formData.get("newLogo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No asset file provided." }, { status: 400 });
    }

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    let logoBuffer: Buffer | null = null;
    let logoFilename: string | undefined = undefined;
    if (logoFile && logoFile.size > 0) {
      const logoArrayBuffer = await logoFile.arrayBuffer();
      logoBuffer = Buffer.from(logoArrayBuffer);
      logoFilename = logoFile.name;
    }

    const jobId = `reb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const result = await MediaRebrandService.executeRebrand({
      jobId,
      mediaType: mediaType as "pdf" | "image" | "video",
      originalFilename: file.name,
      fileBuffer,
      oldText,
      newText,
      newLogoBuffer: logoBuffer,
      newLogoFilename: logoFilename,
      contactPhone,
      contactEmail,
      contactWebsite,
      positionZone,
      adminUid: user.uid,
      adminName: user.name,
    });

    return NextResponse.json({
      success: result.status === "completed",
      job: result,
      downloadUrl: result.downloadUrl,
      driveLink: result.driveWebViewLink,
    });
  } catch (err: any) {
    console.error("[Rebrand API] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process rebranding task." },
      { status: 500 }
    );
  }
}
