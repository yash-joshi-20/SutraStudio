import { NextResponse } from "next/server";
import { downloadDriveFileStream } from "@/lib/services/googleDriveService";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const userId = req.headers.get("x-user-id");

    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    const downloadRes = await downloadDriveFileStream(fileId);

    if (!downloadRes) {
      return NextResponse.json(
        { error: "Vault asset not found or access restricted" },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const isDownload = url.searchParams.get("download") === "true";

    const headers = new Headers();
    headers.set("Content-Type", downloadRes.metadata.mimeType || "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(
        downloadRes.metadata.name
      )}"`
    );
    headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

    if (downloadRes.stream) {
      return new Response(downloadRes.stream as any, {
        status: 200,
        headers,
      });
    }

    // Return buffer if in fallback/simulated mode
    const bytes = new Uint8Array(downloadRes.buffer || Buffer.from("Sutra Studio Deliverable"));
    return new Response(bytes, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("[API/drive/file] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve secure file" },
      { status: 500 }
    );
  }
}
