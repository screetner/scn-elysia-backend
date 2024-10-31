import {t} from "elysia";

export const passwordSchema = t.Object({
    oldPassword: t.String(),
    newPassword: t.String()
})