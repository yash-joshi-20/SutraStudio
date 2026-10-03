/**
 * SUTRA STUDIO — AI Pipeline API
 * Trigger generation, check status, manage outputs.
 */

import { NextResponse } from "next/server";
import { OutputStore, researchTrends, buildCreativePrompt, DEFAULT_PROMPT_TEMPLATES, PromptTemplateStore } from "@/lib/services/aiPipeline";
import { generateImage, generateVideo, generate3DModel, generate360Panorama } from "@/lib/services/outputProcessors";
import { runAutomatedChecks, QualityGateStore } from "@/lib/services/qualityGate";
import { BrandKitStore } from "@/lib/services/brandKitStore";
import { requestRole, requestUid } from "@/lib/auth/requestRole";

// POST /api/pipeline — Trigger a generation
export async function POST(req: Request) {
  try {
    const clientUid = await requestUid(req);
    const userRole = await requestRole(req);

    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "generate": {
        const { orderId, brandKitId, serviceId, brief, outputType } = body;

        if (!orderId || !serviceId) {
          return NextResponse.json({ error: "orderId and serviceId are required." }, { status: 400 });
        }

        // Get brand kit
        const brandKit = brandKitId
          ? await BrandKitStore.getById(brandKitId, clientUid)
          : await BrandKitStore.getDefault(clientUid);

        if (!brandKit) {
          return NextResponse.json({
            error: "No Brand Kit found. Please create a Brand Kit before ordering.",
          }, { status: 400 });
        }

        // Research trends
        const trends = await researchTrends(brandKit.industry, brandKit.region || "India", brandKit.contentKeywords);
        const topTrend = trends[0] || undefined;

        // Build prompt
        const templateStr = DEFAULT_PROMPT_TEMPLATES[serviceId] || DEFAULT_PROMPT_TEMPLATES["image-creation"];
        const prompt = buildCreativePrompt({
          template: templateStr,
          brandKit: {
            brandName: brandKit.brandName,
            companyName: brandKit.companyName,
            industry: brandKit.industry,
            tone: brandKit.tone,
            tagline: brandKit.tagline,
            colors: brandKit.colors.map((c) => ({ hex: c.hex, name: c.name })),
            language: brandKit.language,
          },
          brief: brief || {},
          trend: topTrend,
          serviceName: serviceId,
          outputFormat: outputType,
        });

        // Generate based on type
        let output;
        switch (outputType || "image") {
          case "video":
            output = await generateVideo({
              scriptPrompt: prompt,
              orderId,
              clientUid,
              brandKitId: brandKit.id,
              serviceId,
              duration: body.duration || 15,
              aspectRatio: body.aspectRatio || "16:9",
              includeVoiceover: body.includeVoiceover || false,
              voiceSettings: body.voiceSettings,
              brandOverlay: body.brandOverlay,
            });
            break;

          case "3d_model":
            output = await generate3DModel({
              prompt,
              orderId,
              clientUid,
              brandKitId: brandKit.id,
              serviceId,
              style: body.style,
              exportFormats: body.exportFormats || ["glb"],
            });
            break;

          case "panorama":
            output = await generate360Panorama({
              prompt,
              orderId,
              clientUid,
              brandKitId: brandKit.id,
              serviceId,
              spaceType: body.spaceType || "interior",
              hotspots: body.hotspots,
            });
            break;

          default:
            output = await generateImage({
              prompt,
              orderId,
              clientUid,
              brandKitId: brandKit.id,
              serviceId,
              formats: body.formats || [
                { ratio: "1:1", width: 1024, height: 1024 },
                { ratio: "9:16", width: 768, height: 1365 },
                { ratio: "16:9", width: 1365, height: 768 },
              ],
              brandOverlay: body.brandOverlay,
              style: body.style,
            });
        }

        // Run quality checks
        const qualityCheck = runAutomatedChecks(output);
        await QualityGateStore.saveCheck(qualityCheck);

        // Save output
        if (output.id) {
          await OutputStore.create(output as any);
        }

        return NextResponse.json({
          success: true,
          output,
          qualityCheck,
          trend: topTrend,
          promptUsed: prompt,
        });
      }

      case "research_trends": {
        const { industry, region, keywords } = body;
        const trends = await researchTrends(industry || "Creative Design", region, keywords);
        return NextResponse.json({ trends });
      }

      case "list_outputs": {
        const outputs = body.orderId
          ? await OutputStore.listByOrder(body.orderId)
          : await OutputStore.listByClient(clientUid, body.limit);
        return NextResponse.json({ outputs });
      }

      case "review_output": {
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }

        const { outputId, status, rejectionReason } = body;
        if (!outputId || !status) {
          return NextResponse.json({ error: "outputId and status required." }, { status: 400 });
        }

        await OutputStore.updateStatus(outputId, status, clientUid, rejectionReason);
        return NextResponse.json({ success: true });
      }

      case "list_templates": {
        const templates = body.serviceId
          ? await PromptTemplateStore.getForService(body.serviceId)
          : await PromptTemplateStore.listAll();
        return NextResponse.json({ templates });
      }

      case "save_template": {
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        const template = await PromptTemplateStore.upsert(body.template);
        return NextResponse.json({ success: true, template });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Pipeline error." }, { status: 500 });
  }
}
