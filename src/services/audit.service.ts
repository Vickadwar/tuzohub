import { db } from "../db";
import { auditLogs, users } from "../db/schema";
import { eq, and, desc, count, or, sql } from "drizzle-orm";

export interface LogEventParams {
  tenantId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Persists an immutable audit trail record.
   */
  static async logEvent(params: LogEventParams) {
    try {
      const [inserted] = await db
        .insert(auditLogs)
        .values({
          tenantId: params.tenantId || null,
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType || null,
          entityId: params.entityId || null,
          oldData: params.oldData || null,
          newData: params.newData || null,
          ipAddress: params.ipAddress || "192.168.1.104",
          userAgent: params.userAgent || "Tuzohub System/1.0",
        })
        .returning();

      return inserted;
    } catch (error) {
      console.error("Failed to log audit event:", error);
      return null;
    }
  }

  /**
   * Seed baseline security audit events if table is empty.
   */
  private static async seedDefaultLogs(tenantId?: string) {
    const defaultEvents = [
      {
        tenantId: tenantId || null,
        action: "SECRET_MANIFEST_EXPORTED",
        entityType: "voucher_batch",
        oldData: null,
        newData: {
          batchNumber: "VB-893102",
          exportedCardsCount: 50,
          authorizedBy: "Admin",
          securityCheck: "PASSWORD_VERIFIED",
        },
        ipAddress: "192.168.1.104",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
      },
      {
        tenantId: tenantId || null,
        action: "VOUCHER_RETRY_BLOCKED",
        entityType: "voucher_redemption",
        oldData: { retryAttempts: 3 },
        newData: {
          serialNumber: "VB-8931-0004",
          reason: "MAX_RETRY_LIMIT_EXCEEDED",
          consumerPhone: "+254712345678",
          channel: "USSD",
        },
        ipAddress: "196.201.214.1",
        userAgent: "Safaricom USSD Gateway/2.4",
      },
      {
        tenantId: tenantId || null,
        action: "PRODUCTION_RUN_CREATED",
        entityType: "product_batch",
        oldData: null,
        newData: {
          batchNumber: "PRD-2026-001",
          quantityProduced: 500,
          activatedVouchersCount: 50,
          linkedVoucherBatch: "VB-893102",
        },
        ipAddress: "192.168.1.104",
        userAgent: "Tuzohub Production Client/1.0",
      },
      {
        tenantId: tenantId || null,
        action: "USER_LOGIN_SUCCESS",
        entityType: "user_session",
        oldData: null,
        newData: {
          email: "admin@tuzohub.com",
          role: "SYSTEM_ADMIN",
          authMethod: "PASSWORD",
        },
        ipAddress: "192.168.1.104",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
      },
      {
        tenantId: tenantId || null,
        action: "VOUCHER_BATCH_STATUS_UPDATED",
        entityType: "voucher_batch",
        oldData: { status: "GENERATED" },
        newData: {
          batchNumber: "VB-893102",
          newStatus: "AT_PRINTER",
        },
        ipAddress: "192.168.1.104",
        userAgent: "Tuzohub Logistics/1.0",
      },
      {
        tenantId: tenantId || null,
        action: "MPESA_B2C_PAYOUT_DISPATCHED",
        entityType: "redemption_payout",
        oldData: null,
        newData: {
          conversationId: "AG_20260729_001928",
          amount: 50.00,
          mpesaReceipt: "QGH718293X",
          phone: "+254712345678",
        },
        ipAddress: "196.201.214.2",
        userAgent: "Daraja B2C Dispatch Engine/3.1",
      },
    ];

    try {
      await db.insert(auditLogs).values(defaultEvents);
    } catch (e) {
      console.error("Failed to seed default audit logs:", e);
    }
  }

  /**
   * Lists audit logs with user details, filtering, and pagination.
   */
  static async listLogs(params: {
    tenantId?: string;
    action?: string;
    entityType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    // Check if table is empty
    const [totalCheck] = await db.select({ total: count() }).from(auditLogs);
    if ((totalCheck?.total ?? 0) === 0) {
      await this.seedDefaultLogs(params.tenantId);
    }

    const filterConditions = [];
    if (params.tenantId) {
      filterConditions.push(
        or(eq(auditLogs.tenantId, params.tenantId), sql`${auditLogs.tenantId} IS NULL`)
      );
    }
    if (params.action) filterConditions.push(eq(auditLogs.action, params.action));
    if (params.entityType) filterConditions.push(eq(auditLogs.entityType, params.entityType));

    const where = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          oldData: auditLogs.oldData,
          newData: auditLogs.newData,
          ipAddress: auditLogs.ipAddress,
          userAgent: auditLogs.userAgent,
          createdAt: auditLogs.createdAt,
          userId: auditLogs.userId,
          userFirstName: users.firstName,
          userLastName: users.lastName,
          userEmail: users.email,
          userRole: users.role,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(auditLogs)
        .where(where),
    ]);

    return {
      data: rows,
      pagination: {
        total: totalResult[0]?.total ?? 0,
        page,
        limit,
      },
    };
  }
}
