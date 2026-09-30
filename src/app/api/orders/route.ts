import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // In production, queries Firestore for current client's orders
  const orders = [
    {
      id: "ord_001",
      code: "#ORD-001",
      serviceName: "3D Interior Design",
      status: "in_progress",
      createdAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = `ord_${Date.now()}`;
    const orderCode = `#ORD-${Math.floor(100 + Math.random() * 900)}`;

    return NextResponse.json({
      success: true,
      orderId,
      orderCode,
      serviceName: body.serviceName || "Custom Studio Service",
      status: "pending",
      message: "Order placed and assigned to isolated workflow pipeline.",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 400 }
    );
  }
}
