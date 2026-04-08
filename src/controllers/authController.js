const { authenticateDashboardUser } = require("../config/dashboardUsers");
const { createAuthToken } = require("../utils/authToken");

async function login(request, reply) {
  const { username, password, portal } = request.body;
  const user = await authenticateDashboardUser({ username, password, portal });

  if (!user) {
    return reply.status(401).send({
      message: "Invalid username or password",
    });
  }

  const token = createAuthToken({
    username: user.username,
    role: user.role,
    commissionerate: user.commissionerate,
    portal: user.portal,
  });

  return reply.send({
    message: "Login successful",
    data: {
      token,
      user,
    },
  });
}

module.exports = {
  login,
};
