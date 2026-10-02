import { NextResponse } from "next/server";
import { PaymentsService, UtrVerificationRequest } from "@/lib/services/payments";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UtrVerificationRequest;

    if (!body.utrNumber || !body.orderId) {
      return NextResponse.json(
        { error: "utrNumber and orderId are required for payment verification." },
        { status: 400 }
      );
    }

    const verification = PaymentsService.verifyUtr(body);

    if (!verification.success) {
      return NextResponse.json(verification, { status: 422 });
    }

    return NextResponse.json(verification, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal payment verification failed.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
