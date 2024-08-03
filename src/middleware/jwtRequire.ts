import {Elysia, t} from "elysia";
import {jwtAccessSetup} from "@/routes/auth/setup";

export const checkToken = (app: Elysia) =>
    app
        .use(jwtAccessSetup)
        .derive(async function handler({jwtAccess, set, request: {headers}}) {
            const token = headers.get("Authorization")?.split(" ")[1];
            if (!token) {
                set.status = 401;
                return {
                    success: false,
                    message: "Unauthorized",
                    data: null,
                };
            }
            const payload = await jwtAccess.verify(token);
            if (!payload) {
                set.status = 401;
                return {
                    success: false,
                    message: "Unauthorized",
                    data: null,
                };
            }

            return {payload};
        })