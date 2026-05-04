import { db } from "../db";
import { externalWebhooks } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export class WebhookService {
  static async createWebhook(
    tenantId: string,
    data: {
      name: string;
      url: string;
      eventTypes: string[];
    },
    tx: any = db
  ) {
    const { name, url, eventTypes } = data;

    // Generate a secure signing secret
    const secretKey = crypto.randomBytes(32).toString("hex");

    const [webhook] = await tx.insert(externalWebhooks).values({
      id: uuidv4(),
      tenantId,
      name,
      url,
      eventTypes,
      secretKey,
      isActive: true,
    }).returning();

    return webhook;
  }

  static async getTenantWebhooks(tenantId: string, tx: any = db) {
    return await tx.select().from(externalWebhooks).where(
      and(
        eq(externalWebhooks.tenantId, tenantId),
        eq(externalWebhooks.isActive, true)
      )
    );
  }
}
