const {
  cleanSlug,
  cleanText,
  jsonResponse,
  readJsonBody,
  readJsonFile,
  writeJsonFile,
} = require("./_github-json");

const fallback = {
  backgrounds: {},
};

function summarize(entry) {
  const count = Number(entry.count || 0);
  const total = Number(entry.total || 0);
  return {
    count,
    average: count ? Number((total / count).toFixed(2)) : 0,
    stars: entry.stars || {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const url = new URL(req.url, "http://localhost");
      const slug = cleanSlug(url.searchParams.get("slug"));
      const file = await readJsonFile("data/ratings.json", fallback);
      const entry = (file.data.backgrounds || {})[slug] || {};
      return jsonResponse(res, 200, {
        ok: true,
        slug,
        rating: summarize(entry),
      });
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return jsonResponse(res, 405, {
        error: "Method not allowed",
      });
    }
    const body = await readJsonBody(req);
    const slug = cleanSlug(body.slug || body.background);
    const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating || 0))));
    if (!rating) {
      return jsonResponse(res, 400, {
        error: "Rating must be 1 to 5",
      });
    }
    const now = new Date().toISOString();
    const file = await readJsonFile("data/ratings.json", fallback);
    const data = file.data || fallback;
    data.backgrounds = data.backgrounds || {};
    const entry = data.backgrounds[slug] || {
      title: cleanText(body.title, 120),
      category: cleanText(body.category, 60),
      path: cleanText(body.path, 220),
      count: 0,
      total: 0,
      stars: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
      latest: [],
    };
    entry.title = cleanText(body.title, 120) || entry.title;
    entry.category = cleanText(body.category, 60) || entry.category;
    entry.path = cleanText(body.path, 220) || entry.path;
    entry.count = Number(entry.count || 0) + 1;
    entry.total = Number(entry.total || 0) + rating;
    entry.stars = entry.stars || {};
    entry.stars[rating] = Number(entry.stars[rating] || 0) + 1;
    entry.latest = Array.isArray(entry.latest) ? entry.latest : [];
    entry.latest.unshift({
      rating,
      ratedAt: now,
      visitorId: cleanText(body.visitorId, 80),
    });
    entry.latest = entry.latest.slice(0, 50);
    data.backgrounds[slug] = entry;
    await writeJsonFile("data/ratings.json", data, `Track rating: ${slug}`, file.sha);
    return jsonResponse(res, 200, {
      ok: true,
      slug,
      rating: summarize(entry),
    });
  }
  catch (error) {
    return jsonResponse(res, error.statusCode || 500, {
      error: "Could not process rating",
      detail: error.message,
    });
  }
};
