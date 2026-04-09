const {
  loginAdmin,
  loginBooth,
  loginCommissionerate,
  getBootstrapStatus,
  bootstrapAdmin,
} = require("../controllers/authController");

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
    schema: bootstrapAdminSchema,
    handler: bootstrapAdmin,
  });

  fastify.route({
    method: "POST",
    url: "/login",
    schema: adminLoginSchema,
    handler: loginAdmin,
  });

  fastify.route({
    method: "POST",
    url: "/commissionerate/login",
    schema: commissionerateLoginSchema,
    handler: loginCommissionerate,
  });

  fastify.route({
    method: "POST",
    url: "/booth/login",
    schema: boothLoginSchema,
    handler: loginBooth,
  });
}

module.exports = {
  registerAuthRoutes,
};
