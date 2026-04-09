const assert = require("node:assert/strict");
const { test } = require("node:test");

process.env.AUTH_TOKEN_SECRET = "test-secret-with-at-least-32-characters";

const { createApplicationNumber } = require("../src/controllers/complaintController");
const { createAuthToken, verifyAuthToken } = require("../src/utils/authToken");

test("auth tokens round-trip signed payloads", () => {
  const token = createAuthToken({
    username: "admin",
    role: "admin",
  });

  const payload = verifyAuthToken(token);

  assert.equal(payload.username, "admin");
  assert.equal(payload.role, "admin");
  assert.equal(typeof payload.exp, "number");
});

test("tampered auth tokens fail verification", () => {
  const token = createAuthToken({
    username: "admin",
    role: "admin",
  });

  assert.equal(verifyAuthToken(`${token}x`), null);
});

test("complaint application numbers use backend format and entropy", () => {
  const value = createApplicationNumber(new Date("2026-04-09T10:00:00.000Z"));

  assert.match(value, /^TG-260409-[A-Z0-9_-]{7}$/);
});
