const mongoose = require("mongoose");
const { ensureCommissionerateCredentialsSeeded } = require("../services/dashboardCredentialService");

let isConnected = false;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectWithRetry(mongoUri, options, app) {
  const maxAttempts = Number(process.env.DB_CONNECT_MAX_ATTEMPTS || 5);
  const baseDelayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 1000);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await mongoose.connect(mongoUri, options);
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }

      const delayMs = baseDelayMs * attempt;
      app.log.warn({ error, attempt, maxAttempts, delayMs }, "MongoDB connection failed; retrying");
      await wait(delayMs);
    }
  }

  return mongoose.connection;
}

async function connectToDatabase(app) {
  if (isConnected) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in backend/.env");
  }

  await connectWithRetry(
    mongoUri,
    { dbName: process.env.DB_NAME || undefined },
    app
  );

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
