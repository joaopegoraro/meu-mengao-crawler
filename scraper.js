const db = require("./dist/db.js");
const noticias = require("./dist/noticias-scraper.js");
const youtube = require("./dist/youtube-scraper.js");
const campeonatos = require("./dist/campeonatos-scraper.js");

db.startConnection().then(async () => {
  console.log("COMECANDO NOTICIAS");
  await noticias.scrapeNoticias();
  console.log("ACABOU NOTICIAS");

  console.log("COMECANDO YOUTUBE");
  await youtube.scrapeYoutube();
  console.log("ACABOU YOUTUBE");

  console.log("COMECANDO CAMPEONATOS");
  await campeonatos.scrapeCampeonatos();
  console.log("ACABOU CAMPEONATOS");

  db.endConnection();
});
