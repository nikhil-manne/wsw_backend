const mongoose = require("mongoose");

const dashboardUserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["admin", "commissionerate"],
      index: true,
    },
    commissionerateKey: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },
    commissionerate: {
      type: String,
      trim: true,
      default: null,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("DashboardUser", dashboardUserSchema);
