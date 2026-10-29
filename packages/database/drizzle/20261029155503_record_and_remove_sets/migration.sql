CREATE TABLE "workout_exercise_recorded_set" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"position" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"workout_exercise_id" uuid NOT NULL,
	CONSTRAINT "workout_exercise_recorded_set_workout_exercise_id_position_key" UNIQUE("workout_exercise_id","position"),
	CONSTRAINT "workout_exercise_recorded_set_position_check" CHECK ("position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "workout_exercise_recorded_set_segment" (
	"amount" integer NOT NULL,
	"position" integer,
	"weight" numeric(6,2),
	"workout_exercise_recorded_set_id" uuid,
	CONSTRAINT "workout_exercise_recorded_set_segment_pkey" PRIMARY KEY("workout_exercise_recorded_set_id","position"),
	CONSTRAINT "workout_exercise_recorded_set_segment_position_check" CHECK ("position" >= 0),
	CONSTRAINT "workout_exercise_recorded_set_segment_amount_check" CHECK ("amount" >= 1),
	CONSTRAINT "workout_exercise_recorded_set_segment_weight_check" CHECK ("weight" between 0.01 and 9999.99)
);
--> statement-breakpoint
ALTER TABLE "workout_exercise_set_segment" DROP CONSTRAINT "workout_exercise_set_segment_workout_exercise_set_id_fkey";--> statement-breakpoint
DROP TABLE "workout_exercise_set";--> statement-breakpoint
DROP TABLE "workout_exercise_set_segment";--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD COLUMN "weight_unit" text DEFAULT 'kilogram' NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_exercise_recorded_set" ADD CONSTRAINT "workout_exercise_recorded_set_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercise"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise_recorded_set_segment" ADD CONSTRAINT "workout_exercise_recorded_set_segment_recorded_set_id_fkey" FOREIGN KEY ("workout_exercise_recorded_set_id") REFERENCES "workout_exercise_recorded_set"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_weight_unit_check" CHECK ("weight_unit" in ('kilogram', 'pound'));