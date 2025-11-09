CREATE TABLE "login_attempts" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ip" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"successful" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;