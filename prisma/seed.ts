import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import path from "path";

// Load environment variables from project root
config({ path: path.resolve(process.cwd(), '.env') });

console.log("DATABASE_URL loaded:", process.env.DATABASE_URL ? "Yes" : "No");

// Configure Neon for Node.js
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
    throw new Error("DATABASE_URL not found in environment variables");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Ensure admin user exists
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { emailAddress: "admin@smartledger.com" },
        update: {
            password: hashedPassword,
            role: "admin",
        },
        create: {
            userName: "Admin",
            emailAddress: "admin@smartledger.com",
            password: hashedPassword,
            role: "admin",
        },
    });

    console.log("✅ Admin user is ready:");
    console.log("   Email: admin@smartledger.com");
    console.log("   Password: admin123");

    const defaultCategories = [
        { categoryName: "Food & Dining", description: "Meals, groceries, restaurants", userId: admin.id, sequence: 1, isExpense: true, isIncome: false },
        { categoryName: "Transportation", description: "Fuel, public transport, taxi", userId: admin.id, sequence: 2, isExpense: true, isIncome: false },
        { categoryName: "Utilities", description: "Electricity, water, internet", userId: admin.id, sequence: 3, isExpense: true, isIncome: false },
        { categoryName: "Entertainment", description: "Movies, games, subscriptions", userId: admin.id, sequence: 4, isExpense: true, isIncome: false },
        { categoryName: "Shopping", description: "Clothes, electronics, household", userId: admin.id, sequence: 5, isExpense: true, isIncome: false },
        { categoryName: "Salary", description: "Monthly salary income", userId: admin.id, sequence: 6, isExpense: false, isIncome: true },
        { categoryName: "Freelance", description: "Freelance and contract work", userId: admin.id, sequence: 7, isExpense: false, isIncome: true },
    ];

    const existingCategories = await prisma.category.findMany({
        where: { userId: admin.id },
        select: { categoryName: true },
    });
    const existingCategoryNames = new Set(existingCategories.map((c) => c.categoryName));
    const missingCategories = defaultCategories.filter(
        (c) => !existingCategoryNames.has(c.categoryName)
    );

    if (missingCategories.length > 0) {
        const created = await prisma.category.createMany({ data: missingCategories });
        console.log(`✅ Created ${created.count} missing default categories`);
    } else {
        console.log("ℹ️ Default categories already exist");
    }

    const existingProject = await prisma.project.findFirst({
        where: {
            userId: admin.id,
            projectName: "Personal",
        },
    });

    if (!existingProject) {
        await prisma.project.create({
            data: {
                projectName: "Personal",
                description: "Personal expenses and income",
                userId: admin.id,
            },
        });
        console.log("✅ Created default project");
    } else {
        console.log("ℹ️ Default project already exists");
    }

    // ========================================
    // ABC USER - Test User with Sample Data
    // ========================================
    console.log("\n📝 Creating ABC User with test data...");
    
    const abcHashedPassword = await bcrypt.hash("abc123", 10);
    const abcUser = await prisma.user.upsert({
        where: { emailAddress: "abc@smartledger.com" },
        update: {
            password: abcHashedPassword,
            role: "user",
        },
        create: {
            userName: "ABC User",
            emailAddress: "abc@smartledger.com",
            mobileNo: "9876543210",
            password: abcHashedPassword,
            role: "user",
        },
    });

    console.log("✅ ABC User created:");
    console.log("   Email: abc@smartledger.com");
    console.log("   Password: abc123");

    // Create categories for ABC user
    const abcCategories = await prisma.category.createMany({
        data: [
            { categoryName: "Food & Dining", description: "Meals, groceries, restaurants", userId: abcUser.id, sequence: 1, isExpense: true, isIncome: false },
            { categoryName: "Transportation", description: "Fuel, public transport, taxi", userId: abcUser.id, sequence: 2, isExpense: true, isIncome: false },
            { categoryName: "Utilities", description: "Electricity, water, internet", userId: abcUser.id, sequence: 3, isExpense: true, isIncome: false },
            { categoryName: "Entertainment", description: "Movies, games, subscriptions", userId: abcUser.id, sequence: 4, isExpense: true, isIncome: false },
            { categoryName: "Shopping", description: "Clothes, electronics, household", userId: abcUser.id, sequence: 5, isExpense: true, isIncome: false },
            { categoryName: "Health & Fitness", description: "Medical, gym, wellness", userId: abcUser.id, sequence: 6, isExpense: true, isIncome: false },
            { categoryName: "Education", description: "Courses, books, training", userId: abcUser.id, sequence: 7, isExpense: true, isIncome: false },
            { categoryName: "Salary", description: "Monthly salary income", userId: abcUser.id, sequence: 8, isExpense: false, isIncome: true },
            { categoryName: "Freelance", description: "Freelance and contract work", userId: abcUser.id, sequence: 9, isExpense: false, isIncome: true },
            { categoryName: "Bonus", description: "Performance bonus and incentives", userId: abcUser.id, sequence: 10, isExpense: false, isIncome: true },
        ],
        skipDuplicates: true,
    });
    console.log(`✅ Created ${abcCategories.count} expense/income categories for ABC user`);

    // Get categories for subcategories creation
    const abcCatsMap = await prisma.category.findMany({
        where: { userId: abcUser.id },
    });
    const catMap = new Map(abcCatsMap.map(c => [c.categoryName, c.id]));

    // Create subcategories
    const subcategories = await prisma.subCategory.createMany({
        data: [
            // Food subcategories
            { categoryId: catMap.get("Food & Dining")!, subCategoryName: "Groceries", userId: abcUser.id, isExpense: true, isIncome: false },
            { categoryId: catMap.get("Food & Dining")!, subCategoryName: "Restaurants", userId: abcUser.id, isExpense: true, isIncome: false },
            { categoryId: catMap.get("Food & Dining")!, subCategoryName: "Coffee & Snacks", userId: abcUser.id, isExpense: true, isIncome: false },
            // Transportation subcategories
            { categoryId: catMap.get("Transportation")!, subCategoryName: "Fuel", userId: abcUser.id, isExpense: true, isIncome: false },
            { categoryId: catMap.get("Transportation")!, subCategoryName: "Public Transport", userId: abcUser.id, isExpense: true, isIncome: false },
            { categoryId: catMap.get("Transportation")!, subCategoryName: "Taxi & Uber", userId: abcUser.id, isExpense: true, isIncome: false },
            // Shopping subcategories
            { categoryId: catMap.get("Shopping")!, subCategoryName: "Clothing", userId: abcUser.id, isExpense: true, isIncome: false },
            { categoryId: catMap.get("Shopping")!, subCategoryName: "Electronics", userId: abcUser.id, isExpense: true, isIncome: false },
            { categoryId: catMap.get("Shopping")!, subCategoryName: "Home & Kitchen", userId: abcUser.id, isExpense: true, isIncome: false },
            // Health subcategories
            { categoryId: catMap.get("Health & Fitness")!, subCategoryName: "Medical", userId: abcUser.id, isExpense: true, isIncome: false },
            { categoryId: catMap.get("Health & Fitness")!, subCategoryName: "Gym Membership", userId: abcUser.id, isExpense: true, isIncome: false },
        ],
        skipDuplicates: true,
    });
    console.log(`✅ Created ${subcategories.count} subcategories for ABC user`);

    // Create projects for ABC user
    const projects = await prisma.project.createMany({
        data: [
            {
                projectName: "Web Development",
                description: "Personal web development project",
                projectStartDate: new Date("2024-01-15"),
                userId: abcUser.id,
                isActive: true,
            },
            {
                projectName: "Mobile App",
                description: "Mobile application development",
                projectStartDate: new Date("2024-03-01"),
                userId: abcUser.id,
                isActive: true,
            },
            {
                projectName: "Freelance Client A",
                description: "Freelance project for client A",
                projectStartDate: new Date("2024-02-01"),
                projectEndDate: new Date("2024-08-31"),
                userId: abcUser.id,
                isActive: false,
            },
            {
                projectName: "Freelance Client B",
                description: "Ongoing freelance with client B",
                projectStartDate: new Date("2024-04-15"),
                userId: abcUser.id,
                isActive: true,
            },
            {
                projectName: "Personal",
                description: "Personal expenses and income",
                userId: abcUser.id,
                isActive: true,
            },
        ],
        skipDuplicates: true,
    });
    console.log(`✅ Created ${projects.count} projects for ABC user`);

    // Create people/employees
    const peoples = await prisma.people.createMany({
        data: [
            {
                peopleName: "John Doe",
                email: "john@example.com",
                mobileNo: "9876543210",
                description: "Senior Developer",
                userId: abcUser.id,
            },
            {
                peopleName: "Jane Smith",
                email: "jane@example.com",
                mobileNo: "9876543211",
                description: "UI/UX Designer",
                userId: abcUser.id,
            },
            {
                peopleName: "Mike Johnson",
                email: "mike@example.com",
                mobileNo: "9876543212",
                description: "Project Manager",
                userId: abcUser.id,
            },
            {
                peopleName: "Sarah Williams",
                email: "sarah@example.com",
                mobileNo: "9876543213",
                description: "QA Engineer",
                userId: abcUser.id,
            },
        ],
        skipDuplicates: true,
    });
    console.log(`✅ Created ${peoples.count} people/employees for ABC user`);

    // Get all projects and people
    const abcProjects = await prisma.project.findMany({ where: { userId: abcUser.id } });
    const abcPeoples = await prisma.people.findMany({ where: { userId: abcUser.id } });
    const subcatsData = await prisma.subCategory.findMany({ where: { userId: abcUser.id } });

    // Create sample expenses (20 expenses)
    const expenses = [
        // Food expenses
        { amount: 450, categoryId: catMap.get("Food & Dining"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Groceries")?.id, description: "Weekly groceries", date: new Date("2025-12-01") },
        { amount: 250, categoryId: catMap.get("Food & Dining"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Restaurants")?.id, description: "Lunch with colleagues", date: new Date("2025-12-02") },
        { amount: 120, categoryId: catMap.get("Food & Dining"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Coffee & Snacks")?.id, description: "Daily coffee and snacks", date: new Date("2025-12-03") },
        { amount: 550, categoryId: catMap.get("Food & Dining"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Groceries")?.id, description: "Monthly groceries", date: new Date("2025-12-06") },
        
        // Transportation expenses
        { amount: 800, categoryId: catMap.get("Transportation"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Fuel")?.id, description: "Fuel refill", date: new Date("2025-12-04"), projectId: abcProjects.find(p => p.projectName === "Web Development")?.id },
        { amount: 200, categoryId: catMap.get("Transportation"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Taxi & Uber")?.id, description: "Uber rides", date: new Date("2025-12-05"), peopleId: abcPeoples[0]?.id },
        { amount: 400, categoryId: catMap.get("Transportation"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Public Transport")?.id, description: "Monthly travel pass", date: new Date("2025-12-07") },
        
        // Shopping expenses
        { amount: 2500, categoryId: catMap.get("Shopping"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Electronics")?.id, description: "New monitor", date: new Date("2025-12-08"), projectId: abcProjects.find(p => p.projectName === "Web Development")?.id },
        { amount: 1200, categoryId: catMap.get("Shopping"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Clothing")?.id, description: "Winter clothes", date: new Date("2025-12-09") },
        { amount: 800, categoryId: catMap.get("Shopping"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Home & Kitchen")?.id, description: "Kitchen utensils", date: new Date("2025-12-10"), peopleId: abcPeoples[1]?.id },
        
        // Health expenses
        { amount: 150, categoryId: catMap.get("Health & Fitness"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Medical")?.id, description: "Doctor checkup", date: new Date("2025-12-11") },
        { amount: 500, categoryId: catMap.get("Health & Fitness"), subCategoryId: subcatsData.find(s => s.subCategoryName === "Gym Membership")?.id, description: "Monthly gym", date: new Date("2025-12-12"), projectId: abcProjects.find(p => p.projectName === "Personal")?.id },
        
        // Utilities
        { amount: 1200, categoryId: catMap.get("Utilities"), description: "Electricity bill", date: new Date("2025-12-13") },
        { amount: 800, categoryId: catMap.get("Utilities"), description: "Internet and mobile", date: new Date("2026-01-14") },
        
        // Entertainment
        { amount: 500, categoryId: catMap.get("Entertainment"), description: "Netflix and streaming", date: new Date("2026-01-15") },
        { amount: 1500, categoryId: catMap.get("Entertainment"), description: "Movie night with friends", date: new Date("2026-02-16"), projectId: abcProjects.find(p => p.projectName === "Personal")?.id },
        
        // Education
        { amount: 3000, categoryId: catMap.get("Education"), description: "Online course enrollment", date: new Date("2026-02-17"), projectId: abcProjects.find(p => p.projectName === "Mobile App")?.id },
        { amount: 600, categoryId: catMap.get("Education"), description: "Technical books", date: new Date("2026-02-18") },
        
        // Additional expenses
        { amount: 2000, categoryId: catMap.get("Shopping"), description: "Office supplies", date: new Date("2026-02-19"), peopleId: abcPeoples[2]?.id, projectId: abcProjects.find(p => p.projectName === "Freelance Client B")?.id },
        { amount: 1000, categoryId: catMap.get("Entertainment"), description: "Gaming and hobbies", date: new Date("2026-03-20"), projectId: abcProjects.find(p => p.projectName === "Personal")?.id },
    ];

    const createdExpenses = await prisma.expense.createMany({
        data: expenses.map(exp => ({
            amount: new Prisma.Decimal(exp.amount),
            categoryId: exp.categoryId,
            subCategoryId: exp.subCategoryId,
            description: exp.description,
            expenseDetail: exp.description,
            projectId: exp.projectId,
            peopleId: exp.peopleId,
            userId: abcUser.id,
            expenseDate: exp.date,
        })),
        skipDuplicates: true,
    });
    console.log(`✅ Created ${createdExpenses.count} expenses for ABC user`);

    // Create sample incomes (15 incomes)
    const incomes = [
        { amount: 50000, categoryId: catMap.get("Salary"), description: "Monthly salary", date: new Date("2025-12-01"), projectId: abcProjects.find(p => p.projectName === "Personal")?.id },
        { amount: 5000, categoryId: catMap.get("Freelance"), description: "Freelance project - Client A", date: new Date("2025-12-02"), projectId: abcProjects.find(p => p.projectName === "Freelance Client A")?.id, peopleId: abcPeoples[0]?.id },
        { amount: 8000, categoryId: catMap.get("Freelance"), description: "Web development freelance", date: new Date("2025-12-05"), projectId: abcProjects.find(p => p.projectName === "Web Development")?.id },
        { amount: 3000, categoryId: catMap.get("Freelance"), description: "Consulting hours", date: new Date("2025-12-08"), peopleId: abcPeoples[2]?.id },
        { amount: 6000, categoryId: catMap.get("Freelance"), description: "Design consultation - Client B", date: new Date("2025-12-10"), projectId: abcProjects.find(p => p.projectName === "Freelance Client B")?.id },
        { amount: 12000, categoryId: catMap.get("Bonus"), description: "Performance bonus Q3", date: new Date("2025-12-15"), projectId: abcProjects.find(p => p.projectName === "Personal")?.id },
        { amount: 4500, categoryId: catMap.get("Freelance"), description: "Tutorial content creation", date: new Date("2026-01-17") },
        { amount: 7000, categoryId: catMap.get("Freelance"), description: "Mobile app development contract", date: new Date("2026-01-18"), projectId: abcProjects.find(p => p.projectName === "Mobile App")?.id, peopleId: abcPeoples[1]?.id },
        { amount: 2500, categoryId: catMap.get("Freelance"), description: "Code review services", date: new Date("2026-01-20") },
        { amount: 5500, categoryId: catMap.get("Freelance"), description: "Workshop conduction", date: new Date("2026-02-22"), peopleId: abcPeoples[3]?.id },
        { amount: 50000, categoryId: catMap.get("Salary"), description: "Monthly salary", date: new Date("2026-01-01"), projectId: abcProjects.find(p => p.projectName === "Personal")?.id },
        { amount: 3000, categoryId: catMap.get("Bonus"), description: "Referral bonus", date: new Date("2026-02-05"), projectId: abcProjects.find(p => p.projectName === "Freelance Client B")?.id },
        { amount: 9000, categoryId: catMap.get("Freelance"), description: "Long-term project payment", date: new Date("2026-02-10"), projectId: abcProjects.find(p => p.projectName === "Freelance Client A")?.id },
        { amount: 4000, categoryId: catMap.get("Freelance"), description: "Tech writing freelance", date: new Date("2026-02-12") },
        { amount: 6500, categoryId: catMap.get("Freelance"), description: "Maintenance contract fee", date: new Date("2026-03-15"), projectId: abcProjects.find(p => p.projectName === "Web Development")?.id, peopleId: abcPeoples[1]?.id },
    ];

    const createdIncomes = await prisma.income.createMany({
        data: incomes.map(inc => ({
            amount: new Prisma.Decimal(inc.amount),
            categoryId: inc.categoryId,
            description: inc.description,
            incomeDetail: inc.description,
            projectId: inc.projectId,
            peopleId: inc.peopleId,
            userId: abcUser.id,
            incomeDate: inc.date,
        })),
        skipDuplicates: true,
    });
    console.log(`✅ Created ${createdIncomes.count} incomes for ABC user`);

    console.log("\n✨ ABC User seed data completed successfully!");
    console.log("📊 Summary of test data created:");
    console.log(`   - Categories: 10`);
    console.log(`   - Subcategories: 11`);
    console.log(`   - Projects: 5`);
    console.log(`   - People/Employees: 4`);
    console.log(`   - Expenses: ${createdExpenses.count}`);
    console.log(`   - Incomes: ${createdIncomes.count}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
