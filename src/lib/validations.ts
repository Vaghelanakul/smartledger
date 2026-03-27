import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// User Schema
export const userSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
  emailAddress: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobileNo: z.string().optional(),
  role: z.enum(["admin", "user"]),
});

export const userUpdateSchema = userSchema.partial().omit({ password: true });

// People Schema
export const peopleSchema = z.object({
  peopleCode: z.string().optional(),
  peopleName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  mobileNo: z.string().optional(),
  description: z.string().optional(),
});

// Category Schema
export const categorySchema = z.object({
  categoryName: z.string().min(2, "Category name must be at least 2 characters"),
  logoPath: z.string().optional(),
  isExpense: z.boolean(),
  isIncome: z.boolean(),
  isActive: z.boolean(),
  description: z.string().optional(),
  sequence: z.number().optional(),
});

// SubCategory Schema
export const subCategorySchema = z.object({
  categoryId: z.number().int().positive("Please select a category"),
  subCategoryName: z.string().min(2, "Subcategory name must be at least 2 characters"),
  logoPath: z.string().optional(),
  isExpense: z.boolean(),
  isIncome: z.boolean(),
  isActive: z.boolean(),
  description: z.string().optional(),
  sequence: z.number().optional(),
});

// Project Schema
export const projectSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters"),
  projectLogo: z.string().optional(),
  projectStartDate: z.date().optional().nullable(),
  projectEndDate: z.date().optional().nullable(),
  projectDetail: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
});

// Expense Schema
export const expenseSchema = z.object({
  expenseDate: z.date({ message: "Please select a date" }),
  categoryId: z.number().int().positive("Please select a category").optional().nullable(),
  subCategoryId: z.number().int().positive("Please select a subcategory").optional().nullable(),
  peopleId: z.number().int().positive("Please select a person").optional().nullable(),
  projectId: z.number().int().positive("Please select a project").optional().nullable(),
  amount: z.number().positive("Amount must be greater than 0"),
  expenseDetail: z.string().optional(),
  attachmentPath: z.string().optional(),
  description: z.string().optional(),
});

// Income Schema
export const incomeSchema = z.object({
  incomeDate: z.date({ message: "Please select a date" }),
  categoryId: z.number().int().positive("Please select a category").optional().nullable(),
  subCategoryId: z.number().int().positive("Please select a subcategory").optional().nullable(),
  peopleId: z.number().int().positive("Please select a person").optional().nullable(),
  projectId: z.number().int().positive("Please select a project").optional().nullable(),
  amount: z.number().positive("Amount must be greater than 0"),
  incomeDetail: z.string().optional(),
  attachmentPath: z.string().optional(),
  description: z.string().optional(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type PeopleInput = z.infer<typeof peopleSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type SubCategoryInput = z.infer<typeof subCategorySchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
