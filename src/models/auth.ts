import {Static, t} from 'elysia'
import {permission} from "@/models/role";


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
    abilityScope: permission,
    email : t.String(),
    orgId : t.String(),
    orgName : t.String(),
    isOwner : t.Boolean(),
})

export type JWTPayload = Static<typeof JWTPayloadSchema>

export interface JWTInvitePayload {
    email: string,
    orgId: string,
    roleId: string,
}

export const JWTInvitePayloadSchema = t.Object({
    email: t.String(),
    orgId: t.String(),
    roleId: t.String(),
})

export type LoginBodyType = Static<typeof LoginBody>