const COMMISSIONERATES = {
  hyderabad: "Hyderabad",
  cyberabad: "Cyberabad",
  malkajgiri: "Malkajgiri",
  future_city: "Future City",
};

function normalizeCommissionerateKey(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeCommissionerate(value = "") {
  const normalizedKey = normalizeCommissionerateKey(value);

  return COMMISSIONERATES[normalizedKey] || null;
}

module.exports = {
  COMMISSIONERATES,
  normalizeCommissionerate,
  normalizeCommissionerateKey,
};
