import {db} from "@/database/database";
import * as schemas from "@/database/schemas";
import {eq} from "drizzle-orm";
import {password} from "bun";

export async function changePassword(userId: string, newPassword: string) {
    const encryptedPassword = await password.hash(newPassword, "bcrypt");
    const [userData] = await db.select({
        password: schemas.userTable.password
    })
        .from(schemas.userTable)
        .where(eq(schemas.userTable.userId, userId));

    if (!userData) {
        throw new Error("User not found");
    }

    const IsSamePassword = await Bun.password.verify(newPassword, userData.password);

    if(IsSamePassword) {
        throw new Error("Password is same as old password");
    }

    return db.update(schemas.userTable)
        .set({
            password: encryptedPassword
        })
        .where(eq(schemas.userTable.userId, userId))
        .returning({
            password: schemas.userTable.password
        });
}