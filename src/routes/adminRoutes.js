const {
  getCommissionerateUsers,
  createOrUpdateCommissionerate,
} = require("../controllers/adminController");
const { authenticate, requireAdmin } = require("../middleware/authenticate");

const commissionerateSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["commissionerateKey", "password"],
    properties: {
      commissionerateKey: { type: "string", minLength: 1 },
      password: { type: "string", minLength: 8 },
    },
  },
};

async function registerAdminRoutes(fastify) {
  fastify.route({
    method: "GET",
    url: "/commissionerate",
    preHandler: [authenticate, requireAdmin],
    handler: getCommissionerateUsers,
  });

  fastify.route({
    method: "POST",
    url: "/commissionerate",
    preHandler: [authenticate, requireAdmin],
    schema: commissionerateSchema,
    handler: createOrUpdateCommissionerate,
  });
}

module.exports = {
  registerAdminRoutes,
};
