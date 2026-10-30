CREATE TABLE "workout_exercise_group" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"position" integer NOT NULL,
	"section" text NOT NULL,
	"workout_id" uuid NOT NULL,
	CONSTRAINT "workout_exercise_group_workout_id_section_position_key" UNIQUE("workout_id","section","position"),
	CONSTRAINT "workout_exercise_group_section_check" CHECK ("section" in ('warm_up', 'main', 'cool_down')),
	CONSTRAINT "workout_exercise_group_position_check" CHECK ("position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "workout_exercise_planned_set" (
	"amount" integer,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"intensity_technique" text,
	"is_to_failure" boolean NOT NULL,
	"pause_seconds" integer,
	"position" integer NOT NULL,
	"rest_seconds" integer,
	"segment_count" integer,
	"tempo" text,
	"type" text NOT NULL,
	"weight_percentage" integer,
	"workout_exercise_id" uuid NOT NULL,
	CONSTRAINT "workout_exercise_planned_set_workout_exercise_id_position_key" UNIQUE("workout_exercise_id","position"),
	CONSTRAINT "workout_exercise_planned_set_type_check" CHECK ("type" in ('warm_up', 'working')),
	CONSTRAINT "workout_exercise_planned_set_intensity_technique_check" CHECK ("intensity_technique" in ('drop_set', 'rest_pause_set')),
	CONSTRAINT "workout_exercise_planned_set_tempo_check" CHECK ("tempo" ~ '^[0-9]{1,2}-[0-9]{1,2}-([0-9]{1,2}|X)-[0-9]{1,2}$'),
	CONSTRAINT "workout_exercise_planned_set_position_check" CHECK ("position" >= 0),
	CONSTRAINT "workout_exercise_planned_set_amount_check" CHECK ("amount" >= 1),
	CONSTRAINT "workout_exercise_planned_set_rest_seconds_check" CHECK ("rest_seconds" >= 1),
	CONSTRAINT "workout_exercise_planned_set_segment_count_check" CHECK ("segment_count" >= 2),
	CONSTRAINT "workout_exercise_planned_set_weight_percentage_check" CHECK ("weight_percentage" between 1 and 99),
	CONSTRAINT "workout_exercise_planned_set_pause_seconds_check" CHECK ("pause_seconds" >= 1),
	CONSTRAINT "workout_exercise_planned_set_no_intensity_technique_check" CHECK ("intensity_technique" is not null or ("segment_count" is null and "weight_percentage" is null and "pause_seconds" is null)),
	CONSTRAINT "workout_exercise_planned_set_drop_set_check" CHECK ("intensity_technique" <> 'drop_set' or ("segment_count" is not null and "pause_seconds" is null)),
	CONSTRAINT "workout_exercise_planned_set_rest_pause_set_check" CHECK ("intensity_technique" <> 'rest_pause_set' or ("segment_count" is not null and "pause_seconds" is not null and "weight_percentage" is null))
);
--> statement-breakpoint
ALTER TABLE "workout_exercise" DROP CONSTRAINT "workout_exercise_workout_id_fkey";--> statement-breakpoint
ALTER TABLE "workout_exercise" DROP CONSTRAINT "workout_exercise_workout_id_position_key";--> statement-breakpoint
ALTER TABLE "workout_exercise" DROP CONSTRAINT "workout_exercise_section_check";--> statement-breakpoint
DROP INDEX "workout_exercise_warm_up_for_workout_exercise_id_idx";--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD COLUMN "planned_note" text;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD COLUMN "workout_exercise_group_id" uuid;--> statement-breakpoint
ALTER TABLE "workout_exercise" DROP COLUMN "section";--> statement-breakpoint
ALTER TABLE "workout_exercise" DROP COLUMN "superset";--> statement-breakpoint
ALTER TABLE "workout_exercise" DROP COLUMN "workout_id";--> statement-breakpoint
ALTER TABLE "workout" DROP COLUMN "version";--> statement-breakpoint
ALTER TABLE "workout" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "workout" ALTER COLUMN "started_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_workout_exercise_group_id_position_key" UNIQUE("workout_exercise_group_id","position");--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_warm_up_for_workout_exercise_id_position_key" UNIQUE("warm_up_for_workout_exercise_id","position");--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_workout_exercise_group_id_fkey" FOREIGN KEY ("workout_exercise_group_id") REFERENCES "workout_exercise_group"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise_group" ADD CONSTRAINT "workout_exercise_group_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise_planned_set" ADD CONSTRAINT "workout_exercise_planned_set_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercise"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_parent_check" CHECK (num_nonnulls("workout_exercise_group_id", "warm_up_for_workout_exercise_id") = 1);