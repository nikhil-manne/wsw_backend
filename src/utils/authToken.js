const crypto = require("crypto");

const DEFAULT_ACCESS_TTL_SECONDS = 15 * 60;

function getSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_TOKEN_SECRET must be set to at least 32 characters");
  }

  return secret;
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signJwtSegment(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function createAuthToken(payload) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + Number(process.env.AUTH_TOKEN_TTL_SECONDS || DEFAULT_ACCESS_TTL_SECONDS);
  const header = base64UrlJson({
    alg: "HS256",
    typ: "JWT",
  });
  const body = base64UrlJson({
    ...payload,
    iat: issuedAt,
    exp: expiresAt,
  });
  const signingInput = `${header}.${body}`;
  const signature = signJwtSegment(signingInput);

  return `${signingInput}.${signature}`;
}

function verifyAuthToken(token) {
  if (!token || token.split(".").length !== 3) {
    return null;
  }

  const [header, body, signature] = token.split(".");
  const signingInput = `${header}.${body}`;
  const expectedSignature = signJwtSegment(signingInput);

  if (!signature || signature.length !== expectedSignature.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const decodedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));

  if (decodedHeader.alg !== "HS256" || decodedHeader.typ !== "JWT") {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

module.exports = {
  createAuthToken,
  verifyAuthToken,
};
