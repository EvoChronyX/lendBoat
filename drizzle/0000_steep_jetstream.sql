CREATE TABLE "boats" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"length" integer NOT NULL,
	"capacity" integer NOT NULL,
	"location" text NOT NULL,
	"daily_rate" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"boat_id" integer NOT NULL,
	"checkin_date" timestamp NOT NULL,
	"checkout_date" timestamp NOT NULL,
	"guests" integer NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"special_requests" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"owner_status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owner_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"address" text NOT NULL,
	"government_id" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"consent_agreement" boolean NOT NULL,
	"business_name" text NOT NULL,
	"boat_name" text NOT NULL,
	"boat_type" text NOT NULL,
	"boat_length" integer NOT NULL,
	"boat_capacity" integer NOT NULL,
	"registration_number" text NOT NULL,
	"hull_identification_number" text NOT NULL,
	"state_of_registration" text NOT NULL,
	"insurance_details" text NOT NULL,
	"daily_rate" numeric(10, 2) NOT NULL,
	"purpose" text NOT NULL,
	"tax_id" text,
	"business_license" text,
	"insurance_certificate" text,
	"marina_location" text,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"owner_id" text NOT NULL,
	"business_name" text NOT NULL,
	"tax_id" text NOT NULL,
	"password" text NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "owners_owner_id_unique" UNIQUE("owner_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "boats" ADD CONSTRAINT "boats_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_requests" ADD CONSTRAINT "owner_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owners" ADD CONSTRAINT "owners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;