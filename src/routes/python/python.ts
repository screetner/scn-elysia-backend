import {Elysia} from "elysia";
import {PostAssetBody} from "@/models/python";
import {postAsset} from "@/routes/python/python-service";

export const python = (app: Elysia) =>
    app.group("python", (app) => {
        return app
            .post('', async ({error, body}) => {
                try {
                    return await postAsset(body);
                } catch (e) {
                    return error(500, e);
                }
            }, {
                detail: {
                    description: "Post Asset",
                    tags: ["Python"],
                },
                body: PostAssetBody,
            });
    });