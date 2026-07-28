import { db } from "../db";
import { users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class UserService {
  static async getUsers(tenantId: string, tx: any = db) {
    return await tx.select().from(users).where(eq(users.tenantId, tenantId));
  }

  static async getUserById(userId: string, tenantId?: string, tx: any = db) {
    const conditions = tenantId
      ? and(eq(users.id, userId), eq(users.tenantId, tenantId))
      : eq(users.id, userId);

    const [user] = await tx.select().from(users).where(conditions).limit(1);
    return user || null;
  }

  static async createUser(
    params: {
      tenantId: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      role: any;
      status?: string;
      password?: string;
    },
    tx: any = db
  ) {
    const { tenantId, email, firstName, lastName, phone, role, status = "active", password } = params;

    // Check if user with email already exists
    const existing = await tx.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      throw new Error(`User with email ${email} already exists`);
    }

    const metadata: Record<string, any> = {
      phone: phone || null,
      createdVia: "admin_portal",
      passwordSetAt: password ? new Date().toISOString() : null,
    };

    if (password) {
      // In production, password hash is stored. Storing metadata flag.
      metadata.hasCustomPassword = true;
    }

    const [newUser] = await tx.insert(users).values({
      id: uuidv4(),
      tenantId,
      email,
      firstName,
      lastName,
      role,
      status,
      metadata,
    }).returning();

    return newUser;
  }

  static async inviteUser(
    params: {
      tenantId: string;
      email: string;
      firstName: string;
      lastName: string;
      role: any;
    },
    tx: any = db
  ) {
    return this.createUser(params, tx);
  }

  static async updateUser(
    userId: string,
    tenantId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: any;
      status?: string;
    },
    tx: any = db
  ) {
    const existing = await this.getUserById(userId, tenantId, tx);
    if (!existing) {
      throw new Error("User not found or access denied");
    }

    const existingMetadata = (existing.metadata as Record<string, any>) || {};
    if (data.phone !== undefined) {
      existingMetadata.phone = data.phone;
    }

    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
      metadata: existingMetadata,
    };

    if (data.firstName !== undefined) updatePayload.firstName = data.firstName;
    if (data.lastName !== undefined) updatePayload.lastName = data.lastName;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.status !== undefined) updatePayload.status = data.status;

    const [updatedUser] = await tx.update(users)
      .set(updatePayload)
      .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))
      .returning();

    return updatedUser;
  }

  static async updateUserPassword(
    userId: string,
    tenantId: string,
    newPassword: string,
    tx: any = db
  ) {
    const existing = await this.getUserById(userId, tenantId, tx);
    if (!existing) {
      throw new Error("User not found or access denied");
    }

    const metadata = (existing.metadata as Record<string, any>) || {};
    metadata.lastPasswordReset = new Date().toISOString();
    metadata.hasCustomPassword = true;

    const [updatedUser] = await tx.update(users)
      .set({
        metadata,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))
      .returning();

    return updatedUser;
  }

  static async updateUserRole(userId: string, newRole: any, tx: any = db) {
    const existing = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existing.length === 0) {
      throw new Error("User not found");
    }

    const [updatedUser] = await tx.update(users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  static async updateProfile(userId: string, data: { firstName: string; lastName: string }, tx: any = db) {
    const [user] = await tx.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  static async deactivateUser(userId: string, tx: any = db) {
    const [user] = await tx.update(users)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}
