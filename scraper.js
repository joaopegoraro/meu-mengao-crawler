const db = require("./dist/db.js");
const noticias = require("./dist/noticias-scraper.js");
const youtube = require("./dist/youtube-scraper.js");
const campeonatos = require("./dist/campeonatos-scraper.js");

try {
  db.startConnection().then(async () => {
    try {
      const startTime = new Date().toUTCString();
      console.log(`STARTED SCRAPING: ${startTime}`);

      await noticias.scrapeNoticias();
      await youtube.scrapeYoutube();
      await campeonatos.scrapeCampeonatos();

      db.endConnection();

      console.log(
        `FINISHED SCRAPING:\nStart time: ${startTime}\nEnd time: ${new Date().toUTCString()}`
      );
    } catch (e) {
      console.log(e);
      console.log(
        `FINISHED SCRAPING (WITH ERROR):\nStart time: ${startTime}\nEnd time: ${new Date().toUTCString()}`
      );
    }
  });
} catch (e) {
  console.log(e);
  console.log(
    `FINISHED SCRAPING (WITH ERROR):\nStart time: ${startTime}\nEnd time: ${new Date().toUTCString()}`
  );
}
