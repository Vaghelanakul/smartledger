import { getProjects } from "@/actions/projects";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProjectsTable } from "./_components/projects-table";
import { AddProjectDialog } from "./_components/add-project-dialog";

export default async function ProjectsPage() {
    const { projects } = await getProjects();

    return (
        <>
            <DashboardHeader title="Projects" description="Manage your projects">
                <AddProjectDialog />
            </DashboardHeader>
            <div className="p-6">
                <ProjectsTable projects={projects} />
            </div>
        </>
    );
}
