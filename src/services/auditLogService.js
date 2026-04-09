function auditLog(request, event, details = {}) {
  request.log.info(
    {
      audit: true,
      event,
      actor: request.user || null,
      ip: request.ip,
      ...details,
    },
    event
  );
}

module.exports = {
  auditLog,
};
