import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/upload — admin image upload.
 *
 * Accepts a multipart form with one `file` field (JPG/PNG/WebP/GIF ≤ 4 MB),
 * auto-rotates, resizes to ≤ 1200px and recompresses to WebP (~30–100 KB),
 * then stores the bytes in the database — so it works on Vercel's read-only
 * filesystem. Returns `{ url: "/api/images/<id>" }` which is stored in the
 * Product.image field like any other image URL.
 */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB before compression

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Image is too large — pick a photo under 4 MB" },
        { status: 413 }
      );
    }
    if (!/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type)) {
      return NextResponse.json(
        { error: "Unsupported format — use a JPG, PNG, WebP or GIF image" },
        { status: 415 }
      );
    }

    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input)
      .rotate() // respects EXIF orientation
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const asset = await db.imageAsset.create({
      data: { data: output, mime: "image/webp" },
    });

    return NextResponse.json({ url: `/api/images/${asset.id}` }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/upload error:", error);
    return NextResponse.json({ error: "Failed to process the image" }, { status: 500 });
  }
}
