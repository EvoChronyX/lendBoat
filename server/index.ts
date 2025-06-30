import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "./types";
import { initializeDummyData } from "./storage";


process.env.JWT_SECRET="sF8rLrZjdnUBVZ9E3mBtU8W6gFeTX2QwQrFjaVYPLD93gvYcZzM7vGpkRkMVRZTx"
process.env.AUTH_SECRET="xr23MDk9LpB57QvTtMwz8nNbL1Cqg5ZfU6HyEo7Vm2AsWnBdKjRpYxFcGeHzNjLu"


process.env.SENDGRID_API_KEY="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"
process.env.EMAIL_API_KEY="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"

// Load environment variables with better error handling
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
}

// Log available environment variables (safely)
console.log('🔧 Environment Configuration:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET || process.env.AUTH_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY ? '✅ Set' : '❌ Missing'}`);

const app = express();

// Enhanced middleware for better error handling and logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // Enhanced logging for API routes
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Add user info if available
      if (req.user) {
        // Try to log email, username, or id if available
        const userInfo = (req.user as any).email || (req.user as any).username || (req.user as any).id;
        if (userInfo) {
          logLine += ` [User: ${userInfo}]`;
        } else {
          logLine += ` [User: authenticated]`;
        }
      }
      
      // Add response info for errors
      if (res.statusCode >= 400 && capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      // Color code based on status
      if (res.statusCode >= 500) {
        console.error(`🔴 ${logLine}`);
      } else if (res.statusCode >= 400) {
        console.warn(`🟡 ${logLine}`);
      } else {
        log(logLine);
      }
    }
  });

  next();
});

// Enhanced error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log detailed error information
  console.error(`❌ Error ${status}:`, {
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: _req.url,
    method: _req.method,
    body: _req.body,
    timestamp: new Date().toISOString(),
  });

  // Send appropriate error response
  res.status(status).json({ 
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

(async () => {
  try {

    await initializeDummyData();

    // Register all routes and initialize the server
    const server = await registerRoutes(app);
    
    console.log('✅ Routes registered successfully');

    // Setup Vite or static serving based on environment
    if (app.get("env") === "development") {
      console.log('🔧 Setting up Vite development server...');
      await setupVite(app, server);
      console.log('✅ Vite development server ready');
    } else {
      console.log('📦 Setting up static file serving...');
      serveStatic(app);
      console.log('✅ Static files ready');
    }

    // Start the server
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log(`🚀 BoatRental server running on port ${port}`);
      console.log(`🌐 Access the application at: http://localhost:${port}`);
      
      if (app.get("env") === "development") {
        console.log('🔧 Development mode active - Hot reload enabled');
      }
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
})();
