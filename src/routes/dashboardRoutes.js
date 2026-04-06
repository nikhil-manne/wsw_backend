const { getDashboardComplaints } = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authenticate");

async function registerDashboardRoutes(fastify) {
  fastify.get("/complaints", { preHandler: authenticate }, getDashboardComplaints);
}

module.exports = {
  registerDashboardRoutes,
};
