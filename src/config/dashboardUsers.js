const { authenticateCommissionerateUser } = require("../services/dashboardCredentialService");

function readCredentialSet(usernameKey, passwordKey) {
  const username = process.env[usernameKey];
  const password = process.env[passwordKey];

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

function getAdminCredentials() {
  return readCredentialSet("ADMIN_USERNAME", "ADMIN_PASSWORD");
}

async function authenticateDashboardUser({ username, password, portal }) {
  const safePortal = portal === "admin" ? "admin" : "sub";

  if (safePortal === "admin") {
    const adminCredentials = getAdminCredentials();

    if (
      adminCredentials &&
      adminCredentials.username === username &&
      adminCredentials.password === password
    ) {
      return {
        username,
        role: "admin",
        commissionerate: null,
        portal: "admin",
      };
    }

    return null;
  }

  const matchingUser = await authenticateCommissionerateUser({
    username,
    password,
  });

  if (!matchingUser) {
    return null;
  }

  return {
    username,
    role: matchingUser.role,
    commissionerate: matchingUser.commissionerate,
    portal: "sub",
  };
}

module.exports = {
  authenticateDashboardUser,
  getAdminCredentials,
};
