import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

function getUploadsRoot() {
  const dataRoot = process.env.DATA_ROOT;
  if (dataRoot) {
    return path.join(dataRoot, "uploads");
  }
  return path.join(process.cwd(), "public/uploads");
}

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug: segments } = await context.params;
  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const fileName = segments.join("/");
  const baseDir = getUploadsRoot();
  const filePath = path.join(baseDir, fileName);

  try {
    const buffer = await fs.readFile(filePath);
    const body = new Uint8Array(buffer);
    const ext = path.extname(fileName).toLowerCase();
    const mime = MIME_MAP[ext] ?? "application/octet-stream";
    return new NextResponse(body, {
      headers: {
        "content-type": mime,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
}
