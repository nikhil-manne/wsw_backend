const {
  getCommissionerateUsers,
  updateCommissioneratePassword,
} = require("../services/dashboardCredentialService");

async function listCommissionerateCredentials(request, reply) {
  const credentials = await getCommissionerateUsers();

  return reply.send({
    message: "Commissionerate credentials fetched successfully",
    data: credentials,
  });
}

async function changeCommissioneratePassword(request, reply) {
  let updated;

  try {
    updated = await updateCommissioneratePassword({
      commissionerateKey: request.params.commissionerateKey,
      password: request.body.password,
    });
  } catch (error) {
    if (error.code === "MISSING_ENCRYPTION_SECRET") {
      return reply.status(400).send({
        message: error.message,
      });
    }

    throw error;
  }

  if (!updated) {
    return reply.status(404).send({
      message: "Commissionerate credential not found",
    });
  }

  return reply.send({
    message: "Commissionerate password updated successfully",
    data: updated,
  });
}

module.exports = {
  listCommissionerateCredentials,
  changeCommissioneratePassword,
};
