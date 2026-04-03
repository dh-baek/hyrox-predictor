import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("visitor-stats");

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Get current stats
  let stats;
  try {
    stats = JSON.parse(await store.get("stats") || "{}");
  } catch {
    stats = {};
  }

  if (!stats.total) stats.total = 0;
  if (!stats.date || stats.date !== today) {
    stats.date = today;
    stats.daily = 0;
  }

  // Increment
  stats.total += 1;
  stats.daily += 1;

  // Save
  await store.set("stats", JSON.stringify(stats));

  // Netlify Functions v2: context.geo.country.code
  // Fallback: x-country header (Edge Functions)
  const country = (context && context.geo && context.geo.country && context.geo.country.code)
    || req.headers.get("x-country")
    || "";

  return new Response(JSON.stringify({ total: stats.total, daily: stats.daily, country }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};

export const config = {
  path: "/api/visit",
};
