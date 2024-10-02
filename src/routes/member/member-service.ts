import {db} from "@/database/database";
import * as schemas from "@/database/schemas";
import {desc, eq, inArray} from "drizzle-orm";
import * as memberModel from "@/models/member";
import sendEmailMessage from "@/libs/emailform";
import {subject} from "@/models/member";

export async function getRecentMember(organizationId: string, limit: number): Promise<memberModel.getRecentMember[]> {
    return db.select({
        userId: schemas.userTable.userId,
        userName: schemas.userTable.username,
        email: schemas.userTable.email,
        roleName: schemas.roleTable.roleName,
        createdAt: schemas.userTable.createdAt,
    })
        .from(schemas.userTable)
        .leftJoin(schemas.roleTable, eq(schemas.userTable.roleId, schemas.roleTable.roleId))
        .where(eq(schemas.roleTable.organizationId, organizationId))
        .orderBy(desc(schemas.userTable.createdAt))
        .limit(limit);
}

export async function checkEmailExist(emails: string[]): Promise<void> {
    const existingEmails = await db.select({
        email: schemas.userTable.email
    })
        .from(schemas.userTable)
        .where(inArray(schemas.userTable.email, emails));

    if (existingEmails.length > 0) {
        throw new Error(`The following emails already exist: ${existingEmails.map(e => e.email).join(", ")}`);
    }
}

export async function addInviteToDatabase(userId: string, organizationId: string, tokens: string[]) {
    const insertPromises = tokens.map(token => {
        return db.insert(schemas.inviteTable)
            .values({
                userId,
                organizationId,
                token
            });
    });

    await Promise.all(insertPromises);
}

export async function sendInviteEmail(sendInviteTokens: memberModel.sendInviteToken[]) {
    await Promise.all(
        sendInviteTokens.map(async sendInviteToken => {
            const url = process.env.FN_URL! + `/en/register?token=${sendInviteToken.token}`;
            await sendEmailMessage(sendInviteToken.email, subject, url, sendInviteToken.token);
        })
    );
}

// export async function generateAndSendInviteTokens(jwtInvite: Elysia ,emails: string[], orgId: string, roleId: string, senderId: string) {
//     const sendInviteTokens: sendInviteToken[] = [];
//     await Promise.all(emails.map(async email => {
//         const token = await jwtInvite.sign({ email, orgId, roleId });
//         sendInviteTokens.push({ email, token });
//     }));
//
//     await Promise.all([
//         addInviteToDatabase(senderId, orgId, sendInviteTokens.map(e => e.token)),
//         sendInviteEmail(sendInviteTokens)
//     ]);
// }
