const { verifyAuthToken } = require("../utils/authToken");

async function authenticate(request, reply) {
  const authorization = request.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return reply.status(401).send({
      message: "Authentication required",
    });
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return reply.status(401).send({
      message: "Invalid or expired token",
    });
  }

  request.user = payload;
}

function requireAdmin(request, reply, done) {
  if (request.user?.role !== "admin") {
    return reply.status(403).send({
      message: "Admin access required",
    });
  }

  done();
}

module.exports = {
  authenticate,
  requireAdmin,
};
