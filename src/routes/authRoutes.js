const { login } = require("../controllers/authController");

const loginSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["username", "password", "portal"],
    properties: {
      username: { type: "string", minLength: 1 },
      password: { type: "string", minLength: 1 },
      portal: { type: "string", enum: ["sub", "admin"] },
    },
  },
};

async function registerAuthRoutes(fastify) {
  fastify.post("/login", { schema: loginSchema }, login);
}

module.exports = {
  registerAuthRoutes,
};
