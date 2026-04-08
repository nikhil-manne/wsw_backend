const crypto = require("crypto");

function getEncryptionSecret() {
  const secret =
    process.env.CREDENTIAL_ENCRYPTION_SECRET || process.env.AUTH_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "Missing CREDENTIAL_ENCRYPTION_SECRET or AUTH_TOKEN_SECRET in backend/.env"
    );
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function encryptText(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

function decryptText(payload) {
  const [ivHex, tagHex, encryptedHex] = String(payload || "").split(":");

  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error("Invalid encrypted payload format");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionSecret(),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

module.exports = {
  encryptText,
  decryptText,
};
