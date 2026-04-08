const mongoose = require("mongoose");

const dashboardCredentialSchema = new mongoose.Schema(
  {
    portal: {
      type: String,
      required: true,
      trim: true,
      enum: ["sub"],
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["commissionerate"],
    },
    commissionerateKey: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    commissionerate: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    encryptedPassword: {
      type: String,
      required: true,
    },
    lastPasswordChangeAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("DashboardCredential", dashboardCredentialSchema);
