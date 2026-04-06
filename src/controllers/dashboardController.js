const Complaint = require("../models/Complaint");

async function getDashboardComplaints(request, reply) {
  const { role, commissionerate, username } = request.user;
  const filter =
    role === "admin"
      ? {}
      : {
          "complaint.commissionerate": commissionerate,
        };

  const [complaints, total, byType, byCommissionerate] = await Promise.all([
    Complaint.find(filter).sort({ createdAt: -1 }).lean(),
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
      complaints,
    },
  });
}

module.exports = {
  getDashboardComplaints,
};
