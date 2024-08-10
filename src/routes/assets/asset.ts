import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {GetAssetByAssetId, GetAssetByOrgId} from "@/models/asset";
import {findAssetsByIds, findAssetsByOrgId} from "@/routes/assets/asset-services";

export const asset = (app: Elysia) =>
    app.group("assets", (app) => {
        return app
            .use(checkAccessToken)
            .get(
                "/assetId/:assetId",
                async ({error, params}) => {
                    const assetIds = params.assetId.split(",");
                    try {
                        return await findAssetsByIds(assetIds);
                    } catch (e) {
                        return error(500, e);
                    }
                },
                {
                    detail: {
                        title: "Get Asset",
                        description: "Get Asset",
                        tags: ["Asset"],
                    },
                    params: GetAssetByAssetId,
                    response: {},
                }
            )
            .get(
                "/orgId/:orgId",
                async ({error, params}) => {
                    try {
                        return await findAssetsByOrgId(params.orgId);
                    } catch (e) {
                        return error(500, e);
                    }
                },
                {
                    detail: {
                        title: "Get Asset",
                        description: "Get Asset",
                        tags: ["Asset"],
                    },
                    params: GetAssetByOrgId,
                    response: {},
                }
            );
    });
