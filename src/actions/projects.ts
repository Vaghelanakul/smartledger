"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { projectSchema, ProjectInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  const session = await auth();
  if (!session?.user) return { projects: [] };

  const userId = parseInt(session.user.id);
  const isAdmin = session.user.role === "admin";

  const projects = await prisma.project.findMany({
    where: isAdmin ? {} : { userId },
    orderBy: { created: "desc" },
  });

  return { projects };
}

export async function getProjectById(id: number) {
  const session = await auth();
  if (!session?.user) return null;

  const userId = parseInt(session.user.id);
  const isAdmin = session.user.role === "admin";

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...(isAdmin ? {} : { userId }),
    },
  });

  return project;
}

export async function createProject(data: ProjectInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = projectSchema.parse(data);
    const userId = parseInt(session.user.id);

    const project = await prisma.project.create({
      data: {
        ...validated,
        userId,
      },
    });

    revalidatePath("/dashboard/projects");
    return { success: true, project };
  } catch (error) {
    console.error("Create project error:", error);
    return { error: "Failed to create project" };
  }
}

export async function updateProject(id: number, data: ProjectInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = projectSchema.parse(data);
    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    const existing = await prisma.project.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!existing) {
      return { error: "Project not found" };
    }

    const project = await prisma.project.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/dashboard/projects");
    return { success: true, project };
  } catch (error) {
    console.error("Update project error:", error);
    return { error: "Failed to update project" };
  }
}

export async function deleteProject(id: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    const existing = await prisma.project.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { userId }),
      },
    });

    if (!existing) {
      return { error: "Project not found" };
    }

    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error) {
    console.error("Delete project error:", error);
    return { error: "Failed to delete project" };
  }
}
