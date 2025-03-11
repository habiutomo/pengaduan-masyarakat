import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  insertComplaintSchema,
  insertResponseSchema,
  checkComplaintSchema,
  verifyComplaintSchema,
  closeComplaintSchema,
} from "@shared/schema";
import { storage } from "./storage";
import { authRequired } from "./middlewares";
import { registerAuthRoutes } from "./auth";
import { generateRandomToken, generateTrackingId } from "../client/src/lib/utils";
import { z } from "zod";

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only images and PDF
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar dan PDF yang diizinkan") as any);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register auth routes
  registerAuthRoutes(app);

  // Setup complaint routes
  app.get("/api/complaints/public", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const category = req.query.category as string;
      const search = req.query.search as string;

      const result = await storage.getPublicComplaints({
        page,
        limit,
        status,
        category,
        search,
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching public complaints:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.get("/api/complaints/admin", authRequired, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const category = req.query.category as string;
      const search = req.query.search as string;

      const result = await storage.getAdminComplaints({
        page,
        limit,
        status,
        category,
        search,
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching admin complaints:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.get("/api/complaints/stats", authRequired, async (req, res) => {
    try {
      const stats = await storage.getComplaintStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching complaint stats:", error);
      res.status(500).json({ message: "Failed to fetch complaint statistics" });
    }
  });

  app.get("/api/complaints/admin/:id", authRequired, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid complaint ID" });
      }

      const complaint = await storage.getComplaintById(id);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      res.json(complaint);
    } catch (error) {
      console.error("Error fetching complaint detail:", error);
      res.status(500).json({ message: "Failed to fetch complaint details" });
    }
  });

  app.get("/api/complaints/detail/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const email = req.query.email as string;

      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const complaint = await storage.getComplaintByToken(token);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      // If email is provided, verify it matches
      if (email && complaint.email !== email) {
        return res.status(403).json({ message: "Email does not match the complaint owner" });
      }

      res.json(complaint);
    } catch (error) {
      console.error("Error fetching complaint by token:", error);
      res.status(500).json({ message: "Failed to fetch complaint details" });
    }
  });

  app.post("/api/complaints/check", async (req, res) => {
    try {
      const result = checkComplaintSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const { email, token } = result.data;

      const complaint = await storage.getComplaintByEmailAndToken(email, token);
      if (!complaint) {
        return res.status(404).json({ message: "Pengaduan tidak ditemukan atau kredensial tidak valid" });
      }

      res.json(complaint);
    } catch (error) {
      console.error("Error checking complaint:", error);
      res.status(500).json({ message: "Failed to check complaint status" });
    }
  });

  // Create new complaint
  app.post("/api/complaints", upload.array("files", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      // Parse complaint data from the request
      const complaintData = JSON.parse(req.body.data);
      
      // Validate complaint data
      const result = insertComplaintSchema.safeParse(complaintData);
      if (!result.success) {
        // Clean up uploaded files on validation error
        files.forEach(file => {
          fs.unlinkSync(file.path);
        });
        
        return res.status(400).json({ 
          message: "Invalid complaint data", 
          errors: result.error.format() 
        });
      }
      
      // Generate tracking ID and access token
      const trackingId = generateTrackingId();
      const accessToken = generateRandomToken();
      
      // Create complaint in database
      const complaint = await storage.createComplaint({
        ...result.data,
        trackingId,
        accessToken,
      });
      
      // Save file attachments
      if (files.length > 0) {
        for (const file of files) {
          await storage.addAttachment({
            complaintId: complaint.id,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
          });
        }
      }
      
      res.status(201).json({
        id: complaint.id,
        trackingId: complaint.trackingId,
        accessToken: complaint.accessToken,
      });
    } catch (error) {
      console.error("Error creating complaint:", error);
      
      // Clean up uploaded files on error
      if (req.files) {
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      
      res.status(500).json({ message: "Failed to create complaint" });
    }
  });

  // Verify complaint (admin only)
  app.post("/api/complaints/:id/verify", authRequired, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid complaint ID" });
      }
      
      const result = verifyComplaintSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid verification data", 
          errors: result.error.format() 
        });
      }
      
      const { approved, rejectionReason, response } = result.data;
      
      // Verify the complaint
      const updatedComplaint = await storage.verifyComplaint(id, approved, rejectionReason);
      
      // Add response if provided
      if (response && approved) {
        await storage.addResponse({
          complaintId: id,
          content: response,
          isFromAdmin: true,
        });
      }
      
      res.json(updatedComplaint);
    } catch (error) {
      console.error("Error verifying complaint:", error);
      res.status(500).json({ message: "Failed to verify complaint" });
    }
  });

  // Add response to complaint
  app.post("/api/complaints/:id/responses", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid complaint ID" });
      }
      
      const result = insertResponseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid response data", 
          errors: result.error.format() 
        });
      }
      
      // Check if admin is required for this response
      if (result.data.isFromAdmin && !req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Add the response
      const response = await storage.addResponse(result.data);
      
      // If this is a public response, update complaint status to "inprogress"
      if (!result.data.isFromAdmin) {
        await storage.updateComplaintStatus(id, "inprogress");
      }
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Error adding response:", error);
      res.status(500).json({ message: "Failed to add response" });
    }
  });

  // Close complaint (requires verification)
  app.post("/api/complaints/:id/close", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid complaint ID" });
      }
      
      // Verify user owns this complaint
      const { email, token } = req.body;
      if (!email || !token) {
        return res.status(400).json({ message: "Email and token are required" });
      }
      
      const complaint = await storage.getComplaintByEmailAndToken(email, token);
      if (!complaint || complaint.id !== id) {
        return res.status(403).json({ message: "You don't have permission to close this complaint" });
      }
      
      // Close the complaint
      const updatedComplaint = await storage.closeComplaint(id);
      
      res.json(updatedComplaint);
    } catch (error) {
      console.error("Error closing complaint:", error);
      res.status(500).json({ message: "Failed to close complaint" });
    }
  });

  // Get attachment
  app.get("/api/attachments/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(uploadDir, filename);
      
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.sendFile(filepath);
    } catch (error) {
      console.error("Error serving attachment:", error);
      res.status(500).json({ message: "Failed to serve attachment" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
