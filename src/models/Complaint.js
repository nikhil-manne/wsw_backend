const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    houseNumber: String,
    street: String,
    locality: String,
    landmark: String,
    ward: String,
    mandal: String,
    residency: String,
    state: String,
    district: String,
    station: String,
    city: String,
    pincode: String,
  },
  { _id: false }
);

const complainantSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    surname: { type: String, trim: true },
    dateOfBirth: String,
    guardian: String,
    relationType: String,
    age: Number,
    occupation: String,
    education: String,
    maritalStatus: String,
    caste: String,
    religion: String,
    nationality: String,
    mobile: { type: String, required: true, trim: true },
    alternateMobile: String,
    gender: String,
  },
  { _id: false }
);

const respondentSchema = new mongoose.Schema(
  {
    isKnown: { type: Boolean, default: false },
    name: String,
    surname: String,
    gender: String,
    guardian: String,
    relationType: String,
    age: Number,
    dateOfBirth: String,
    occupation: String,
    education: String,
    caste: String,
    religion: String,
    maritalStatus: String,
    nationality: String,
  },
  { _id: false }
);

const complaintDetailsSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, required: true, unique: true, index: true },
    complaintType: { type: String, required: true, trim: true },
    naturePetition: { type: String, required: true, trim: true },
    description: String,
    voiceText: String,
    offenceDate: String,
    offenceLocation: { type: String, required: true, trim: true },
    commissionerate: { type: String, required: true, trim: true, index: true },
    status: { type: String, default: "Submitted", trim: true },
    declarationAccepted: { type: Boolean, required: true },
  },
  { _id: false }
);

const officerSchema = new mongoose.Schema(
  {
    name: String,
    mobile: String,
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complainant: { type: complainantSchema, required: true },
    address: { type: addressSchema, required: true },
    respondent: { type: respondentSchema, required: true },
    complaint: { type: complaintDetailsSchema, required: true },
    officer: { type: officerSchema, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);
