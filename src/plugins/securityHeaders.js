async function registerSecurityHeaders(app) {
  app.addHook("onSend", async (request, reply) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
    reply.header(
      "Content-Security-Policy",
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
    );
    reply.header(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains"
    );
  });
}

module.exports = {
  registerSecurityHeaders,
};
