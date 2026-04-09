const Complaint = require("../models/Complaint");

const LIST_PROJECTION = [
  "complainant.firstName",
  "complainant.surname",
  "complainant.mobile",
  "complaint.applicationNumber",
  "complaint.status",
  "complaint.complaintType",
  "complaint.naturePetition",
  "complaint.commissionerate",
  "complaint.offenceLocation",
  "createdAt",
  "updatedAt",
].join(" ");

const DETAIL_PROJECTION = "-__v";
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

function getDashboardFilter(user) {
  return user.role === "admin"
    ? {}
    : {
        "complaint.commissionerate": user.commissionerate,
      };
}

function getPagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE;
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

async function getDashboardComplaints(request, reply) {
  const { role, commissionerate, username } = request.user;
  const filter = getDashboardFilter(request.user);
  const { page, limit, skip } = getPagination(request.query || {});

  const [complaints, total, byType, byCommissionerate] = await Promise.all([
    Complaint.find(filter)
      .select(LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Complaint.countDocuments(filter),
    Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$complaint.complaintType", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$complaint.commissionerate", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
  ]);

  return reply.send({
    message: "Dashboard data fetched successfully",
    data: {
      user: {
        username,
        role,
        commissionerate,
      },
      summary: {
        total,
        byType: byType.map((item) => ({
          label: item._id || "Unknown",
          count: item.count,
        })),
        byCommissionerate: byCommissionerate.map((item) => ({
          label: item._id || "Unknown",
          count: item.count,
        })),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
      complaints,
    },
  });
}

async function getDashboardComplaintById(request, reply) {
  const filter = {
    ...getDashboardFilter(request.user),
    _id: request.params.id,
  };
  const complaint = await Complaint.findOne(filter).select(DETAIL_PROJECTION).lean();

  if (!complaint) {
    return reply.status(404).send({
      message: "Complaint not found",
    });
  }

  return reply.send({
    message: "Complaint fetched successfully",
    data: complaint,
  });
}

module.exports = {
  getDashboardComplaintById,
  getDashboardComplaints,
};
