const Fastify = require("fastify");
const cors = require("@fastify/cors");
const { registerAuthRoutes } = require("./routes/authRoutes");
const { registerDashboardRoutes } = require("./routes/dashboardRoutes");
const { registerCredentialRoutes } = require("./routes/credentialRoutes");
const { registerComplaintRoutes } = require("./routes/complaintRoutes");
const { connectToDatabase } = require("./config/database");

async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
  });

  app.get("/api/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  await connectToDatabase(app);
  await app.register(registerAuthRoutes, { prefix: "/api/auth" });
  await app.register(registerComplaintRoutes, { prefix: "/api/complaints" });
  await app.register(registerDashboardRoutes, { prefix: "/api/dashboard" });
  await app.register(registerCredentialRoutes, { prefix: "/api/dashboard" });

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
