CREATE TYPE "public"."announcement_priority" AS ENUM ('low', 'medium', 'high', 'emergency');
--> statement-breakpoint
CREATE TYPE "public"."target_audience" AS ENUM ('all', 'students', 'admins', 'specific');
--> statement-breakpoint
CREATE TYPE "public"."billing_status" AS ENUM (
	'unpaid',
	'fully paid',
	'partially paid',
	'overdue',
	'cancelled'
);
--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM ('card', 'mobile money', 'bank transfer', 'cash');
--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM ('completed', 'failed', 'pending', 'refunded');
--> statement-breakpoint
CREATE TYPE "public"."complaint_action_taken" AS ENUM ('assigned', 'updated', 'resolved', 'rejected');
--> statement-breakpoint
CREATE TYPE "public"."complaint_priority" AS ENUM ('low', 'medium', 'high', 'emergency');
--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM ('pending', 'in-progress', 'resolved', 'rejected');
--> statement-breakpoint
CREATE TYPE "public"."complaint_type" AS ENUM (
	'room condition',
	'staff behavior',
	'amenities',
	'noise',
	'security',
	'billing issue',
	'other'
);
--> statement-breakpoint
CREATE TYPE "public"."maintenance_issue_type" AS ENUM (
	'plumbing',
	'electrical',
	'furniture',
	'cleaning',
	'appliance',
	'structural',
	'pest control',
	'internet/Wi-Fi',
	'other'
);
--> statement-breakpoint
CREATE TYPE "public"."maintenance_priority" AS ENUM ('low', 'medium', 'high', 'emergency');
--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM (
	'pending',
	'assigned',
	'in-progress',
	'completed',
	'rejected'
);
--> statement-breakpoint
CREATE TYPE "public"."allocation_status" AS ENUM ('active', 'expired', 'pending', 'cancelled');
--> statement-breakpoint
CREATE TYPE "public"."hostel_status" AS ENUM ('active', 'inactive', 'under renovation');
--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM (
	'vacant',
	'fully occupied',
	'partially occupied',
	'under maintenance',
	'reserved'
);
--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM ('single', 'double', 'triple', 'quad');
--> statement-breakpoint
CREATE TYPE "public"."access_level" AS ENUM ('regular', 'super', 'support');
--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM ('male', 'female');
--> statement-breakpoint
CREATE TYPE "public"."residency_status" AS ENUM (
	'active',
	'inactive',
	'suspended',
	'graduated',
	'withdrawn'
);
--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM ('student', 'admin');
--> statement-breakpoint
CREATE TYPE "public"."visitor_status" AS ENUM (
	'checked-in',
	'checked-out',
	'pending',
	'cancelled',
	'denied',
	'approved'
);
--> statement-breakpoint
CREATE TABLE "announcement" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "announcement_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "posted_by" integer NOT NULL,
    "title" varchar(150) NOT NULL,
    "content" text NOT NULL,
    "posted_at" timestamp DEFAULT now() NOT NULL,
    "priority" "announcement_priority" DEFAULT 'medium' NOT NULL,
    "target_audience" "target_audience" DEFAULT 'all' NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_reads" (
    "read_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "announcement_reads_read_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "announcement_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "read_date" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "unique_announcement_student" UNIQUE ("announcement_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE "billing" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "billing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "student_id" integer NOT NULL,
    "allocation_id" integer NOT NULL,
    "hostel_id" integer NOT NULL,
    "amount" numeric(10, 2) NOT NULL,
    "description" text NOT NULL,
    "date_issued" timestamp DEFAULT now() NOT NULL,
    "due_date" date NOT NULL,
    "status" "billing_status" DEFAULT 'unpaid' NOT NULL,
    "late_fee" numeric(10, 2) DEFAULT '0.00',
    "paid_amount" numeric(10, 2) DEFAULT '0.00',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "chk_paid_amount" CHECK (
        paid_amount >= 0
        AND paid_amount <= amount
    )
);
--> statement-breakpoint
CREATE TABLE "payment" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "payment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "student_id" integer NOT NULL,
    "billing_id" integer NOT NULL,
    "amount" numeric(10, 2) NOT NULL,
    "payment_date" timestamp DEFAULT now() NOT NULL,
    "transaction_reference" text NOT NULL,
    "payment_method" "payment_method" NOT NULL,
    "status" "payment_status" DEFAULT 'pending' NOT NULL,
    CONSTRAINT "payment_transactionReference_unique" UNIQUE ("transaction_reference")
);
--> statement-breakpoint
CREATE TABLE "complaint" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "complaint_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "student_id" integer NOT NULL,
    "room_id" integer NOT NULL,
    "hostel_id" integer NOT NULL,
    "description" text NOT NULL,
    "type" "complaint_type" NOT NULL,
    "priority" "complaint_priority" DEFAULT 'medium' NOT NULL,
    "status" "complaint_status" DEFAULT 'pending' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "resolved_at" timestamp,
    "resolved_by" integer,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaint_response" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "complaint_response_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "complaint_id" integer NOT NULL,
    "responder_id" integer NOT NULL,
    "response" text NOT NULL,
    "action_taken" "complaint_action_taken" NOT NULL,
    "response_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_request" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "maintenance_request_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "student_id" integer NOT NULL,
    "room_id" integer NOT NULL,
    "hostel_id" integer NOT NULL,
    "issue_type" "maintenance_issue_type" NOT NULL,
    "description" text NOT NULL,
    "request_date" timestamp DEFAULT now() NOT NULL,
    "priority" "maintenance_priority" DEFAULT 'medium' NOT NULL,
    "status" "maintenance_status" DEFAULT 'pending' NOT NULL,
    "assigned_to" integer,
    "resolution_date" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_response" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "maintenance_response_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "maintenance_request_id" integer NOT NULL,
    "responder_id" integer NOT NULL,
    "response_text" text NOT NULL,
    "response_date" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "chk_response_text" CHECK (
        char_length(response_text) > 0
    )
);
--> statement-breakpoint
CREATE TABLE "allocation" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "allocation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "student_id" integer NOT NULL,
    "room_id" integer NOT NULL,
    "allocation_date" date NOT NULL,
    "end_date" date,
    "status" "allocation_status" DEFAULT 'pending' NOT NULL,
    CONSTRAINT "unique_active_allocation" UNIQUE ("student_id", "status"),
    CONSTRAINT "chk_dates" CHECK (
        end_date IS NULL
        OR end_date >= allocation_date
    )
);
--> statement-breakpoint
CREATE TABLE "hostel" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "hostel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "name" text NOT NULL,
    "code" varchar(50) NOT NULL,
    "address" text NOT NULL,
    "contact_number" varchar(20) NOT NULL,
    "email" varchar(255) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "status" "hostel_status" DEFAULT 'active' NOT NULL,
    CONSTRAINT "hostel_code_unique" UNIQUE ("code"),
    CONSTRAINT "hostel_email_unique" UNIQUE ("email")
);
--> statement-breakpoint
CREATE TABLE "room" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "room_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "room_number" varchar(10) NOT NULL,
    "building" varchar(100) NOT NULL,
    "floor" integer NOT NULL,
    "capacity" integer NOT NULL,
    "room_type" "room_type" NOT NULL,
    "current_occupancy" integer DEFAULT 0 NOT NULL,
    "features" text,
    "amount_per_year" numeric(10, 2) NOT NULL,
    "status" "room_status" DEFAULT 'vacant' NOT NULL,
    CONSTRAINT "room_roomNumber_unique" UNIQUE ("room_number"),
    CONSTRAINT "room_building_unique" UNIQUE ("building"),
    CONSTRAINT "unique_room" UNIQUE ("room_number", "building"),
    CONSTRAINT "chk_capacity" CHECK (capacity > 0),
    CONSTRAINT "chk_occupancy" CHECK (
        current_occupancy >= 0
        AND current_occupancy <= capacity
    )
);
--> statement-breakpoint
CREATE TABLE "admin" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "admin_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "user_id" integer NOT NULL,
    "phone_number" varchar(20) NOT NULL,
    "department" text NOT NULL,
    "access_level" "access_level" DEFAULT 'regular' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "student_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "user_id" integer NOT NULL,
    "gender" "gender" NOT NULL,
    "date_of_birth" date NOT NULL,
    "phone_number" varchar(20) NOT NULL,
    "address" text NOT NULL,
    "emergency_contact_name" text NOT NULL,
    "emergency_contact_phone_number" varchar(20) NOT NULL,
    "health_conditions" text,
    "enrollment_date" date,
    "residency_status" "residency_status" DEFAULT 'inactive' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "name" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "role" "roles" DEFAULT 'student' NOT NULL,
    "image" text,
    "email_verified" boolean DEFAULT false NOT NULL,
    "verification_token" text,
    "verification_token_expires_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "last_login" timestamp,
    CONSTRAINT "user_email_unique" UNIQUE ("email")
);
--> statement-breakpoint
CREATE TABLE "visitor" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "visitor_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "student_id" integer NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "phone_number" text NOT NULL,
    "visit_date" date NOT NULL,
    "relationship" text NOT NULL,
    "purpose" text NOT NULL,
    "check_in_time" timestamp,
    "check_out_time" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "status" "visitor_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_logs" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "visitor_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START
        WITH
            1 CACHE 1
    ),
    "visitor_id" integer NOT NULL,
    "check_in_time" timestamp NOT NULL,
    "check_out_time" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcement"
