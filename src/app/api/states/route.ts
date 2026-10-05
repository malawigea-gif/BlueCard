import { getStates } from "@/lib/geo";

// GET /api/states?country=DE → ["Baden-Württemberg", "Bavaria", ...]
export async function GET(req: Request) {
  const code = (new URL(req.url).searchParams.get("country") ?? "").toUpperCase();
  return Response.json(getStates(code), { headers: { "Cache-Control": "public, max-age=86400" } });
}
