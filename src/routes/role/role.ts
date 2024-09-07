import {Elysia} from "elysia";
import {checkAccessToken} from "@/middleware/jwtRequire";
import {
    assignRole,
    getRoleInformation,
    getRoleOrganization,
    getUnassignedRole,
    unassignRole
} from "@/routes/role/role-service";
import {
    AssignRoleBody,
    GetRoleInfoByRoleId,
    updateRole,
    roleInOrg,
    roleManagement,
    roleMemberInformation, UnassignRoleBody
} from "@/models/role";

export const role = (app: Elysia) =>
    app.group("role", (app) => {
        return app
            .use(checkAccessToken)
            .get('/', async ({error, payload}) => {
                try {
                    const response: roleInOrg[] = await getRoleOrganization(payload!.orgId)

                    if (!response) return error(401, "Unauthorized")

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    title: "Get Role Organization",
                    description: "Get All Role Organization for Organization",
                    tags: ["Role"]
                }
            })
            .get('/unassigned', async ({error, payload}) => {
                try {
                    const response: roleMemberInformation[] = await getUnassignedRole(payload!.orgId);

                    if (!response) return error(401, "Unauthorized");

                    return response;
                } catch (e) {
                    return error(500, e);
                }
            }, {
                detail: {
                    title: "Get Unassigned Role",
                    description: "Get All Unassigned Role of users in Organization",
                    tags: ["Role"]
                }
            })
            .get('/:roleId', async ({error, params, payload}) => {
                try {
                    const roleId = params.roleId;
                    const response: roleManagement = await getRoleInformation(roleId, payload!.orgId);

                    if (!response) return error(401, "Unauthorized");

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    title: "Get Role Information",
                    description: "Get Role Information and Members Information by RoleId",
                    tags: ["Role"]
                },
                params: GetRoleInfoByRoleId
            })
            .patch('/assign-role', async ({error, payload, body}) => {
                try {
                    const response: updateRole[] = await assignRole(body.userId, body.roleId, payload!.orgId);

                    if (!response) return error(401, "Unauthorized");

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    title: "Assign Role",
                    description: "Assign Role to User",
                    tags: ["Role"]
                },
                body: AssignRoleBody
            }).patch('/unassign-role', async ({error, payload, body}) => {
                try {
                    const response: updateRole = await unassignRole(body.userId, payload!.orgId);

                    if (!response) return error(401, "Unauthorized");

                    return response;
                } catch (e) {
                    return error(500, e)
                }
            }, {
                detail: {
                    title: "Unassign Role",
                    description: "Unassign Role from User",
                    tags: ["Role"]
                },
                body: UnassignRoleBody
            })
    },
    );