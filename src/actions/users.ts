"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { userSchema, UserInput } from "@/lib/validations";
import bcrypt from "bcryptjs";

async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
  });

  if (!user || user.role !== "admin") {
    return { error: "Access denied. Admin privileges required." };
  }

  return { user };
}

export async function getUsers() {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return { error: adminCheck.error, users: [] };
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        userName: true,
        emailAddress: true,
        role: true,
        mobileNo: true,
        created: true,
        modified: true,
        _count: {
          select: {
            expenses: true,
            incomes: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });

    return { users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { error: "Failed to fetch users", users: [] };
  }
}

export async function getUserById(id: string) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return { error: adminCheck.error };
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        userName: true,
        emailAddress: true,
        role: true,
        mobileNo: true,
        created: true,
        modified: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    return { user };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return { error: "Failed to fetch user" };
  }
}

export async function createUser(data: UserInput) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return { error: adminCheck.error };
    }

    const validatedData = userSchema.parse(data);

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { userName: validatedData.userName },
          { emailAddress: validatedData.emailAddress },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.userName === validatedData.userName) {
        return { error: "Username already exists" };
      }
      return { error: "Email already exists" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        userName: validatedData.userName,
        emailAddress: validatedData.emailAddress,
        password: hashedPassword,
        role: validatedData.role || "user",
      },
    });

    revalidatePath("/dashboard/users");

    return {
      user: {
        id: user.id,
        userName: user.userName,
        emailAddress: user.emailAddress,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: "Failed to create user" };
  }
}

export async function updateUser(
  id: string,
  data: Partial<UserInput> & { password?: string }
) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return { error: adminCheck.error };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return { error: "User not found" };
    }

    // Check for duplicate username/email
    if (data.userName || data.emailAddress) {
      const duplicate = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            {
              OR: [
                ...(data.userName ? [{ userName: data.userName }] : []),
                ...(data.emailAddress ? [{ emailAddress: data.emailAddress }] : []),
              ],
            },
          ],
        },
      });

      if (duplicate) {
        if (duplicate.userName === data.userName) {
          return { error: "Username already exists" };
        }
        return { error: "Email already exists" };
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      ...(data.userName && { userName: data.userName }),
      ...(data.emailAddress && { emailAddress: data.emailAddress }),
      ...(data.role && { role: data.role }),
      ...(data.mobileNo && { mobileNo: data.mobileNo }),
    };

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    revalidatePath("/dashboard/users");

    return {
      user: {
        id: user.id,
        userName: user.userName,
        emailAddress: user.emailAddress,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { error: "Failed to update user" };
  }
}

export async function deleteUser(id: string) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error || !adminCheck.user) {
      return { error: adminCheck.error || "Unauthorized" };
    }

    // Don't allow deleting self
    if (adminCheck.user.id === parseInt(id)) {
      return { error: "Cannot delete your own account" };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return { error: "User not found" };
    }

    // Delete user (this will cascade delete their data based on schema)
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/dashboard/users");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user" };
  }
}
