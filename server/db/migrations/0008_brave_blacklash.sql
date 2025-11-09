ALTER TABLE "login_attempts" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "login_attempts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "login_attempts" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD COLUMN "success" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "login_attempts" DROP COLUMN "successful";