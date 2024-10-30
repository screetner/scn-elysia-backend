import {t} from "elysia";

export const passwordSchema = t.Object({
    newPassword: t.String()
})