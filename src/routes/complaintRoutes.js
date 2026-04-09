const { createComplaint, trackComplaint } = require("../controllers/complaintController");
const { authenticate, requireBooth } = require("../middleware/authenticate");
const { rateLimit } = require("../middleware/rateLimit");

const mobilePattern = "^[6-9][0-9]{9}$";
const trackRateLimit = rateLimit({
  max: Number(process.env.TRACK_RATE_LIMIT_MAX || 30),
  windowMs: Number(process.env.TRACK_RATE_LIMIT_WINDOW_MS || 60_000),
  scope: "track",
});

const trackSchema = {
  params: {
    type: "object",
    additionalProperties: false,
    required: ["applicationNumber"],
    properties: {
      applicationNumber: { type: "string", minLength: 6, maxLength: 80 },
    },
  },
};

const complaintSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["complainant", "address", "respondent", "complaint", "officer"],
    properties: {
      complainant: {
        type: "object",
        additionalProperties: false,
        required: ["firstName", "mobile"],
        properties: {
          firstName: { type: "string", minLength: 1 },
          surname: { type: "string" },
          dateOfBirth: { type: "string" },
          guardian: { type: "string" },
          relationType: { type: "string" },
          age: { type: ["integer", "null"], minimum: 0, maximum: 120 },
          occupation: { type: "string" },
          education: { type: "string" },
          maritalStatus: { type: "string" },
          caste: { type: "string" },
          religion: { type: "string" },
          nationality: { type: "string" },
          mobile: { type: "string", pattern: mobilePattern },
          alternateMobile: { type: "string" },
          gender: { type: "string" },
        },
      },
      address: {
        type: "object",
        additionalProperties: false,
        required: ["state", "district", "offenceLocation"],
        properties: {
          houseNumber: { type: "string" },
          street: { type: "string" },
          locality: { type: "string" },
          landmark: { type: "string" },
          ward: { type: "string" },
          mandal: { type: "string" },
          residency: { type: "string" },
          state: { type: "string", minLength: 1 },
          district: { type: "string", minLength: 1 },
          station: { type: "string" },
          city: { type: "string" },
          pincode: { type: "string" },
          offenceDate: { type: "string" },
          offenceLocation: { type: "string", minLength: 1 },
        },
      },
      respondent: {
        type: "object",
        additionalProperties: false,
        required: ["isKnown"],
        properties: {
          isKnown: { type: "boolean" },
          name: { type: "string" },
          surname: { type: "string" },
          gender: { type: "string" },
          guardian: { type: "string" },
          relationType: { type: "string" },
          age: { type: ["integer", "null"], minimum: 0, maximum: 120 },
          dateOfBirth: { type: "string" },
          occupation: { type: "string" },
          education: { type: "string" },
          caste: { type: "string" },
          religion: { type: "string" },
          maritalStatus: { type: "string" },
          nationality: { type: "string" },
        },
        allOf: [
          {
            if: {
              properties: {
                isKnown: { const: true },
              },
            },
            then: {
              required: ["name", "gender"],
            },
          },
        ],
      },
      complaint: {
        type: "object",
        additionalProperties: false,
        required: [
          "applicationNumber",
          "complaintType",
          "naturePetition",
          "commissionerate",
          "declarationAccepted",
          "offenceLocation",
        ],
        properties: {
          applicationNumber: { type: "string", minLength: 1 },
          complaintType: { type: "string", minLength: 1 },
          naturePetition: { type: "string", minLength: 1 },
          description: { type: "string" },
          voiceText: { type: "string" },
          offenceDate: { type: "string" },
          offenceLocation: { type: "string", minLength: 1 },
          commissionerate: { type: "string", minLength: 1 },
          declarationAccepted: { type: "boolean", const: true },
        },
      },
      officer: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          mobile: { type: "string" },
        },
      },
    },
  },
};

async function registerComplaintRoutes(fastify) {
  fastify.get(
    "/track/:applicationNumber",
    { preHandler: trackRateLimit, schema: trackSchema },
    trackComplaint
  );
  fastify.post("/", { preHandler: [authenticate, requireBooth], schema: complaintSchema }, createComplaint);
}

module.exports = {
  registerComplaintRoutes,
};
