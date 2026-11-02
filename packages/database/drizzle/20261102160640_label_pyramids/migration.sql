ALTER TABLE "routine_exercise" ADD COLUMN "pyramid_label" text;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD COLUMN "pyramid_label" text;--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_pyramid_label_check" CHECK ("pyramid_label" in ('pyramid', 'reverse_pyramid'));--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_pyramid_label_check" CHECK ("pyramid_label" in ('pyramid', 'reverse_pyramid'));