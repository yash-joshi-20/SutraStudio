/**
 * SUTRA STUDIO — Brand Kit API
 * CRUD operations for client brand profiles.
 * All operations verify client ownership server-side.
 */

import { NextResponse } from "next/server";
import { BrandKitStore, type BrandKitCreateInput } from "@/lib/services/brandKitStore";

// GET /api/brand-kits — List brand kits for authenticated client
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientUid = req.headers.get("x-user-id");

    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const kitId = searchParams.get("id");
    if (kitId) {
      const kit = await BrandKitStore.getById(kitId, clientUid);
      if (!kit) {
        return NextResponse.json({ error: "Brand Kit not found." }, { status: 404 });
      }
      return NextResponse.json({ brandKit: kit });
    }

    const kits = await BrandKitStore.listByClient(clientUid);
    return NextResponse.json({ brandKits: kits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch brand kits." }, { status: 500 });
  }
}

// POST /api/brand-kits — Create a new brand kit
export async function POST(req: Request) {
  try {
    const clientUid = req.headers.get("x-user-id");
    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.brandName?.trim()) {
      return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
    }
    if (!body.industry?.trim()) {
      return NextResponse.json({ error: "Industry is required." }, { status: 400 });
    }

    const input: BrandKitCreateInput = {
      clientUid,
      brandName: body.brandName.trim(),
      companyName: body.companyName?.trim() || body.brandName.trim(),
      industry: body.industry.trim(),
      subIndustry: body.subIndustry?.trim(),
      language: body.language || "en",
      region: body.region?.trim(),
      tone: body.tone || "Professional & Corporate",
      tagline: body.tagline?.trim(),
      description: body.description?.trim(),
      logoUrl: body.logoUrl,
      logoFileId: body.logoFileId,
      brandImages: body.brandImages || [],
      colors: body.colors || [
        { name: "Primary", hex: "#000000", usage: "primary" },
        { name: "Background", hex: "#FFFFFF", usage: "background" },
      ],
      fonts: body.fonts || [],
      websiteUrl: body.websiteUrl?.trim(),
      socialLinks: body.socialLinks || [],
      referenceLinks: body.referenceLinks || [],
      contentKeywords: body.contentKeywords || [],
      avoidKeywords: body.avoidKeywords || [],
      targetAudience: body.targetAudience?.trim(),
      competitorBrands: body.competitorBrands || [],
      isDefault: body.isDefault ?? true,
      isActive: true,
    };

    const kit = await BrandKitStore.create(input);
    return NextResponse.json({ success: true, brandKit: kit }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create brand kit." }, { status: 500 });
  }
}

// PUT /api/brand-kits — Update a brand kit
export async function PUT(req: Request) {
  try {
    const clientUid = req.headers.get("x-user-id");
    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Brand Kit ID is required." }, { status: 400 });
    }

    const updated = await BrandKitStore.update(body.id, clientUid, body);
    if (!updated) {
      return NextResponse.json({ error: "Brand Kit not found or not owned by you." }, { status: 404 });
    }

    return NextResponse.json({ success: true, brandKit: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update brand kit." }, { status: 500 });
  }
}

// DELETE /api/brand-kits — Delete a brand kit
export async function DELETE(req: Request) {
  try {
    const clientUid = req.headers.get("x-user-id");
    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kitId = searchParams.get("id");
    if (!kitId) {
      return NextResponse.json({ error: "Brand Kit ID is required." }, { status: 400 });
    }

    const deleted = await BrandKitStore.delete(kitId, clientUid);
    if (!deleted) {
      return NextResponse.json({ error: "Brand Kit not found or not owned by you." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Brand Kit deleted." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete brand kit." }, { status: 500 });
  }
}
