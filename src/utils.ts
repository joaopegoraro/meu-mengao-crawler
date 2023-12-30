import axios from "axios";
import sharp from "sharp";
import puppeteer, {
  Browser,
  Page,
  PuppeteerLaunchOptions,
  PuppeteerLifeCycleEvent,
} from "puppeteer";

export async function scrapePage<T>(
  options: {
    url?: string;
    browser?: Browser;
    page?: Page;
    launchOptions?: PuppeteerLaunchOptions;
    headless?: boolean | "new";
    args?: string[];
    closeBrowserOnFinish?: boolean;
    waitUntil?: PuppeteerLifeCycleEvent | PuppeteerLifeCycleEvent[];
  },
  onScraping?: (page: Page, browser?: Browser) => Promise<T>
): Promise<T> {
  const browser =
    options.page != null
      ? null
      : options.browser ||
        (await puppeteer.launch(
          options.launchOptions || {
            headless: options.headless != null ? options.headless : "new",
            args: options.args || [
              "--disable-gpu",
              "--disable-dev-shm-usage",
              "--disable-setuid-sandbox",
              "--no-first-run",
              "--no-sandbox",
              "--no-zygote",
              "--single-process",
            ],
          }
        ));

  const page = options.page || (await browser.newPage());

  if (options.url) {
    await page
      .goto(options.url, {
        waitUntil: options.waitUntil || ["networkidle2", "domcontentloaded"],
      })
      .catch((e) => null);
    await new Promise((r) => setTimeout(r, 5000));
  }

  const result = onScraping ? await onScraping(page, browser) : null;

  if (browser != null && options.closeBrowserOnFinish != false) {
    await browser.close();
  }

  return result;
}

export async function convertImageUrlToBase64(
  imageUrl: string,
  width: number = 90,
  height: number = 120
) {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "binary");
  const image = await sharp(buffer).resize(width, height).toBuffer();
  return image.toString("base64");
}
