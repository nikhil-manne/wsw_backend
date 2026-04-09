const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");

const REFRESH_COOKIE_NAME = "wsw_refresh";
const DEFAULT_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

function getRefreshTtlSeconds() {
  return Number(process.env.REFRESH_TOKEN_TTL_SECONDS || DEFAULT_REFRESH_TTL_SECONDS);
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function createRefreshTokenValue() {
  return crypto.randomBytes(48).toString("base64url");
}

function getCookieValue(request, name) {
  const cookies = String(request.headers.cookie || "").split(";");

  for (const item of cookies) {
    const [rawName, ...rawValueParts] = item.trim().split("=");
    if (rawName === name) {
      return decodeURIComponent(rawValueParts.join("="));
    }
  }

  return "";
}

function setRefreshCookie(reply, refreshToken) {
  const maxAge = getRefreshTtlSeconds();
  const secure = process.env.NODE_ENV === "production";
  const sameSite = secure ? "None" : "Lax";
  const cookieParts = [
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`,
    "HttpOnly",
    "Path=/api/auth",
    `Max-Age=${maxAge}`,
    `SameSite=${sameSite}`,
  ];

  if (secure) {
    cookieParts.push("Secure");
  }

  reply.header("Set-Cookie", cookieParts.join("; "));
}

function clearRefreshCookie(reply) {
  const secure = process.env.NODE_ENV === "production";
  const cookieParts = [
    `${REFRESH_COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/api/auth",
    "Max-Age=0",
    `SameSite=${secure ? "None" : "Lax"}`,
  ];

  if (secure) {
    cookieParts.push("Secure");
  }

  reply.header("Set-Cookie", cookieParts.join("; "));
}

async function createRefreshSession(userPayload) {
  const refreshToken = createRefreshTokenValue();
  const expiresAt = new Date(Date.now() + getRefreshTtlSeconds() * 1000);
  const userKey = `${userPayload.role}:${userPayload.username || userPayload.commissionerateKey}`;

  await RefreshToken.create({
    tokenHash: hashRefreshToken(refreshToken),
    userKey,
    userPayload,
    expiresAt,
  });

  return { refreshToken, expiresAt };
}

async function rotateRefreshSession(oldRefreshToken) {
  const tokenHash = hashRefreshToken(oldRefreshToken);
  const session = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  session.revokedAt = new Date();
  await session.save();

  const nextSession = await createRefreshSession(session.userPayload);

  return {
    ...nextSession,
    userPayload: session.userPayload,
  };
}

async function revokeRefreshSession(refreshToken) {
  if (!refreshToken) {
    return;
  }

  await RefreshToken.updateOne(
    { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

module.exports = {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  createRefreshSession,
  getCookieValue,
  rotateRefreshSession,
  revokeRefreshSession,
  setRefreshCookie,
};
