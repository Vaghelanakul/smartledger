"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { deletePeople } from "@/actions/people";
import { toast } from "sonner";
import { EditPeopleDialog } from "./edit-people-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface People {
    id: number;
    peopleCode: string | null;
    peopleName: string;
    email: string | null;
    mobileNo: string | null;
    description: string | null;
    created: Date;
    user?: { userName: string };
}

interface PeopleTableProps {
    people: People[];
}

export function PeopleTable({ people }: PeopleTableProps) {
    const [editPerson, setEditPerson] = useState<People | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!deleteId) return;
        setIsDeleting(true);

        const result = await deletePeople(deleteId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Person deleted successfully");
        }

        setIsDeleting(false);
        setDeleteId(null);
    }

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    {people.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Mobile</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {people.map((person) => (
                                    <TableRow key={person.id}>
                                        <TableCell className="font-mono text-sm">
                                            {person.peopleCode || "-"}
                                        </TableCell>
                                        <TableCell className="font-medium">{person.peopleName}</TableCell>
                                        <TableCell>{person.email || "-"}</TableCell>
                                        <TableCell>{person.mobileNo || "-"}</TableCell>
                                        <TableCell>{formatDate(person.created)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditPerson(person)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(person.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex h-32 items-center justify-center text-muted-foreground">
                            No people found. Add your first person to get started.
                        </div>
                    )}
                </CardContent>
            </Card>

            <EditPeopleDialog person={editPerson} onClose={() => setEditPerson(null)} />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this person
                            and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
