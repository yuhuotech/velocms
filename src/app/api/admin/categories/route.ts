import { NextResponse } from "next/server";
import { categoryRepository } from "@/db/repositories";
import { db } from "@/db/client";

export async function GET() {
  try {
    await db.initialize();
    const categories = await categoryRepository.findAll();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await db.initialize();
    const data = await req.json();

    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    const slugExists = await categoryRepository.checkSlugExists(data.slug);
    if (slugExists) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 },
      );
    }

    const category = await categoryRepository.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
