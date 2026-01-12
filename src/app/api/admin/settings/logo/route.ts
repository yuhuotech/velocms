import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { fileManager } from "@/storage/file-manager";
import { settings, files } from "@/db/drizzle/schema";
import { db } from "@/db/client";
import { eq, desc } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileSize = file.size;
    const maxSize = 2 * 1024 * 1024;
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    const uploadedFile = await fileManager.upload(
      file,
      parseInt(session.user.id),
    );

    await db.initialize();
    const adapter = db.getAdapter();

    const [existingSettings] = await adapter.select().from(settings).limit(1);

    const logoUrl = fileManager.getUrl(uploadedFile.filename);

    await adapter.insert(files).values({
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      storageType: uploadedFile.storageType,
      storagePath: uploadedFile.storagePath,
      url: uploadedFile.url,
      uploadedBy: parseInt(session.user.id),
    });

    if (existingSettings) {
      await adapter
        .update(settings)
        .set({ logoUrl, updatedAt: new Date() })
        .where(eq(settings.id, existingSettings.id));
    } else {
      await adapter.insert(settings).values({ logoUrl });
    }

    return NextResponse.json({ success: true, logoUrl });
  } catch (error) {
    console.error("Logo upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.initialize();
    const adapter = db.getAdapter();

    const [existingSettings] = await adapter.select().from(settings).limit(1);

    if (!existingSettings || !existingSettings.logoUrl) {
      return NextResponse.json({ error: "No logo found" }, { status: 404 });
    }

    const logoUrl = existingSettings.logoUrl;
    const filename = logoUrl.split("/").pop();

    if (filename) {
      const [fileToDelete] = await adapter
        .select()
        .from(files)
        .where(eq(files.filename, filename))
        .limit(1);

      if (fileToDelete) {
        await adapter.delete(files).where(eq(files.id, fileToDelete.id));

        if (fileManager.getEnvironment() === "local") {
          await fileManager.delete(fileToDelete.storagePath);
        } else {
          await fileManager.delete(fileToDelete.storagePath);
        }
      }
    }

    await adapter
      .update(settings)
      .set({ logoUrl: null, updatedAt: new Date() })
      .where(eq(settings.id, existingSettings.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logo delete failed:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 },
    );
  }
}
