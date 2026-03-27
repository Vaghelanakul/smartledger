import { getCategories, getSubCategories } from "@/actions/categories";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesTable } from "./_components/categories-table";
import { SubCategoriesTable } from "./_components/subcategories-table";
import { AddCategoryDialog } from "./_components/add-category-dialog";
import { AddSubCategoryDialog } from "./_components/add-subcategory-dialog";

export default async function CategoriesPage() {
    const [{ categories }, { subCategories }] = await Promise.all([
        getCategories(),
        getSubCategories(),
    ]);

    return (
        <>
            <DashboardHeader title="Categories" description="Manage your expense and income categories" />
            <div className="space-y-5 p-6">
                <Tabs defaultValue="categories" className="w-full">
                    <Card className="w-full border-border/70 bg-card/70 backdrop-blur-xl">
                        <CardHeader className="border-b border-border/70 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <TabsList className="w-full sm:w-auto">
                                    <TabsTrigger value="categories" className="flex-1 sm:flex-none">Categories</TabsTrigger>
                                    <TabsTrigger value="subcategories" className="flex-1 sm:flex-none">Subcategories</TabsTrigger>
                                </TabsList>
                                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                                    <AddCategoryDialog />
                                    <AddSubCategoryDialog categories={categories} />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="w-full p-0">
                            <TabsContent value="categories" className="mt-0 w-full">
                                <CategoriesTable categories={categories} />
                            </TabsContent>
                            <TabsContent value="subcategories" className="mt-0 w-full">
                                <SubCategoriesTable subCategories={subCategories} categories={categories} />
                            </TabsContent>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </>
    );
}
