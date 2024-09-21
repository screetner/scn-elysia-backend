import {t} from "elysia";

export interface getRecentMember {
    userId: string;
    userName: string;
    email: string;
    roleName: string | null;
    createdAt: Date | null;
}

export const memberRecentQuery = t.Object({
    limit: t.String(),
});
