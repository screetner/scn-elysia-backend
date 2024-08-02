ALTER TABLE "roles" ALTER COLUMN "organizationId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "roleId" SET NOT NULL;