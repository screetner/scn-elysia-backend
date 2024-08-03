import {db} from "@/database/database";
import {eq} from "drizzle-orm";
import { userTable } from "@/database/schemas";
import {LoginBodyType} from "@/models/auth/auth";

export async function findUser(body: LoginBodyType) {
    return db.query.userTable.findFirst({
        where : eq(userTable.username, body.username),
        columns : {userId: true, username :true, email: true, password: true},
        with: {
            role : {
                columns : {
                    roleId: true,
                    organizationId : true,
                    roleName : true,
                    abilityScope : true,
                },
                with: {
                    organization : {
                        columns : {
                            organizationId: true,
                            name: true
                        }
                    }
                }
            }
        },
    })
}

/*
*/
export function accessTokenExpire(timeInSeconds : number) {
    const currentDate = new Date();
    return new Date(currentDate.getTime() + timeInSeconds * 1000);
}