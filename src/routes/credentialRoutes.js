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
  fastify.get(
    "/commissionerate-users",
    { preHandler: [authenticate, requireAdmin] },
    listCommissionerateCredentials
  );

  fastify.put(
    "/commissionerate-users/:commissionerateKey/password",
    {
      preHandler: [authenticate, requireAdmin],
      schema: changePasswordSchema,
    },
    changeCommissioneratePassword
  );
}

module.exports = {
  registerCredentialRoutes,
};
