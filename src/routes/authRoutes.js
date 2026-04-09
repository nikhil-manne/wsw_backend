const {
  loginAdmin,
  loginBooth,
  loginCommissionerate,
  logoutAuthSession,
  refreshAuthSession,
  getBootstrapStatus,
  bootstrapAdmin,
} = require("../controllers/authController");
const { rateLimit } = require("../middleware/rateLimit");

const loginRateLimit = rateLimit({
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX || 10),
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 60_000),
  scope: "auth",
});

const bootstrapRateLimit = rateLimit({
  max: Number(process.env.BOOTSTRAP_RATE_LIMIT_MAX || 5),
  windowMs: Number(process.env.BOOTSTRAP_RATE_LIMIT_WINDOW_MS || 60_000),
  scope: "bootstrap",
});

const adminLoginSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["username", "password"],
    properties: {
      username: { type: "string", minLength: 1 },
      password: { type: "string", minLength: 1 },
    },
  },
};

const bootstrapAdminSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["username", "password"],
    properties: {
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 8 },
    },
  },
};

const commissionerateLoginSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["commissionerateKey", "password"],
    properties: {
      commissionerateKey: { type: "string", minLength: 1 },
      password: { type: "string", minLength: 1 },
    },
  },
};

const boothLoginSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["username", "password"],
    properties: {
      username: { type: "string", minLength: 1 },
      password: { type: "string", minLength: 1 },
    },
  },
};

async function registerAuthRoutes(fastify) {
  fastify.route({
    method: "GET",
    url: "/bootstrap-status",
    handler: getBootstrapStatus,
  });

  fastify.route({
    method: "POST",
    url: "/bootstrap-admin",
    preHandler: bootstrapRateLimit,
    schema: bootstrapAdminSchema,
    handler: bootstrapAdmin,
  });

  fastify.route({
    method: "POST",
    url: "/login",
    preHandler: loginRateLimit,
    schema: adminLoginSchema,
    handler: loginAdmin,
  });

  fastify.route({
    method: "POST",
    url: "/commissionerate/login",
    preHandler: loginRateLimit,
    schema: commissionerateLoginSchema,
    handler: loginCommissionerate,
  });

  fastify.route({
    method: "POST",
    url: "/booth/login",
    preHandler: loginRateLimit,
    schema: boothLoginSchema,
    handler: loginBooth,
  });

  fastify.route({
    method: "POST",
    url: "/refresh",
    preHandler: loginRateLimit,
    handler: refreshAuthSession,
  });

  fastify.route({
    method: "POST",
    url: "/logout",
    handler: logoutAuthSession,
  });
}

module.exports = {
  registerAuthRoutes,
};
