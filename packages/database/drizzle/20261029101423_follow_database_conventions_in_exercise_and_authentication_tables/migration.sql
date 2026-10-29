CREATE SCHEMA "authentication";
--> statement-breakpoint
CREATE TABLE "authentication"."account" (
	"access_token" text,
	"access_token_expires_at" timestamp with time zone,
	"account_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"id_token" text,
	"password" text,
	"provider_id" text NOT NULL,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authentication"."session" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"ip_address" text,
	"token" text NOT NULL CONSTRAINT "session_token_key" UNIQUE,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authentication"."user" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL CONSTRAINT "user_email_key" UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"image" text,
	"name" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authentication"."verification" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"identifier" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."account" DROP CONSTRAINT "account_user_id_user_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."session" DROP CONSTRAINT "session_user_id_user_id_fkey";--> statement-breakpoint
ALTER TABLE "routine" DROP CONSTRAINT "routine_user_id_fkey";--> statement-breakpoint
ALTER TABLE "workout" DROP CONSTRAINT "workout_user_id_fkey";--> statement-breakpoint
DROP TABLE "auth"."account";--> statement-breakpoint
DROP TABLE "auth"."session";--> statement-breakpoint
DROP TABLE "auth"."user";--> statement-breakpoint
DROP TABLE "auth"."verification";--> statement-breakpoint
ALTER TABLE "exercise_muscle_group" RENAME COLUMN "muscle_group_role" TO "role";--> statement-breakpoint
ALTER TABLE "exercise_equipment" DROP CONSTRAINT "exercise_equipment_exercise_id_equipment_key";--> statement-breakpoint
ALTER TABLE "exercise_muscle_group" DROP CONSTRAINT "exercise_muscle_group_exercise_id_muscle_group_key";--> statement-breakpoint
ALTER TABLE "exercise_muscle_group" RENAME CONSTRAINT "exercise_muscle_group_muscle_group_role_check" TO "exercise_muscle_group_role_check";--> statement-breakpoint
ALTER TABLE "exercise_muscle_group" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "exercise_muscle_group" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "exercise_muscle_group" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "exercise_equipment" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "exercise_equipment" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "exercise_equipment" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "exercise_equipment" ADD CONSTRAINT "exercise_equipment_pkey" PRIMARY KEY("exercise_id","equipment");--> statement-breakpoint
ALTER TABLE "exercise_muscle_group" ADD CONSTRAINT "exercise_muscle_group_pkey" PRIMARY KEY("exercise_id","muscle_group");--> statement-breakpoint
ALTER TABLE "routine" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "workout" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "authentication"."account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "authentication"."session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "authentication"."verification" ("identifier");--> statement-breakpoint
ALTER TABLE "authentication"."account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "authentication"."user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "authentication"."session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "authentication"."user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exercise_muscle_group" DROP CONSTRAINT "exercise_muscle_group_role_check", ADD CONSTRAINT "exercise_muscle_group_role_check" CHECK ("role" in ('primary', 'secondary'));--> statement-breakpoint
DROP SCHEMA "auth";
