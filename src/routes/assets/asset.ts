import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {GetAssetByAssetId} from "@/models/asset";
import {findAssetsByIds, findAssetsByOrgId} from "@/routes/assets/asset-services";
import {getGeo} from "@/routes/geolocation/geolocation-service";

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
                "/orgId",
                async ({error, payload}) => {
                    try {
                        const [border, assets] = await Promise.all([
                            getGeo(payload.orgId!),
                            findAssetsByOrgId(payload.orgId!),
                        ]);
                        return {
                            border,
                            assets,
                        };
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
                    response: {},
                }
            );
    });
