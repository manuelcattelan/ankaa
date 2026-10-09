DROP INDEX "workout_user_id_idx1";--> statement-breakpoint
DROP INDEX "workout_user_id_idx";--> statement-breakpoint
CREATE INDEX "workout_user_id_idx" ON "workout" ("user_id");--> statement-breakpoint
ALTER TABLE "workout_exercise_set_segment" RENAME CONSTRAINT "workout_exercise_set_segment_workout_exercise_set_id_positi_key" TO "workout_exercise_set_segment_position_key";--> statement-breakpoint
CREATE UNIQUE INDEX "workout_in_progress_idx" ON "workout" ("user_id") WHERE ("ended_at" is null);