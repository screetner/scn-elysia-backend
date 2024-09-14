import {
    bigint,
    index,
    jsonb,
    pgEnum,
    pgTable,
    point,
    text,
    timestamp,
    varchar,
    unique,
} from 'drizzle-orm/pg-core';
import {createId} from "@paralleldrive/cuid2";
import {relations} from "drizzle-orm";
import {polygonDB} from "@/database/customTypes";

// AssetType Table
export const assetTypeTable = pgTable('assetTypes', {
    assetTypeId: text('assetTypeId').primaryKey().$defaultFn(createId),
    assetType: varchar('assetType', { length: 255 }).notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    assetTypeIdIdx: index('assetType_assetTypeId_idx').on(table.assetTypeId),
}));

// Asset Table
export const assetTable = pgTable('assets', {
    assetId: text('assetId').primaryKey().$defaultFn(createId),
    geoCoordinate: point('geoCoordinate').notNull(),
    assetTypeId: text('assetTypeId').references(() => assetTypeTable.assetTypeId),
    imageFileLink: varchar('imageFileLink', { length: 255 }).notNull(),
    recordedUser: text('recordedUser').references(() => userTable.userId),
    recordedAt: timestamp('recordedAt').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    assetIdIdx: index('asset_assetId_idx').on(table.assetId),
    assetTypeIdIdx: index('asset_assetTypeId_idx').on(table.assetTypeId),
}));


// Organization Table
export const organizationTable = pgTable('organizations', {
    organizationId: text('organizationId').primaryKey().$defaultFn(createId),
    name: varchar('name', { length: 255 }).notNull(),
    border: polygonDB('border'),
    sasToken: varchar('sasToken', { length: 255 }),
    sasTokenExpireDate: timestamp('sasTokenExpireDate').defaultNow(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    organizationIdIdx: index('org_organizationId_idx').on(table.organizationId),
    nameIdx: index('org_name_idx').on(table.name),
}));

// Role Table
export const roleTable = pgTable('roles', {
    roleId: text('roleId').primaryKey().$defaultFn(createId),
    organizationId: text('organizationId').references(() => organizationTable.organizationId).notNull(),
    roleName: varchar('roleName', { length: 255 }).notNull(),
    abilityScope: jsonb('abilityScope').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    roleIdIdx: index('role_roleId_idx').on(table.roleId),
    organizationIdIdx: index('role_organizationId_idx').on(table.organizationId),
}));

// User Table
export const userTable = pgTable('users', {
    userId: text('userId').primaryKey().$defaultFn(createId),
    roleId: text('roleId').references(() => roleTable.roleId).notNull(),
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
export const videoSessionStateEnum = pgEnum('video_session_state', ['uploading', 'uploaded', 'processing', 'processed', 'canDelete']);

export const videoSessionTable = pgTable('videoSessions', {
    videoSessionId: text('videoSessionId').primaryKey().$defaultFn(createId),
    uploadUserId: text('uploadUserId').references(() => userTable.userId).notNull(),
    uploadProgress: bigint('uploadProgress', { mode: 'number' }),
    videoLink: varchar('videoLink', { length: 255 }),
    state: videoSessionStateEnum('state'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
});

//Token Table
export const tokenEnum = pgEnum('token_type', ['Access', 'Refresh', 'Tusd']);

export const tokenTable = pgTable('tokens', {
    tokenId: text('tokenId').primaryKey().$defaultFn(createId),
    userId: text('userId').references(() => userTable.userId).notNull(),
    tokenType: tokenEnum('tokenType').notNull(),
    token: text('token').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
    userIdIdx: index('token_userId_idx').on(table.userId),
    tokenTypeIdx: index('token_tokenType_idx').on(table.tokenType),
    tokenIdx: index('token_token_idx').on(table.token),
    userIdTypeUniqueIdx: unique('token_userId_type_unique_idx').on(table.userId, table.tokenType),
}));

// Relations
export const organizationRelations = relations(organizationTable, ({ many }) => ({
    role: many(roleTable)
}));

export const rolesRelations = relations(roleTable, ({ one, many }) => ({
    organization: one(organizationTable, {
        fields: [roleTable.organizationId],
        references : [organizationTable.organizationId]
    }),
    user: many(userTable)
}));

export const userRelation = relations(userTable, ({ one, many }) => ({
    role: one(roleTable, {
        fields: [userTable.roleId],
        references: [roleTable.roleId],
    }),
    asset: many(assetTable),
    token: many(tokenTable)
}));

export const assetTypeRelations = relations(assetTypeTable, ({ many }) => ({
    asset: many(assetTable)
}));

export const assetRelations = relations(assetTable, ({ one }) => ({
    assetType: one(assetTypeTable, {
        fields: [assetTable.assetTypeId],
        references: [assetTypeTable.assetTypeId],
    }),
    user: one(userTable, {
        fields: [assetTable.recordedUser],
        references: [userTable.userId],
    }),
}));

export const tokenRelations = relations(tokenTable, ({ one }) => ({
    user: one(userTable, {
        fields: [tokenTable.userId],
        references: [userTable.userId],
    }),
}));