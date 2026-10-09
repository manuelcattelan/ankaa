CREATE TABLE "exercise" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"amount_unit" text NOT NULL,
	"name" text NOT NULL UNIQUE,
	"weight_type" text NOT NULL,
	CONSTRAINT "exercise_amount_unit_check" CHECK ("amount_unit" in ('repetition', 'second')),
	CONSTRAINT "exercise_weight_type_check" CHECK ("weight_type" in ('total', 'single', 'bodyweight', 'assisted', 'none'))
);
--> statement-breakpoint
CREATE TABLE "exercise_equipment" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"equipment" text NOT NULL,
	"exercise_id" uuid NOT NULL,
	CONSTRAINT "exercise_equipment_exercise_id_equipment_key" UNIQUE("exercise_id","equipment"),
	CONSTRAINT "exercise_equipment_equipment_check" CHECK ("equipment" in ('barbell', 'bench', 'rack'))
);
--> statement-breakpoint
CREATE TABLE "exercise_muscle_group" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"muscle_group" text NOT NULL,
	"muscle_group_role" text NOT NULL,
	CONSTRAINT "exercise_muscle_group_exercise_id_muscle_group_key" UNIQUE("exercise_id","muscle_group"),
	CONSTRAINT "exercise_muscle_group_muscle_group_check" CHECK ("muscle_group" in ('chest', 'triceps', 'front_deltoid')),
	CONSTRAINT "exercise_muscle_group_muscle_group_role_check" CHECK ("muscle_group_role" in ('primary', 'secondary'))
);
--> statement-breakpoint
ALTER TABLE "exercise_equipment" ADD CONSTRAINT "exercise_equipment_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "exercise_muscle_group" ADD CONSTRAINT "exercise_muscle_group_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE RESTRICT;