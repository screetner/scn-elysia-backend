import {db} from "@/database/database";
import {and, eq} from "drizzle-orm";
import * as schemas from "@/database/schemas";
import {tokenTypeEnum} from "@/models/token";

export async function checkToken(userId: string, tokenType: tokenTypeEnum){
    return db.query.tokenTable.findFirst({
        where: and(eq(schemas.tokenTable.userId, userId), eq(schemas.tokenTable.tokenType, tokenType)),
        columns: {
            token: true,
        }
    });
}

export async function createToken(userId: string, tokenType: tokenTypeEnum, token: string) {
    return db.insert(schemas.tokenTable).values({
        userId,
        tokenType,
        token,
    });
}

// export async function updateToken(userId: string, tokenType: tokenTypeEnum, token: string) {
//     return db.insert(schemas.tokenTable).values({
//         userId,
//         tokenType,
//         token,
//     });
// }