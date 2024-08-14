import {Static, t} from 'elysia'


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
        canRead: t.Boolean(),
        canCreate: t.Boolean(),
        canUpdate: t.Boolean(),
        canDelete: t.Boolean(),
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
    abilityScope: any,
    email : string,
    orgId : string,
    orgName : string,
}

export type LoginBodyType = Static<typeof LoginBody>