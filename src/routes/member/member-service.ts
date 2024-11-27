import {db} from "@/database/database";
import * as schemas from "@/database/schemas";
import {desc, eq, inArray} from "drizzle-orm";
import * as memberModel from "@/models/member";
import sendEmailMessage from "@/libs/emailform";
import {sendInviteToken, subject} from "@/models/member";

export async function getRecentMember(organizationId: string, limit?: number): Promise<memberModel.getRecentMember[]> {
    const query = db.select({
        userId: schemas.userTable.userId,
        username: schemas.userTable.username,
        email: schemas.userTable.email,
        roleName: schemas.roleTable.roleName,
        createdAt: schemas.userTable.createdAt,
    })
        .from(schemas.userTable)
        .leftJoin(schemas.roleTable, eq(schemas.userTable.roleId, schemas.roleTable.roleId))
        .where(eq(schemas.roleTable.organizationId, organizationId))
        .orderBy(desc(schemas.userTable.createdAt));

    if (limit !== undefined) {
        query.limit(limit);
    }

    return query;
}

export async function checkEmailExist(emails: string[]): Promise<void> {
    const existingEmails = await db.select({
        email: schemas.userTable.email
    })
        .from(schemas.userTable)
        .where(inArray(schemas.userTable.email, emails));

    if (existingEmails.length > 0) {
        throw new Error(`These Emails already exist in other Org : ${existingEmails.map(e => e.email).join(", ")}`);
    }
}

export async function addInviteToDatabase(userId: string, organizationId: string, emailAndTokens: sendInviteToken[]) {
    const insertPromises = emailAndTokens.map(emailAndToken => {
        return db.insert(schemas.inviteTable)
            .values({
                userId,
                email: emailAndToken.email,
                organizationId,
                token: emailAndToken.token
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