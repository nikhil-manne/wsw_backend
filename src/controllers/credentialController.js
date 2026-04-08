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
  const updated = await updateCommissioneratePassword({
    commissionerateKey: request.params.commissionerateKey,
    password: request.body.password,
  });

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
