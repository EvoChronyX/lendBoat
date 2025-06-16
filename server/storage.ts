import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, owners, ownerRequests, boats, bookings, type User, type InsertUser, type OwnerRequest, type InsertOwnerRequest, type Owner, type Boat, type InsertBoat, type Booking, type InsertBooking } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  
  // Owner Requests
  createOwnerRequest(request: InsertOwnerRequest): Promise<OwnerRequest>;
  getPendingOwnerRequests(): Promise<OwnerRequest[]>;
  getOwnerRequestById(id: number): Promise<OwnerRequest | undefined>;
  updateOwnerRequestStatus(id: number, status: string, adminNotes?: string): Promise<OwnerRequest | undefined>;
  
  // Owners
  createOwner(userId: number, businessName: string, taxId: string): Promise<Owner>;
  getOwnerByUserId(userId: number): Promise<Owner | undefined>;
  getAllOwners(): Promise<Owner[]>;
  
  // Boats
  createBoat(boat: InsertBoat): Promise<Boat>;
  getAllBoats(): Promise<Boat[]>;
  getBoatsByOwnerId(ownerId: number): Promise<Boat[]>;
  getBoatById(id: number): Promise<Boat | undefined>;
  
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
}

export class PostgresStorage implements IStorage {
  // Users
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  // Owner Requests
  async createOwnerRequest(request: InsertOwnerRequest): Promise<OwnerRequest> {
    const [newRequest] = await db.insert(ownerRequests).values(request).returning();
    return newRequest;
  }

  async getPendingOwnerRequests(): Promise<OwnerRequest[]> {
    return await db.select().from(ownerRequests).where(eq(ownerRequests.status, "pending")).orderBy(desc(ownerRequests.createdAt));
  }

  async getOwnerRequestById(id: number): Promise<OwnerRequest | undefined> {
    const [request] = await db.select().from(ownerRequests).where(eq(ownerRequests.id, id));
    return request;
  }

  async updateOwnerRequestStatus(id: number, status: string, adminNotes?: string): Promise<OwnerRequest | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (adminNotes) updateData.adminNotes = adminNotes;
    
    const [updatedRequest] = await db.update(ownerRequests).set(updateData).where(eq(ownerRequests.id, id)).returning();
    return updatedRequest;
  }

  // Owners
  async createOwner(userId: number, businessName: string, taxId: string): Promise<Owner> {
    const [newOwner] = await db.insert(owners).values({
      userId,
      businessName,
      taxId,
      isApproved: true,
    }).returning();
    return newOwner;
  }

  async getOwnerByUserId(userId: number): Promise<Owner | undefined> {
    const [owner] = await db.select().from(owners).where(eq(owners.userId, userId));
    return owner;
  }

  async getAllOwners(): Promise<Owner[]> {
    return await db.select().from(owners).orderBy(desc(owners.createdAt));
  }

  // Boats
  async createBoat(boat: InsertBoat): Promise<Boat> {
    const [newBoat] = await db.insert(boats).values(boat).returning();
    return newBoat;
  }

  async getAllBoats(): Promise<Boat[]> {
    return await db.select().from(boats).where(eq(boats.isActive, true)).orderBy(desc(boats.createdAt));
  }

  async getBoatsByOwnerId(ownerId: number): Promise<Boat[]> {
    return await db.select().from(boats).where(eq(boats.ownerId, ownerId));
  }

  async getBoatById(id: number): Promise<Boat | undefined> {
    const [boat] = await db.select().from(boats).where(eq(boats.id, id));
    return boat;
  }

  // Bookings
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }
}

export const storage = new PostgresStorage();

// Initialize with dummy data
export async function initializeDummyData() {
  try {
    // Check if data already exists
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length > 0) {
      console.log("Database already has data, skipping initialization");
      return;
    }

    // Create admin user
    const adminUser = await storage.createUser({
      firstName: "Admin",
      lastName: "User",
      email: "admin@boatrental.com",
      phone: "+1555000000",
      password: "$2b$10$dummy.hash.for.admin.password", // In real app, use bcrypt
    });
    await storage.updateUserRole(adminUser.id, "admin");

    // Create sample users
    const user1 = await storage.createUser({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+1555123456",
      password: "$2b$10$dummy.hash.for.user.password",
    });

    const user2 = await storage.createUser({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "+1555234567",
      password: "$2b$10$dummy.hash.for.user.password",
    });

    // Create sample owner
    const owner1 = await storage.createOwner(user1.id, "Ocean Adventures LLC", "12-3456789");
    await storage.updateUserRole(user1.id, "owner");

    // Create sample boats
    await storage.createBoat({
      ownerId: owner1.id,
      name: "Ocean Dream",
      type: "yacht",
      length: 45,
      capacity: 12,
      location: "Miami, FL",
      dailyRate: "450.00",
      description: "Luxury yacht perfect for sunset cruises and special occasions. Accommodates up to 12 guests.",
      imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      rating: "4.8",
    });

    await storage.createBoat({
      ownerId: owner1.id,
      name: "Deep Sea Explorer",
      type: "fishing",
      length: 32,
      capacity: 8,
      location: "Key West, FL",
      dailyRate: "320.00",
      description: "Professional fishing boat equipped with latest gear. Perfect for deep sea fishing adventures.",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      rating: "4.9",
    });

    await storage.createBoat({
      ownerId: owner1.id,
      name: "Speed Thunder",
      type: "speedboat",
      length: 28,
      capacity: 6,
      location: "San Diego, CA",
      dailyRate: "280.00",
      description: "High-performance speedboat for thrill seekers. Experience the ultimate adrenaline rush.",
      imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      rating: "4.7",
    });

    // Create sample owner request
    await storage.createOwnerRequest({
      userId: user2.id,
      businessName: "Marina Dreams LLC",
      taxId: "98-7654321",
      businessLicense: "/uploads/business-license-123.pdf",
      insuranceCertificate: "/uploads/insurance-cert-123.pdf",
      boatName: "Sea Breeze",
      boatType: "catamaran",
      boatLength: 40,
      boatCapacity: 10,
      marinaLocation: "Miami Beach Marina",
      dailyRate: "380.00",
      description: "Beautiful catamaran perfect for group adventures and sunset sails.",
    });

    console.log("Dummy data initialized successfully");
  } catch (error) {
    console.error("Error initializing dummy data:", error);
  }
}
