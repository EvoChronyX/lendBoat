import { pgTable, text, serial, integer, boolean, timestamp, decimal, date, varchar, numeric } from "../server/node_modules/drizzle-orm/pg-core";
import { z } from "../server/node_modules/zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  profileImageUrl: text("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const ownerRequests = pgTable("owner_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  address: text("address").notNull(),
  governmentId: text("government_id").notNull(),
  governmentIdNum: text("government_id_num"),
  dateOfBirth: date("date_of_birth").notNull(),
  businessName: text("business_name").notNull(),
  boatName: text("boat_name").notNull(),
  boatType: text("boat_type").notNull(),
  boatLength: integer("boat_length").notNull(),
  boatCapacity: integer("boat_capacity").notNull(),
  registrationNumber: text("registration_number").notNull(),
  hullIdentificationNumber: text("hull_identification_number").notNull(),
  stateOfRegistration: text("state_of_registration").notNull(),
  insuranceDetails: text("insurance_details").notNull(),
  dailyRate: text("daily_rate").notNull(),
  purpose: text("purpose").notNull(),
  businessLicense: text("business_license"),
  insuranceCertificate: text("insurance_certificate"),
  marinaLocation: text("marina_location"),
  description: text("description"),
  ownerId: text("owner_id").notNull(),
  password: text("password").notNull(),
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const owners = pgTable("owners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  address: text("address").notNull(),
  governmentId: text("government_id").notNull(),
  governmentIdNum: text("government_id_num"),
  dateOfBirth: date("date_of_birth").notNull(),
  businessName: text("business_name").notNull(),
  boatName: text("boat_name").notNull(),
  boatType: text("boat_type").notNull(),
  boatLength: integer("boat_length").notNull(),
  boatCapacity: integer("boat_capacity").notNull(),
  registrationNumber: text("registration_number").notNull(),
  hullIdentificationNumber: text("hull_identification_number").notNull(),
  stateOfRegistration: text("state_of_registration").notNull(),
  insuranceDetails: text("insurance_details").notNull(),
  dailyRate: text("daily_rate").notNull(),
  purpose: text("purpose").notNull(),
  businessLicense: text("business_license"),
  insuranceCertificate: text("insurance_certificate"),
  marinaLocation: text("marina_location"),
  description: text("description"),
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  ownerId: text("owner_id").notNull(),
  password: text("password").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const boats = pgTable("boats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  length: integer("length").notNull(),
  capacity: integer("capacity").notNull(),
  location: text("location").notNull(),
  dailyRate: text("daily_rate").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  images: text("images"),
  rating: text("rating").default("0.0"),
  isActive: boolean("is_active").default(true),
  ownerId: integer("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  boatId: integer("boat_id").notNull(),
  checkinDate: text("checkin_date").notNull(),
  checkoutDate: text("checkout_date").notNull(),
  guests: text("guests").notNull(),
  totalAmount: text("total_amount").notNull(),
  status: text("status").default("pending").notNull(),
  paymentStatus: text("payment_status"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  secretKey: text("secret_key"),
  specialRequests: text("special_requests"),
  ownerStatus: text("owner_status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Owner = typeof owners.$inferSelect;
export type InsertOwner = typeof owners.$inferInsert;

export type OwnerRequest = typeof ownerRequests.$inferSelect;
export type InsertOwnerRequest = typeof ownerRequests.$inferInsert;

export type Boat = typeof boats.$inferSelect;
export type InsertBoat = typeof boats.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

export const insertUserSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  profileImageUrl: z.string().optional().nullable(),
  stripeCustomerId: z.string().optional().nullable(),
  stripeSubscriptionId: z.string().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export const insertOwnerRequestSchema = z.object({
  userId: z.number(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  governmentId: z.string().min(1, "Government ID is required"),
  governmentIdNum: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  businessName: z.string().min(1, "Business name is required"),
  boatName: z.string().min(1, "Boat name is required"),
  boatType: z.string().min(1, "Boat type is required"),
  boatLength: z.number().min(1, "Boat length is required"),
  boatCapacity: z.number().min(1, "Boat capacity is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  hullIdentificationNumber: z.string().min(1, "Hull identification number is required"),
  stateOfRegistration: z.string().min(1, "State of registration is required"),
  insuranceDetails: z.string().min(1, "Insurance details are required"),
  dailyRate: z.string().min(1, "Daily rate is required"),
  purpose: z.string().min(1, "Purpose is required"),
  businessLicense: z.string().optional(),
  insuranceCertificate: z.string().optional(),
  marinaLocation: z.string().optional(),
  description: z.string().optional(),
});

export const insertBookingSchema = z.object({
  userId: z.string(),
  updatedAt: z.date().optional().nullable(),
  boatId: z.number(),
  totalAmount: z.string(),
  secretKey: z.string().optional().nullable(),
  paymentStatus: z.string().optional().nullable(),
  stripePaymentIntentId: z.string().optional().nullable(),
  checkinDate: z.string(),
  checkoutDate: z.string(),
  guests: z.string(),
  specialRequests: z.string().optional().nullable(),
  ownerStatus: z.string().optional().nullable(),
});
