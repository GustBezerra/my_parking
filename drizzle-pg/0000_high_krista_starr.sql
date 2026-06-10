CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"spot_id" integer NOT NULL,
	"token" text NOT NULL,
	"entry_time" text NOT NULL,
	"exit_time" text,
	CONSTRAINT "entries_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "parking_spots" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" integer NOT NULL,
	"status" text DEFAULT 'disponivel' NOT NULL,
	CONSTRAINT "parking_spots_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_spot_id_parking_spots_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."parking_spots"("id") ON DELETE no action ON UPDATE no action;