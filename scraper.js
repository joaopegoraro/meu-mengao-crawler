const db = require("./dist/db.js");
const noticias = require("./dist/noticias-scraper.js");
const youtube = require("./dist/youtube-scraper.js");
const campeonatos = require("./dist/campeonatos-scraper.js");

db.startConnection().then(async () => {
  const startTime = new Date().toUTCString();
  console.log(`STARTED SCRAPING: ${startTime}`);

  await noticias.scrapeNoticias();
  await youtube.scrapeYoutube();
  await campeonatos.scrapeCampeonatos();

  db.endConnection();

  console.log(
    `FINISHED SCRAPING:\nStart time: ${startTime}\nEnd time: ${new Date().toUTCString()}`
  );
});
