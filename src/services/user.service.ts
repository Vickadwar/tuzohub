import { db } from "../db";
import { users, userRoleEnum } from "../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class UserService {
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
    const { tenantId, email, firstName, lastName, role } = params;

    // Check if user exists
    const existing = await tx.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      throw new Error(`User with email ${email} already exists`);
    }

    const [newUser] = await tx.insert(users).values({
      id: uuidv4(),
      tenantId,
      email,
      firstName,
      lastName,
      role,
      status: "active",
      metadata: { inviteSentAt: new Date().toISOString() }
    }).returning();

    return newUser;
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

  static async updateProfile(userId: string, data: { firstName: string, lastName: string }, tx: any = db) {
    const [user] = await tx.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  static async getUsers(tenantId: string, tx: any = db) {
    return await tx.select().from(users).where(eq(users.tenantId, tenantId));
  }

  static async deactivateUser(userId: string, tx: any = db) {
    const [user] = await tx.update(users)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}
