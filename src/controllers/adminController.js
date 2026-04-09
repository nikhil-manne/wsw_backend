const {
  listCommissionerateUsers,
  listBoothUsers,
  createOrUpdateBoothUser,
  createOrUpdateCommissionerateUser,
  deleteBoothUser,
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

async function getBoothUsers(request, reply) {
  const users = await listBoothUsers();

  return reply.send({
    message: "Booth users fetched successfully",
    data: users,
  });
}

async function createOrUpdateBooth(request, reply) {
  try {
    const user = await createOrUpdateBoothUser({
      id: request.body.id,
      username: request.body.username,
      password: request.body.password,
      commissionerateKey: request.body.commissionerateKey,
      boothLocation: request.body.boothLocation,
      adminId: request.user?.id || request.user?.username || "admin",
    });

    return reply.send({
      message: "Booth user saved successfully",
      data: user,
    });
  } catch (error) {
    if (
      error.code === "INVALID_COMMISSIONERATE" ||
      error.code === "INVALID_BOOTH_LOCATION" ||
      error.code === "BOOTH_PASSWORD_REQUIRED" ||
      error.code === "BOOTH_NOT_FOUND"
    ) {
      return reply.status(400).send({
        message: error.message,
      });
    }

    if (error?.code === 11000) {
      return reply.status(409).send({
        message: "A dashboard user with this username already exists",
      });
    }

    throw error;
  }
}

async function deleteBooth(request, reply) {
  try {
    const deleted = await deleteBoothUser(request.params.id);

    return reply.send({
      message: "Booth deleted successfully",
      data: deleted,
    });
  } catch (error) {
    if (error.code === "BOOTH_NOT_FOUND") {
      return reply.status(404).send({
        message: error.message,
      });
    }

    throw error;
  }
}

module.exports = {
  getBoothUsers,
  getCommissionerateUsers,
  createOrUpdateBooth,
  createOrUpdateCommissionerate,
  deleteBooth,
};
