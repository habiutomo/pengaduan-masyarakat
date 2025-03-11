import {
  users,
  type User,
  type InsertUser,
  categories,
  type Category,
  type InsertCategory,
  complaints,
  type Complaint,
  type InsertComplaint,
  attachments,
  type Attachment,
  type InsertAttachment,
  responses,
  type Response,
  type InsertResponse,
  type ComplaintWithRelations,
  type PublicComplaint,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { generateTrackingId } from "../client/src/lib/utils";

// Define filter params for complaint queries
interface ComplaintFilterParams {
  page: number;
  limit: number;
  status?: string;
  category?: string;
  search?: string;
}

// Storage interface with all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;

  // Category operations
  createCategory(category: InsertCategory): Promise<Category>;
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;

  // Complaint operations
  createComplaint(complaint: InsertComplaint & { trackingId: string, accessToken: string }): Promise<Complaint>;
  getComplaintById(id: number): Promise<ComplaintWithRelations | undefined>;
  getComplaintByToken(token: string): Promise<ComplaintWithRelations | undefined>;
  getComplaintByEmailAndToken(email: string, token: string): Promise<ComplaintWithRelations | undefined>;
  getPublicComplaints(filters: ComplaintFilterParams): Promise<{ complaints: PublicComplaint[], pagination: any }>;
  getAdminComplaints(filters: ComplaintFilterParams): Promise<{ complaints: Complaint[], pagination: any }>;
  verifyComplaint(id: number, approved: boolean, rejectionReason?: string): Promise<Complaint>;
  updateComplaintStatus(id: number, status: string): Promise<Complaint>;
  closeComplaint(id: number): Promise<Complaint>;
  getComplaintStats(): Promise<any>;

  // Attachment operations
  addAttachment(attachment: InsertAttachment): Promise<Attachment>;
  getAttachmentsByComplaintId(complaintId: number): Promise<Attachment[]>;

  // Response operations
  addResponse(response: InsertResponse): Promise<Response>;
  getResponsesByComplaintId(complaintId: number): Promise<Response[]>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private categoriesMap: Map<number, Category>;
  private complaintsMap: Map<number, Complaint>;
  private attachmentsMap: Map<number, Attachment>;
  private responsesMap: Map<number, Response>;
  
  // Auto-incrementing IDs
  private userIdCounter: number;
  private categoryIdCounter: number;
  private complaintIdCounter: number;
  private attachmentIdCounter: number;
  private responseIdCounter: number;

  constructor() {
    this.usersMap = new Map();
    this.categoriesMap = new Map();
    this.complaintsMap = new Map();
    this.attachmentsMap = new Map();
    this.responsesMap = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.complaintIdCounter = 1;
    this.attachmentIdCounter = 1;
    this.responseIdCounter = 1;
    
    // Initialize with default admin user
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    this.createUser({
      username: "admin",
      password: hashedPassword,
      name: "Administrator",
      role: "admin"
    });
    
    // Create default categories
    const defaultCategories = [
      { name: "Infrastruktur", description: "Jalan, jembatan, gedung, dll" },
      { name: "Lingkungan", description: "Sampah, polusi, taman, dll" },
      { name: "Pelayanan Publik", description: "Layanan pemerintah" },
      { name: "Kesehatan", description: "Rumah sakit, puskesmas, dll" },
      { name: "Pendidikan", description: "Sekolah, beasiswa, dll" },
      { name: "Lainnya", description: "Kategori lainnya" }
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    const user: User = {
      id,
      username: userData.username,
      password: userData.password,
      name: userData.name,
      role: userData.role || "admin",
      createdAt: now
    };
    
    this.usersMap.set(id, user);
    return user;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Category methods
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    
    const category: Category = {
      id,
      name: categoryData.name,
      description: categoryData.description
    };
    
    this.categoriesMap.set(id, category);
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categoriesMap.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categoriesMap.get(id);
  }

  // Complaint methods
  async createComplaint(complaintData: InsertComplaint & { trackingId: string, accessToken: string }): Promise<Complaint> {
    const id = this.complaintIdCounter++;
    const now = new Date();
    
    const complaint: Complaint = {
      id,
      trackingId: complaintData.trackingId,
      title: complaintData.title,
      description: complaintData.description,
      location: complaintData.location,
      categoryId: complaintData.categoryId,
      status: "pending",
      isPublished: false,
      isArchived: false,
      name: complaintData.name,
      nik: complaintData.nik,
      email: complaintData.email,
      phone: complaintData.phone,
      address: complaintData.address,
      accessToken: complaintData.accessToken,
      rejectionReason: null,
      closedAt: null,
      createdAt: now,
      updatedAt: now
    };
    
    this.complaintsMap.set(id, complaint);
    return complaint;
  }

  async getComplaintById(id: number): Promise<ComplaintWithRelations | undefined> {
    const complaint = this.complaintsMap.get(id);
    if (!complaint) return undefined;
    
    const attachments = await this.getAttachmentsByComplaintId(id);
    const responses = await this.getResponsesByComplaintId(id);
    
    // Add category name if categoryId exists
    let categoryName = "";
    if (complaint.categoryId) {
      const category = await this.getCategoryById(complaint.categoryId);
      if (category) {
        categoryName = category.name;
      }
    }
    
    return {
      ...complaint,
      attachments,
      responses,
      categoryName
    };
  }

  async getComplaintByToken(token: string): Promise<ComplaintWithRelations | undefined> {
    const complaint = Array.from(this.complaintsMap.values()).find(
      (c) => c.accessToken === token
    );
    
    if (!complaint) return undefined;
    
    return this.getComplaintById(complaint.id);
  }

  async getComplaintByEmailAndToken(email: string, token: string): Promise<ComplaintWithRelations | undefined> {
    const complaint = Array.from(this.complaintsMap.values()).find(
      (c) => c.email === email && c.accessToken === token
    );
    
    if (!complaint) return undefined;
    
    return this.getComplaintById(complaint.id);
  }

  async getPublicComplaints(filters: ComplaintFilterParams): Promise<{ complaints: PublicComplaint[], pagination: any }> {
    // Start with only verified/published complaints
    let filteredComplaints = Array.from(this.complaintsMap.values()).filter(
      c => c.isPublished && !c.isArchived
    );
    
    // Apply status filter if specified
    if (filters.status && filters.status !== "all") {
      filteredComplaints = filteredComplaints.filter(c => c.status === filters.status);
    }
    
    // Apply category filter if specified
    if (filters.category && filters.category !== "all") {
      filteredComplaints = filteredComplaints.filter(
        c => this.categoriesMap.get(c.categoryId)?.name.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    // Apply search filter if specified
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredComplaints = filteredComplaints.filter(
        c => c.title.toLowerCase().includes(searchLower) || 
             c.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created date (newest first)
    filteredComplaints.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Calculate pagination
    const totalItems = filteredComplaints.length;
    const totalPages = Math.ceil(totalItems / filters.limit);
    const currentPage = filters.page;
    const startIndex = (currentPage - 1) * filters.limit;
    const endIndex = Math.min(startIndex + filters.limit, totalItems);
    
    // Slice for current page
    const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);
    
    // Get related data for each complaint
    const complaintsWithRelations = await Promise.all(
      paginatedComplaints.map(async (complaint) => {
        const complaintWithRelations = await this.getComplaintById(complaint.id);
        
        // Map to public fields only
        return {
          id: complaint.id,
          trackingId: complaint.trackingId,
          title: complaint.title,
          description: complaint.description,
          location: complaint.location,
          categoryId: complaint.categoryId,
          categoryName: complaintWithRelations.categoryName,
          status: complaint.status,
          createdAt: complaint.createdAt,
          updatedAt: complaint.updatedAt,
          attachments: complaintWithRelations.attachments,
          responses: complaintWithRelations.responses
        };
      })
    );
    
    return {
      complaints: complaintsWithRelations,
      pagination: {
        total: totalItems,
        totalPages,
        currentPage,
        limit: filters.limit,
        from: startIndex + 1,
        to: endIndex
      }
    };
  }

  async getAdminComplaints(filters: ComplaintFilterParams): Promise<{ complaints: Complaint[], pagination: any }> {
    // Start with all non-archived complaints
    let filteredComplaints = Array.from(this.complaintsMap.values()).filter(
      c => !c.isArchived
    );
    
    // Apply status filter if specified
    if (filters.status && filters.status !== "all") {
      filteredComplaints = filteredComplaints.filter(c => c.status === filters.status);
    }
    
    // Apply category filter if specified
    if (filters.category && filters.category !== "all") {
      filteredComplaints = filteredComplaints.filter(
        c => this.categoriesMap.get(c.categoryId)?.name.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    // Apply search filter if specified
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredComplaints = filteredComplaints.filter(
        c => c.title.toLowerCase().includes(searchLower) || 
             c.description.toLowerCase().includes(searchLower) ||
             c.name.toLowerCase().includes(searchLower) ||
             c.email.toLowerCase().includes(searchLower) ||
             c.trackingId.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created date (newest first)
    filteredComplaints.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Calculate pagination
    const totalItems = filteredComplaints.length;
    const totalPages = Math.ceil(totalItems / filters.limit);
    const currentPage = filters.page;
    const startIndex = (currentPage - 1) * filters.limit;
    const endIndex = Math.min(startIndex + filters.limit, totalItems);
    
    // Slice for current page
    const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);
    
    // Get category name for each complaint
    const complaintsWithCategory = await Promise.all(
      paginatedComplaints.map(async (complaint) => {
        let categoryName = "";
        if (complaint.categoryId) {
          const category = await this.getCategoryById(complaint.categoryId);
          if (category) {
            categoryName = category.name;
          }
        }
        
        return {
          ...complaint,
          categoryName
        };
      })
    );
    
    return {
      complaints: complaintsWithCategory,
      pagination: {
        total: totalItems,
        totalPages,
        currentPage,
        limit: filters.limit,
        from: startIndex + 1,
        to: endIndex
      }
    };
  }

  async verifyComplaint(id: number, approved: boolean, rejectionReason?: string): Promise<Complaint> {
    const complaint = this.complaintsMap.get(id);
    if (!complaint) {
      throw new Error("Complaint not found");
    }
    
    if (complaint.status !== "pending") {
      throw new Error("Complaint is not in pending status");
    }
    
    const now = new Date();
    
    if (approved) {
      // Approve complaint
      const updatedComplaint: Complaint = {
        ...complaint,
        status: "verified",
        isPublished: true,
        updatedAt: now
      };
      
      this.complaintsMap.set(id, updatedComplaint);
      return updatedComplaint;
    } else {
      // Reject complaint
      if (!rejectionReason) {
        throw new Error("Rejection reason is required");
      }
      
      const updatedComplaint: Complaint = {
        ...complaint,
        status: "rejected",
        rejectionReason,
        updatedAt: now
      };
      
      this.complaintsMap.set(id, updatedComplaint);
      return updatedComplaint;
    }
  }

  async updateComplaintStatus(id: number, status: string): Promise<Complaint> {
    const complaint = this.complaintsMap.get(id);
    if (!complaint) {
      throw new Error("Complaint not found");
    }
    
    // Validate status transition
    const validStatuses = ["pending", "verified", "rejected", "inprogress", "resolved"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }
    
    const now = new Date();
    const updatedComplaint: Complaint = {
      ...complaint,
      status,
      updatedAt: now
    };
    
    this.complaintsMap.set(id, updatedComplaint);
    return updatedComplaint;
  }

  async closeComplaint(id: number): Promise<Complaint> {
    const complaint = this.complaintsMap.get(id);
    if (!complaint) {
      throw new Error("Complaint not found");
    }
    
    const now = new Date();
    const updatedComplaint: Complaint = {
      ...complaint,
      status: "resolved",
      closedAt: now,
      updatedAt: now
    };
    
    this.complaintsMap.set(id, updatedComplaint);
    return updatedComplaint;
  }

  async getComplaintStats(): Promise<any> {
    const complaints = Array.from(this.complaintsMap.values());
    
    // Count complaints by status
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === "pending").length;
    const verified = complaints.filter(c => c.status === "verified").length;
    const rejected = complaints.filter(c => c.status === "rejected").length;
    const inprogress = complaints.filter(c => c.status === "inprogress").length;
    const resolved = complaints.filter(c => c.status === "resolved").length;
    
    return {
      total,
      pending,
      verified,
      rejected,
      inprogress,
      resolved
    };
  }

  // Attachment methods
  async addAttachment(attachmentData: InsertAttachment): Promise<Attachment> {
    const id = this.attachmentIdCounter++;
    const now = new Date();
    
    const attachment: Attachment = {
      id,
      complaintId: attachmentData.complaintId,
      filename: attachmentData.filename,
      originalName: attachmentData.originalName,
      mimeType: attachmentData.mimeType,
      createdAt: now
    };
    
    this.attachmentsMap.set(id, attachment);
    return attachment;
  }

  async getAttachmentsByComplaintId(complaintId: number): Promise<Attachment[]> {
    return Array.from(this.attachmentsMap.values()).filter(
      (attachment) => attachment.complaintId === complaintId
    );
  }

  // Response methods
  async addResponse(responseData: InsertResponse): Promise<Response> {
    const id = this.responseIdCounter++;
    const now = new Date();
    
    const response: Response = {
      id,
      complaintId: responseData.complaintId,
      content: responseData.content,
      isFromAdmin: responseData.isFromAdmin,
      createdAt: now
    };
    
    this.responsesMap.set(id, response);
    return response;
  }

  async getResponsesByComplaintId(complaintId: number): Promise<Response[]> {
    return Array.from(this.responsesMap.values())
      .filter(response => response.complaintId === complaintId)
      .sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }
}

export const storage = new MemStorage();
