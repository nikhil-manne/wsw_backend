const {
  getDashboardComplaintById,
  getDashboardComplaints,
} = require("../controllers/dashboardController");
const { authenticate, requireDashboardUser } = require("../middleware/authenticate");

const dashboardPreHandlers = [authenticate, requireDashboardUser];
const objectIdPattern = "^[a-fA-F0-9]{24}$";

const dashboardListSchema = {
  querystring: {
    type: "object",
    additionalProperties: false,
    properties: {
      page: { type: "integer", minimum: 1 },
      limit: { type: "integer", minimum: 1, maximum: 100 },
    },
  },
};

const dashboardDetailSchema = {
  params: {
    type: "object",
    additionalProperties: false,
    required: ["id"],
    properties: {
      id: { type: "string", pattern: objectIdPattern },
    },
  },
};

async function registerDashboardRoutes(fastify) {
  fastify.get(
    "/complaints",
    { preHandler: dashboardPreHandlers, schema: dashboardListSchema },
    getDashboardComplaints
  );

  fastify.get(
    "/complaints/:id",
    { preHandler: dashboardPreHandlers, schema: dashboardDetailSchema },
    getDashboardComplaintById
  );
}

module.exports = {
  registerDashboardRoutes,
};