ADD CONSTRAINT "announcement_posted_by_admin_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."admin" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "announcement_reads"
ADD CONSTRAINT "announcement_reads_announcement_id_announcement_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcement" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "announcement_reads"
ADD CONSTRAINT "announcement_reads_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "billing"
ADD CONSTRAINT "billing_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "billing"
ADD CONSTRAINT "billing_allocation_id_allocation_id_fk" FOREIGN KEY ("allocation_id") REFERENCES "public"."allocation" ("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "billing"
ADD CONSTRAINT "billing_hostel_id_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostel" ("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment"
ADD CONSTRAINT "payment_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment"
ADD CONSTRAINT "payment_billing_id_billing_id_fk" FOREIGN KEY ("billing_id") REFERENCES "public"."billing" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "complaint"
ADD CONSTRAINT "complaint_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "complaint"
ADD CONSTRAINT "complaint_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "complaint"
ADD CONSTRAINT "complaint_hostel_id_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostel" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "complaint_response"
ADD CONSTRAINT "complaint_response_complaint_id_complaint_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaint" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "complaint_response"
ADD CONSTRAINT "complaint_response_responder_id_user_id_fk" FOREIGN KEY ("responder_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "maintenance_request"
ADD CONSTRAINT "maintenance_request_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "maintenance_request"
ADD CONSTRAINT "maintenance_request_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "maintenance_request"
ADD CONSTRAINT "maintenance_request_hostel_id_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostel" ("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "maintenance_response"
ADD CONSTRAINT "maintenance_response_maintenance_request_id_maintenance_request_id_fk" FOREIGN KEY ("maintenance_request_id") REFERENCES "public"."maintenance_request" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "maintenance_response"
ADD CONSTRAINT "maintenance_response_responder_id_user_id_fk" FOREIGN KEY ("responder_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "allocation"
ADD CONSTRAINT "allocation_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "allocation"
ADD CONSTRAINT "allocation_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admin"
ADD CONSTRAINT "admin_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "student"
ADD CONSTRAINT "student_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "visitor"
ADD CONSTRAINT "visitor_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student" ("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "visitor_logs"
ADD CONSTRAINT "visitor_logs_visitor_id_visitor_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitor" ("id") ON DELETE cascade ON UPDATE no action;

