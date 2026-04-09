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

async function trackComplaint(request, reply) {
  const applicationNumber = String(request.params.applicationNumber || "").trim();
  const complaint = await Complaint.findOne({
    "complaint.applicationNumber": applicationNumber,
  })
    .select("complaint.applicationNumber complaint.status complaint.complaintType complaint.naturePetition complaint.commissionerate complaint.offenceLocation officer.name createdAt updatedAt")
    .lean();

  if (!complaint) {
    return reply.status(404).send({
      message: "No complaint found with this reference number",
    });
  }

  return reply.send({
    message: "Complaint tracking details fetched successfully",
    data: {
      applicationNumber: complaint.complaint.applicationNumber,
      status: complaint.complaint.status || "Submitted",
      complaintType: complaint.complaint.complaintType,
      naturePetition: complaint.complaint.naturePetition,
      commissionerate: complaint.complaint.commissionerate,
      offenceLocation: complaint.complaint.offenceLocation,
      officerName: complaint.officer?.name || "",
      submittedAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
    },
  });
}

module.exports = {
  createComplaint,
  trackComplaint,
};
