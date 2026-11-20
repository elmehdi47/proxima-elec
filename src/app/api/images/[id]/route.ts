import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/images/[id] — serves an admin-uploaded image.
 *
 * The bytes live in the database (ImageAsset), so this works on serverless
 * hosts with read-only filesystems. Cached forever — the id changes whenever
 * a new upload happens.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!/^[a-z0-9]+$/i.test(id)) {
      return NextResponse.json({ error: "Invalid image id" }, { status: 400 });
    }

    const asset = await db.imageAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const bytes = new Uint8Array(asset.data);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": asset.mime,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/images/[id] error:", error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
