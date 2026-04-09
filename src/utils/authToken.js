const crypto = require("crypto");

const DEFAULT_TTL_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_TOKEN_SECRET must be set to at least 32 characters");
  }

  return secret;
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function createAuthToken(payload) {
  const expiresAt =
    Math.floor(Date.now() / 1000) + Number(process.env.AUTH_TOKEN_TTL_SECONDS || DEFAULT_TTL_SECONDS);
  const body = base64UrlEncode(JSON.stringify({ ...payload, exp: expiresAt }));
  const signature = signValue(body);

  return `${body}.${signature}`;
}

function verifyAuthToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [body, signature] = token.split(".");
  const expectedSignature = signValue(body);

  if (!signature || signature.length !== expectedSignature.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(body));

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

module.exports = {
  createAuthToken,
  verifyAuthToken,
};
