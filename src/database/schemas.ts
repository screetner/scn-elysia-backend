import {
    bigint,
    index,
    json,
    mysqlEnum,
    mysqlTable,
    timestamp,
    varchar,
} from 'drizzle-orm/mysql-core';
import {createId} from "@paralleldrive/cuid2";
import {relations} from "drizzle-orm";
import {pointDB, polygonDB} from "@/database/customTypes";

// AssetType Table
export const assetTypeTable = mysqlTable('assetTypes', {
    assetTypeId: varchar('assetTypeId', { length: 128 }).primaryKey().$defaultFn(createId),
    assetType: varchar('assetType', { length: 255 }).notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    assetTypeIdIdx: index('assetType_assetTypeId_idx').on(table.assetTypeId),
}));

// Asset Table
export const assetTable = mysqlTable('assets', {
    assetId: varchar('assetId', { length: 128 }).primaryKey().$defaultFn(createId),
    geoCoordinate: pointDB('geoCoordinate').notNull(),
    assetTypeId: varchar('assetTypeId', { length: 128 }).references(() => assetTypeTable.assetTypeId),
    imageFileLink: varchar('imageFileLink', { length: 255 }).notNull(),
    recordedUser: varchar('recordedUser', { length: 128 }).references(() => userTable.userId),
    recordedAt: timestamp('recordedAt').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    assetIdIdx: index('asset_assetId_idx').on(table.assetId),
    assetTypeIdIdx: index('asset_assetTypeId_idx').on(table.assetTypeId),
}));


// Organization Table
export const organizationTable = mysqlTable('organizations', {
    organizationId: varchar('organizationId', { length: 128 }).primaryKey().$defaultFn(createId),
    name: varchar('name', { length: 255 }).notNull(),
    border: polygonDB('border'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    organizationIdIdx: index('org_organizationId_idx').on(table.organizationId),
    nameIdx: index('org_name_idx').on(table.name),
}));

// Role Table
export const roleTable = mysqlTable('roles', {
    roleId: varchar('roleId', { length: 128 }).primaryKey().$defaultFn(createId),
    organizationId: varchar('organizationId', { length: 128 }).references(() => organizationTable.organizationId).notNull(),
    roleName: varchar('roleName', { length: 255 }).notNull(),
    abilityScope: json('abilityScope').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    roleIdIdx: index('role_roleId_idx').on(table.roleId),
    organizationIdIdx: index('role_organizationId_idx').on(table.organizationId),
}));

// User Table
export const userTable = mysqlTable('users', {
    userId: varchar('userId', { length: 128 }).primaryKey().$defaultFn(createId),
    roleId: varchar('roleId', { length: 128 }).references(() => roleTable.roleId).notNull(),
    username: varchar('username', { length: 50 }).notNull(),
    email: varchar('email', { length: 100 }).unique().notNull(),
    password: varchar('password', { length: 101 }).notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    userIdIdx: index('user_userId_idx').on(table.userId),
    usernameIdx: index('user_username_idx').on(table.username),
    emailIdx: index('user_email_idx').on(table.email),
}));

// VideoSession Table
export const videoSessionTable = mysqlTable('videoSessions', {
    videoSessionId: varchar('videoSessionId', { length: 128 }).primaryKey().$defaultFn(createId),
    uploadUserId: varchar('uploadUserId', { length: 128 }).references(() => userTable.userId).notNull(),
    uploadProgress: bigint('uploadProgress', { mode: 'number' }),
    videoLink: varchar('videoLink', { length: 255 }),
    state: mysqlEnum('state', ['uploading', 'uploaded', 'processing', 'processed', 'canDelete']),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
});


// Relations
export const rolesRelations = relations(roleTable, ({ one, many }) => ({
    organization: one(organizationTable, {
        fields: [roleTable.organizationId],
        references : [organizationTable.organizationId]
    }),
    user: many(userTable)
}));

export const organizationRelations = relations(organizationTable, ({ many }) => ({
    role: many(roleTable)
}));

export const userRelation = relations(userTable, ({ one }) => ({
    role: one(roleTable, {
        fields: [userTable.roleId],
        references: [roleTable.roleId],
    }),
}));