import {Elysia} from "elysia";
import {geolocation} from "@/routes/geolocation/geolocation";

export const router = (app: Elysia) =>
    app.group("api", (app) =>
        app.use(geolocation)
    );