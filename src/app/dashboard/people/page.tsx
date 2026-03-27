import { getPeople } from "@/actions/people";
import { DashboardHeader } from "@/components/dashboard-header";
import { PeopleTable } from "./_components/people-table";
import { AddPeopleDialog } from "./_components/add-people-dialog";

export default async function PeoplePage() {
    const { people } = await getPeople();

    return (
        <>
            <DashboardHeader title="People" description="Manage your people list">
                <AddPeopleDialog />
            </DashboardHeader>
            <div className="p-6">
                <PeopleTable people={people} />
            </div>
        </>
    );
}
