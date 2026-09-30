import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    authenticated: true,
    user: {
      uid: "usr_mock_001",
      email: "yash@studioliving.com",
      role: "client",
      displayName: "Yash Joshi",
      driveFolderId: "drive_fld_sutra_001",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "Session established",
      uid: body.uid || "usr_mock_001",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
