const {
  authenticateAdminUser,
  authenticateBoothUser,
  authenticateCommissionerateUser,
  bootstrapAdminUser,
  hasAdminUsers,
} = require("../services/dashboardUserService");
const {
  clearRefreshCookie,
  createRefreshSession,
  getCookieValue,
  REFRESH_COOKIE_NAME,
  rotateRefreshSession,
  revokeRefreshSession,
  setRefreshCookie,
} = require("../services/sessionService");
const { auditLog } = require("../services/auditLogService");
const { createAuthToken } = require("../utils/authToken");

function buildTokenPayload(user) {
  return {
    username: user.username,
    role: user.role,
    commissionerate: user.commissionerate,
    commissionerateKey: user.commissionerateKey,
    portal: user.portal,
  };
}

async function sendLoginSession(request, reply, user) {
  const tokenPayload = buildTokenPayload(user);
  const { refreshToken } = await createRefreshSession(tokenPayload);

  setRefreshCookie(reply, refreshToken);
  auditLog(request, "auth.login.success", {
    username: user.username,
    role: user.role,
    portal: user.portal,
  });

  return reply.send({
    message: "Login successful",
    data: {
      token: createAuthToken(tokenPayload),
      user,
    },
  });
}

async function loginAdmin(request, reply) {
  const { username, password } = request.body;
  const user = await authenticateAdminUser({ username, password });

  if (!user) {
    auditLog(request, "auth.login.failure", { username, role: "admin" });
    return reply.status(401).send({
      message: "Invalid username or password",
    });
  }

  return sendLoginSession(request, reply, user);
}

async function loginCommissionerate(request, reply) {
  const { commissionerateKey, password } = request.body;
  const user = await authenticateCommissionerateUser({
    commissionerateKey,
    password,
  });

  if (!user) {
    auditLog(request, "auth.login.failure", {
      commissionerateKey,
      role: "commissionerate",
    });
    return reply.status(401).send({
      message: "Invalid commissionerate key or password",
    });
  }

  return sendLoginSession(request, reply, user);
}

async function loginBooth(request, reply) {
  const { username, password } = request.body;
  const user = await authenticateBoothUser({ username, password });

  if (!user) {
    auditLog(request, "auth.login.failure", { username, role: "booth" });
    return reply.status(401).send({
      message: "Invalid booth username or password",
    });
  }

  return sendLoginSession(request, reply, user);
}

async function refreshAuthSession(request, reply) {
  const refreshToken = getCookieValue(request, REFRESH_COOKIE_NAME);
  const session = await rotateRefreshSession(refreshToken);

  if (!session) {
    clearRefreshCookie(reply);
    return reply.status(401).send({
      message: "Refresh session expired. Please login again.",
    });
  }

  setRefreshCookie(reply, session.refreshToken);
  auditLog(request, "auth.refresh.success", {
    username: session.userPayload.username,
    role: session.userPayload.role,
  });

  return reply.send({
    message: "Session refreshed successfully",
    data: {
      token: createAuthToken(session.userPayload),
      user: session.userPayload,
    },
  });
}

async function logoutAuthSession(request, reply) {
  const refreshToken = getCookieValue(request, REFRESH_COOKIE_NAME);
  await revokeRefreshSession(refreshToken);
  clearRefreshCookie(reply);
  auditLog(request, "auth.logout", {});

  return reply.send({
    message: "Logout successful",
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
  bootstrapAdmin,
  getBootstrapStatus,
  loginAdmin,
  loginBooth,
  loginCommissionerate,
  logoutAuthSession,
  refreshAuthSession,
};
