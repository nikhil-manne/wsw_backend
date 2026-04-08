const {
  listCommissionerateUsers,
  createOrUpdateCommissionerateUser,
} = require("../services/dashboardUserService");

async function getCommissionerateUsers(request, reply) {
  const users = await listCommissionerateUsers();

  return reply.send({
    message: "Commissionerate users fetched successfully",
    data: users,
  });
}

async function createOrUpdateCommissionerate(request, reply) {
  try {
    const user = await createOrUpdateCommissionerateUser({
      commissionerateKey: request.body.commissionerateKey,
      password: request.body.password,
      adminId: request.user?.id || request.user?.username || "admin",
    });

    return reply.send({
      message: "Commissionerate user saved successfully",
      data: user,
    });
  } catch (error) {
    if (error.code === "INVALID_COMMISSIONERATE") {
      return reply.status(400).send({
        message: error.message,
      });
    }

    throw error;
  }
}

module.exports = {
  getCommissionerateUsers,
  createOrUpdateCommissionerate,
};
