const {
  jsonResponse,
  readJsonFile,
  requireAdmin,
} = require("./_github-json");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return jsonResponse(res, 405, {
      error: "Method not allowed",
    });
  }
  try {
    requireAdmin(req);
    const visits = await readJsonFile("data/visits.json", {
      totalVisits: 0,
      backgrounds: {},
      latest: [],
    });
    const ratings = await readJsonFile("data/ratings.json", {
      backgrounds: {},
    });
    return jsonResponse(res, 200, {
      ok: true,
      generatedAt: new Date().toISOString(),
      visits: visits.data,
      ratings: ratings.data,
    });
  }
  catch (error) {
    return jsonResponse(res, error.statusCode || 500, {
      error: error.statusCode === 401 ? "Unauthorized" : "Could not load stats",
      detail: error.statusCode === 401 ? undefined : error.message,
    });
  }
};
