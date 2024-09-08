import {Static, t} from 'elysia'
import {rolePermission} from "@/models/role";


export const LoginBody = t.Object({
        username: t.String(),
        password: t.String()
    },
    {
        description: "Login model",
    },
)

export const JWTPayloadSchema = t.Object({
    userId : t.String(),
    username : t.String(),
    roleId : t.String(),
    roleName : t.String(),
    abilityScope: t.Object({
        mobile: t.Object({
            access: t.Boolean(),
            videosProcess: t.Boolean(),
        }),
        web: t.Object({
            access: t.Boolean(),
            manageGeometry: t.Boolean(),
            roleSetting: t.Boolean(),
        })
    }),
    email : t.String(),
    orgId : t.String(),
    orgName : t.String(),
})

export interface JWTPayload {
    userId: string,
    username: string,
    roleId: string,
    roleName: string,
    abilityScope: rolePermission,
    email : string,
    orgId : string,
    orgName : string,
}

export type LoginBodyType = Static<typeof LoginBody>