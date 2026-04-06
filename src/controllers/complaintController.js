const Complaint = require("../models/Complaint");
const { normalizeCommissionerate } = require("../config/commissionerates");

async function createComplaint(request, reply) {
  const payload = request.body;
  const normalizedCommissionerate = normalizeCommissionerate(
    payload?.complaint?.commissionerate
  );

  if (!payload.complaint.description && !payload.complaint.voiceText) {
    return reply.status(400).send({
      message: "Either a written description or voice transcription is required",
    });
  }

  if (!normalizedCommissionerate) {
    return reply.status(400).send({
      message: "Unsupported commissionerate selected",
    });
  }

  payload.complaint.commissionerate = normalizedCommissionerate;

  try {
    const complaint = await Complaint.create(payload);

    return reply.status(201).send({
      message: "Complaint saved successfully",
      data: {
        id: complaint._id,
        applicationNumber: complaint.complaint.applicationNumber,
        createdAt: complaint.createdAt,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return reply.status(409).send({
        message: "A complaint with this application number already exists",
      });
    }

    throw error;
  }
}

module.exports = {
  createComplaint,
};
