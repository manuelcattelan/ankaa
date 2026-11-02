ALTER TABLE "absence" DROP CONSTRAINT "absence_routine_id_date_key";--> statement-breakpoint
ALTER TABLE "absence" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "absence_live_routine_id_date_idx" ON "absence" ("routine_id","date") WHERE ("deleted_at" is null);--> statement-breakpoint
CREATE INDEX "absence_routine_id_idx" ON "absence" ("routine_id");