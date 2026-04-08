const {
  listCommissionerateCredentials,
  changeCommissioneratePassword,
} = require("../controllers/credentialController");
const { authenticate, requireAdmin } = require("../middleware/authenticate");

const changePasswordSchema = {
  params: {
    type: "object",
    additionalProperties: false,
    required: ["commissionerateKey"],
    properties: {
      commissionerateKey: { type: "string", minLength: 1 },
    },
  },
  body: {
    type: "object",
    additionalProperties: false,
    required: ["password"],
    properties: {
      password: { type: "string", minLength: 6 },
    },
  },
};

async function registerCredentialRoutes(fastify) {
  fastify.route({
    method: "GET",
    url: "/commissionerate-users",
    preHandler: [authenticate, requireAdmin],
    handler: listCommissionerateCredentials,
  });

  fastify.route({
    method: "PUT",
    url: "/commissionerate-users/:commissionerateKey/password",
    preHandler: [authenticate, requireAdmin],
    schema: changePasswordSchema,
    handler: changeCommissioneratePassword,
  });
}

module.exports = {
  registerCredentialRoutes,
};
