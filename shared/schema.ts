import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, owner, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ownerRequests = pgTable("owner_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  taxId: text("tax_id").notNull(),
  businessLicense: text("business_license"), // file path
  insuranceCertificate: text("insurance_certificate"), // file path
  boatName: text("boat_name").notNull(),
  boatType: text("boat_type").notNull(),
  boatLength: integer("boat_length").notNull(),
  boatCapacity: integer("boat_capacity").notNull(),
  marinaLocation: text("marina_location").notNull(),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const owners = pgTable("owners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  taxId: text("tax_id").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const boats = pgTable("boats", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => owners.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  length: integer("length").notNull(),
  capacity: integer("capacity").notNull(),
  location: text("location").notNull(),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  boatId: integer("boat_id").references(() => boats.id).notNull(),
  checkinDate: timestamp("checkin_date").notNull(),
  checkoutDate: timestamp("checkout_date").notNull(),
  guests: integer("guests").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  specialRequests: text("special_requests"),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  role: true,
});

export const insertOwnerRequestSchema = createInsertSchema(ownerRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  adminNotes: true,
});

export const insertBoatSchema = createInsertSchema(boats).omit({
  id: true,
  createdAt: true,
  rating: true,
  isActive: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type OwnerRequest = typeof ownerRequests.$inferSelect;
export type InsertOwnerRequest = z.infer<typeof insertOwnerRequestSchema>;
export type Owner = typeof owners.$inferSelect;
export type Boat = typeof boats.$inferSelect;
export type InsertBoat = z.infer<typeof insertBoatSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
