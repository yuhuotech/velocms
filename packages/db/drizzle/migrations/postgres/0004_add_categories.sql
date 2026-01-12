-- Add categories table
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now()
);

-- Add category_id to posts table (with idempotency check using DO block)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE "posts" ADD COLUMN "category_id" integer REFERENCES "categories"("id");
    END IF;
END $$;

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_unique" ON "categories" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_unique" ON "categories" ("name");
