const fs = require("fs");

const puppeteer = require("puppeteer");

async function scrapeHSReplayMeta() {

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);

  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
  );

  await page.goto("https://hsreplay.net/meta/#rankRange=TOP_1000_LEGEND", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });

  const response = await page.waitForResponse(
    res =>
      res.url().includes("analytics/query/list_decks_by_win_rate") &&
      res.request().method() === "GET" &&
      res.status() === 200,
    { timeout: 120000 }
  );

  const payload = await response.json();

  fs.writeFileSync(
    "public/data/meta-debug.json",
    JSON.stringify({ url: response.url(), payload }, null, 2)
  );

  const seriesData = payload?.series?.data || {};

  const records = Object.entries(seriesData).flatMap(([cls, decks]) =>
    decks.map(deck => {
      const games = Number(deck?.total_games || deck?.games || deck?.total_games_played || 0);
      return {
        class: cls,
        archetype:
          deck?.archetype_name ||
          (deck?.archetype_id ? `Archetype ${deck.archetype_id}` : `Deck ${deck?.deck_id}`),
        winrate: Number(deck?.win_rate || deck?.winrate || 0),
        games,
      };
    })
  );

  const totalGames = records.reduce((sum, row) => sum + (row.games || 0), 0);

  const data = records.map(row => ({
    ...row,
    popularity: totalGames ? (row.games / totalGames) * 100 : 0,
  }));

  if (!data.length) {

    throw new Error("Unable to parse HSReplay payload. See public/data/meta-debug.json for details.");

  }

  fs.mkdirSync("public/data", { recursive: true });

  fs.writeFileSync("public/data/metaData.json", JSON.stringify(data, null, 2));

  console.log("✅ Saved meta data to public/data/metaData.json");

  await browser.close();

}

scrapeHSReplayMeta();

