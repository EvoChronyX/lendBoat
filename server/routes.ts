import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, PostgresStorage, initializeDummyData } from "./storage";
import { authService, authenticateToken as authMiddleware, requireAdmin, requireOwner } from "./services/auth";
import { emailService } from "./services/email";
import { insertUserSchema, insertOwnerRequestSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import "./types";
import Stripe from "stripe";
import bodyParser from "body-parser";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import bcrypt from "bcryptjs";

import dotenv from 'dotenv';
dotenv.config();


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

// Owner login schema
const ownerLoginSchema = z.object({
  ownerId: z.string().length(7),
  password: z.string().min(1),
});


const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
if (!STRIPE_SECRET_KEY) {
  console.warn("⚠️ STRIPE_SECRET_KEY not found in environment variables - Stripe payments will not work");
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-05-28.basil" }) : null;

// Owner request validation schema
const ownerRequestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  governmentId: z.string().min(1, "Government ID is required"),
  governmentIdNum: z.string().optional(), // Optional additional government ID
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  businessName: z.string().min(1, "Business name is required"),
  boatName: z.string().min(1, "Boat name is required"),
  boatType: z.string().min(1, "Boat type is required"),
  boatLength: z.number().min(1, "Boat length must be at least 1"),
  boatCapacity: z.number().min(1, "Boat capacity must be at least 1"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  hullIdentificationNumber: z.string().min(1, "Hull identification number is required"),
  stateOfRegistration: z.string().min(1, "State of registration is required"),
  insuranceDetails: z.string().min(1, "Insurance details are required"),
  dailyRate: z.string().min(1, "Daily rate is required"),
  purpose: z.string().min(1, "Purpose is required"),
  // Legacy fields
  taxId: z.string().optional(),
  businessLicense: z.string().optional(),
  insuranceCertificate: z.string().optional(),
  marinaLocation: z.string().optional(),
  description: z.string().optional(),
});

// Authentication middleware - COMMENTED OUT TO AVOID CONFLICT WITH IMPORTED FUNCTION
/*
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // Use userId instead of id
    (req as any).user = { id: decoded.userId, userId: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
}
*/

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

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const { email, type } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      let emailSent = false;
      
      switch (type) {
        case 'owner-approval':
          emailSent = await emailService.sendOwnerApprovalEmail(
            email,
            "Test Owner",
            "Test Business",
            "1234567",
            "testpass123"
          );
          break;
        case 'owner-rejection':
          emailSent = await emailService.sendOwnerRejectionEmail(
            email,
            "Test Owner",
            "Test rejection reason"
          );
          break;
        case 'booking-confirmation':
          emailSent = await emailService.sendBookingConfirmationEmail(
            email,
            {
              customerName: "Test Customer",
              boatName: "Test Boat",
              location: "Test Location",
              checkinDate: "2024-01-15",
              checkoutDate: "2024-01-17",
              guests: 4,
              totalAmount: "500.00"
            }
          );
          break;
        default:
          return res.status(400).json({ message: "Invalid email type. Use: owner-approval, owner-rejection, or booking-confirmation" });
      }

      if (emailSent) {
        res.json({ 
          success: true, 
          message: `${type} email sent successfully to ${email}` 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: `Failed to send ${type} email to ${email}` 
        });
      }
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
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

  app.post("/api/auth/owner-login", async (req, res) => {
    try {
      const { ownerId, password } = ownerLoginSchema.parse(req.body);
      console.log('Owner login attempt:', { ownerId, passwordLength: password?.length });
      
      const owner = await storage.getOwnerByOwnerId(ownerId);
      console.log('Owner lookup result:', { 
        ownerFound: !!owner, 
        ownerStatus: owner?.status,
        ownerId: owner?.ownerId,
        businessName: owner?.businessName 
      });
      
      if (!owner || owner.status !== "approved") {
        console.log('Owner login failed - not found or not approved:', { 
          ownerFound: !!owner, 
          status: owner?.status 
        });
        return res.status(401).json({ message: "Invalid Owner ID or not approved" });
      }
      
      // Check password using bcrypt
      if (!owner.password) {
        console.log('Owner login failed - no password stored');
        return res.status(401).json({ message: "Invalid Owner ID or password" });
      }
      
      console.log('Attempting password comparison...');
      const isPasswordValid = await authService.comparePassword(password, owner.password);
      console.log('Password comparison result:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Owner login failed - invalid password');
        return res.status(401).json({ message: "Invalid Owner ID or password" });
      }
      
      // Get the associated user
      const user = owner.userId ? await storage.getUserById(owner.userId) : null;
      console.log('User lookup result:', { 
        userFound: !!user, 
        userId: user?.userId,
        userRole: user?.role 
      });
      
      if (!user) {
        console.log('Owner login failed - associated user not found');
        return res.status(401).json({ message: "Associated user not found" });
      }

      // Generate JWT token for the user
      const token = authService.generateToken(user);
      console.log('Owner login successful - token generated');

      res.json({
        owner: {
          id: owner.id,
          ownerId: owner.ownerId,
          businessName: owner.businessName,
          userId: owner.userId,
        },
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token
      });
    } catch (error) {
      console.error("Owner login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid owner login data" });
      }
      res.status(500).json({ message: "Internal server error during owner login" });
    }
  });

  // Owner request routes
  app.post("/api/owner-requests", authMiddleware, async (req, res) => {
    try {
      // Get userId from authenticated user
      const userId = (req as any).user.userId;
      
      // Parse and validate the request data
      const requestData = ownerRequestSchema.parse(req.body);

      // Validate that the user exists
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate unique 7-digit owner ID
      const ownerId = await PostgresStorage.generateUniqueOwnerId();
      
      // Generate random password
      const password = crypto.randomBytes(8).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);

      // Create the owner request with all fields
      const ownerRequest = await storage.createOwnerRequest({
        userId,
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        email: requestData.email,
        phoneNumber: requestData.phoneNumber,
        address: requestData.address,
        governmentId: requestData.governmentId,
        governmentIdNum: requestData.governmentIdNum || null,
        dateOfBirth: new Date(requestData.dateOfBirth),
        businessName: requestData.businessName,
        boatName: requestData.boatName,
        boatType: requestData.boatType,
        boatLength: requestData.boatLength,
        boatCapacity: requestData.boatCapacity,
        registrationNumber: requestData.registrationNumber,
        hullIdentificationNumber: requestData.hullIdentificationNumber,
        stateOfRegistration: requestData.stateOfRegistration,
        insuranceDetails: requestData.insuranceDetails,
        dailyRate: requestData.dailyRate,
        purpose: requestData.purpose,
        ownerId,
        password,
        // Legacy fields
        taxId: requestData.taxId || null,
        businessLicense: requestData.businessLicense || null,
        insuranceCertificate: requestData.insuranceCertificate || null,
        marinaLocation: requestData.marinaLocation || null,
        description: requestData.description || null,
      });

      console.log(`✅ Owner request created successfully for user ${userId} with owner ID ${ownerId}`);

      res.status(201).json({
        message: "Owner request submitted successfully",
        ownerRequest: {
          id: ownerRequest.id,
          status: ownerRequest.status,
          ownerId: ownerRequest.ownerId,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Owner request error:", error);
        return res.status(400).json({
          message: "Invalid owner request data",
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        });
      }
      console.error("Error creating owner request:", error);
      res.status(500).json({ message: "Failed to create owner request" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authMiddleware, requireAdmin, async (req, res) => {
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

  app.get("/api/admin/pending-requests", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getPendingOwnerRequests();
      
      // Return the requests directly since they now contain all the personal information
      res.json(requests);
    } catch (error) {
      console.error("Pending requests error:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  });

  app.post("/api/admin/approve-owner/:id", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }

      const request = await storage.getOwnerRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Owner request not found" });
      }

      // Check if request is already processed
      if (request.status !== "pending") {
        return res.status(400).json({ 
          message: `Request is already ${request.status}. Cannot approve again.` 
        });
      }

      // Update request status first
      await storage.updateOwnerRequest(requestId, { 
        status: "approved", 
        adminNotes: "Application approved by admin" 
      });

      // Generate unique 7-digit Owner ID
      const ownerId = await PostgresStorage.generateUniqueOwnerId();

      // Generate a random password for the owner
      const plainPassword = crypto.randomBytes(8).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
      const hashedPassword = await authService.hashPassword(plainPassword);

      // Check required fields
      if (!hashedPassword || !ownerId || !request.businessName) {
        console.error("Missing required value for owner creation:", {
          hashedPassword, ownerId, businessName: request.businessName
        });
        return res.status(500).json({ message: "Internal error: missing required value for owner creation" });
      }

      // Always insert into owners table, only if userId is a number
      try {
        if (typeof request.userId === 'number') {
          // Create owner with all the information from the request
          await storage.createOwner({
            userId: request.userId,
            firstName: request.firstName,
            lastName: request.lastName,
            email: request.email,
            phoneNumber: request.phoneNumber,
            address: request.address,
            governmentId: request.governmentId,
            governmentIdNum: request.governmentIdNum || null,
            dateOfBirth: new Date(request.dateOfBirth),
            businessName: request.businessName,
            boatName: request.boatName,
            boatType: request.boatType,
            boatLength: request.boatLength,
            boatCapacity: request.boatCapacity,
            registrationNumber: request.registrationNumber,
            hullIdentificationNumber: request.hullIdentificationNumber,
            stateOfRegistration: request.stateOfRegistration,
            insuranceDetails: request.insuranceDetails,
            dailyRate: request.dailyRate,
            purpose: request.purpose,
            businessLicense: request.businessLicense || null,
            insuranceCertificate: request.insuranceCertificate || null,
            marinaLocation: request.marinaLocation || null,
            description: request.description || null,
            status: "approved",
            ownerId: ownerId,
            password: bcrypt.hashSync(plainPassword, 10),
            createdAt: new Date()
          });
        } else {
          console.error("Cannot create owner: userId is not a number", { userId: request.userId });
          return res.status(500).json({ message: "Internal error: userId is missing or invalid for owner creation" });
        }
      } catch (err) {
        console.error("Error inserting owner:", {
          userId: request.userId,
          ownerId,
          businessName: request.businessName,
          error: err
        });
        return res.status(500).json({ message: "Failed to insert owner record" });
      }

      if (typeof request.userId === 'number') {
        // Update user role
        await storage.updateUserRole(request.userId, "owner");

        // Get user for email
        const user = await storage.getUserById(request.userId);
        if (user) {
          try {
            // Send approval email with credentials
            const ownerName = `${request.firstName} ${request.lastName}`;
            const emailSent = await emailService.sendOwnerApprovalEmail(
              request.email, // Use email from request
              ownerName,
              request.businessName,
              ownerId,
              plainPassword
            );
            
            if (!emailSent) {
              console.warn(`⚠️ Failed to send approval email to ${request.email}`);
            } else {
              console.log(`✅ Approval email sent to ${request.email}`);
            }
          } catch (emailError) {
            console.error("Email sending error:", emailError);
          }
        }
        // Print password for owner with userId
        console.log(`✅ Owner approved: ${request.businessName} (Request ID: ${requestId}, Owner ID: ${ownerId}, Password: ${plainPassword})`);
      } else {
        // Public owner request (no userId): just log
        console.log(`Approved public owner request (no userId): ${requestId}, Owner ID: ${ownerId}, Password: ${plainPassword}`);
      }

      res.json({ 
        message: "Owner approved successfully",
        ownerId,
        businessName: request.businessName
      });
    } catch (error) {
      console.error("Approve owner error:", error);
      res.status(500).json({ message: "Failed to approve owner" });
    }
  });

  app.post("/api/admin/reject-owner/:id", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!requestId) {
        return res.status(400).json({ message: "Request ID is required" });
      }

      // Get the owner request
      const ownerRequest = await storage.getOwnerRequestById(requestId);
      if (!ownerRequest) {
        return res.status(404).json({ message: "Owner request not found" });
      }

      if (ownerRequest.status !== "pending") {
        return res.status(400).json({ message: "Request is not in pending status" });
      }

      // Update owner request status
      await storage.updateOwnerRequest(requestId, { 
        status: "rejected",
        adminNotes: reason || "Rejected by admin"
      });

      // Send rejection email
      try {
        const emailSent = await emailService.sendOwnerRejectionEmail(
          ownerRequest.email,
          `${ownerRequest.firstName} ${ownerRequest.lastName}`,
          reason || "Application rejected by admin"
        );

        if (emailSent) {
          console.log(`✅ Owner rejection email sent to ${ownerRequest.email}`);
        } else {
          console.warn(`⚠️ Failed to send owner rejection email to ${ownerRequest.email}`);
        }
      } catch (emailError) {
        console.error("Owner rejection email error:", emailError);
      }

      res.json({ 
        message: "Owner request rejected successfully"
      });
    } catch (error) {
      console.error("Reject owner request error:", error);
      res.status(500).json({ message: "Failed to reject owner request" });
    }
  });

  app.get("/api/admin/users", authMiddleware, requireAdmin, async (req, res) => {
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

  app.get("/api/admin/owners", authMiddleware, requireAdmin, async (req, res) => {
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

  app.get("/api/boats/search", async (req, res) => {
    try {
      const { boatType, rating, popularity, purpose } = req.query;
      
      let boats = await storage.getAllBoats();
      
      // Filter by boat type (exact match or contains)
      if (boatType && typeof boatType === 'string') {
        boats = boats.filter(boat => 
          boat.type.toLowerCase().includes(boatType.toLowerCase()) ||
          boat.name.toLowerCase().includes(boatType.toLowerCase())
        );
      }
      
      // Filter by rating
      if (rating && typeof rating === 'string') {
        switch (rating) {
          case 'highly-rated':
            boats = boats.filter(boat => parseFloat(boat.rating) >= 4.5);
            break;
          case 'top-rated':
            boats = boats.filter(boat => parseFloat(boat.rating) >= 4.0);
            break;
          case 'well-rated':
            boats = boats.filter(boat => parseFloat(boat.rating) >= 3.5);
            break;
        }
      }
      
      // Filter by popularity (based on creation date and rating)
      if (popularity && typeof popularity === 'string') {
        switch (popularity) {
          case 'most-popular':
            // Sort by rating and then by creation date
            boats.sort((a, b) => {
              const ratingDiff = parseFloat(b.rating) - parseFloat(a.rating);
              if (ratingDiff !== 0) return ratingDiff;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            break;
          case 'trending':
            // Sort by recent creation date
            boats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'new':
            // Show boats created in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            boats = boats.filter(boat => new Date(boat.createdAt) > thirtyDaysAgo);
            break;
        }
      }
      
      // Filter by purpose (based on boat type, capacity, and description)
      if (purpose && typeof purpose === 'string') {
        switch (purpose) {
          case 'Party':
            boats = boats.filter(boat => 
              boat.capacity >= 8 || 
              boat.type.toLowerCase().includes('yacht') ||
              boat.type.toLowerCase().includes('pontoon') ||
              boat.description.toLowerCase().includes('party')
            );
            break;
          case 'Business Meeting':
            boats = boats.filter(boat => 
              boat.type.toLowerCase().includes('yacht') ||
              boat.type.toLowerCase().includes('houseboat') ||
              boat.description.toLowerCase().includes('business') ||
              boat.description.toLowerCase().includes('corporate') ||
              boat.capacity >= 10
            );
            break;
          case 'Travel':
            boats = boats.filter(boat => 
              boat.type.toLowerCase().includes('yacht') ||
              boat.type.toLowerCase().includes('trawler') ||
              boat.type.toLowerCase().includes('houseboat') ||
              boat.description.toLowerCase().includes('cruising') ||
              boat.description.toLowerCase().includes('travel')
            );
            break;
          case 'Fishing':
            boats = boats.filter(boat => 
              boat.type.toLowerCase().includes('fishing') ||
              boat.type.toLowerCase().includes('motorboat') ||
              boat.description.toLowerCase().includes('fishing') ||
              boat.description.toLowerCase().includes('fish')
            );
            break;
          case 'Vacation':
            boats = boats.filter(boat => 
              boat.type.toLowerCase().includes('yacht') ||
              boat.type.toLowerCase().includes('catamaran') ||
              boat.type.toLowerCase().includes('houseboat') ||
              boat.description.toLowerCase().includes('vacation') ||
              boat.description.toLowerCase().includes('luxury')
            );
            break;
          case 'Wedding':
            boats = boats.filter(boat => 
              boat.capacity >= 20 || 
              boat.type.toLowerCase().includes('yacht') ||
              boat.description.toLowerCase().includes('wedding') ||
              boat.description.toLowerCase().includes('special occasions')
            );
            break;
          case 'Corporate Event':
            boats = boats.filter(boat => 
              boat.capacity >= 15 || 
              boat.type.toLowerCase().includes('yacht') ||
              boat.description.toLowerCase().includes('corporate') ||
              boat.description.toLowerCase().includes('business')
            );
            break;
          case 'Family Trip':
            boats = boats.filter(boat => 
              (boat.capacity >= 6 && boat.capacity <= 12) ||
              boat.description.toLowerCase().includes('family') ||
              boat.description.toLowerCase().includes('family-friendly')
            );
            break;
          case 'Romantic Getaway':
            boats = boats.filter(boat => 
              boat.capacity <= 4 ||
              boat.type.toLowerCase().includes('sailboat') ||
              boat.type.toLowerCase().includes('yacht') ||
              boat.description.toLowerCase().includes('romantic') ||
              boat.description.toLowerCase().includes('sunset')
            );
            break;
          case 'Adventure':
            boats = boats.filter(boat => 
              boat.type.toLowerCase().includes('speedboat') ||
              boat.type.toLowerCase().includes('jet ski') ||
              boat.type.toLowerCase().includes('motorboat') ||
              boat.description.toLowerCase().includes('adventure') ||
              boat.description.toLowerCase().includes('thrill') ||
              boat.description.toLowerCase().includes('adrenaline')
            );
            break;
        }
      }
      
      res.json(boats);
    } catch (error) {
      console.error("Search boats error:", error);
      res.status(500).json({ message: "Failed to search boats" });
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
  app.post("/api/bookings", authMiddleware, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: user not found in request" });
      }
      // Convert checkinDate and checkoutDate to Date objects if they are strings
      let checkinDate = req.body.checkinDate;
      let checkoutDate = req.body.checkoutDate;
      if (typeof checkinDate === 'string') checkinDate = new Date(checkinDate);
      if (typeof checkoutDate === 'string') checkoutDate = new Date(checkoutDate);

      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.userId,
        checkinDate,
        checkoutDate,
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

  app.get("/api/bookings", authMiddleware, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: user not found in request" });
      }
      const bookings = await storage.getBookingsByUserId(req.user.userId);
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/latest", authMiddleware, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: user not found in request" });
      }
      
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      // Get the Stripe session to verify the booking
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      let session;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId);
      } catch (stripeError) {
        console.error("Stripe session retrieval error:", stripeError);
        return res.status(404).json({ message: "Invalid session ID" });
      }

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      // Get all bookings and find the one that matches the session metadata
      const allBookings = await storage.getAllBookings();
      const sessionMetadata = session.metadata || {};
      
      console.log("Session metadata:", sessionMetadata);
      console.log("All bookings count:", allBookings.length);
      
      // Find the booking that matches the session metadata
      let matchingBooking = allBookings.find(booking => {
        const bookingUserId = booking.userId.toString();
        const bookingBoatId = booking.boatId.toString();
        const bookingCheckin = new Date(booking.checkinDate).toISOString().split('T')[0];
        const bookingCheckout = new Date(booking.checkoutDate).toISOString().split('T')[0];
        const bookingGuests = booking.guests.toString();
        const bookingAmount = booking.totalAmount;
        
        console.log("Comparing booking:", {
          bookingUserId,
          bookingBoatId,
          bookingCheckin,
          bookingCheckout,
          bookingGuests,
          bookingAmount
        });
        console.log("With session metadata:", {
          userId: sessionMetadata.userId,
          boatId: sessionMetadata.boatId,
          checkinDate: sessionMetadata.checkinDate,
          checkoutDate: sessionMetadata.checkoutDate,
          guests: sessionMetadata.guests,
          totalAmount: sessionMetadata.totalAmount
        });
        
        return (
          bookingUserId === sessionMetadata.userId &&
          bookingBoatId === sessionMetadata.boatId &&
          bookingCheckin === sessionMetadata.checkinDate &&
          bookingCheckout === sessionMetadata.checkoutDate &&
          bookingGuests === sessionMetadata.guests &&
          bookingAmount === sessionMetadata.totalAmount
        );
      });

      // If no matching booking found, create it from the session metadata
      if (!matchingBooking) {
        console.log("No matching booking found, creating from session metadata...");
        try {
          matchingBooking = await storage.createBooking({
            userId: Number(sessionMetadata.userId),
            boatId: Number(sessionMetadata.boatId),
            checkinDate: sessionMetadata.checkinDate, // Keep as string
            checkoutDate: sessionMetadata.checkoutDate, // Keep as string
            guests: Number(sessionMetadata.guests),
            totalAmount: sessionMetadata.totalAmount,
            specialRequests: sessionMetadata.specialRequests || "",
          });
          console.log(`✅ Created booking from session: ${matchingBooking.id}`);
        } catch (createError) {
          console.error("Failed to create booking from session:", createError);
          return res.status(500).json({ message: "Failed to create booking from session" });
        }
      } else {
        console.log("Found matching booking:", matchingBooking.id);
      }
      
      // Get boat details
      const boat = await storage.getBoatById(matchingBooking.boatId);
      if (!boat) {
        return res.status(404).json({ message: "Boat not found" });
      }

      // Get owner details
      const owner = await storage.getOwnerById(boat.ownerId);
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }

      // Get user details (the customer who made the booking)
      const user = await storage.getUserById(parseInt(matchingBooking.userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const bookingDetails = {
        ...matchingBooking,
        boat,
        owner: {
          id: owner.id,
          ownerId: owner.ownerId,
          businessName: owner.businessName,
          phone: owner.phoneNumber,
          email: owner.email,
        },
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      };

      // Send confirmation email if booking is confirmed and not already sent
      if (matchingBooking.status === "confirmed") {
        try {
          await emailService.sendBookingConfirmationEmail(
            user.email,
            `${user.firstName} ${user.lastName}`,
            {
              bookingId: matchingBooking.id,
              boatName: boat.name,
              boatType: boat.type,
              checkinDate: matchingBooking.checkinDate.toLocaleDateString(),
              checkoutDate: matchingBooking.checkoutDate.toLocaleDateString(),
              guests: matchingBooking.guests,
              totalAmount: matchingBooking.totalAmount,
              location: boat.location,
              description: boat.description || "",
              ownerBusinessName: owner.businessName,
              ownerPhone: owner.phoneNumber,
              ownerEmail: owner.email,
            }
          );
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }

      res.json(bookingDetails);
    } catch (error) {
      console.error("Get latest booking error:", error);
      res.status(500).json({ message: "Failed to fetch booking details" });
    }
  });

  // Owner: Upload a boat
  app.post("/api/owner/boats", authMiddleware, requireOwner, async (req, res) => {
    try {
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) return res.status(403).json({ message: "Not an approved owner" });
      const boatData = req.body;
      boatData.ownerId = owner.id;
      const boat = await storage.createBoat(boatData);
      res.json(boat);
    } catch (error) {
      console.error("Upload boat error:", error);
      res.status(500).json({ message: "Failed to upload boat" });
    }
  });

  // Owner: View booking requests
  app.get("/api/owner/booking-requests", authMiddleware, requireOwner, async (req, res) => {
    try {
      const bookings = await storage.getBookingsForOwner(req.user!.userId);
      res.json(bookings);
    } catch (error) {
      console.error("Get owner bookings error:", error);
      res.status(500).json({ message: "Failed to fetch booking requests" });
    }
  });

  // Owner: Get owner info and user data
  app.get("/api/auth/owner-info", authMiddleware, requireOwner, async (req, res) => {
    try {
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }

      const user = await storage.getUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        owner: {
          id: owner.id,
          ownerId: owner.ownerId,
          businessName: owner.businessName,
          userId: owner.userId,
        },
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Get owner info error:", error);
      res.status(500).json({ message: "Failed to fetch owner information" });
    }
  });

  // Owner: Get owner's boats
  app.get("/api/owner/boats", authMiddleware, requireOwner, async (req, res) => {
    try {
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }

      const boats = await storage.getBoatsByOwnerId(owner.id);
      res.json(boats);
    } catch (error) {
      console.error("Get owner boats error:", error);
      res.status(500).json({ message: "Failed to fetch owner boats" });
    }
  });

  // Owner: Update profile
  app.put("/api/owner/profile", authMiddleware, requireOwner, async (req, res) => {
    try {
      const { firstName, lastName, email, phone, businessName } = req.body;
      
      // Update user profile
      await storage.updateUserProfile(req.user!.userId, {
        firstName,
        lastName,
        email,
        phone
      });

      // Update owner business name
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (owner) {
        await storage.updateOwnerBusinessName(owner.id, businessName);
      }

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update owner profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Owner: Accept booking request
  app.post("/api/owner/booking-requests/:id/accept", authMiddleware, requireOwner, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBookingById(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      // Check owner owns the boat
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) return res.status(403).json({ message: "Not an approved owner" });
      const boat = await storage.getBoatById(booking.boatId);
      if (!boat || boat.ownerId !== owner.id) return res.status(403).json({ message: "Not authorized for this booking" });
      // Update status
      await storage.updateBookingOwnerStatus(bookingId, "accepted");
      // Send email to user
      const user = await storage.getUserById(booking.userId);
      if (user) {
        await emailService.sendBookingStatusEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          boat.name,
          "accepted",
          {
            checkinDate: booking.checkinDate.toLocaleDateString(),
            checkoutDate: booking.checkoutDate.toLocaleDateString(),
            guests: booking.guests,
            totalAmount: booking.totalAmount,
          }
        );
      }
      res.json({ message: "Booking accepted" });
    } catch (error) {
      console.error("Accept booking error:", error);
      res.status(500).json({ message: "Failed to accept booking" });
    }
  });

  // Owner: Decline booking request
  app.post("/api/owner/booking-requests/:id/decline", authMiddleware, requireOwner, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBookingById(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      // Check owner owns the boat
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) return res.status(403).json({ message: "Not an approved owner" });
      const boat = await storage.getBoatById(booking.boatId);
      if (!boat || boat.ownerId !== owner.id) return res.status(403).json({ message: "Not authorized for this booking" });
      // Update status
      await storage.updateBookingOwnerStatus(bookingId, "declined");
      // Send email to user
      const user = await storage.getUserById(booking.userId);
      if (user) {
        await emailService.sendBookingStatusEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          boat.name,
          "declined",
          {
            checkinDate: booking.checkinDate.toLocaleDateString(),
            checkoutDate: booking.checkoutDate.toLocaleDateString(),
            guests: booking.guests,
            totalAmount: booking.totalAmount,
          }
        );
      }
      res.json({ message: "Booking declined" });
    } catch (error) {
      console.error("Decline booking error:", error);
      res.status(500).json({ message: "Failed to decline booking" });
    }
  });

  // Owner: Approve booking (update status to 'approved')
  app.patch("/api/owner/bookings/:id/approve", authMiddleware, requireOwner, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBookingById(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      // Check owner owns the boat
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) return res.status(403).json({ message: "Not an approved owner" });
      const boat = await storage.getBoatById(booking.boatId);
      if (!boat || boat.ownerId !== owner.id) return res.status(403).json({ message: "Not authorized for this booking" });
      // Update status
      await storage.updateBookingStatus(bookingId, "approved");
      res.json({ message: "Booking approved" });
    } catch (error) {
      console.error("Approve booking error:", error);
      res.status(500).json({ message: "Failed to approve booking" });
    }
  });

  // Stripe payment endpoints
  app.post("/api/stripe/create-payment-intent", authMiddleware, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const { amount, boatId, checkinDate, checkoutDate, guests, specialRequests } = req.body;

      if (!amount || !boatId) {
        return res.status(400).json({ message: "Amount and boatId are required" });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: req.user.userId.toString(),
          boatId: boatId.toString(),
          checkinDate: checkinDate,
          checkoutDate: checkoutDate,
          guests: guests.toString(),
          specialRequests: specialRequests || '',
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Create payment intent error:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post("/api/stripe/create-checkout-session", authMiddleware, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const { 
        boatId, 
        checkinDate, 
        checkoutDate, 
        guests, 
        specialRequests, 
        totalAmount,
        boatName,
        location,
        dailyRate,
        boatType,
        capacity
      } = req.body;

      if (!boatId || !checkinDate || !checkoutDate || !guests || !totalAmount) {
        return res.status(400).json({ message: "Missing required booking information" });
      }

      // Calculate number of days
      const checkin = new Date(checkinDate);
      const checkout = new Date(checkoutDate);
      const days = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 3600 * 24));

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: boatName || 'Boat Rental',
                description: `${boatType || 'Boat'} rental for ${days} day${days > 1 ? 's' : ''} at ${location}`,
                images: ['https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'],
              },
              unit_amount: Math.round(totalAmount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/booking-cancelled`,
        metadata: {
          userId: req.user.userId.toString(),
          boatId: boatId.toString(),
          checkinDate: checkinDate,
          checkoutDate: checkoutDate,
          guests: guests.toString(),
          specialRequests: specialRequests || '',
          totalAmount: totalAmount.toString(),
          boatName: boatName || '',
          location: location || '',
          dailyRate: dailyRate || '',
          boatType: boatType || '',
          capacity: capacity || '',
          days: days.toString(),
          customerName: `${req.user.firstName} ${req.user.lastName}`,
          customerEmail: req.user.email,
        },
        customer_email: req.user.email,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'IN'],
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Create checkout session error:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Stripe webhook endpoint
  app.post("/api/stripe/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error("Stripe webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      
      try {
        // Create booking from successful checkout session
        const booking = await storage.createBooking({
          userId: Number(metadata.userId),
          boatId: Number(metadata.boatId),
          checkinDate: new Date(metadata.checkinDate),
          checkoutDate: new Date(metadata.checkoutDate),
          guests: Number(metadata.guests),
          totalAmount: metadata.totalAmount,
          specialRequests: metadata.specialRequests || "",
        });

        // Get boat and user details for email
        const boat = await storage.getBoatById(booking.boatId);
        const user = await storage.getUserById(booking.userId);

        if (boat && user) {
          try {
            // Send booking confirmation email
            const emailSent = await emailService.sendBookingConfirmationEmail(
              user.email,
              `${user.firstName} ${user.lastName}`,
              {
                bookingId: booking.id,
                boatName: boat.name,
                boatType: boat.type,
                checkinDate: booking.checkinDate.toLocaleDateString(),
                checkoutDate: booking.checkoutDate.toLocaleDateString(),
                guests: booking.guests,
                totalAmount: booking.totalAmount,
                location: boat.location,
                description: boat.description || "",
                ownerBusinessName: "Boat Rental Pro",
                ownerPhone: "+1-555-0123",
                ownerEmail: "support@boatrentalpro.com",
              }
            );
            
            if (!emailSent) {
              console.warn(`⚠️ Failed to send booking confirmation email to ${user.email}`);
            } else {
              console.log(`✅ Booking confirmation email sent to ${user.email}`);
            }
          } catch (emailError) {
            console.error("Email sending error:", emailError);
          }
        }

        console.log(`🎉 Booking created from successful checkout: ${boat?.name || 'Unknown'} for user ${user?.email || 'Unknown'} (Booking ID: ${booking.id})`);
      } catch (err) {
        console.error("Failed to create booking from checkout session:", err);
        return res.status(500).send("Failed to create booking");
      }
    }
    
    res.json({ received: true });
  });

  // Route to handle successful payments from frontend
  app.post("/api/stripe/payment-success", authMiddleware, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const { paymentIntentId, bookingData } = req.body;

      if (!paymentIntentId || !bookingData) {
        return res.status(400).json({ message: "Payment intent ID and booking data are required" });
      }

      // Verify the payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      // Create the booking
      const booking = await storage.createBooking({
        userId: req.user.userId,
        boatId: bookingData.boatId,
        checkinDate: new Date(bookingData.checkinDate),
        checkoutDate: new Date(bookingData.checkoutDate),
        guests: bookingData.guests,
        totalAmount: bookingData.totalAmount.toString(),
        specialRequests: bookingData.specialRequests || "",
      });

      // Get boat details for email
      const boat = await storage.getBoatById(booking.boatId);

      if (boat) {
        try {
          // Send booking confirmation email
          const emailSent = await emailService.sendBookingConfirmationEmail(
            req.user.email,
            `${req.user.firstName} ${req.user.lastName}`,
            {
              bookingId: booking.id,
              boatName: boat.name,
              boatType: boat.type,
              checkinDate: booking.checkinDate.toLocaleDateString(),
              checkoutDate: booking.checkoutDate.toLocaleDateString(),
              guests: booking.guests,
              totalAmount: booking.totalAmount,
              location: boat.location,
              description: boat.description || "",
              ownerBusinessName: "Boat Rental Pro",
              ownerPhone: "+1-555-0123",
              ownerEmail: "support@boatrentalpro.com",
            }
          );
          
          if (!emailSent) {
            console.warn(`⚠️ Failed to send booking confirmation email to ${req.user.email}`);
          } else {
            console.log(`✅ Booking confirmation email sent to ${req.user.email}`);
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
        }
      }

      console.log(`🎉 New booking created: ${boat?.name || 'Unknown'} for ${req.user.email} (Booking ID: ${booking.id})`);
      res.json({ 
        success: true, 
        booking,
        message: "Booking confirmed successfully" 
      });
    } catch (error) {
      console.error("Payment success error:", error);
      res.status(500).json({ message: "Failed to process payment success" });
    }
  });

  app.get("/api/admin/bookings", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Get all bookings error:", error);
      res.status(500).json({ message: "Failed to fetch all bookings" });
    }
  });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, subject, message } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({ 
          message: "All fields are required: firstName, lastName, email, subject, message" 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Store contact message in database
      const contactMessage = await storage.createContact({
        firstName,
        lastName,
        email,
        subject,
        message,
        status: "new"
      });

      // Send notification email to admin
      try {
        const adminEmailSent = await emailService.sendContactNotificationEmail({
          customerName: `${firstName} ${lastName}`,
          customerEmail: email,
          subject: subject,
          message: message,
          contactId: contactMessage.id
        });

        if (adminEmailSent) {
          console.log(`✅ Contact notification email sent to admin for message from ${email}`);
        } else {
          console.warn(`⚠️ Failed to send contact notification email to admin`);
        }
      } catch (emailError) {
        console.error("Contact notification email error:", emailError);
      }

      // Send confirmation email to customer
      try {
        const customerEmailSent = await emailService.sendContactConfirmationEmail(email, {
          customerName: `${firstName} ${lastName}`,
          subject: subject
        });

        if (customerEmailSent) {
          console.log(`✅ Contact confirmation email sent to ${email}`);
        } else {
          console.warn(`⚠️ Failed to send contact confirmation email to ${email}`);
        }
      } catch (emailError) {
        console.error("Contact confirmation email error:", emailError);
      }

      console.log(`📧 New contact message received from ${firstName} ${lastName} (${email}): ${subject}`);
      
      res.status(201).json({ 
        message: "Contact message sent successfully",
        contactId: contactMessage.id
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to send contact message" });
    }
  });

  // Get all contact messages (admin only)
  app.get("/api/admin/contacts", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all owners (admin only)
  app.get("/api/admin/owners", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const owners = await storage.getAllOwners();
      res.json(owners);
    } catch (error) {
      console.error("Get owners error:", error);
      res.status(500).json({ message: "Failed to fetch owners" });
    }
  });

  // Get all boats (admin only)
  app.get("/api/admin/boats", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const boats = await storage.getAllBoats();
      res.json(boats);
    } catch (error) {
      console.error("Get boats error:", error);
      res.status(500).json({ message: "Failed to fetch boats" });
    }
  });

  // Get all owner requests (admin only)
  app.get("/api/admin/owner-requests", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllOwnerRequests();
      res.json(requests);
    } catch (error) {
      console.error("Get owner requests error:", error);
      res.status(500).json({ message: "Failed to fetch owner requests" });
    }
  });

  // Approve owner request (admin only)
  app.post("/api/admin/owner-requests/:id/approve", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      
      if (!requestId) {
        return res.status(400).json({ message: "Request ID is required" });
      }

      // Get the owner request
      const ownerRequest = await storage.getOwnerRequestById(requestId);
      if (!ownerRequest) {
        return res.status(404).json({ message: "Owner request not found" });
      }

      if (ownerRequest.status !== "pending") {
        return res.status(400).json({ message: "Request is not in pending status" });
      }

      // Generate unique owner ID and password
      const ownerId = await PostgresStorage.generateUniqueOwnerId();
      const password = crypto.randomBytes(8).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);

      // Create the owner
      const newOwner = await storage.createOwner({
        userId: ownerRequest.userId,
        firstName: ownerRequest.firstName,
        lastName: ownerRequest.lastName,
        email: ownerRequest.email,
        phoneNumber: ownerRequest.phoneNumber,
        address: ownerRequest.address,
        governmentId: ownerRequest.governmentId,
        governmentIdNum: ownerRequest.governmentIdNum || null,
        dateOfBirth: new Date(ownerRequest.dateOfBirth),
        businessName: ownerRequest.businessName,
        boatName: ownerRequest.boatName,
        boatType: ownerRequest.boatType,
        boatLength: ownerRequest.boatLength,
        boatCapacity: ownerRequest.boatCapacity,
        registrationNumber: ownerRequest.registrationNumber,
        hullIdentificationNumber: ownerRequest.hullIdentificationNumber,
        stateOfRegistration: ownerRequest.stateOfRegistration,
        insuranceDetails: ownerRequest.insuranceDetails,
        dailyRate: ownerRequest.dailyRate,
        purpose: ownerRequest.purpose,
        businessLicense: ownerRequest.businessLicense || null,
        insuranceCertificate: ownerRequest.insuranceCertificate || null,
        marinaLocation: ownerRequest.marinaLocation || null,
        description: ownerRequest.description || null,
        status: "approved",
        ownerId: ownerId,
        password: bcrypt.hashSync(password, 10),
        createdAt: new Date()
      });

      // Update user role to owner
      await storage.updateUserRole(ownerRequest.userId, "owner");

      // Update owner request status
      await storage.updateOwnerRequest(requestId, { 
        status: "approved",
        adminNotes: "Approved by admin"
      });

      // Send approval email
      try {
        const emailSent = await emailService.sendOwnerApprovalEmail(
          ownerRequest.email,
          `${ownerRequest.firstName} ${ownerRequest.lastName}`,
          ownerRequest.businessName,
          ownerId,
          password
        );

        if (emailSent) {
          console.log(`✅ Owner approval email sent to ${ownerRequest.email}`);
        } else {
          console.warn(`⚠️ Failed to send owner approval email to ${ownerRequest.email}`);
        }
      } catch (emailError) {
        console.error("Owner approval email error:", emailError);
      }

      res.json({ 
        message: "Owner request approved successfully",
        owner: newOwner
      });
    } catch (error) {
      console.error("Approve owner request error:", error);
      res.status(500).json({ message: "Failed to approve owner request" });
    }
  });

  // Reject owner request (admin only)
  app.post("/api/admin/owner-requests/:id/reject", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!requestId) {
        return res.status(400).json({ message: "Request ID is required" });
      }

      // Get the owner request
      const ownerRequest = await storage.getOwnerRequestById(requestId);
      if (!ownerRequest) {
        return res.status(404).json({ message: "Owner request not found" });
      }

      if (ownerRequest.status !== "pending") {
        return res.status(400).json({ message: "Request is not in pending status" });
      }

      // Update owner request status
      await storage.updateOwnerRequest(requestId, { 
        status: "rejected",
        adminNotes: reason || "Rejected by admin"
      });

      // Send rejection email
      try {
        const emailSent = await emailService.sendOwnerRejectionEmail(
          ownerRequest.email,
          `${ownerRequest.firstName} ${ownerRequest.lastName}`,
          reason || "Application rejected by admin"
        );

        if (emailSent) {
          console.log(`✅ Owner rejection email sent to ${ownerRequest.email}`);
        } else {
          console.warn(`⚠️ Failed to send owner rejection email to ${ownerRequest.email}`);
        }
      } catch (emailError) {
        console.error("Owner rejection email error:", emailError);
      }

      res.json({ 
        message: "Owner request rejected successfully"
      });
    } catch (error) {
      console.error("Reject owner request error:", error);
      res.status(500).json({ message: "Failed to reject owner request" });
    }
  });

  // Reply to contact message (admin only)
  app.post("/api/admin/contacts/:id/reply", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const { replyMessage, customerEmail, customerName, originalSubject } = req.body;

      if (!contactId || !replyMessage || !customerEmail) {
        return res.status(400).json({ message: "Contact ID, reply message, and customer email are required" });
      }

      // Send reply email to customer
      try {
        const emailSent = await emailService.sendContactReplyEmail(customerEmail, {
          customerName,
          originalSubject,
          replyMessage,
          adminName: req.user.firstName
        });

        if (emailSent) {
          console.log(`✅ Contact reply email sent to ${customerEmail}`);
        } else {
          console.warn(`⚠️ Failed to send contact reply email to ${customerEmail}`);
        }
      } catch (emailError) {
        console.error("Contact reply email error:", emailError);
      }

      // Update contact status to "replied"
      const updatedContact = await storage.updateContact(contactId, { status: "replied" });
      
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact message not found" });
      }

      res.json({ 
        message: "Reply sent successfully",
        contact: updatedContact
      });
    } catch (error) {
      console.error("Reply to contact error:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  // Update contact status (admin only)
  app.put("/api/admin/contacts/:id/status", authMiddleware, requireAdmin, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const { status } = req.body;

      if (!contactId || !status) {
        return res.status(400).json({ message: "Contact ID and status are required" });
      }

      const updatedContact = await storage.updateContact(contactId, { status });
      
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact message not found" });
      }

      res.json({ 
        message: "Contact status updated successfully",
        contact: updatedContact
      });
    } catch (error) {
      console.error("Update contact status error:", error);
      res.status(500).json({ message: "Failed to update contact status" });
    }
  });

  // Owner: Get owner profile
  app.get("/api/owner/profile", authMiddleware, requireOwner, async (req, res) => {
    try {
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }

      res.json(owner);
    } catch (error) {
      console.error("Get owner profile error:", error);
      res.status(500).json({ message: "Failed to fetch owner profile" });
    }
  });

  // Owner: Get owner's bookings with user details
  app.get("/api/owner/bookings", authMiddleware, requireOwner, async (req, res) => {
    try {
      const bookings = await storage.getBookingsForOwner(req.user!.userId);
      res.json(bookings);
    } catch (error) {
      console.error("Get owner bookings error:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Owner: Reply to booking
  app.post("/api/owner/bookings/:id/reply", authMiddleware, requireOwner, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { replyMessage, customerEmail, customerName } = req.body;

      if (!bookingId || !replyMessage || !customerEmail) {
        return res.status(400).json({ message: "Booking ID, reply message, and customer email are required" });
      }

      // Verify owner owns this booking
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) return res.status(403).json({ message: "Not an approved owner" });
      
      const booking = await storage.getBookingById(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      const boat = await storage.getBoatById(booking.boatId);
      if (!boat || boat.ownerId !== owner.id) return res.status(403).json({ message: "Not authorized for this booking" });

      // Send reply email to customer
      try {
        const emailSent = await emailService.sendBookingReplyEmail(customerEmail, {
          customerName,
          boatName: boat.name,
          replyMessage,
          ownerName: `${owner.firstName} ${owner.lastName}`,
          businessName: owner.businessName
        });

        if (emailSent) {
          console.log(`✅ Booking reply email sent to ${customerEmail}`);
        } else {
          console.warn(`⚠️ Failed to send booking reply email to ${customerEmail}`);
        }
      } catch (emailError) {
        console.error("Booking reply email error:", emailError);
      }

      res.json({ 
        message: "Reply sent successfully"
      });
    } catch (error) {
      console.error("Reply to booking error:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  // Owner: Update booking status
  app.put("/api/owner/bookings/:id/status", authMiddleware, requireOwner, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;

      if (!bookingId || !status) {
        return res.status(400).json({ message: "Booking ID and status are required" });
      }

      // Verify owner owns this booking
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) return res.status(403).json({ message: "Not an approved owner" });
      
      const booking = await storage.getBookingById(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      const boat = await storage.getBoatById(booking.boatId);
      if (!boat || boat.ownerId !== owner.id) return res.status(403).json({ message: "Not authorized for this booking" });

      // Update booking status
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Send status update email to user
      const user = await storage.getUserById(parseInt(booking.userId));
      if (user) {
        try {
          const emailSent = await emailService.sendBookingStatusEmail(
            user.email,
            `${user.firstName} ${user.lastName}`,
            boat.name,
            status,
            {
              checkinDate: booking.checkinDate.toLocaleDateString(),
              checkoutDate: booking.checkoutDate.toLocaleDateString(),
              guests: booking.guests,
              totalAmount: booking.totalAmount,
            }
          );

          if (emailSent) {
            console.log(`✅ Booking status email sent to ${user.email}`);
          } else {
            console.warn(`⚠️ Failed to send booking status email to ${user.email}`);
          }
        } catch (emailError) {
          console.error("Booking status email error:", emailError);
        }
      }

      res.json({ 
        message: "Booking status updated successfully",
        booking: updatedBooking
      });
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Owner: Update boat
  app.put("/api/owner/boats/:id", authMiddleware, requireOwner, async (req, res) => {
    try {
      const boatId = parseInt(req.params.id);
      const boatData = req.body;

      if (!boatId) {
        return res.status(400).json({ message: "Boat ID is required" });
      }

      // Verify owner owns this boat
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) return res.status(403).json({ message: "Not an approved owner" });
      
      const existingBoat = await storage.getBoatById(boatId);
      if (!existingBoat) return res.status(404).json({ message: "Boat not found" });
      
      if (existingBoat.ownerId !== owner.id) return res.status(403).json({ message: "Not authorized for this boat" });

      // Update boat
      const updatedBoat = await storage.updateBoat(boatId, boatData);
      
      if (!updatedBoat) {
        return res.status(404).json({ message: "Boat not found" });
      }

      res.json({ 
        message: "Boat updated successfully",
        boat: updatedBoat
      });
    } catch (error) {
      console.error("Update boat error:", error);
      res.status(500).json({ message: "Failed to update boat" });
    }
  });

  // Owner: Delete boat
  app.delete("/api/owner/boats/:id", authMiddleware, requireOwner, async (req, res) => {
    try {
      const boatId = parseInt(req.params.id);

      if (!boatId) {
        return res.status(400).json({ message: "Boat ID is required" });
      }

      // Verify owner owns this boat
      const owner = await storage.getOwnerByUserId(req.user!.userId);
      if (!owner) return res.status(403).json({ message: "Not an approved owner" });
      
      const existingBoat = await storage.getBoatById(boatId);
      if (!existingBoat) return res.status(404).json({ message: "Boat not found" });
      
      if (existingBoat.ownerId !== owner.id) return res.status(403).json({ message: "Not authorized for this boat" });

      // Check if boat has any active bookings
      const boatBookings = await storage.getBookingsByBoatId(boatId);
      const activeBookings = boatBookings.filter(booking => 
        booking.status === "confirmed" || booking.status === "pending"
      );

      if (activeBookings.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete boat with active bookings. Please cancel all bookings first." 
        });
      }

      // Delete boat
      const deleted = await storage.deleteBoat(boatId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Boat not found" });
      }

      res.json({ 
        message: "Boat deleted successfully"
      });
    } catch (error) {
      console.error("Delete boat error:", error);
      res.status(500).json({ message: "Failed to delete boat" });
    }
  });

  // Forgot Password - Admin
  app.post("/api/auth/admin/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if admin exists
      const admin = await storage.getUserByEmail(email);
      if (!admin || admin.role !== "admin") {
        return res.status(404).json({ message: "Admin account not found" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token (in a real app, you'd store this in the database)
      // For now, we'll just send a simple reset email
      
      // Send reset email
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${email}&type=admin`;
      
      const emailSent = await emailService.sendPasswordResetEmail(
        email,
        `${admin.firstName} ${admin.lastName}`,
        resetLink,
        "admin"
      );

      if (emailSent) {
        res.json({ message: "Password reset email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send reset email" });
      }
    } catch (error) {
      console.error("Admin forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset" });
    }
  });

  // Forgot Password - Owner
  app.post("/api/auth/owner/forgot-password", async (req, res) => {
    try {
      const { email, ownerId } = req.body;

      if (!email || !ownerId) {
        return res.status(400).json({ message: "Email and Owner ID are required" });
      }

      // Check if owner exists and is approved
      const owner = await storage.getOwnerByEmail(email);
      if (!owner) {
        return res.status(404).json({ message: "Owner account not found" });
      }

      // Verify owner ID matches
      if (owner.ownerId !== ownerId) {
        return res.status(400).json({ message: "Owner ID does not match" });
      }

      // Check if owner is approved
      if (owner.status !== "approved") {
        return res.status(400).json({ message: "Only approved owners can reset their password" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token (in a real app, you'd store this in the database)
      // For now, we'll just send a simple reset email
      
      // Send reset email
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${email}&type=owner`;
      
      const emailSent = await emailService.sendPasswordResetEmail(
        email,
        `${owner.firstName} ${owner.lastName}`,
        resetLink,
        "owner"
      );

      if (emailSent) {
        res.json({ message: "Password reset email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send reset email" });
      }
    } catch (error) {
      console.error("Owner forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset" });
    }
  });

  // Verify Owner ID
  app.post("/api/auth/owner/verify-owner-id", async (req, res) => {
    try {
      const { ownerId } = req.body;

      if (!ownerId) {
        return res.status(400).json({ message: "Owner ID is required" });
      }

      // Check if owner ID exists and is approved
      const owner = await storage.getOwnerByOwnerId(ownerId);
      if (!owner) {
        return res.status(404).json({ message: "Owner ID not found" });
      }

      if (owner.status !== "approved") {
        return res.status(400).json({ message: "Only approved owners can reset their password" });
      }

      res.json({ message: "Owner ID verified successfully" });
    } catch (error) {
      console.error("Owner ID verification error:", error);
      res.status(500).json({ message: "Failed to verify owner ID" });
    }
  });

  // Direct Password Reset - Admin
  app.post("/api/auth/admin/reset-password-direct", async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }

      // Check if admin exists
      const admin = await storage.getUserByEmail(email);
      if (!admin || admin.role !== "admin") {
        return res.status(404).json({ message: "Admin account not found" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the password
      await storage.updateUser(admin.userId, { password: hashedPassword });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Admin direct password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Direct Password Reset - User
  app.post("/api/auth/user/reset-password-direct", async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User account not found" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the password
      await storage.updateUser(user.userId, { password: hashedPassword });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("User direct password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
