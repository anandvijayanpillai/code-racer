import React from "react"
import { RecentRacesTable } from "./recentRaces"
import { Result } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { User } from "next-auth";

interface RaceTableServerSideProps {
    user: User;
    searchParams: {
        [key: string]: string | string[] | undefined;
        tableType: string;
    };
    totalUserGames: number;
}

export default async function RaceTableServerSide({
    user,
    searchParams,
    totalUserGames,
}: RaceTableServerSideProps) {
    const { tableType } = searchParams;

    if (tableType != "race") {
        searchParams = {
            page: "1",
            per_page: "5",
            sort: "createdAt.asc",
            tableType: "race",
        }
    };

    const { page, per_page, sort } = searchParams;

    // Number of records to show per page
    const take = typeof per_page === "string" ? parseInt(per_page) : 5;

    // Number of records to skip
    const skip = typeof page === "string" ? (parseInt(page) - 1) * take : 0;

    // Column and order to sort by
    const [column, order] = (typeof sort === "string")
        ?
        (
            sort.split(".") as [keyof Result | undefined, "asc" | "desc" | undefined,]
        )
        :
        [];

    const recentGames = await prisma.result.findMany({
        take,
        skip,
        where: {
            userId: user.id,
        },
        orderBy: {
            [column ?? "createdAt"]: order,
        },
    });

    const userPageCount = (totalUserGames === 0) ? 1 : Math.ceil(totalUserGames / take);

    return (
        <RecentRacesTable data={recentGames} pageCount={userPageCount} />
    )
}
