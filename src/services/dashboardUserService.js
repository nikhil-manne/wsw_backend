const bcrypt = require("bcryptjs");
const DashboardUser = require("../models/DashboardUser");
const {
  COMMISSIONERATES,
  normalizeCommissionerateKey,
} = require("../config/commissionerates");

const SALT_ROUNDS = 10;
const COMMISSIONERATE_MOBILE_PATTERN = /^[6-9][0-9]{9}$/;

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

async function authenticateBoothUser({ username, password }) {
  const user = await DashboardUser.findOne({
    role: "booth",
    username: String(username || "").trim(),
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
    role: "booth",
    commissionerate: user.commissionerate,
    portal: "booth",
    boothLocation: user.boothLocation || null,
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
    commissionerateMobile: user.commissionerateMobile || "",
    username: user.username,
    createdBy: user.createdBy,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

async function listBoothUsers() {
  const users = await DashboardUser.find({ role: "booth" })
    .sort({ username: 1 })
    .lean();

  return users.map((user) => ({
    id: String(user._id),
    username: user.username,
    commissionerate: user.commissionerate,
    boothLocation: user.boothLocation || null,
    createdBy: user.createdBy,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

async function createOrUpdateCommissionerateUser({
  commissionerateKey,
  password,
  commissionerateMobile,
  adminId,
}) {
  const resolved = resolveCommissionerate(commissionerateKey);

  if (!resolved) {
    const error = new Error("Invalid commissionerate key");
    error.code = "INVALID_COMMISSIONERATE";
    throw error;
  }

  const normalizedMobile = String(commissionerateMobile || "").trim();

  if (!COMMISSIONERATE_MOBILE_PATTERN.test(normalizedMobile)) {
    const error = new Error("Commissionerate mobile number must be a valid 10-digit Indian mobile");
    error.code = "INVALID_COMMISSIONERATE_MOBILE";
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
        commissionerateMobile: normalizedMobile,
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
    commissionerateMobile: user.commissionerateMobile || "",
    username: user.username,
    createdBy: user.createdBy,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getCommissionerateContact({ commissionerateKey }) {
  const resolved = resolveCommissionerate(commissionerateKey);

  if (!resolved) {
    const error = new Error("Invalid commissionerate key");
    error.code = "INVALID_COMMISSIONERATE";
    throw error;
  }

  const user = await DashboardUser.findOne({
    role: "commissionerate",
    commissionerateKey: resolved.commissionerateKey,
  })
    .select("commissionerate commissionerateKey commissionerateMobile")
    .lean();

  if (!user || !COMMISSIONERATE_MOBILE_PATTERN.test(String(user.commissionerateMobile || ""))) {
    const error = new Error("Commissionerate mobile number is not configured");
    error.code = "COMMISSIONERATE_MOBILE_NOT_FOUND";
    throw error;
  }

  return {
    commissionerateKey: user.commissionerateKey,
    commissionerate: user.commissionerate,
    mobile: user.commissionerateMobile,
  };
}

function resolveBoothLocation(location = {}) {
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    const error = new Error("Booth location must contain valid latitude and longitude");
    error.code = "INVALID_BOOTH_LOCATION";
    throw error;
  }

  return { latitude, longitude };
}

async function createOrUpdateBoothUser({
  id,
  username,
  password,
  commissionerateKey,
  boothLocation,
  adminId,
}) {
  const resolved = resolveCommissionerate(commissionerateKey);

  if (!resolved) {
    const error = new Error("Invalid commissionerate key");
    error.code = "INVALID_COMMISSIONERATE";
    throw error;
  }

  const normalizedUsername = String(username || "").trim();
  const update = {
    username: normalizedUsername,
    commissionerate: resolved.commissionerate,
    boothLocation: resolveBoothLocation(boothLocation),
    createdBy: adminId,
  };

  if (password) {
    update.passwordHash = await hashPassword(password);
  }

  if (!id && !update.passwordHash) {
    const error = new Error("Password is required when creating a booth");
    error.code = "BOOTH_PASSWORD_REQUIRED";
    throw error;
  }

  const filter = id
    ? { _id: id, role: "booth" }
    : { role: "booth", username: normalizedUsername };

  const user = await DashboardUser.findOneAndUpdate(
    filter,
    {
      $set: update,
      $setOnInsert: { role: "booth" },
    },
    {
      upsert: !id,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  ).lean();

  if (!user) {
    const error = new Error("Booth user not found");
    error.code = "BOOTH_NOT_FOUND";
    throw error;
  }

  return {
    id: String(user._id),
    username: user.username,
    commissionerate: user.commissionerate,
    boothLocation: user.boothLocation || null,
    createdBy: user.createdBy,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function deleteBoothUser(id) {
  const deleted = await DashboardUser.findOneAndDelete({ _id: id, role: "booth" }).lean();

  if (!deleted) {
    const error = new Error("Booth user not found");
    error.code = "BOOTH_NOT_FOUND";
    throw error;
  }

  return { id: String(deleted._id) };
}

module.exports = {
  authenticateAdminUser,
  authenticateBoothUser,
  authenticateCommissionerateUser,
  bootstrapAdminUser,
  createOrUpdateCommissionerateUser,
  createOrUpdateBoothUser,
  deleteBoothUser,
  getCommissionerateContact,
  hasAdminUsers,
  listBoothUsers,
  listCommissionerateUsers,
};
