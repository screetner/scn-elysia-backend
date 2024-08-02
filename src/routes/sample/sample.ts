import {Elysia} from "elysia";
import {clearMockData, createMockData} from "@/routes/sample/sample-service";

export const sample = (app: Elysia) =>
    app.group("sample", (app) => {
            return app
                .post("/", async ({error}) => {
                    try {
                        return await createMockData()
                    } catch (e) {
                        return error(500,e)
                    }
                }, {
                    detail: {
                        description: "Create mock data for the system",
                        tags: ["Sample"]
                    }
                })
                .delete("/", async ({error}) => {
                        try {
                            return await clearMockData()
                        } catch (e) {
                            return error(500,e)
                        }
                    }, {
                        detail: {
                            description: "Clear mock data for the system",
                            tags: ["Sample"]
                        }
                    }
                )
        }
    );