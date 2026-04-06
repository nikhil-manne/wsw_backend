const { COMMISSIONERATES } = require("./commissionerates");

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

function getCommissionerateUsers() {
  return Object.entries(COMMISSIONERATES)
    .map(([key, commissionerate]) => {
      const credentials = readCredentialSet(
        `${key.toUpperCase()}_USERNAME`,
        `${key.toUpperCase()}_PASSWORD`
      );

      if (!credentials) {
        return null;
      }

      return {
        role: "commissionerate",
        commissionerate,
        ...credentials,
      };
    })
    .filter(Boolean);
}

function authenticateDashboardUser({ username, password, portal }) {
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

  const matchingUser = getCommissionerateUsers().find(
    (user) => user.username === username && user.password === password
  );

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
  getCommissionerateUsers,
};
