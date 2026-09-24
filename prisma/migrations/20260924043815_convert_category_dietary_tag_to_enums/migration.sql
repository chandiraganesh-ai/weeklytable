-- CreateEnum
CREATE TYPE "Category" AS ENUM ('classics', 'italian', 'bowls', 'mexican');

-- CreateEnum
CREATE TYPE "DietaryTag" AS ENUM ('vegetarian', 'gluten-free', 'high-protein');

-- AlterTable: cast existing text values directly onto the new enum types.
-- Every current `category` value (classics/italian/bowls/mexican) and
-- non-null `dietaryTag` value (vegetarian/gluten-free/high-protein) matches
-- an enum label verbatim, so this requires no data rewrite — NULLs in
-- `dietaryTag` cast straight through to NULL.
ALTER TABLE "Dish" ALTER COLUMN "category" TYPE "Category" USING ("category"::"Category");
ALTER TABLE "Dish" ALTER COLUMN "dietaryTag" TYPE "DietaryTag" USING ("dietaryTag"::"DietaryTag");
