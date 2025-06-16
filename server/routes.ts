import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, initializeDummyData } from "./storage";
import { authService, authenticateToken, requireAdmin, requireOwner } from "./services/auth";
import { emailService } from "./services/email";
import { insertUserSchema, insertOwnerRequestSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import "./types";

// Ensure environment variables are loaded with proper fallbacks
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || process.env.CLERK_SECRET_KEY || 'fallback-secret-key';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY || process.env.SENDGRID_SECRET || '';
const DATABASE_URL = process.env.DATABASE_URL || process.env.DB_URL || '';

if (!DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL not found in environment variables");
}

if (!SENDGRID_API_KEY) {
  console.warn("⚠️ Email service API key not found - email notifications may not work");
}

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Admin login schema
const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize dummy data
  try {
    await initializeDummyData();
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      hasDatabase: !!DATABASE_URL,
      hasEmailService: !!SENDGRID_API_KEY,
    });
  });

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await authService.hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = authService.generateToken(user);

      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data provided", 
          details: error.errors.map(e => e.message).join(", ")
        });
      }
      res.status(500).json({ message: "Internal server error during signup" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await authService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = authService.generateToken(user);

      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data provided" });
      }
      res.status(500).json({ message: "Internal server error during login" });
    }
  });

  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      
      const user = await authService.authenticateUser(email, password);
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      const token = authService.generateToken(user);

      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error("Admin login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid admin login data" });
      }
      res.status(500).json({ message: "Internal server error during admin login" });
    }
  });

  // Owner request routes
  app.post("/api/owner-requests", authenticateToken, async (req, res) => {
    try {
      const requestData = insertOwnerRequestSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const ownerRequest = await storage.createOwnerRequest(requestData);
      
      // Log for admin notification
      console.log(`📝 New owner request submitted by ${req.user.email} (ID: ${ownerRequest.id})`);
      
      res.json(ownerRequest);
    } catch (error) {
      console.error("Owner request error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid owner request data", 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ")
        });
      }
      res.status(500).json({ message: "Failed to submit owner request" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const owners = await storage.getAllOwners();
      const pendingRequests = await storage.getPendingOwnerRequests();
      const boats = await storage.getAllBoats();

      res.json({
        totalUsers: users.length,
        approvedOwners: owners.filter(o => o.isApproved).length,
        pendingRequests: pendingRequests.length,
        totalBoats: boats.length,
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/pending-requests", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getPendingOwnerRequests();
      
      // Join with user data
      const requestsWithUsers = await Promise.all(
        requests.map(async (request) => {
          const user = await storage.getUserById(request.userId);
          return {
            ...request,
            ownerName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
            email: user?.email || 'Unknown',
          };
        })
      );

      res.json(requestsWithUsers);
    } catch (error) {
      console.error("Pending requests error:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  });

  app.post("/api/admin/approve-owner/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const request = await storage.getOwnerRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Owner request not found" });
      }

      // Update request status
      await storage.updateOwnerRequestStatus(requestId, "approved", "Application approved by admin");

      // Create owner record
      await storage.createOwner(request.userId, request.businessName, request.taxId);

      // Update user role
      await storage.updateUserRole(request.userId, "owner");

      // Get user for email
      const user = await storage.getUserById(request.userId);
      if (user) {
        try {
          // Send approval email
          const emailSent = await emailService.sendOwnerApprovalEmail(
            user.email,
            `${user.firstName} ${user.lastName}`,
            request.businessName
          );
          
          if (!emailSent) {
            console.warn(`⚠️ Failed to send approval email to ${user.email}`);
          } else {
            console.log(`✅ Approval email sent to ${user.email}`);
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
        }
      }

      console.log(`✅ Owner approved: ${request.businessName} (Request ID: ${requestId})`);
      res.json({ message: "Owner approved successfully" });
    } catch (error) {
      console.error("Approve owner error:", error);
      res.status(500).json({ message: "Failed to approve owner" });
    }
  });

  app.post("/api/admin/reject-owner/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const { reason } = req.body;
      
      const request = await storage.getOwnerRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Owner request not found" });
      }

      // Update request status
      await storage.updateOwnerRequestStatus(requestId, "rejected", reason || "Application rejected by admin");

      // Get user for email
      const user = await storage.getUserById(request.userId);
      if (user) {
        try {
          // Send rejection email
          const emailSent = await emailService.sendOwnerRejectionEmail(
            user.email,
            `${user.firstName} ${user.lastName}`,
            reason || "Please contact support for more information"
          );
          
          if (!emailSent) {
            console.warn(`⚠️ Failed to send rejection email to ${user.email}`);
          } else {
            console.log(`✅ Rejection email sent to ${user.email}`);
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
        }
      }

      console.log(`❌ Owner rejected: ${request.businessName} (Request ID: ${requestId})`);
      res.json({ message: "Owner request rejected successfully" });
    } catch (error) {
      console.error("Reject owner error:", error);
      res.status(500).json({ message: "Failed to reject owner request" });
    }
  });

  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      })));
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/owners", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const owners = await storage.getAllOwners();
      res.json(owners);
    } catch (error) {
      console.error("Get owners error:", error);
      res.status(500).json({ message: "Failed to fetch owners" });
    }
  });

  // Boat routes
  app.get("/api/boats", async (req, res) => {
    try {
      const boats = await storage.getAllBoats();
      res.json(boats);
    } catch (error) {
      console.error("Get boats error:", error);
      res.status(500).json({ message: "Failed to fetch boats" });
    }
  });

  app.get("/api/boats/:id", async (req, res) => {
    try {
      const boatId = parseInt(req.params.id);
      if (isNaN(boatId)) {
        return res.status(400).json({ message: "Invalid boat ID" });
      }

      const boat = await storage.getBoatById(boatId);
      if (!boat) {
        return res.status(404).json({ message: "Boat not found" });
      }

      res.json(boat);
    } catch (error) {
      console.error("Get boat error:", error);
      res.status(500).json({ message: "Failed to fetch boat" });
    }
  });

  // Booking routes
  app.post("/api/bookings", authenticateToken, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const booking = await storage.createBooking(bookingData);
      
      // Get boat and user details for email
      const boat = await storage.getBoatById(booking.boatId);
      const user = req.user;

      if (boat && user) {
        try {
          // Send booking confirmation email
          const emailSent = await emailService.sendBookingConfirmationEmail(user.email, {
            customerName: `${user.firstName} ${user.lastName}`,
            boatName: boat.name,
            location: boat.location,
            checkinDate: booking.checkinDate.toLocaleDateString(),
            checkoutDate: booking.checkoutDate.toLocaleDateString(),
            guests: booking.guests,
            totalAmount: booking.totalAmount,
          });
          
          if (!emailSent) {
            console.warn(`⚠️ Failed to send booking confirmation email to ${user.email}`);
          } else {
            console.log(`✅ Booking confirmation email sent to ${user.email}`);
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
        }
      }

      console.log(`🎉 New booking created: ${boat?.name || 'Unknown'} for ${user.email} (Booking ID: ${booking.id})`);
      res.json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ")
        });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", authenticateToken, async (req, res) => {
    try {
      const bookings = await storage.getBookingsByUserId(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/admin/bookings", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Get all bookings error:", error);
      res.status(500).json({ message: "Failed to fetch all bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
