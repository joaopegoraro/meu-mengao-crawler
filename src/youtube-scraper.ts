import { convertImageUrlToBase64 } from "./utils";
import { createNoticia, deleteNoticiaWithSite } from "./db";
import axios from "axios";

export async function scrapeYoutube() {
  await scrapeVeneCasagrande();
  await scrapeFlaTV();
  await scrapeMauroCezar();
}

async function scrapeVeneCasagrande() {
  const veneCasagrandeChannelId = "UC084Mraf1n0rUIhz0V3sZfg";
  await scrapeYoutubeChannel(veneCasagrandeChannelId);
}

async function scrapeFlaTV() {
  const flaTVChannelId = "UCOa-WaNwQaoyFHLCDk7qKIw";
  await scrapeYoutubeChannel(flaTVChannelId);
}

async function scrapeMauroCezar() {
  const mauroCezarChannelId = "UCRcRAyb5Y4x3HVNKBZ9SMLA";
  await scrapeYoutubeChannel(mauroCezarChannelId);
}

async function scrapeYoutubeChannel(channelId: string) {
  try {
    const invidiousUrl = "https://vid.puffyan.us/api/v1/channels/";
    const youtubeUrl = "https://www.youtube.com/watch?v=";

    const response = await axios.get(invidiousUrl + channelId);
    const video = response.data["latestVideos"][0];

    // Thumbnail 5 é a 'high', de tamanho 480x360
    const thumbnail = video["videoThumbnails"][4];

    // Thumbnail do autor 2 tem tamanho 76x76
    const logo = response.data["authorThumbnails"][2];

    const noticia = {
      titulo: video["title"],
      link: youtubeUrl + video["videoId"],
      site: video["author"],
      data: video["published"],
      logoSite: await convertImageUrlToBase64(logo["url"], 76, 76),
      foto: await convertImageUrlToBase64(thumbnail["url"], 350, 250),
    };

    await deleteNoticiaWithSite(noticia.site);
    await createNoticia(noticia);
  } catch (e: unknown) {
    const message = `Erro ao tentar recolher dados do canal ${channelId}: `;
    if (e instanceof Error) {
      console.log(message + e.message, e.stack);
    } else {
      console.log(message + e);
    }
  }
}
