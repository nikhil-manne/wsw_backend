const mongoose = require("mongoose");
const { ensureCommissionerateCredentialsSeeded } = require("../services/dashboardCredentialService");

let isConnected = false;

async function connectToDatabase(app) {
  if (isConnected) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in backend/.env");
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.DB_NAME || undefined,
  });

  isConnected = true;
  app.log.info("MongoDB connected");
  await ensureCommissionerateCredentialsSeeded();
  app.log.info("Commissionerate credentials synced");

  mongoose.connection.on("error", (error) => {
    app.log.error(error, "MongoDB connection error");
  });

  return mongoose.connection;
}

module.exports = {
  connectToDatabase,
};
