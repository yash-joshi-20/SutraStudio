import { GET as handleGet, POST as handlePost } from "../webhook/route";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handleGet(req);
}

export async function POST(req: Request) {
  return handlePost(req);
}
