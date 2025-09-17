// Netlify Function: /.netlify/functions/headlines
// Hides your NEWS_API_KEY in Netlify env vars.
// Set NEWS_API_KEY in Netlify Site settings → Environment variables.

export async function handler(event, context) {
  try {
    const key = process.env.NEWS_API_KEY;
    if (!key) return { statusCode: 200, body: JSON.stringify({}) };

    const catMap = {
      mixed: "", world: "general", tech: "technology", science: "science",
      sports: "sports", business: "business", entertainment: "entertainment",
      environment: "science"
    };
    const params = new URLSearchParams(event.queryStringParameters || {});
    const category = params.get("category") || "mixed";
    const c = catMap[category] || "";

    const url = new URL("https://newsapi.org/v2/top-headlines");
    url.searchParams.set("pageSize","25");
    url.searchParams.set("language","en");
    if (c) url.searchParams.set("category", c);

    const rsp = await fetch(url.toString(), { headers: { "X-Api-Key": key } });
    if (!rsp.ok) return { statusCode: 200, body: JSON.stringify({}) };
    const data = await rsp.json();
    const arts = (data.articles || []).filter(a => a.title);
    if (!arts.length) return { statusCode: 200, body: JSON.stringify({}) };
    const pick = arts[Math.floor(Math.random()*arts.length)];
    const out = {
      title: pick.title.replace(/\s*-\s*.*$/, ""),
      source: (pick.source && pick.source.name) ? `Live • ${pick.source.name}` : "Live",
      url: pick.url
    };
    return { statusCode: 200, body: JSON.stringify(out) };
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({}) };
  }
}
