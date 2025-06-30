-- Add new fields to owner_requests table
ALTER TABLE "owner_requests" ADD COLUMN "first_name" text;
ALTER TABLE "owner_requests" ADD COLUMN "last_name" text;
ALTER TABLE "owner_requests" ADD COLUMN "email" text;
ALTER TABLE "owner_requests" ADD COLUMN "phone_number" text;
ALTER TABLE "owner_requests" ADD COLUMN "address" text;
ALTER TABLE "owner_requests" ADD COLUMN "government_id" text;
ALTER TABLE "owner_requests" ADD COLUMN "date_of_birth" date;
ALTER TABLE "owner_requests" ADD COLUMN "consent_agreement" boolean;
ALTER TABLE "owner_requests" ADD COLUMN "registration_number" text;
ALTER TABLE "owner_requests" ADD COLUMN "hull_identification_number" text;
ALTER TABLE "owner_requests" ADD COLUMN "state_of_registration" text;
ALTER TABLE "owner_requests" ADD COLUMN "insurance_details" text;
ALTER TABLE "owner_requests" ADD COLUMN "purpose" text;

-- Make the new fields NOT NULL after adding them
ALTER TABLE "owner_requests" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "last_name" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "phone_number" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "address" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "government_id" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "date_of_birth" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "consent_agreement" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "registration_number" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "hull_identification_number" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "state_of_registration" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "insurance_details" SET NOT NULL;
ALTER TABLE "owner_requests" ALTER COLUMN "purpose" SET NOT NULL; 