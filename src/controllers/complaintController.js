const crypto = require("crypto");
const Complaint = require("../models/Complaint");
const { normalizeCommissionerate } = require("../config/commissionerates");
const { auditLog } = require("../services/auditLogService");

const APPLICATION_NUMBER_COLLISION_RETRIES = 5;

function createApplicationNumber(date = new Date()) {
  const yy = date.getFullYear().toString().slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random = crypto.randomBytes(5).toString("base64url").toUpperCase();

  return `TG-${yy}${mm}${dd}-${random}`;
}

async function saveComplaintWithGeneratedNumber(payload) {
  let lastDuplicateError = null;

  for (let attempt = 0; attempt < APPLICATION_NUMBER_COLLISION_RETRIES; attempt += 1) {
    payload.complaint.applicationNumber = createApplicationNumber();

    try {
      return await Complaint.create(payload);
    } catch (error) {
      if (error?.code !== 11000) {
        throw error;
      }

      lastDuplicateError = error;
    }
  }

  throw lastDuplicateError || new Error("Unable to create a unique application number");
}

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
    const complaint = await saveComplaintWithGeneratedNumber(payload);
    auditLog(request, "complaint.create.success", {
      complaintId: String(complaint._id),
      applicationNumber: complaint.complaint.applicationNumber,
      commissionerate: complaint.complaint.commissionerate,
    });

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
    .select("complainant.firstName complainant.surname complaint.applicationNumber complaint.status complaint.complaintType complaint.naturePetition complaint.commissionerate complaint.offenceLocation officer.name createdAt updatedAt")
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
      complainantName: [complaint.complainant?.firstName, complaint.complainant?.surname]
        .filter(Boolean)
        .join(" "),
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
  createApplicationNumber,
  createComplaint,
  trackComplaint,
};
