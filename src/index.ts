import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import {auth, sample, geolocation} from "@/routes";
import {jwt} from "@elysiajs/jwt";

const app = new Elysia()
    .get("/", () => "Hello Elysia")
    .use(auth)
    .use(geolocation)
    .use(sample)
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET || "secret"
    }))
    .use(swagger({
        documentation: {
            tags: [
                { name: 'Auth', description: 'Authentication endpoints' },
                { name: 'Sample', description: 'Sample endpoints' }
            ]
        }
    }))
    .listen(3000);
