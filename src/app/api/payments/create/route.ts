import { NextResponse } from "next/server";
import { PaymentsService, PaymentIntentOptions } from "@/lib/services/payments";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PaymentIntentOptions;

    if (!body.amountINR || !body.orderId) {
      return NextResponse.json(
        { error: "amountINR and orderId are required fields." },
        { status: 400 }
      );
    }

    const paymentIntent = await PaymentsService.createPaymentIntent(body);
    return NextResponse.json(paymentIntent, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initialize payment intent." },
      { status: 500 }
    );
  }
}
