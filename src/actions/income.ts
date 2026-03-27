"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { incomeSchema, IncomeInput } from "@/lib/validations";

function serializeSequencedEntity<T extends Record<string, unknown> | null>(entity: T): T {
  if (!entity || !Object.prototype.hasOwnProperty.call(entity, "sequence")) {
    return entity;
  }

  const sequence = (entity as { sequence?: unknown }).sequence;
  return {
    ...entity,
    sequence: sequence == null ? null : Number(sequence),
  } as T;
}

export async function getIncomes(filters?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: number;
  projectId?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized", incomes: [] };
    }

    const whereClause: Record<string, unknown> = {
      userId: parseInt(session.user.id),
    };

    if (filters?.startDate && filters?.endDate) {
      whereClause.incomeDate = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    if (filters?.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters?.projectId) {
      whereClause.projectId = filters.projectId;
    }

    const incomes = await prisma.income.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true,
        project: true,
        people: true,
      },
      orderBy: {
        incomeDate: "desc",
      },
    });

    const serializedIncomes = incomes.map((income) => ({
      ...income,
      amount: Number(income.amount),
      category: serializeSequencedEntity(income.category),
      subCategory: serializeSequencedEntity(income.subCategory),
      project: serializeSequencedEntity(income.project),
      people: serializeSequencedEntity(income.people),
    }));

    return { incomes: serializedIncomes };
  } catch (error) {
    console.error("Failed to fetch incomes:", error);
    return { error: "Failed to fetch incomes", incomes: [] };
  }
}

export async function getIncomeById(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const income = await prisma.income.findFirst({
      where: {
        id,
        userId: parseInt(session.user.id),
      },
      include: {
        category: true,
        subCategory: true,
        project: true,
        people: true,
      },
    });

    if (!income) {
      return { error: "Income not found" };
    }

    return {
      income: {
        ...income,
        amount: Number(income.amount),
        category: serializeSequencedEntity(income.category),
        subCategory: serializeSequencedEntity(income.subCategory),
        project: serializeSequencedEntity(income.project),
        people: serializeSequencedEntity(income.people),
      },
    };
  } catch (error) {
    console.error("Failed to fetch income:", error);
    return { error: "Failed to fetch income" };
  }
}

export async function createIncome(data: IncomeInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = incomeSchema.parse(data);

    const income = await prisma.income.create({
      data: {
        userId: parseInt(session.user.id),
        incomeDate: validatedData.incomeDate,
        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId || null,
        projectId: validatedData.projectId || null,
        peopleId: validatedData.peopleId || null,
        amount: validatedData.amount,
        incomeDetail: validatedData.incomeDetail || null,
        description: validatedData.description || null,
        attachmentPath: validatedData.attachmentPath || null,
      },
    });

    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");

    return {
      income: {
        ...income,
        amount: Number(income.amount),
      },
    };
  } catch (error) {
    console.error("Failed to create income:", error);
    return { error: "Failed to create income" };
  }
}

export async function updateIncome(id: number, data: IncomeInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Check if income belongs to user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId: parseInt(session.user.id),
      },
    });

    if (!existingIncome) {
      return { error: "Income not found" };
    }

    const validatedData = incomeSchema.parse(data);

    const income = await prisma.income.update({
      where: { id },
      data: {
        incomeDate: validatedData.incomeDate,
        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId || null,
        projectId: validatedData.projectId || null,
        peopleId: validatedData.peopleId || null,
        amount: validatedData.amount,
        incomeDetail: validatedData.incomeDetail || null,
        description: validatedData.description || null,
        attachmentPath: validatedData.attachmentPath || null,
      },
    });

    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");

    return {
      income: {
        ...income,
        amount: Number(income.amount),
      },
    };
  } catch (error) {
    console.error("Failed to update income:", error);
    return { error: "Failed to update income" };
  }
}

export async function deleteIncome(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Check if income belongs to user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId: parseInt(session.user.id),
      },
    });

    if (!existingIncome) {
      return { error: "Income not found" };
    }

    await prisma.income.delete({
      where: { id },
    });

    revalidatePath("/dashboard/income");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete income:", error);
    return { error: "Failed to delete income" };
  }
}

export async function getIncomeStats(period: "week" | "month" | "year" = "month") {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const incomes = await prisma.income.findMany({
      where: {
        userId: parseInt(session.user.id),
        incomeDate: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        category: true,
      },
    });

    const totalAmount = incomes.reduce((sum: number, inc: { amount: unknown }) => sum + Number(inc.amount), 0);

    // Group by category
    const byCategory = incomes.reduce((acc: Record<string, number>, inc: { amount: unknown; category: { categoryName: string } | null }) => {
      const categoryName = inc.category?.categoryName || "Uncategorized";
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += Number(inc.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAmount,
      count: incomes.length,
      byCategory,
    };
  } catch (error) {
    console.error("Failed to fetch income stats:", error);
    return { error: "Failed to fetch income stats" };
  }
}
