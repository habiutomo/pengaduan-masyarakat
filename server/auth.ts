import { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Register auth-related routes
export function registerAuthRoutes(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      // Validate request data
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid login data",
          errors: result.error.format(),
        });
      }

      const { username, password } = result.data;

      // Find the user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({
          message: "Invalid username or password",
        });
      }

      // Verify password
      const isPasswordValid = await storage.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid username or password",
        });
      }

      // Create session
      if (req.session) {
        req.session.user = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        };
      }

      // Return user info (without password)
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        message: "Server error during login",
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({
          message: "Error logging out",
        });
      }

      res.clearCookie("connect.sid"); // Clear the session cookie
      return res.status(200).json({
        message: "Logout successful",
      });
    });
  });

  // Get current user/session status
  app.get("/api/auth/status", (req: Request, res: Response) => {
    if (req.session?.user) {
      return res.status(200).json({
        isAuthenticated: true,
        user: req.session.user,
      });
    } else {
      return res.status(200).json({
        isAuthenticated: false,
      });
    }
  });
}
