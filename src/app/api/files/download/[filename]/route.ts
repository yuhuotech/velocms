import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { files } from "@/db/drizzle/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  await db.initialize();
  const { filename } = await params;

  try {
    const adapter = db.getAdapter();

    const fileList = await adapter
      .select()
      .from(files)
      .where(eq(files.filename, filename))
      .limit(1);

    const file = fileList[0];

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.storageType === "vercel_blob" && file.url) {
      return NextResponse.redirect(file.url);
    }

    const filepath = file.storagePath;
    const fileBuffer = await fs.readFile(filepath);

    const headers = new Headers();
    headers.set("Content-Type", file.mimeType);
    headers.set("Content-Length", fileBuffer.length.toString());

    const isImage = file.mimeType.startsWith("image/");
    const disposition = isImage ? "inline" : "attachment";
    headers.set(
      "Content-Disposition",
      `${disposition}; filename="${encodeURIComponent(file.originalName)}"`,
    );

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("Failed to download file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 },
    );
  }
}
