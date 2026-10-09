CREATE TABLE "workout" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"routine_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"user_id" text NOT NULL,
	"version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercise" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"amount_unit" text NOT NULL,
	"exercise_id" uuid NOT NULL,
	"note" text,
	"position" integer NOT NULL,
	"section" text NOT NULL,
	"skip_reason" text,
	"skip_reason_note" text,
	"superset" integer,
	"warm_up_for_workout_exercise_id" uuid,
	"weight_type" text NOT NULL,
	"workout_id" uuid NOT NULL,
	CONSTRAINT "workout_exercise_workout_id_position_key" UNIQUE("workout_id","position"),
	CONSTRAINT "workout_exercise_amount_unit_check" CHECK ("amount_unit" in ('repetition', 'second')),
	CONSTRAINT "workout_exercise_weight_type_check" CHECK ("weight_type" in ('total', 'single', 'bodyweight', 'assisted', 'none')),
	CONSTRAINT "workout_exercise_section_check" CHECK ("section" in ('warm_up', 'main', 'cool_down')),
	CONSTRAINT "workout_exercise_skip_reason_check" CHECK ("skip_reason" in ('low_on_time', 'low_energy', 'pain', 'other')),
	CONSTRAINT "workout_exercise_position_check" CHECK ("position" >= 0),
	CONSTRAINT "workout_exercise_skip_check" CHECK ("skip_reason" is not null or "skip_reason_note" is null)
);
--> statement-breakpoint
CREATE TABLE "workout_exercise_set" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_to_failure" boolean NOT NULL,
	"position" integer NOT NULL,
	"set_type" text NOT NULL,
	"tempo" text,
	"variation" text,
	"workout_exercise_id" uuid NOT NULL,
	CONSTRAINT "workout_exercise_set_workout_exercise_id_position_key" UNIQUE("workout_exercise_id","position"),
	CONSTRAINT "workout_exercise_set_set_type_check" CHECK ("set_type" in ('warm_up', 'working')),
	CONSTRAINT "workout_exercise_set_variation_check" CHECK ("variation" in ('rest_pause', 'drop_set')),
	CONSTRAINT "workout_exercise_set_tempo_check" CHECK ("tempo" ~ '^[0-9]{1,2}-[0-9]{1,2}-([0-9]{1,2}|X)-[0-9]{1,2}$'),
	CONSTRAINT "workout_exercise_set_position_check" CHECK ("position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "workout_exercise_set_segment" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"amount" integer,
	"position" integer NOT NULL,
	"weight_unit" text,
	"weight_value" numeric(6,2),
	"workout_exercise_set_id" uuid NOT NULL,
	CONSTRAINT "workout_exercise_set_segment_workout_exercise_set_id_positi_key" UNIQUE("workout_exercise_set_id","position"),
	CONSTRAINT "workout_exercise_set_segment_weight_unit_check" CHECK ("weight_unit" in ('kilogram', 'pound')),
	CONSTRAINT "workout_exercise_set_segment_position_check" CHECK ("position" >= 0),
	CONSTRAINT "workout_exercise_set_segment_amount_check" CHECK ("amount" >= 1),
	CONSTRAINT "workout_exercise_set_segment_weight_value_check" CHECK ("weight_value" >= 0.01),
	CONSTRAINT "workout_exercise_set_segment_weight_check" CHECK ("weight_value" is null or "weight_unit" is not null)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "workout_user_id_idx" ON "workout" ("user_id") WHERE ("ended_at" is null);--> statement-breakpoint
CREATE INDEX "workout_user_id_idx1" ON "workout" ("user_id");--> statement-breakpoint
CREATE INDEX "workout_routine_id_idx" ON "workout" ("routine_id");--> statement-breakpoint
CREATE INDEX "workout_exercise_exercise_id_idx" ON "workout_exercise" ("exercise_id");--> statement-breakpoint
CREATE INDEX "workout_exercise_warm_up_for_workout_exercise_id_idx" ON "workout_exercise" ("warm_up_for_workout_exercise_id");--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_warm_up_for_workout_exercise_id_fkey" FOREIGN KEY ("warm_up_for_workout_exercise_id") REFERENCES "workout_exercise"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise_set" ADD CONSTRAINT "workout_exercise_set_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercise"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercise_set_segment" ADD CONSTRAINT "workout_exercise_set_segment_workout_exercise_set_id_fkey" FOREIGN KEY ("workout_exercise_set_id") REFERENCES "workout_exercise_set"("id") ON DELETE CASCADE;