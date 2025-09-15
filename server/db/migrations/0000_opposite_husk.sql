CREATE TYPE "public"."roles" AS ENUM('student', 'admin');--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "roles" DEFAULT 'student' NOT NULL,
	"image" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"verification_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

ALTER SEQUENCE user_id_seq RESTART WITH 10000000;

ALTER TABLE "user"
ADD CONSTRAINT user_id_8_digits CHECK (
    id >= 10000000
    AND id <= 99999999
);
