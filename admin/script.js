const tokenForm = document.querySelector("#token-form");
const tokenInput = document.querySelector("#token");
const totalVisits = document.querySelector("#total-visits");
const ratedCount = document.querySelector("#rated-count");
const averageRating = document.querySelector("#average-rating");
const updatedAt = document.querySelector("#updated-at");
const backgroundRows = document.querySelector("#background-rows");
const latestVisits = document.querySelector("#latest-visits");

tokenInput.value = localStorage.getItem("fields.admin.token") || "";

function formatDate(value) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ratingSummary(entry) {
  const count = Number(entry?.count || 0);
  const total = Number(entry?.total || 0);
  return {
    count,
    average: count ? total / count : 0,
  };
}

function render(data) {
  const visitBackgrounds = data.visits?.backgrounds || {};
  const ratingBackgrounds = data.ratings?.backgrounds || {};
  const slugs = Array.from(new Set([
    ...Object.keys(visitBackgrounds),
    ...Object.keys(ratingBackgrounds),
  ]));
  const ratingTotals = Object.values(ratingBackgrounds).reduce((acc, entry) => {
    acc.count += Number(entry.count || 0);
    acc.total += Number(entry.total || 0);
    return acc;
  }, {
    count: 0,
    total: 0,
  });
  totalVisits.textContent = String(data.visits?.totalVisits || 0);
  ratedCount.textContent = String(Object.keys(ratingBackgrounds).length);
  averageRating.textContent = ratingTotals.count ? (ratingTotals.total / ratingTotals.count).toFixed(2) : "0.00";
  updatedAt.textContent = `Updated ${formatDate(data.generatedAt)}`;
  backgroundRows.innerHTML = slugs
    .map((slug) => {
      const visit = visitBackgrounds[slug] || {};
      const rating = ratingSummary(ratingBackgrounds[slug]);
      return `
        <tr>
          <td>${visit.title || ratingBackgrounds[slug]?.title || slug}</td>
          <td>${visit.category || ratingBackgrounds[slug]?.category || ""}</td>
          <td>${visit.visits || 0}</td>
          <td>${rating.average ? rating.average.toFixed(2) : "0.00"}</td>
          <td>${rating.count}</td>
          <td>${formatDate(visit.lastVisitAt)}</td>
        </tr>
      `;
    })
    .join("") || `<tr><td colspan="6">No stats recorded yet.</td></tr>`;
  latestVisits.innerHTML = (data.visits?.latest || [])
    .slice(0, 30)
    .map((visit) => `
      <div class="visit">
        <strong>${visit.title || visit.slug}</strong>
        <small>${formatDate(visit.visitedAt)}</small>
        <small>${visit.publicInfo?.timezone || "Unknown timezone"} / ${visit.publicInfo?.language || "Unknown language"}</small>
        <small>${visit.embedded ? "Embed" : "Page"}</small>
      </div>
    `)
    .join("") || "";
}

async function loadStats(token) {
  backgroundRows.innerHTML = `<tr><td colspan="6">Loading stats...</td></tr>`;
  const response = await fetch(`/api/stats?token=${encodeURIComponent(token)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load stats");
  render(data);
}

tokenForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = tokenInput.value.trim();
  localStorage.setItem("fields.admin.token", token);
  try {
    await loadStats(token);
  }
  catch (error) {
    backgroundRows.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
  }
});

if (tokenInput.value) {
  loadStats(tokenInput.value).catch(() => {});
}
