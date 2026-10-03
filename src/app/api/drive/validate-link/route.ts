import { NextResponse } from "next/server";
import { validateExternalDriveLink } from "@/lib/services/googleDriveService";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const result = validateExternalDriveLink(url);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        isValid: false,
        type: "unknown",
        isAccessible: false,
        message: error.message || "Invalid link evaluation request",
      },
      { status: 400 }
    );
  }
}
