module.exports = async function(req, res) {
  const mod = await import("../services/api/src/server.mjs");
  return mod.default(req, res);
};
