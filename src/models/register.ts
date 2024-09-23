import {t} from "elysia";

export interface register {
    username: string;
    password: string;
}

export const RegisterBody = t.Object({
    username: t.String(),
    password: t.String(),
});