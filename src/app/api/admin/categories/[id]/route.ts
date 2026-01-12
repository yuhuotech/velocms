import { NextResponse } from "next/server";
import { categoryRepository } from "@/db/repositories";
import { db } from "@/db/client";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await db.initialize();
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const data = await req.json();

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 },
      );
    }

    if (data.slug) {
      const slugExists = await categoryRepository.checkSlugExists(
        data.slug,
        id,
      );
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 },
        );
      }
    }

    const category = await categoryRepository.update(id, {
      name: data.name,
      slug: data.slug,
      description: data.description,
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await db.initialize();
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 },
      );
    }

    await categoryRepository.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
