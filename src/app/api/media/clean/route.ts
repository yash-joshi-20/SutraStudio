import { NextRequest, NextResponse } from "next/server";
import { sanitizeFromUrl, isFfmpegAvailable } from "@/lib/sanitizer";

export const dynamic = "force-dynamic";

/**
 * SUTRA STUDIO — Media Sanitization & Watermark Stripper Endpoint
 * Phase 4 requirement: Automated image and video cleaning before vault delivery.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl, type = "image" } = body;

    if (!fileUrl || typeof fileUrl !== "string") {
      return NextResponse.json(
        { error: "Valid 'fileUrl' string is required." },
        { status: 400 }
      );
    }

    if (type !== "image" && type !== "video") {
      return NextResponse.json(
        { error: "Invalid 'type'. Must be 'image' or 'video'." },
        { status: 400 }
      );
    }

    const result = await sanitizeFromUrl(fileUrl, type);

    if (result.type === "image" && result.buffer) {
      const base64 = result.buffer.toString("base64");
      const dataUrl = `data:image/${result.metadata.format || "png"};base64,${base64}`;

      return NextResponse.json({
        success: true,
        message: "Image sanitized: watermark margin cropped and EXIF metadata purged.",
        type: "image",
        dataUrl,
        metadata: result.metadata,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Media sanitized successfully.",
      type: result.type,
      outputPath: result.outputPath,
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error("[Sutra Media Clean API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sanitize media asset." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const ffmpegReady = await isFfmpegAvailable();
  return NextResponse.json({
    status: "online",
    engine: "Sutra Studio Media Sanitizer Pipeline",
    features: {
      imageWatermarkCropping: "Sharp (active, 4% margin autoscale)",
      exifStripping: "Active (withMetadata: false)",
      videoWatermarkCropping: ffmpegReady
        ? "FFmpeg (105% zoom / delogo filter)"
        : "FFmpeg not detected on host path",
    },
  });
}
