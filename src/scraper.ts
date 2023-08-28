import { startConnection, endConnection } from "./db";
import { scrapeNoticias } from "./noticias-scraper";
import { scrapeYoutube } from "./youtube-scraper";
import { scrapeCampeonatos } from "./campeonatos-scraper";

Promise.all([
  startConnection(),

  scrapeNoticias(),
  scrapeYoutube(),
  scrapeCampeonatos(),

  endConnection(),
]);
