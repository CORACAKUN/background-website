const {
  cleanSlug,
  cleanText,
  jsonResponse,
  readJsonBody,
  readJsonFile,
  writeJsonFile,
} = require("./_github-json");

const fallback = {
  totalVisits: 0,
  backgrounds: {},
  latest: [],
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return jsonResponse(res, 405, {
      error: "Method not allowed",
    });
  }
  try {
    const body = await readJsonBody(req);
    const slug = cleanSlug(body.slug || body.background);
    const now = new Date().toISOString();
    const publicInfo = body.publicInfo || {};
    const visit = {
      slug,
      title: cleanText(body.title, 120),
      category: cleanText(body.category, 60),
      path: cleanText(body.path, 220),
      visitorId: cleanText(body.visitorId, 80),
      embedded: Boolean(body.embedded),
      visitedAt: now,
      publicInfo: {
        language: cleanText(publicInfo.language, 40),
        timezone: cleanText(publicInfo.timezone, 80),
        screen: cleanText(publicInfo.screen, 40),
        referrer: cleanText(publicInfo.referrer, 220),
        userAgent: cleanText(publicInfo.userAgent, 260),
      },
    };
    const file = await readJsonFile("data/visits.json", fallback);
    const data = file.data || fallback;
    data.totalVisits = Number(data.totalVisits || 0) + 1;
    data.backgrounds = data.backgrounds || {};
    data.latest = Array.isArray(data.latest) ? data.latest : [];
    const current = data.backgrounds[slug] || {
      title: visit.title,
      category: visit.category,
      path: visit.path,
      visits: 0,
    };
    current.title = visit.title || current.title;
    current.category = visit.category || current.category;
    current.path = visit.path || current.path;
    current.visits = Number(current.visits || 0) + 1;
    current.lastVisitAt = now;
    data.backgrounds[slug] = current;
    data.latest.unshift(visit);
    data.latest = data.latest.slice(0, 100);
    await writeJsonFile("data/visits.json", data, `Track visit: ${slug}`, file.sha);
    return jsonResponse(res, 200, {
      ok: true,
      visits: current.visits,
      totalVisits: data.totalVisits,
    });
  }
  catch (error) {
    return jsonResponse(res, error.statusCode || 500, {
      error: "Could not save visit",
      detail: error.message,
    });
  }
};
