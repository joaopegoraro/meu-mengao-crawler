const db = require("./dist/db.js");
const noticias = require("./dist/noticias-scraper.js");
const youtube = require("./dist/youtube-scraper.js");
const campeonatos = require("./dist/campeonatos-scraper.js");

db.startConnection().then(async () => {
  console.log("STARTED SCRAPING: " + new Date().toUTCString());

  //await noticias.scrapeNoticias();
  //await youtube.scrapeYoutube();
  await campeonatos.scrapeCampeonatos();

  db.endConnection();

  console.log("FINISHED SCRAPING: " + new Date().toUTCString());
});
