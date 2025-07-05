import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import express from "express";
import { registerRoutes } from "../../server/routes";

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Register all routes
registerRoutes(app);

// Netlify function handler
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Convert Netlify event to Express request
  const { httpMethod, path, queryStringParameters, headers, body } = event;
  
  // Remove /api prefix from path
  const apiPath = path.replace("/.netlify/functions/api", "");
  
  // Create a mock request object
  const req = {
    method: httpMethod,
    url: apiPath,
    path: apiPath,
    query: queryStringParameters || {},
    headers: headers || {},
    body: body ? JSON.parse(body) : {},
  } as any;

  // Create a mock response object
  let responseBody = "";
  let responseStatus = 200;
  let responseHeaders: Record<string, string> = {};

  const res = {
    status: (code: number) => {
      responseStatus = code;
      return res;
    },
    json: (data: any) => {
      responseBody = JSON.stringify(data);
      responseHeaders["Content-Type"] = "application/json";
      return res;
    },
    send: (data: any) => {
      responseBody = typeof data === "string" ? data : JSON.stringify(data);
      return res;
    },
    header: (name: string, value: string) => {
      responseHeaders[name] = value;
      return res;
    },
    setHeader: (name: string, value: string) => {
      responseHeaders[name] = value;
      return res;
    },
  } as any;

  try {
    // Handle the request through Express
    await new Promise((resolve, reject) => {
      app(req, res, (err: any) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    return {
      statusCode: responseStatus,
      headers: responseHeaders,
      body: responseBody,
    };
  } catch (error) {
    console.error("API function error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
}; 