import {t} from "elysia";

export interface getRecentMember {
    userId: string;
    username: string;
    email: string;
    roleName: string | null;
    createdAt: Date | null;
}

export interface sendInviteToken {
    email: string;
    token: string;
}

export const memberInvitesBody = t.Object({
    defaultRoleId: t.String(),
    emails: t.Array(t.String()),
});

export const memberRecentQuery = t.Object({
    limit: t.String(),
});

export const subject = 'Invitation to join organization';
