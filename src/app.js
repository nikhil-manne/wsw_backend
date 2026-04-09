const Fastify = require("fastify");
const cors = require("@fastify/cors");
const { registerAdminRoutes } = require("./routes/adminRoutes");
const { registerAuthRoutes } = require("./routes/authRoutes");
const { registerDashboardRoutes } = require("./routes/dashboardRoutes");
const { registerComplaintRoutes } = require("./routes/complaintRoutes");
const { connectToDatabase } = require("./config/database");
const { registerSecurityHeaders } = require("./plugins/securityHeaders");

function getCorsOrigin() {
  const origin = process.env.CORS_ORIGIN;

  if (!origin || origin === "*") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CORS_ORIGIN must be set to explicit origin(s) in production");
    }

    return true;
  }

  const origins = origin
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return origins.length === 1 ? origins[0] : origins;
}

async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(registerSecurityHeaders);
  await app.register(cors, {
    origin: getCorsOrigin(),
    credentials: true,
  });

  app.get("/api/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  await connectToDatabase(app);
  await app.register(registerAuthRoutes, { prefix: "/api/auth" });
  await app.register(registerAdminRoutes, { prefix: "/api/admin" });
  await app.register(registerComplaintRoutes, { prefix: "/api/complaints" });
  await app.register(registerDashboardRoutes, { prefix: "/api/dashboard" });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        message: "Validation failed",
        errors: error.validation,
      });
    }

    return reply.status(error.statusCode || 500).send({
      message: error.message || "Internal server error",
    });
  });

  return app;
}

module.exports = {
  buildApp,
};
