const DashboardCredential = require("../models/DashboardCredential");
const { COMMISSIONERATES } = require("../config/commissionerates");
const { hasEncryptionSecret, encryptText, decryptText } = require("../utils/crypto");

function readLegacyCommissionerateEnv(key) {
  const normalizedKey = key.toUpperCase();
  const username = process.env[`${normalizedKey}_USERNAME`];
  const password = process.env[`${normalizedKey}_PASSWORD`];

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

async function ensureCommissionerateCredentialsSeeded() {
  if (!hasEncryptionSecret()) {
    return false;
  }

  const operations = Object.entries(COMMISSIONERATES).map(async ([key, commissionerate]) => {
    const existing = await DashboardCredential.findOne({ commissionerateKey: key }).lean();

    if (existing) {
      return existing;
    }

    const legacyCredentials = readLegacyCommissionerateEnv(key);

    if (!legacyCredentials) {
      return null;
    }

    return DashboardCredential.create({
      portal: "sub",
      role: "commissionerate",
      commissionerateKey: key,
      commissionerate,
      username: legacyCredentials.username,
      encryptedPassword: encryptText(legacyCredentials.password),
      lastPasswordChangeAt: new Date(),
    });
  });

  await Promise.all(operations);
  return true;
}

function getLegacyCommissionerateUsers() {
  return Object.entries(COMMISSIONERATES)
    .map(([key, commissionerate]) => {
      const legacyCredentials = readLegacyCommissionerateEnv(key);

      if (!legacyCredentials) {
        return null;
      }

      return {
        id: `legacy-${key}`,
        role: "commissionerate",
        portal: "sub",
        commissionerateKey: key,
        commissionerate,
        username: legacyCredentials.username,
        lastPasswordChangeAt: null,
        storageMode: "env",
      };
    })
    .filter(Boolean);
}

function authenticateLegacyCommissionerateUser({ username, password }) {
  const matchingUser = Object.entries(COMMISSIONERATES)
    .map(([key, commissionerate]) => {
      const legacyCredentials = readLegacyCommissionerateEnv(key);

      if (!legacyCredentials) {
        return null;
      }

      return {
        username: legacyCredentials.username,
        password: legacyCredentials.password,
        commissionerate,
      };
    })
    .filter(Boolean)
    .find((user) => user.username === username && user.password === password);

  if (!matchingUser) {
    return null;
  }

  return {
    username: matchingUser.username,
    role: "commissionerate",
    commissionerate: matchingUser.commissionerate,
    portal: "sub",
  };
}

async function getCommissionerateUsers() {
  const didSeed = await ensureCommissionerateCredentialsSeeded();

  if (!didSeed) {
    return getLegacyCommissionerateUsers();
  }

  const credentials = await DashboardCredential.find({ portal: "sub", role: "commissionerate" })
    .sort({ commissionerate: 1 })
    .lean();

  return credentials.map((item) => ({
    id: String(item._id),
    role: item.role,
    portal: item.portal,
    commissionerateKey: item.commissionerateKey,
    commissionerate: item.commissionerate,
    username: item.username,
    lastPasswordChangeAt: item.lastPasswordChangeAt,
    storageMode: "database",
  }));
}

async function authenticateCommissionerateUser({ username, password }) {
  const didSeed = await ensureCommissionerateCredentialsSeeded();

  if (!didSeed) {
    return authenticateLegacyCommissionerateUser({ username, password });
  }

  const credential = await DashboardCredential.findOne({
    portal: "sub",
    role: "commissionerate",
    username,
  }).lean();

  if (!credential) {
    return null;
  }

  let decryptedPassword;

  try {
    decryptedPassword = decryptText(credential.encryptedPassword);
  } catch {
    return null;
  }

  if (decryptedPassword !== password) {
    return null;
  }

  return {
    username: credential.username,
    role: credential.role,
    commissionerate: credential.commissionerate,
    portal: "sub",
  };
}

async function updateCommissioneratePassword({ commissionerateKey, password }) {
  const didSeed = await ensureCommissionerateCredentialsSeeded();

  if (!didSeed) {
    const error = new Error(
      "Set CREDENTIAL_ENCRYPTION_SECRET or AUTH_TOKEN_SECRET before updating commissionerate passwords."
    );
    error.code = "MISSING_ENCRYPTION_SECRET";
    throw error;
  }

  const credential = await DashboardCredential.findOneAndUpdate(
    { portal: "sub", role: "commissionerate", commissionerateKey },
    {
      $set: {
        encryptedPassword: encryptText(password),
        lastPasswordChangeAt: new Date(),
      },
    },
    {
      new: true,
    }
  ).lean();

  if (!credential) {
    return null;
  }

  return {
    id: String(credential._id),
    commissionerateKey: credential.commissionerateKey,
    commissionerate: credential.commissionerate,
    username: credential.username,
    lastPasswordChangeAt: credential.lastPasswordChangeAt,
  };
}

module.exports = {
  authenticateCommissionerateUser,
  ensureCommissionerateCredentialsSeeded,
  getCommissionerateUsers,
  updateCommissioneratePassword,
};
