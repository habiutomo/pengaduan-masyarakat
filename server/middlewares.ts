import { Request, Response, NextFunction } from "express";

// Middleware to check if user is authenticated
export function authRequired(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }
  
  next();
}

// Add user types to express session
declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      name: string;
      role: string;
    };
  }
}
