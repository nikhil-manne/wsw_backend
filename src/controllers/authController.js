const {
  authenticateAdminUser,
  authenticateBoothUser,
  authenticateCommissionerateUser,
  bootstrapAdminUser,
  hasAdminUsers,
} = require("../services/dashboardUserService");
const { createAuthToken } = require("../utils/authToken");

async function loginAdmin(request, reply) {
  const { username, password } = request.body;
  const user = await authenticateAdminUser({ username, password });

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

async function loginCommissionerate(request, reply) {
  const { commissionerateKey, password } = request.body;
  const user = await authenticateCommissionerateUser({
    commissionerateKey,
    password,
  });

  if (!user) {
    return reply.status(401).send({
      message: "Invalid commissionerate key or password",
    });
  }

  const token = createAuthToken({
    username: user.username,
    role: user.role,
    commissionerate: user.commissionerate,
    commissionerateKey: user.commissionerateKey,
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

async function loginBooth(request, reply) {
  const { username, password } = request.body;
  const user = await authenticateBoothUser({ username, password });

  if (!user) {
    return reply.status(401).send({
      message: "Invalid booth username or password",
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

async function getBootstrapStatus(request, reply) {
  const adminConfigured = await hasAdminUsers();

  return reply.send({
    message: "Bootstrap status fetched successfully",
    data: {
      adminConfigured,
    },
  });
}

async function bootstrapAdmin(request, reply) {
  const { username, password } = request.body;

  try {
    const admin = await bootstrapAdminUser({ username, password });

    return reply.status(201).send({
      message: "Admin account created successfully",
      data: admin,
    });
  } catch (error) {
    if (error.code === "ADMIN_ALREADY_EXISTS") {
      return reply.status(409).send({
        message: error.message,
      });
    }

    throw error;
  }
}

module.exports = {
  loginAdmin,
  loginBooth,
  loginCommissionerate,
  getBootstrapStatus,
  bootstrapAdmin,
};
