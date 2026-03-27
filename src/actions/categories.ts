"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { categorySchema, subCategorySchema, CategoryInput, SubCategoryInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

function serializeCategory<T extends { sequence: unknown }>(category: T) {
  return {
    ...category,
    sequence: category.sequence == null ? null : Number(category.sequence),
  };
}

function serializeSubCategory<T extends { sequence: unknown }>(subCategory: T) {
  return {
    ...subCategory,
    sequence: subCategory.sequence == null ? null : Number(subCategory.sequence),
  };
}

// Categories
export async function getCategories() {
  const session = await auth();
  if (!session?.user) return { categories: [] };

  const userId = parseInt(session.user.id);
  const isAdmin = session.user.role === "admin";

  const categories = await prisma.category.findMany({
    where: isAdmin ? {} : { userId },
    orderBy: [{ sequence: "asc" }, { categoryName: "asc" }],
    include: {
      _count: { select: { subCategories: true } },
    },
  });

  return { categories: categories.map((category) => serializeCategory(category)) };
}

export async function getCategoryById(id: number) {
  const session = await auth();
  if (!session?.user) return null;

  const userId = parseInt(session.user.id);
  const isAdmin = session.user.role === "admin";

  const category = await prisma.category.findFirst({
    where: {
      id,
      ...(isAdmin ? {} : { userId }),
    },
    include: {
      subCategories: true,
    },
  });

  if (!category) {
    return null;
  }

  return {
    ...serializeCategory(category),
    subCategories: category.subCategories.map((subCategory) =>
      serializeSubCategory(subCategory)
    ),
  };
}

export async function createCategory(data: CategoryInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = categorySchema.parse(data);
    const userId = parseInt(session.user.id);

    const category = await prisma.category.create({
      data: {
        ...validated,
        userId,
      },
    });

    revalidatePath("/dashboard/categories");
    return { success: true, category: serializeCategory(category) };
  } catch (error) {
    console.error("Create category error:", error);
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(id: number, data: CategoryInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = categorySchema.parse(data);
    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    const existing = await prisma.category.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!existing) {
      return { error: "Category not found" };
    }

    const category = await prisma.category.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/dashboard/categories");
    return { success: true, category: serializeCategory(category) };
  } catch (error) {
    console.error("Update category error:", error);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(id: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    const existing = await prisma.category.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!existing) {
      return { error: "Category not found" };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { error: "Failed to delete category" };
  }
}

// SubCategories
export async function getSubCategories(categoryId?: number) {
  const session = await auth();
  if (!session?.user) return { subCategories: [] };

  const userId = parseInt(session.user.id);
  const isAdmin = session.user.role === "admin";

  const subCategories = await prisma.subCategory.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(isAdmin ? {} : { userId }),
    },
    orderBy: [{ sequence: "asc" }, { subCategoryName: "asc" }],
    include: {
      category: { select: { categoryName: true } },
    },
  });

  return { subCategories: subCategories.map((subCategory) => serializeSubCategory(subCategory)) };
}

export async function createSubCategory(data: SubCategoryInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = subCategorySchema.parse(data);
    const userId = parseInt(session.user.id);

    const subCategory = await prisma.subCategory.create({
      data: {
        ...validated,
        userId,
      },
    });

    revalidatePath("/dashboard/categories");
    return { success: true, subCategory: serializeSubCategory(subCategory) };
  } catch (error) {
    console.error("Create subcategory error:", error);
    return { error: "Failed to create subcategory" };
  }
}

export async function updateSubCategory(id: number, data: SubCategoryInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = subCategorySchema.parse(data);
    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    const existing = await prisma.subCategory.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!existing) {
      return { error: "Subcategory not found" };
    }

    const subCategory = await prisma.subCategory.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/dashboard/categories");
    return { success: true, subCategory: serializeSubCategory(subCategory) };
  } catch (error) {
    console.error("Update subcategory error:", error);
    return { error: "Failed to update subcategory" };
  }
}

export async function deleteSubCategory(id: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    const existing = await prisma.subCategory.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!existing) {
      return { error: "Subcategory not found" };
    }

    await prisma.subCategory.delete({
      where: { id },
    });

    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return { error: "Failed to delete subcategory" };
  }
}
