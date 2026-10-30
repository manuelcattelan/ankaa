CREATE TABLE "routine_exercise_group" (
	"id" uuid PRIMARY KEY,
	"position" integer NOT NULL,
	"routine_id" uuid NOT NULL,
	"section" text NOT NULL,
	CONSTRAINT "routine_exercise_group_routine_id_section_position_key" UNIQUE("routine_id","section","position"),
	CONSTRAINT "routine_exercise_group_section_check" CHECK ("section" in ('warm_up', 'main', 'cool_down')),
	CONSTRAINT "routine_exercise_group_position_check" CHECK ("position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "routine_exercise" DROP CONSTRAINT "routine_exercise_routine_id_fkey";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" RENAME COLUMN "variation" TO "intensity_technique";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" RENAME COLUMN "set_type" TO "type";--> statement-breakpoint
ALTER TABLE "routine_exercise" DROP CONSTRAINT "routine_exercise_routine_id_position_key";--> statement-breakpoint
ALTER TABLE "routine_day" DROP CONSTRAINT "routine_day_routine_id_day_of_week_key";--> statement-breakpoint
ALTER TABLE "routine_exercise" DROP CONSTRAINT "routine_exercise_section_check";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP CONSTRAINT "routine_exercise_set_set_type_check";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP CONSTRAINT "routine_exercise_set_variation_check";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP CONSTRAINT "routine_exercise_set_rest_pause_rest_seconds_check";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP CONSTRAINT "routine_exercise_set_rest_pause_segment_count_check";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP CONSTRAINT "routine_exercise_set_drop_set_segment_count_check";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP CONSTRAINT "routine_exercise_set_drop_set_weight_percentage_check";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP CONSTRAINT "routine_exercise_set_rest_pause_check";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP CONSTRAINT "routine_exercise_set_drop_set_check";--> statement-breakpoint
DROP INDEX "routine_exercise_warm_up_for_routine_exercise_id_idx";--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD COLUMN "routine_exercise_group_id" uuid;--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD COLUMN "pause_seconds" integer;--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD COLUMN "segment_count" integer;--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD COLUMN "weight_percentage" integer;--> statement-breakpoint
ALTER TABLE "routine_exercise" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "routine_exercise" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "routine_exercise" DROP COLUMN "routine_id";--> statement-breakpoint
ALTER TABLE "routine_exercise" DROP COLUMN "section";--> statement-breakpoint
ALTER TABLE "routine_exercise" DROP COLUMN "superset";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP COLUMN "drop_set_segment_count";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP COLUMN "drop_set_weight_percentage";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP COLUMN "rest_pause_rest_seconds";--> statement-breakpoint
ALTER TABLE "routine_exercise_set" DROP COLUMN "rest_pause_segment_count";--> statement-breakpoint
ALTER TABLE "routine_day" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "routine_day" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "routine_day" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "routine_day" ADD CONSTRAINT "routine_day_pkey" PRIMARY KEY("routine_id","day_of_week");--> statement-breakpoint
ALTER TABLE "routine" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "routine_exercise" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ALTER COLUMN "is_to_failure" DROP DEFAULT;--> statement-breakpoint
DROP INDEX "routine_user_id_name_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "routine_user_id_name_idx" ON "routine" ("user_id",lower("name")) WHERE ("deleted_at" is null);--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_routine_exercise_group_id_position_key" UNIQUE("routine_exercise_group_id","position");--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_warm_up_for_routine_exercise_id_position_key" UNIQUE("warm_up_for_routine_exercise_id","position");--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_routine_exercise_group_id_fkey" FOREIGN KEY ("routine_exercise_group_id") REFERENCES "routine_exercise_group"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine_exercise_group" ADD CONSTRAINT "routine_exercise_group_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine" ADD CONSTRAINT "routine_name_check" CHECK ("name" <> '');--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_parent_check" CHECK (num_nonnulls("routine_exercise_group_id", "warm_up_for_routine_exercise_id") = 1);--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_type_check" CHECK ("type" in ('warm_up', 'working'));--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_intensity_technique_check" CHECK ("intensity_technique" in ('drop_set', 'rest_pause_set'));--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_segment_count_check" CHECK ("segment_count" >= 2);--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_weight_percentage_check" CHECK ("weight_percentage" between 1 and 99);--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_pause_seconds_check" CHECK ("pause_seconds" >= 1);--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_no_intensity_technique_check" CHECK ("intensity_technique" is not null or ("segment_count" is null and "weight_percentage" is null and "pause_seconds" is null));--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_rest_pause_set_check" CHECK ("intensity_technique" <> 'rest_pause_set' or ("segment_count" is not null and "pause_seconds" is not null and "weight_percentage" is null));--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_drop_set_check" CHECK ("intensity_technique" <> 'drop_set' or ("segment_count" is not null and "pause_seconds" is null));--> statement-breakpoint
ALTER TABLE "workout_exercise_set" DROP CONSTRAINT "workout_exercise_set_variation_check", ADD CONSTRAINT "workout_exercise_set_variation_check" CHECK ("variation" in ('drop_set', 'rest_pause_set'));