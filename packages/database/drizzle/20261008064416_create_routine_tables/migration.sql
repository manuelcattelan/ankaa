CREATE TABLE "routine" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_day" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"day_of_week" text NOT NULL,
	"routine_id" uuid NOT NULL,
	CONSTRAINT "routine_day_routine_id_day_of_week_key" UNIQUE("routine_id","day_of_week"),
	CONSTRAINT "routine_day_day_of_week_check" CHECK ("day_of_week" in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'))
);
--> statement-breakpoint
CREATE TABLE "routine_exercise" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"note" text,
	"position" integer NOT NULL,
	"routine_id" uuid NOT NULL,
	"section" text NOT NULL,
	"superset" integer,
	"warm_up_for_routine_exercise_id" uuid,
	CONSTRAINT "routine_exercise_routine_id_position_key" UNIQUE("routine_id","position"),
	CONSTRAINT "routine_exercise_section_check" CHECK ("section" in ('warm_up', 'main', 'cool_down')),
	CONSTRAINT "routine_exercise_position_check" CHECK ("position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "routine_exercise_set" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"amount" integer,
	"drop_set_segment_count" integer,
	"drop_set_weight_percentage" integer,
	"is_to_failure" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"rest_pause_rest_seconds" integer,
	"rest_pause_segment_count" integer,
	"rest_seconds" integer,
	"routine_exercise_id" uuid NOT NULL,
	"set_type" text NOT NULL,
	"tempo" text,
	"variation" text,
	CONSTRAINT "routine_exercise_set_routine_exercise_id_position_key" UNIQUE("routine_exercise_id","position"),
	CONSTRAINT "routine_exercise_set_set_type_check" CHECK ("set_type" in ('warm_up', 'working')),
	CONSTRAINT "routine_exercise_set_variation_check" CHECK ("variation" in ('rest_pause', 'drop_set')),
	CONSTRAINT "routine_exercise_set_tempo_check" CHECK ("tempo" ~ '^[0-9]{1,2}-[0-9]{1,2}-([0-9]{1,2}|X)-[0-9]{1,2}$'),
	CONSTRAINT "routine_exercise_set_position_check" CHECK ("position" >= 0),
	CONSTRAINT "routine_exercise_set_amount_check" CHECK ("amount" >= 1),
	CONSTRAINT "routine_exercise_set_rest_seconds_check" CHECK ("rest_seconds" >= 1),
	CONSTRAINT "routine_exercise_set_rest_pause_rest_seconds_check" CHECK ("rest_pause_rest_seconds" >= 1),
	CONSTRAINT "routine_exercise_set_rest_pause_segment_count_check" CHECK ("rest_pause_segment_count" >= 2),
	CONSTRAINT "routine_exercise_set_drop_set_segment_count_check" CHECK ("drop_set_segment_count" >= 2),
	CONSTRAINT "routine_exercise_set_drop_set_weight_percentage_check" CHECK ("drop_set_weight_percentage" between 1 and 99),
	CONSTRAINT "routine_exercise_set_check" CHECK (case when "variation" = 'rest_pause' then "rest_pause_rest_seconds" is not null and "rest_pause_segment_count" is not null else "rest_pause_rest_seconds" is null and "rest_pause_segment_count" is null end),
	CONSTRAINT "routine_exercise_set_check1" CHECK (case when "variation" = 'drop_set' then "drop_set_segment_count" is not null else "drop_set_segment_count" is null and "drop_set_weight_percentage" is null end)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "routine_user_id_name_idx" ON "routine" ("user_id","name") WHERE ("deleted_at" is null);--> statement-breakpoint
CREATE INDEX "routine_user_id_idx" ON "routine" ("user_id");--> statement-breakpoint
CREATE INDEX "routine_exercise_exercise_id_idx" ON "routine_exercise" ("exercise_id");--> statement-breakpoint
CREATE INDEX "routine_exercise_warm_up_for_routine_exercise_id_idx" ON "routine_exercise" ("warm_up_for_routine_exercise_id");--> statement-breakpoint
ALTER TABLE "routine" ADD CONSTRAINT "routine_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine_day" ADD CONSTRAINT "routine_day_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine_exercise" ADD CONSTRAINT "routine_exercise_warm_up_for_routine_exercise_id_fkey" FOREIGN KEY ("warm_up_for_routine_exercise_id") REFERENCES "routine_exercise"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine_exercise_set" ADD CONSTRAINT "routine_exercise_set_routine_exercise_id_fkey" FOREIGN KEY ("routine_exercise_id") REFERENCES "routine_exercise"("id") ON DELETE CASCADE;