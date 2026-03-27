"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { userSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function registerUser(data: {
  userName: string;
  emailAddress: string;
  password: string;
  mobileNo?: string;
  role?: string;
}) {
  try {
    const validated = userSchema.parse(data);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { emailAddress: validated.emailAddress },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        userName: validated.userName,
        emailAddress: validated.emailAddress,
        password: hashedPassword,
        mobileNo: validated.mobileNo || null,
        role: validated.role || "user",
      },
    });

    revalidatePath("/users");
    return { success: true, user: { id: user.id, email: user.emailAddress } };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to register user" };
  }
}
