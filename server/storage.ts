import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  owners,
  ownerRequests,
  boats,
  bookings,
  contacts,
  type User,
  type InsertUser,
  type OwnerRequest,
  type InsertOwnerRequest,
  type Owner,
  type Boat,
  type InsertBoat,
  type Booking,
  type InsertBooking
} from "../shared/schema";
import { eq, desc, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

process.env.DATABASE_URL="postgresql://boat_rental_owner:npg_uA2vYrDzUm4K@ep-shiny-grass-a1oe4o4x-pooler.ap-southeast-1.aws.neon.tech/boat_rental?sslmode=require&channel_binding=require";
process.env.SENDGRID_API_KEY="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";
process.env.FROM_EMAIL="rohithoutlook.id@gmail.com";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

// Helper function to generate 7-digit ID
function generate7DigitId(): string {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

// Type for InsertOwner
type InsertOwner = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  governmentId: string;
  governmentIdNum?: string | null;
  dateOfBirth: Date;
  businessName: string;
  boatName: string;
  boatType: string;
  boatLength: number;
  boatCapacity: number;
  registrationNumber: string;
  hullIdentificationNumber: string;
  stateOfRegistration: string;
  insuranceDetails: string;
  dailyRate: string;
  purpose: string;
  businessLicense?: string | null;
  insuranceCertificate?: string | null;
  marinaLocation?: string | null;
  description?: string | null;
  status?: string;
  adminNotes?: string | null;
  ownerId: string;
  password: string;
  isApproved?: boolean;
  createdAt?: Date;
};

export interface IStorage {
  // User management
  createUser(user: Omit<InsertUser, 'userId'>): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: number, updates: Partial<User>): Promise<User | null>;
  updateUserProfile(userId: number, updates: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<User | null>;

  // Boat management
  createBoat(boat: InsertBoat): Promise<Boat>;
  getBoatById(id: number): Promise<Boat | null>;
  getAllBoats(): Promise<Boat[]>;
  getBoatsByOwnerId(ownerId: number): Promise<Boat[]>;
  updateBoat(id: number, updates: Partial<Boat>): Promise<Boat | null>;
  deleteBoat(id: number): Promise<boolean>;

  // Owner management
  createOwner(owner: InsertOwner): Promise<Owner>;
  getOwnerById(id: number): Promise<Owner | null>;
  getOwnerByOwnerId(ownerId: string): Promise<Owner | null>;
  getOwnerByUserId(userId: number): Promise<Owner | null>;
  getOwnerByEmail(email: string): Promise<Owner | null>;
  updateOwner(id: number, updates: Partial<Owner>): Promise<Owner | null>;
  deleteOwner(id: number): Promise<boolean>;
  getAllOwners(): Promise<Owner[]>;
  updateOwnerBusinessName(ownerId: number, businessName: string): Promise<Owner | null>;

  // Owner Requests
  createOwnerRequest(data: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    governmentId: string;
    governmentIdNum?: string | null;
    dateOfBirth: Date;
    businessName: string;
    boatName: string;
    boatType: string;
    boatLength: number;
    boatCapacity: number;
    registrationNumber: string;
    hullIdentificationNumber: string;
    stateOfRegistration: string;
    insuranceDetails: string;
    dailyRate: string;
    purpose: string;
    ownerId: string;
    password: string;
    businessLicense?: string | null;
    insuranceCertificate?: string | null;
    marinaLocation?: string | null;
    description?: string | null;
  }): Promise<OwnerRequest>;
  getOwnerRequestById(id: number): Promise<OwnerRequest | null>;
  getPendingOwnerRequests(): Promise<OwnerRequest[]>;
  getAllOwnerRequests(): Promise<OwnerRequest[]>;
  updateOwnerRequest(id: number, updates: Partial<OwnerRequest>): Promise<OwnerRequest | null>;
  deleteOwnerRequest(id: number): Promise<boolean>;

  // Booking management
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | null>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingsByBoatId(boatId: number): Promise<Booking[]>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | null>;
  deleteBooking(id: number): Promise<boolean>;
  getAllBookings(): Promise<Booking[]>;
  getBookingsForOwner(ownerUserId: number): Promise<(Booking & { boat: Boat; user: User })[]>;
  updateBookingStatus(bookingId: number, status: string): Promise<Booking | null>;
  updateBookingOwnerStatus(bookingId: number, status: string): Promise<Booking | null>;

  // Contact management
  createContact(contact: { firstName: string; lastName: string; email: string; subject: string; message: string; status?: string }): Promise<any>;
  getContactById(id: number): Promise<any | null>;
  getAllContacts(): Promise<any[]>;
  updateContact(id: number, updates: Partial<any>): Promise<any | null>;
  deleteContact(id: number): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
  // Users
  async createUser(user: Omit<InsertUser, 'userId'>): Promise<User> {
    // Generate a unique userId
    const userId = Math.floor(Math.random() * 1000000) + 1000000;
    const [newUser] = await db.insert(users).values({ ...user, userId }).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.userId, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const result = await db.update(users).set(updates).where(eq(users.userId, id)).returning();
    return result[0];
  }

  async updateUserProfile(userId: number, updates: Partial<User>): Promise<User | null> {
    const result = await db.update(users).set(updates).where(eq(users.userId, userId)).returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.userId, id)).returning();
    return result.length > 0;
  }

  async updateUserRole(userId: number, role: string): Promise<User | null> {
    const result = await db.update(users).set({ role }).where(eq(users.userId, userId)).returning();
    return result[0];
  }

  // Owner Requests
  async createOwnerRequest(data: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    governmentId: string;
    governmentIdNum?: string | null;
    dateOfBirth: Date;
    businessName: string;
    boatName: string;
    boatType: string;
    boatLength: number;
    boatCapacity: number;
    registrationNumber: string;
    hullIdentificationNumber: string;
    stateOfRegistration: string;
    insuranceDetails: string;
    dailyRate: string;
    purpose: string;
    ownerId: string;
    password: string;
    businessLicense?: string | null;
    insuranceCertificate?: string | null;
    marinaLocation?: string | null;
    description?: string | null;
  }): Promise<OwnerRequest> {
    const [ownerRequest] = await db
      .insert(ownerRequests)
      .values({
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        governmentId: data.governmentId,
        governmentIdNum: data.governmentIdNum,
        dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
        businessName: data.businessName,
        boatName: data.boatName,
        boatType: data.boatType,
        boatLength: data.boatLength,
        boatCapacity: data.boatCapacity,
        registrationNumber: data.registrationNumber,
        hullIdentificationNumber: data.hullIdentificationNumber,
        stateOfRegistration: data.stateOfRegistration,
        insuranceDetails: data.insuranceDetails,
        dailyRate: data.dailyRate,
        purpose: data.purpose,
        ownerId: data.ownerId,
        password: data.password,
        businessLicense: data.businessLicense,
        insuranceCertificate: data.insuranceCertificate,
        marinaLocation: data.marinaLocation,
        description: data.description,
        status: "pending",
      })
      .returning();

    return ownerRequest;
  }

  async getPendingOwnerRequests(): Promise<OwnerRequest[]> {
    return await db.select().from(ownerRequests).where(eq(ownerRequests.status, "pending")).orderBy(desc(ownerRequests.createdAt));
  }

  async getAllOwnerRequests(): Promise<OwnerRequest[]> {
    return await db.select().from(ownerRequests).orderBy(desc(ownerRequests.createdAt));
  }

  async getOwnerRequestById(id: number): Promise<OwnerRequest | null> {
    const [request] = await db.select().from(ownerRequests).where(eq(ownerRequests.id, id));
    return request;
  }

  async updateOwnerRequest(id: number, updates: Partial<OwnerRequest>): Promise<OwnerRequest | null> {
    const result = await db.update(ownerRequests).set(updates).where(eq(ownerRequests.id, id)).returning();
    return result[0];
  }

  async deleteOwnerRequest(id: number): Promise<boolean> {
    const result = await db.delete(ownerRequests).where(eq(ownerRequests.id, id)).returning();
    return result.length > 0;
  }

  // Owners
  async createOwner(owner: InsertOwner): Promise<Owner> {
    const [newOwner] = await db.insert(owners).values({
      ...owner,
      dateOfBirth: owner.dateOfBirth.toISOString().split('T')[0],
      status: owner.status || "approved",
      createdAt: owner.createdAt || new Date(),
      updatedAt: new Date()
    }).returning();
    return newOwner;
  }

  async getOwnerById(id: number): Promise<Owner | null> {
    const [owner] = await db.select().from(owners).where(eq(owners.id, id));
    return owner;
  }

  async getOwnerByUserId(userId: number): Promise<Owner | null> {
    const [owner] = await db.select().from(owners).where(eq(owners.userId, userId));
    return owner;
  }

  async getAllOwners(): Promise<Owner[]> {
    return await db.select().from(owners).orderBy(desc(owners.createdAt));
  }

  async getOwnerByOwnerId(ownerId: string): Promise<Owner | null> {
    const result = await db.select().from(owners).where(eq(owners.ownerId, ownerId));
    return result[0];
  }

  async getOwnerByEmail(email: string): Promise<Owner | null> {
    const [owner] = await db.select().from(owners).where(eq(owners.email, email));
    return owner;
  }

  async updateOwner(id: number, updates: Partial<Owner>): Promise<Owner | null> {
    const result = await db.update(owners).set(updates).where(eq(owners.id, id)).returning();
    return result[0];
  }

  async updateOwnerBusinessName(ownerId: number, businessName: string): Promise<Owner | null> {
    const result = await db.update(owners).set({ businessName }).where(eq(owners.id, ownerId)).returning();
    return result[0];
  }

  async deleteOwner(id: number): Promise<boolean> {
    const result = await db.delete(owners).where(eq(owners.id, id)).returning();
    return result.length > 0;
  }

  // Boats
  async createBoat(boat: InsertBoat): Promise<Boat> {
    const { id, ...boatData } = boat as any;
    const [newBoat] = await db.insert(boats).values(boatData).returning();
    return newBoat;
  }

  async getAllBoats(): Promise<Boat[]> {
    return await db.select().from(boats).where(eq(boats.isActive, true)).orderBy(desc(boats.createdAt));
  }

  async getBoatsByOwnerId(ownerId: number): Promise<Boat[]> {
    return await db.select().from(boats).where(eq(boats.ownerId, ownerId));
  }

  async getBoatById(id: number): Promise<Boat | null> {
    const [boat] = await db.select().from(boats).where(eq(boats.id, id));
    return boat;
  }

  async updateBoat(id: number, updates: Partial<Boat>): Promise<Boat | null> {
    const result = await db.update(boats).set(updates).where(eq(boats.id, id)).returning();
    return result[0];
  }

  async deleteBoat(id: number): Promise<boolean> {
    const result = await db.delete(boats).where(eq(boats.id, id)).returning();
    return result.length > 0;
  }

  // Bookings
  async createBooking(booking: InsertBooking): Promise<Booking> {
    console.log("Creating booking with data:", booking);
    const { id, ...bookingData } = booking as any;
    console.log("Booking data after removing id:", bookingData);
    const [newBooking] = await db.insert(bookings).values(bookingData).returning();
    console.log("Created booking:", newBooking);
    return newBooking;
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId.toString())).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByBoatId(boatId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.boatId, boatId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: number): Promise<Booking | null> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingsForOwner(ownerUserId: number): Promise<(Booking & { boat: Boat; user: User })[]> {
    // Get all boats for this owner
    const owner = await this.getOwnerByUserId(ownerUserId);
    if (!owner) return [];
    const boatsList = await db.select().from(boats).where(eq(boats.ownerId, owner.id));
    const boatIds = boatsList.map(b => b.id);
    if (boatIds.length === 0) return [];
    // Get all bookings for these boats
    const bookingsList = await db.select().from(bookings).where(inArray(bookings.boatId, boatIds));
    // Attach boat and user info
    const result: (Booking & { boat: Boat; user: User })[] = [];
    for (const booking of bookingsList) {
      const boat = boatsList.find(b => b.id === booking.boatId)!;
      const user = await this.getUserById(parseInt(booking.userId));
      if (user) result.push({ ...booking, boat, user });
    }
    return result;
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | null> {
    const result = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return result[0];
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id)).returning();
    return result.length > 0;
  }

  async updateBookingStatus(bookingId: number, status: string): Promise<Booking | null> {
    const result = await db.update(bookings).set({ status }).where(eq(bookings.id, bookingId)).returning();
    return result[0];
  }

  async updateBookingOwnerStatus(bookingId: number, status: string): Promise<Booking | null> {
    const result = await db.update(bookings).set({ status }).where(eq(bookings.id, bookingId)).returning();
    return result[0];
  }

  static async generateUniqueOwnerId(): Promise<string> {
    let ownerId: string;
    let isUnique = false;
    
    while (!isUnique) {
      ownerId = generate7DigitId();
      
      // Check if this owner ID already exists
      const existing = await db
        .select()
        .from(ownerRequests)
        .where(eq(ownerRequests.ownerId, ownerId))
        .limit(1);
      
      if (existing.length === 0) {
        isUnique = true;
      }
    }
    
    return ownerId!;
  }

  // Contact management
  async createContact(contact: { firstName: string; lastName: string; email: string; subject: string; message: string; status?: string }): Promise<any> {
    const { id, ...contactData } = contact as any;
    const [newContact] = await db.insert(contacts).values(contactData).returning();
    return newContact;
  }

  async getContactById(id: number): Promise<any | null> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async getAllContacts(): Promise<any[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async updateContact(id: number, updates: Partial<any>): Promise<any | null> {
    const result = await db.update(contacts).set(updates).where(eq(contacts.id, id)).returning();
    return result[0];
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new PostgresStorage();

// Initialize with dummy data
export async function initializeDummyData() {
  try {
    console.log("Starting dummy data initialization...");
    
    // Check if data already exists
    const existingUsers = await storage.getAllUsers();
    const existingBoats = await storage.getAllBoats();
    const existingOwnerRequests = await storage.getAllOwnerRequests();
    
    if (existingUsers.length > 0 && existingBoats.length > 0 && existingOwnerRequests.length > 0) {
      console.log("Database already seeded, skipping initialization");
      return;
    }

    // Create admin user only if it doesn't exist
    let adminUser = await storage.getUserByEmail("admin@boatrental.com");
    if (!adminUser) {
      adminUser = await storage.createUser({
        firstName: "Admin",
        lastName: "User",
        email: "admin@boatrental.com",
        phone: "+1555000000",
        password: bcrypt.hashSync("newadmin", 10),
      });
      await storage.updateUser(adminUser.userId, { role: "admin" });
    }

    // Create sample users and owners only if they don't exist
    let user1 = await storage.getUserByEmail("john@example.com");
    if (!user1) {
      user1 = await storage.createUser({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1555123456",
        password: bcrypt.hashSync("johnuser123", 10),
      });
    }
    
    let owner1 = await storage.getOwnerByUserId(user1.userId);
    if (!owner1) {
      const owner1Id = await PostgresStorage.generateUniqueOwnerId();
      owner1 = await storage.createOwner({
        userId: user1.userId,
        firstName: "Ocean",
        lastName: "Adventures",
        email: "ocean@example.com",
        phoneNumber: "+1555123456",
        address: "123 Ocean St, Miami, FL 33139",
        governmentId: "Driver's License",
        governmentIdNum: "DL123456789",
        dateOfBirth: new Date("1980-05-15"),
        businessName: "Ocean Adventures LLC",
        boatName: "Ocean Dream",
        boatType: "Yacht",
        boatLength: 45,
        boatCapacity: 12,
        registrationNumber: "REG123456",
        hullIdentificationNumber: "HIN123456789",
        stateOfRegistration: "Florida",
        insuranceDetails: "Comprehensive coverage with $1M liability",
        dailyRate: "850.00",
        purpose: "recreational",
        businessLicense: "BL123456789",
        insuranceCertificate: "IC123456789",
        marinaLocation: "Miami Marina, Miami, FL",
        description: "Luxury yacht perfect for sunset cruises and special occasions. Features premium amenities, spacious deck, and professional crew.",
        status: "approved",
        ownerId: owner1Id,
        password: bcrypt.hashSync("password123", 10),
        isApproved: true,
        createdAt: new Date()
      });
      await storage.updateUser(user1.userId, { role: "owner" });
    }

    let user2 = await storage.getUserByEmail("jane@example.com");
    if (!user2) {
      user2 = await storage.createUser({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        phone: "+1555234567",
        password: bcrypt.hashSync("janeuser123", 10),
      });
    }
    
    let owner2 = await storage.getOwnerByUserId(user2.userId);
    if (!owner2) {
      const owner2Id = await PostgresStorage.generateUniqueOwnerId();
      owner2 = await storage.createOwner({
        userId: user2.userId,
        firstName: "Marina",
        lastName: "Dreams",
        email: "marina@example.com",
        phoneNumber: "+1555234567",
        address: "456 Marina Ave, Miami Beach, FL 33139",
        governmentId: "Driver's License",
        governmentIdNum: "DL987654321",
        dateOfBirth: new Date("1985-07-20"),
        businessName: "Marina Dreams LLC",
        boatName: "Sea Breeze",
        boatType: "Catamaran",
        boatLength: 40,
        boatCapacity: 10,
        registrationNumber: "REG987654",
        hullIdentificationNumber: "HIN987654321",
        stateOfRegistration: "Florida",
        insuranceDetails: "Comprehensive coverage with $1M liability",
        dailyRate: "650.00",
        purpose: "recreational",
        businessLicense: "BL987654321",
        insuranceCertificate: "IC987654321",
        marinaLocation: "Miami Beach Marina, Miami Beach, FL",
        description: "Beautiful catamaran perfect for group adventures and sunset sails. Stable and spacious with panoramic views.",
        status: "approved",
        ownerId: owner2Id,
        password: bcrypt.hashSync("password123", 10),
        isApproved: true,
        createdAt: new Date()
      });
      await storage.updateUser(user2.userId, { role: "owner" });
    }

    let user3 = await storage.getUserByEmail("mike@example.com");
    if (!user3) {
      user3 = await storage.createUser({
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike@example.com",
        phone: "+1555345678",
        password: bcrypt.hashSync("mikeuser123", 10),
      });
    }
    
    let owner3 = await storage.getOwnerByUserId(user3.userId);
    if (!owner3) {
      const owner3Id = await PostgresStorage.generateUniqueOwnerId();
      owner3 = await storage.createOwner({
        userId: user3.userId,
        firstName: "Coastal",
        lastName: "Cruises",
        email: "coastal@example.com",
        phoneNumber: "+1555345678",
        address: "789 Coastal St, San Francisco, CA 94103",
        governmentId: "Driver's License",
        governmentIdNum: "DL456789012",
        dateOfBirth: new Date("1975-09-10"),
        businessName: "Coastal Cruises Inc",
        boatName: "Coastal Cruiser",
        boatType: "Motorboat",
        boatLength: 30,
        boatCapacity: 8,
        registrationNumber: "REG456789",
        hullIdentificationNumber: "HIN456789012",
        stateOfRegistration: "California",
        insuranceDetails: "Comprehensive coverage with $1M liability",
        dailyRate: "450.00",
        purpose: "recreational",
        businessLicense: "BL456789012",
        insuranceCertificate: "IC456789012",
        marinaLocation: "San Francisco Marina, San Francisco, CA",
        description: "Reliable motorboat perfect for coastal cruising and fishing trips. Equipped with navigation and safety equipment.",
        status: "approved",
        ownerId: owner3Id,
        password: bcrypt.hashSync("password123", 10),
        isApproved: true,
        createdAt: new Date()
      });
      await storage.updateUser(user3.userId, { role: "owner" });
    }

    let user4 = await storage.getUserByEmail("sarah@example.com");
    if (!user4) {
      user4 = await storage.createUser({
        firstName: "Sarah",
        lastName: "Wilson",
        email: "sarah@example.com",
        phone: "+1555456789",
        password: bcrypt.hashSync("sarahuser123", 10),
      });
    }
    
    let owner4 = await storage.getOwnerByUserId(user4.userId);
    if (!owner4) {
      const owner4Id = await PostgresStorage.generateUniqueOwnerId();
      owner4 = await storage.createOwner({
        userId: user4.userId,
        firstName: "Luxury",
        lastName: "Yacht",
        email: "luxury@example.com",
        phoneNumber: "+1555456789",
        address: "1010 Luxury St, Fort Lauderdale, FL 33301",
        governmentId: "Driver's License",
        governmentIdNum: "DL678901234",
        dateOfBirth: new Date("1970-11-25"),
        businessName: "Luxury Yacht Charters",
        boatName: "Royal Yacht",
        boatType: "Yacht",
        boatLength: 60,
        boatCapacity: 20,
        registrationNumber: "REG678901",
        hullIdentificationNumber: "HIN678901234",
        stateOfRegistration: "Florida",
        insuranceDetails: "Comprehensive coverage with $1M liability",
        dailyRate: "1200.00",
        purpose: "recreational",
        businessLicense: "BL678901234",
        insuranceCertificate: "IC678901234",
        marinaLocation: "Fort Lauderdale Marina, Fort Lauderdale, FL",
        description: "Ultra-luxury yacht with premium amenities, multiple decks, and professional crew. Perfect for weddings and corporate events.",
        status: "approved",
        ownerId: owner4Id,
        password: bcrypt.hashSync("password123", 10),
        isApproved: true,
        createdAt: new Date()
      });
      await storage.updateUser(user4.userId, { role: "owner" });
    }

    // Create boats only if they don't exist
    const existingBoatsCount = await storage.getAllBoats();
    if (existingBoatsCount.length === 0) {
      // Create 15 comprehensive boat entries
      const boatsData = [
        {
          ownerId: owner1.id,
          name: "Ocean Dream",
          type: "Yacht",
          length: 45,
          capacity: 12,
          location: "Miami, FL",
          dailyRate: "850.00",
          description: "Luxury yacht perfect for sunset cruises and special occasions. Features premium amenities, spacious deck, and professional crew.",
          imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.8"
        },
        {
          ownerId: owner1.id,
          name: "Deep Sea Explorer",
          type: "Fishing Boat",
          length: 32,
          capacity: 8,
          location: "Key West, FL",
          dailyRate: "420.00",
          description: "Professional fishing boat equipped with latest gear and fish finders. Perfect for deep sea fishing adventures and tournaments.",
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.6"
        },
        {
          ownerId: owner1.id,
          name: "Speed Thunder",
          type: "Speedboat",
          length: 28,
          capacity: 6,
          location: "San Diego, CA",
          dailyRate: "380.00",
          description: "High-performance speedboat for thrill seekers. Experience the ultimate adrenaline rush with speeds up to 60 mph.",
          imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.7"
        },
        {
          ownerId: owner2.id,
          name: "Sea Breeze",
          type: "Catamaran",
          length: 40,
          capacity: 10,
          location: "Miami Beach, FL",
          dailyRate: "650.00",
          description: "Beautiful catamaran perfect for group adventures and sunset sails. Stable and spacious with panoramic views.",
          imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.9"
        },
        {
          ownerId: owner2.id,
          name: "Wind Dancer",
          type: "Sailboat",
          length: 35,
          capacity: 6,
          location: "Newport, RI",
          dailyRate: "320.00",
          description: "Classic sailboat offering authentic sailing experience. Perfect for romantic getaways and peaceful ocean adventures.",
          imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.5"
        },
        {
          ownerId: owner2.id,
          name: "Party Paradise",
          type: "Pontoon Boat",
          length: 24,
          capacity: 12,
          location: "Lake Tahoe, CA",
          dailyRate: "280.00",
          description: "Spacious pontoon boat ideal for parties and family gatherings. Features comfortable seating and built-in coolers.",
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.4"
        },
        {
          ownerId: owner3.id,
          name: "Aqua Jet",
          type: "Jet Ski",
          length: 12,
          capacity: 2,
          location: "Miami, FL",
          dailyRate: "180.00",
          description: "High-performance jet ski for adrenaline-pumping water adventures. Perfect for couples seeking excitement.",
          imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.3"
        },
        {
          ownerId: owner3.id,
          name: "Floating Home",
          type: "Houseboat",
          length: 50,
          capacity: 8,
          location: "Lake Powell, AZ",
          dailyRate: "520.00",
          description: "Comfortable houseboat with full amenities including kitchen, bedrooms, and deck. Perfect for extended stays on the water.",
          imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.6"
        },
        {
          ownerId: owner3.id,
          name: "Coastal Cruiser",
          type: "Motorboat",
          length: 30,
          capacity: 8,
          location: "San Francisco, CA",
          dailyRate: "450.00",
          description: "Reliable motorboat perfect for coastal cruising and fishing trips. Equipped with navigation and safety equipment.",
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.5"
        },
        {
          ownerId: owner4.id,
          name: "Royal Yacht",
          type: "Yacht",
          length: 60,
          capacity: 20,
          location: "Fort Lauderdale, FL",
          dailyRate: "1200.00",
          description: "Ultra-luxury yacht with premium amenities, multiple decks, and professional crew. Perfect for weddings and corporate events.",
          imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.9"
        },
        {
          ownerId: owner4.id,
          name: "Adventure Seeker",
          type: "Trawler",
          length: 42,
          capacity: 6,
          location: "Seattle, WA",
          dailyRate: "580.00",
          description: "Sturdy trawler designed for long-distance cruising and exploration. Ideal for adventure seekers and fishing enthusiasts.",
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.7"
        },
        {
          ownerId: owner4.id,
          name: "Sunset Sailor",
          type: "Sailboat",
          length: 38,
          capacity: 4,
          location: "San Diego, CA",
          dailyRate: "350.00",
          description: "Elegant sailboat perfect for romantic sunset cruises. Features comfortable cockpit and easy handling.",
          imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.8"
        },
        {
          ownerId: owner1.id,
          name: "Family Fun",
          type: "Pontoon Boat",
          length: 26,
          capacity: 10,
          location: "Lake Michigan, MI",
          dailyRate: "250.00",
          description: "Family-friendly pontoon boat with safety features and comfortable seating. Perfect for family outings and picnics.",
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.4"
        },
        {
          ownerId: owner2.id,
          name: "Business Class",
          type: "Yacht",
          length: 48,
          capacity: 15,
          location: "New York, NY",
          dailyRate: "950.00",
          description: "Professional yacht designed for business meetings and corporate events. Features conference facilities and premium service.",
          imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.8"
        },
        {
          ownerId: owner3.id,
          name: "Fishing Master",
          type: "Fishing Boat",
          length: 28,
          capacity: 6,
          location: "Gulf Coast, TX",
          dailyRate: "380.00",
          description: "Specialized fishing boat with advanced fish finders and tackle storage. Expert captain available for guided fishing trips.",
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          rating: "4.6"
        }
      ];

      // Insert all boats
      for (const boatData of boatsData) {
        await storage.createBoat(boatData);
      }
    }

    // Create sample owner request only if it doesn't exist
    const existingRequests = await storage.getAllOwnerRequests();
    if (existingRequests.length === 0) {
      const sampleOwnerId = await PostgresStorage.generateUniqueOwnerId();
      const samplePassword = crypto.randomBytes(8).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
      
      await storage.createOwnerRequest({
        userId: user2.userId,
        firstName: "Sample",
        lastName: "Owner",
        email: "sample@example.com",
        phoneNumber: "+1555999999",
        address: "123 Sample Street, Sample City, SC 12345",
        governmentId: "Driver's License",
        governmentIdNum: "DL123456789",
        dateOfBirth: new Date("1990-01-01"),
        businessName: "Sample Boat Rentals LLC",
        boatName: "Sample Boat",
        boatType: "Motorboat",
        boatLength: 25,
        boatCapacity: 8,
        registrationNumber: "REG123456",
        hullIdentificationNumber: "HIN123456789",
        stateOfRegistration: "Florida",
        insuranceDetails: "Comprehensive coverage with $1M liability",
        dailyRate: "300.00",
        purpose: "recreational",
        ownerId: sampleOwnerId,
        password: samplePassword,
        businessLicense: "BL123456789",
        insuranceCertificate: "IC123456789",
        marinaLocation: "Sample Marina, Miami, FL",
        description: "A sample boat for demonstration purposes"
      });
    }

    console.log("✅ Dummy data initialized successfully with 15 boats and sample owner request");
  } catch (error) {
    console.error("❌ Error initializing dummy data:", error);
  }
}

