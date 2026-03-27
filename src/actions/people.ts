"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { peopleSchema, PeopleInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getPeople() {
  const session = await auth();
  if (!session?.user) return { people: [] };

  const userId = parseInt(session.user.id);
  const isAdmin = session.user.role === "admin";

  const people = await prisma.people.findMany({
    where: isAdmin ? {} : { userId },
    orderBy: { created: "desc" },
    include: {
      user: { select: { userName: true } },
    },
  });

  return { people };
}

export async function getPeopleById(id: number) {
  const session = await auth();
  if (!session?.user) return null;

  const userId = parseInt(session.user.id);
  const isAdmin = session.user.role === "admin";

  const person = await prisma.people.findFirst({
    where: {
      id,
      ...(isAdmin ? {} : { userId }),
    },
  });

  return person;
}

export async function createPeople(data: PeopleInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = peopleSchema.parse(data);
    const userId = parseInt(session.user.id);

    const person = await prisma.people.create({
      data: {
        ...validated,
        email: validated.email || null,
        userId,
      },
    });

    revalidatePath("/dashboard/people");
    return { success: true, person };
  } catch (error) {
    console.error("Create people error:", error);
    return { error: "Failed to create person" };
  }
}

export async function updatePeople(id: number, data: PeopleInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = peopleSchema.parse(data);
    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    // Check if person exists and user has access
    const existing = await prisma.people.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!existing) {
      return { error: "Person not found" };
    }

    const person = await prisma.people.update({
      where: { id },
      data: {
        ...validated,
        email: validated.email || null,
      },
    });

    revalidatePath("/dashboard/people");
    return { success: true, person };
  } catch (error) {
    console.error("Update people error:", error);
    return { error: "Failed to update person" };
  }
}

export async function deletePeople(id: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    // Check if person exists and user has access
    const existing = await prisma.people.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!existing) {
      return { error: "Person not found" };
    }

    await prisma.people.delete({
      where: { id },
    });

    revalidatePath("/dashboard/people");
    return { success: true };
  } catch (error) {
    console.error("Delete people error:", error);
    return { error: "Failed to delete person" };
  }
}
