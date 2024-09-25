import { JWTPayload } from "@/models/auth";
import { rolePermission } from "@/models/role";

export type PermissionCheck = Partial<{
    [K in keyof rolePermission]: Partial<Record<keyof rolePermission[K], boolean>>;
}>;

export const checkPermissions = (payload: JWTPayload, ...permissionSets: PermissionCheck[]): boolean => {
    if (!payload || !payload.abilityScope) {
        return false;
    }

    return permissionSets.every(permissionSet =>
        Object.entries(permissionSet).every(([category, permissions]) =>
            Object.entries(permissions!).every(([permission, required]) =>
                !required || (payload.abilityScope?.[category as keyof rolePermission]?.[permission as keyof rolePermission[keyof rolePermission]] === true)
            )
        )
    );
};