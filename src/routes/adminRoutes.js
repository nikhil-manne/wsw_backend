const {
  getCommissionerateUsers,
  getBoothUsers,
  createOrUpdateBooth,
  createOrUpdateCommissionerate,
  deleteBooth,
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

const boothSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["username", "commissionerateKey", "boothLocation"],
    properties: {
      id: { type: "string", minLength: 1 },
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 8 },
      commissionerateKey: { type: "string", minLength: 1 },
      boothLocation: {
        type: "object",
        additionalProperties: false,
        required: ["latitude", "longitude"],
        properties: {
          latitude: { type: "number", minimum: -90, maximum: 90 },
          longitude: { type: "number", minimum: -180, maximum: 180 },
        },
      },
    },
    anyOf: [
      { required: ["id"] },
      { required: ["password"] },
    ],
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

  fastify.route({
    method: "GET",
    url: "/booths",
    preHandler: [authenticate, requireAdmin],
    handler: getBoothUsers,
  });

  fastify.route({
    method: "POST",
    url: "/booths",
    preHandler: [authenticate, requireAdmin],
    schema: boothSchema,
    handler: createOrUpdateBooth,
  });

  fastify.route({
    method: "DELETE",
    url: "/booths/:id",
    preHandler: [authenticate, requireAdmin],
    handler: deleteBooth,
  });
}

module.exports = {
  registerAdminRoutes,
};
