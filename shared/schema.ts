import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (Admin) table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

// Complaints table
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  trackingId: text("tracking_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  categoryId: integer("category_id"),
  status: text("status").notNull().default("pending"), // pending, verified, rejected, inprogress, resolved
  isPublished: boolean("is_published").default(false),
  isArchived: boolean("is_archived").default(false),
  
  // Reporter info (private)
  name: text("name").notNull(),
  nik: text("nik").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  
  // Access token for the reporter to check their complaint
  accessToken: text("access_token").notNull(),
  
  rejectionReason: text("rejection_reason"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attachments table
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  complaintId: integer("complaint_id").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Responses table
export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  complaintId: integer("complaint_id").notNull(),
  content: text("content").notNull(),
  isFromAdmin: boolean("is_from_admin").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export const insertCategorySchema = createInsertSchema(categories);

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  trackingId: true,
  accessToken: true,
  isPublished: true,
  isArchived: true,
  status: true,
  rejectionReason: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});

export const verifyComplaintSchema = z.object({
  id: z.number(),
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
  response: z.string().optional(),
});

export const checkComplaintSchema = z.object({
  email: z.string().email(),
  token: z.string(),
});

export const complaintResponseSchema = z.object({
  complaintId: z.number(),
  content: z.string(),
  isFromAdmin: z.boolean(),
});

export const closeComplaintSchema = z.object({
  id: z.number(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;

export type ComplaintWithRelations = Complaint & {
  attachments?: Attachment[];
  responses?: Response[];
};

export type PublicComplaint = Pick<Complaint, 'id' | 'trackingId' | 'title' | 'description' | 'location' | 'categoryId' | 'status' | 'createdAt' | 'updatedAt'> & {
  attachments?: Attachment[];
  responses?: Response[];
};
