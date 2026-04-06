const COMMISSIONERATES = {
  hyderabad: "Hyderabad",
  cyberabad: "Cyberabad",
  malkajgiri: "Malkajgiri",
  future_city: "Future City",
};

function normalizeCommissionerate(value = "") {
  const normalizedKey = value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return COMMISSIONERATES[normalizedKey] || null;
}

module.exports = {
  COMMISSIONERATES,
  normalizeCommissionerate,
};
