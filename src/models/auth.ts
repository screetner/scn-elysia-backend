import {Static, t} from 'elysia'


export const LoginBody = t.Object({
        username: t.String(),
        password: t.String()
    },
    {
        description: "Login model",
    },
)

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