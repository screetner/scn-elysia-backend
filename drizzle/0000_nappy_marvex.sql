DO $$ BEGIN
 CREATE TYPE "public"."video_session_state" AS ENUM('uploading', 'uploaded', 'processing', 'processed', 'canDelete');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assets" (
	"assetId" text PRIMARY KEY NOT NULL,
	"geoCoordinate" "point" NOT NULL,
	"assetTypeId" text,
	"imageFileLink" varchar(255) NOT NULL,
	"recordedUser" text,
	"recordedAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assetTypes" (
	"assetTypeId" text PRIMARY KEY NOT NULL,
	"assetType" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"organizationId" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"border" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"roleId" text PRIMARY KEY NOT NULL,
	"organizationId" text,
	"roleName" varchar(255) NOT NULL,
	"abilityScope" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"userId" text PRIMARY KEY NOT NULL,
	"roleId" text,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videoSessions" (
	"videoSessionId" text PRIMARY KEY NOT NULL,
	"uploadUserId" text NOT NULL,
	"uploadProgress" bigint,
	"videoLink" varchar(255),
	"state" "video_session_state",
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assets" ADD CONSTRAINT "assets_assetTypeId_assetTypes_assetTypeId_fk" FOREIGN KEY ("assetTypeId") REFERENCES "public"."assetTypes"("assetTypeId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assets" ADD CONSTRAINT "assets_recordedUser_users_userId_fk" FOREIGN KEY ("recordedUser") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_organizations_organizationId_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("organizationId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_roleId_roles_roleId_fk" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("roleId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "videoSessions" ADD CONSTRAINT "videoSessions_uploadUserId_users_userId_fk" FOREIGN KEY ("uploadUserId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_assetId_idx" ON "assets" USING btree ("assetId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_assetTypeId_idx" ON "assets" USING btree ("assetTypeId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assetType_assetTypeId_idx" ON "assetTypes" USING btree ("assetTypeId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_organizationId_idx" ON "organizations" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_name_idx" ON "organizations" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_roleId_idx" ON "roles" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_organizationId_idx" ON "roles" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_userId_idx" ON "users" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "users" USING btree ("email");