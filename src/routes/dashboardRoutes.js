const {
  getDashboardComplaintById,
  getDashboardComplaints,
} = require("../controllers/dashboardController");
const { authenticate, requireDashboardUser } = require("../middleware/authenticate");

const dashboardPreHandlers = [authenticate, requireDashboardUser];

async function registerDashboardRoutes(fastify) {
  fastify.get(
    "/complaints",
    { preHandler: dashboardPreHandlers },
    getDashboardComplaints
  );

  fastify.get(
    "/complaints/:id",
    { preHandler: dashboardPreHandlers },
    getDashboardComplaintById
  );
}

module.exports = {
  registerDashboardRoutes,
};
