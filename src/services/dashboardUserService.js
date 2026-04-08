const bcrypt = require("bcryptjs");
const DashboardUser = require("../models/DashboardUser");
const {
  COMMISSIONERATES,
  normalizeCommissionerateKey,
} = require("../config/commissionerates");

const SALT_ROUNDS = 10;

function buildCommissionerateUsername(commissionerateKey) {
  return commissionerateKey.toLowerCase();
}

function resolveCommissionerate(commissionerateKey) {
  const normalizedKey = normalizeCommissionerateKey(commissionerateKey);

  if (!normalizedKey) {
    return null;
  }

  return {
    commissionerateKey: normalizedKey.toUpperCase(),
    commissionerate: COMMISSIONERATES[normalizedKey],
  };
}

async function hashPassword(password) {
  return bcrypt.hash(String(password), SALT_ROUNDS);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(String(password), String(passwordHash || ""));
}

async function hasAdminUsers() {
  const count = await DashboardUser.countDocuments({ role: "admin" });
  return count > 0;
}

async function bootstrapAdminUser({ username, password }) {
  const adminExists = await hasAdminUsers();

  if (adminExists) {
    const error = new Error("Admin account is already configured");
    error.code = "ADMIN_ALREADY_EXISTS";
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const admin = await DashboardUser.create({
    role: "admin",
    username,
    passwordHash,
    createdBy: "bootstrap",
  });

  return {
    id: String(admin._id),
    username: admin.username,
    role: admin.role,
  };
}

async function authenticateAdminUser({ username, password }) {
  const admin = await DashboardUser.findOne({ role: "admin", username }).lean();

  if (!admin) {
    return null;
  }

  const isValid = await verifyPassword(password, admin.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: String(admin._id),
    username: admin.username,
    role: "admin",
    commissionerate: null,
    commissionerateKey: null,
    portal: "admin",
  };
}

async function authenticateCommissionerateUser({ commissionerateKey, password }) {
  const resolved = resolveCommissionerate(commissionerateKey);

  if (!resolved) {
    return null;
  }

  const user = await DashboardUser.findOne({
    role: "commissionerate",
    commissionerateKey: resolved.commissionerateKey,
  }).lean();

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: String(user._id),
    username: user.username,
    role: "commissionerate",
    commissionerate: user.commissionerate,
    commissionerateKey: user.commissionerateKey,
    portal: "sub",
  };
}

async function listCommissionerateUsers() {
  const users = await DashboardUser.find({ role: "commissionerate" })
    .sort({ commissionerate: 1 })
    .lean();

  return users.map((user) => ({
    id: String(user._id),
    commissionerateKey: user.commissionerateKey,
    commissionerate: user.commissionerate,
    username: user.username,
    createdBy: user.createdBy,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

async function createOrUpdateCommissionerateUser({
  commissionerateKey,
  password,
  adminId,
}) {
  const resolved = resolveCommissionerate(commissionerateKey);

  if (!resolved) {
    const error = new Error("Invalid commissionerate key");
    error.code = "INVALID_COMMISSIONERATE";
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const username = buildCommissionerateUsername(resolved.commissionerateKey);

  const user = await DashboardUser.findOneAndUpdate(
    {
      role: "commissionerate",
      commissionerateKey: resolved.commissionerateKey,
    },
    {
      $set: {
        username,
        commissionerate: resolved.commissionerate,
        passwordHash,
        createdBy: adminId,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  return {
    id: String(user._id),
    commissionerateKey: user.commissionerateKey,
    commissionerate: user.commissionerate,
    username: user.username,
    createdBy: user.createdBy,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = {
  authenticateAdminUser,
  authenticateCommissionerateUser,
  bootstrapAdminUser,
  createOrUpdateCommissionerateUser,
  hasAdminUsers,
  listCommissionerateUsers,
};
