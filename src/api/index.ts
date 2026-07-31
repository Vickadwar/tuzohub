import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { authMiddleware } from "./middleware/auth";
import loyaltyRoutes from "./routes/loyalty";
import consumerRoutes from "./routes/consumer";
import tenantRoutes from "./routes/tenant";
import usersRoutes from "./routes/users";
import campaignsRoutes from "./routes/campaigns";
import productsRoutes from "./routes/products";
import productBatchesRoutes from "./routes/product-batches";
import rewardsRoutes from "./routes/rewards";
import webhooksRoutes from "./routes/webhooks";
import partnersRoutes from "./routes/partners";
import vouchersRoutes from "./routes/vouchers";
import ussdRoutes from "./routes/ussd";
import locationsRoutes from "./routes/locations";
import salesRoutes from "./routes/sales";
import organizationsRoutes from "./routes/organizations";
import transactionsRoutes from "./routes/transactions";
import smsRoutes from "./routes/sms";
import mpesaRoutes from "./routes/mpesa";
import publicRoutes from "./routes/public";
import systemRoutes from "./routes/system";
import billingRoutes from "./routes/billing";
import auditRoutes from "./routes/audit";

type Variables = {
  user: {
    userId: string;
    tenantId: string | null;
    role: string | null;
  }
};

const app = new Hono<{ Variables: Variables }>().basePath("/api");

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors({
  origin: "*", // Adjust for production
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
}));

// Public Routes
app.route("/public", publicRoutes);

// USSD, SMS & M-Pesa callbacks are PUBLIC
app.route("/ussd", ussdRoutes);
app.route("/sms", smsRoutes);
app.route("/mpesa", mpesaRoutes);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "TuzoHub API",
    version: "2026.1.0"
  });
});

// Protected Routes
app.use("*", authMiddleware);

app.get("/me", (c) => {
  const user = c.get("user");
  return c.json({
    success: true,
    user
  });
});

// Mounted Routes
app.route("/loyalty", loyaltyRoutes);
app.route("/consumers", consumerRoutes);
app.route("/tenants", tenantRoutes);
app.route("/users", usersRoutes);
app.route("/campaigns", campaignsRoutes);
app.route("/products", productsRoutes);
app.route("/product-batches", productBatchesRoutes);
app.route("/rewards", rewardsRoutes);
app.route("/webhooks", webhooksRoutes);
app.route("/partners", partnersRoutes);
app.route("/vouchers", vouchersRoutes);
app.route("/locations", locationsRoutes);
app.route("/sales", salesRoutes);
app.route("/organizations", organizationsRoutes);
app.route("/transactions", transactionsRoutes);
app.route("/system", systemRoutes);
app.route("/billing", billingRoutes);
app.route("/audit-logs", auditRoutes);

// Error Handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({
    error: err.message || "Internal Server Error",
    success: false
  }, 500);
});


export default app;
