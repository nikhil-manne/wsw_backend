const DashboardCredential = require("../models/DashboardCredential");
const { COMMISSIONERATES } = require("../config/commissionerates");
const { encryptText, decryptText } = require("../utils/crypto");

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
}

async function getCommissionerateUsers() {
  await ensureCommissionerateCredentialsSeeded();

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
  }));
}

async function authenticateCommissionerateUser({ username, password }) {
  await ensureCommissionerateCredentialsSeeded();

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
  await ensureCommissionerateCredentialsSeeded();

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
