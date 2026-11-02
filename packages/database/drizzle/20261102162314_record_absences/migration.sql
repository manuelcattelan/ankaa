CREATE TABLE "absence" (
	"date" date NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"note" text,
	"reason" text NOT NULL,
	"routine_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "absence_routine_id_date_key" UNIQUE("routine_id","date"),
	CONSTRAINT "absence_reason_check" CHECK ("reason" in ('low_on_time', 'low_energy', 'pain', 'other'))
);
--> statement-breakpoint
CREATE INDEX "absence_user_id_idx" ON "absence" ("user_id");--> statement-breakpoint
ALTER TABLE "absence" ADD CONSTRAINT "absence_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "absence" ADD CONSTRAINT "absence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "authentication"."user"("id") ON DELETE CASCADE;