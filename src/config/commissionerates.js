const COMMISSIONERATES = {
  hyderabad: "Hyderabad",
  cyberabad: "Cyberabad",
  malkajgiri: "Malkajgiri",
  future_city: "Future City",
  warangal: "Warangal",
  karimnagar: "Karimnagar",
  nizamabad: "Nizamabad",
  khammam: "Khammam",
  ramagundam: "Ramagundam",
  siddipet: "Siddipet",
};

const COMMISSIONERATE_ALIASES = {
  hydebrabad: "hyderabad",
  hyderbad: "hyderabad",
  malkagiri: "malkajgiri",
  futurecity: "future_city",
  warangalpolice: "warangal",
  karimnagarpolice: "karimnagar",
  nizamabadpolice: "nizamabad",
  khammampolice: "khammam",
  ramagundampolice: "ramagundam",
  siddipetpolice: "siddipet",
};

function normalizeCommissionerateKey(value = "") {
  const normalized = value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) {
    return "";
  }

  const suffixStripped = normalized
    .replace(/_?(commissionerate|commisionerate|commissionarate|commisionarate|commisionarite|commissionarite)$/, "")
    .replace(/^_+|_+$/g, "");

  return COMMISSIONERATE_ALIASES[suffixStripped] || COMMISSIONERATE_ALIASES[normalized] || suffixStripped;
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
