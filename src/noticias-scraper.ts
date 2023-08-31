import moment from "moment";
import { Page } from "puppeteer";
import { scrapePage, convertImageUrlToBase64 } from "./utils";
import { createNoticia, deleteNoticiaWithSite } from "./db";

export async function scrapeNoticias() {
  await scrapePage({}, async (page) => {
    await scrapeColunaDoFla(page);
    await scrapeGE(page);
  });
}

async function scrapeColunaDoFla(page: Page) {
  try {
    const noticias = await scrapePage(
      { url: "https://colunadofla.com/ultimas-noticias/", page },
      async (page) => {
        return await Promise.all(
          await page
            .evaluate(() => {
              return [...document.querySelectorAll(".post")]
                .slice(0, 4)
                .map((element) => {
                  const anchor =
                    element.querySelector<HTMLAnchorElement>(".card-permalink");
                  const title = element.querySelector(".entry-title");
                  const imageUrl =
                    element.querySelector<HTMLImageElement>(
                      ".wp-post-image"
                    ).src;

                  const data =
                    element.querySelector<HTMLSpanElement>(".entry-meta")
                      .lastChild.textContent;

                  return {
                    titulo: title.textContent,
                    link: anchor.href,
                    site: anchor.host,
                    data: data,
                    logoSite:
                      "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAE1ElEQVR4AWIAAqYBxSDiNDMz208GQO9VAErvFcW/7/l7YGiMELWsDSoVQiKrWKgsgqqIDP40W2MxTCZBhJSKrFAQGCEEkZgmSVPGlADQQwz8h7PjcF++d73xVKpfcr9zzvndc3/n3HeFr94SHxCOonhPYE8mM7oVBHhr/CjTuiew+0DgCtH3Brh+IJCmSkCBEN4Al6oEtlUI9Pf3w/n5uVqcnZ1J/h4cHEB3dzdUVFRAWVkZtLS0wMrKCmfX0dEhIZAgk90T2FEhMDIyAre3t8/i4uICsrOzwdDQ8Mmduru7Q1NTE9zc3JB9T0+PhMB7RmD3FQT29/cpwZ29kZER+Pr6QkxMDMTGxoK/vz8YGxsrifj4+MDOzg5HIE1L63UEFAoFODk5gYWFBdTU1NxVgtavrq5gfX0dTk9PqexFRUWgp6dHMR0cHKgajwl8q6OrMQEK7O3tDYmJiXB0dASXl5fQ2NhIu9bR0SF/Nzc3KCgoINu5uTkwNzendWdnZwmBZLmuxhogsc3Pz9OuKysrwdramjv7trY2ic/4+DiIosh1wXu5zosrQGXd29sjQZWXl4OVlRXZ2trasp0R7O3tYXd3l/MPCAjgCHz/3BFsbGyQyu+ce3t7lWru6+uDoKAgCA0Nha2trbs1Ovvl5WVmwwHbkyPwAyOw/QSB9vZ2MDAwoP8nJycpyOrqKgwPD0NraysJqqurC6ampqgj1BwZEV9cXIT6+nqOQLyaI6CBoa+vr3RIT08HGxubx+dMZ2pmZgZ2dnbg4uICERERUFtbS0OJJZ+engYTExMiUFJSwhH4Tt0R5OfnM2MOjo6OVBGcbGp3vbm5CWlpaaCtrQ0eHh60FhIS8nICzc3NgENK6WBqagrR0dFQVVUFg4ODFPDurJeWlmBsbAwGBgagrq4OMjIywMvLC7S0tMhPLpfD7OwsHB8fs4pyBNS2IYqMypybm/u/uz08PKSKZGVlcdXCIUU2paWlT15GSUwDqiIcHR2lc0tKSuISLiwsQGdnJw0gtjYxMUF6eJwEu4e+4bBi3zgC3zwzB9iIpfZKTU0lIXp6esLa2poyeUNDA5uADGTLvicnJ7P1l2uAEdje3oaoqCilHuLj42neMw3k5ORwwbFjlMmHhoYkE1AjDeDNRS3EnFALLDCRiIyM5ALn5eUxGxpQeFlxNi8axXFxcZIuyMzMVAY+OTkBPz8/bibgeGY2JFpsP/Zd0yOQAruBys2uYbzpuOTV1dXK5NfX1xAWFqYuOXcdc7+KRxGBCPHBuLi4mBSPvUwTTzU5azUGvKafTCpDfI2YoDwqd8EfMpn8RhAKcfGIfVxAxCDkCEtLS3B1deWCFhYWSpKnpKRwNrqIeMRfysSEA8z3iyP7UcqgEMWPrgUhBQ1WmfEW4ifExyqBg4ODJWVPSEiQfP8E8TNiT5r4b4yftCeK+pKXkSr+FMV3aBiODjPM+QRRgfj0IUFgYCDMzMzQrAgPD1cm/gxRhfjnUWLc7e//CkLIJMZ98mmmDp+LMhk6fokB+liwD4hmhMtDQtZqHoh25aODcIN+v6G/57vn3oYvwZUgOGLAXzHw1WPBJqkIC3GBdtVo/8WLH6ea4EwQrB4Eq0BwwsLSm2v8On4NFMK9YDHpBP5NPGDC0hD/AXG3IMvlJzvdAAAAAElFTkSuQmCC",
                    foto: imageUrl,
                    fotoBase64: "",
                  };
                });
            })
            .then(async (noticias) => {
              for (let i = 0; i < noticias.length; i++) {
                noticia = noticias[i];
                const data = moment(noticia.data, "DD/MM/YYYY").toDate();
                const image64 = await convertImageUrlToBase64(
                  noticia.foto,
                  350,
                  250
                );
                noticia.fotoBase64 = image64;
                noticia.data = data.getTime().toString();
              }
              return noticias;
            })
        );
      }
    );

    await deleteNoticiaWithSite(noticias[0].site);
    for (var noticia of noticias) {
      await createNoticia(noticia);
    }
  } catch (e: unknown) {
    const message = `Exception ao tentar fazer scraping da Coluna do Fla: `;
    if (e instanceof Error) {
      console.log(message + e.message, e.stack);
    } else {
      console.log(message + e);
    }
  }
}

async function scrapeGE(page: Page) {
  try {
    return await scrapePage(
      { url: "https://ge.globo.com/futebol/times/flamengo/", page },
      async (page) => {
        const noticias = await Promise.all(
          await page
            .evaluate(() => {
              const noticiasPrincipais = [
                ...document.querySelectorAll(".bstn-hl"),
              ]
                .filter((element) => {
                  const naoEvento = ![...element.classList.values()].includes(
                    "type-eventos-esportivos"
                  );
                  const naoVideo = !element
                    .querySelector<HTMLSpanElement>(".bstn-hl-title")
                    .getAttribute("data-video-id");

                  return naoEvento && naoVideo;
                })
                .map((element) => {
                  const title =
                    element.querySelector<HTMLSpanElement>(".bstn-hl-title");
                  const anchor =
                    element.querySelector<HTMLAnchorElement>(".bstn-hl-link");
                  const imageUrl = window
                    .getComputedStyle(element)
                    .getPropertyValue("--bstn-hl-cover")
                    .match(/url\("(.*)"/)[1];

                  const data = new Date(Date.now());
                  data.setHours(data.getHours() - 1.5);

                  return {
                    titulo: title.textContent,
                    link: anchor.href,
                    site: anchor.host,
                    data: "",
                    logoSite: "",
                    foto: imageUrl,
                    fotoBase64: "",
                  };
                });

              const noticiasSecundarias = [
                ...document.querySelectorAll(".feed-post-body"),
              ]
                .slice(0, 3)
                .filter(
                  (element) =>
                    !element
                      .querySelector<HTMLAnchorElement>(".feed-post-link")
                      .getAttribute("data-video-id")
                )
                .map((element) => {
                  const anchor =
                    element.querySelector<HTMLAnchorElement>(".feed-post-link");
                  const imageUrl = element.querySelector<HTMLImageElement>(
                    ".bstn-fd-picture-image"
                  ).src;

                  return {
                    titulo: anchor.innerText,
                    link: anchor.href,
                    site: anchor.host,
                    data: "",
                    logoSite: "",
                    foto: imageUrl,
                    fotoBase64: "",
                  };
                });

              return [...noticiasPrincipais, ...noticiasSecundarias];
            })
            .then(async (noticias) => {
              for (let i = 0; i < noticias.length; i++) {
                noticia = noticias[i];
                const image64 = await convertImageUrlToBase64(
                  noticia.foto,
                  350,
                  250
                );
                noticia.fotoBase64 = image64;
                noticia.logoSite =
                  "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAE3ElEQVR4AbxWA3QtSxDcaJNv27Zt/+Dbtm3btm1dxbZt27ad+l1zso8Xz5XTZ+5mert6umtmR1OA5saB8DL5H+Zt8/9At/hnev3n16Gb/CZ0k++8jFg9U+9MMAZjMSZjk2N5TuOH6Srd2xrwnm4NGNNDL4QeFADd6g/dzGBrZnyXMRiLMRmbHOQyuEnsochN/uF69CWLhL5zagX/+S2sKblhjMFYjMnY5CAXORU3IWV6T4+5hMTT64TUeTLT5CKnRsjEwbrZf0pKJas2yNerLZCLnOTWvE2+H+uhF6iy02FDGLnISW5NHnJEJKpPGzCBeXKSm/3voFJd9J7CsT+3Br7kIie5NbXPzY4DbWy+QP32/M8XPmZ/bGQO4Mg5jo58OfKZPg63KLk1R6X3ESK3f8+D9uepKuBmloug/XM2tL/PgBr/PVeNhq/7f4bv+cqXo/bXqRLjXM47bIXmiFz75yzsHHQ1Pqg0IbuvElUjLYjpyoNv0jN4ufRXpPaU4pXS3+D2zzmSzDnYMfBKvFvxDzJ6y1Epvhl95fi42oLdQq5jLIdJaHZXLis7JOI2NIx2YkUsyN/0/AyI1N5SaH+chIPFt3akDfbQMt6DwyPvhLuRhLMEvMW8TL7YWMbCwToYKBtuwh8N0cjurwIxtzCvLLwjG55/n4mCgVoQ43NT+LImCNdmvIGva0MwtZho4UAdNmJscjhLgKLR/joN12S8CQOmlmRsLBpgf93/Pguf1dhg4L+WJJyf/CyI+YUFPFv8A7TfjxednCnjifis2qb+T1yc+rLEPp0idp4AiZg9Sz05N40DpbwU3ubWi+Emvd428Ar0TA2C+Ks5Hq+X/UFfqcgcKoabUT7UhOqRVpQNNaJ2tF1VivPvV/7H2ORwncA/zQkgeqeGsa3tclU6tfUke66gXFqiEmiKx6eySoIJ2APJiW9kUaucwEdVZvUisz874Ukp5wlCzLlTVEXGZidB/C0VeL74J/qqUt+b9wmOkPkz4x/HKXGP4Iiou3FszP04MfZB7BB0Fbemcw1wdSz3uYlPL/Z1XpXyhJj7sIXMHRx+C5J7ihUhYRZ9HBfz4BLfyI4cJWDtt2PFjsGFKS8gQoQa11WAi1JehNtfZzjXAM1bSs0t868IzMCslLdO+kpNLFvWqM5c2YYnwtaaCgMtEz2qNdEytyyOjLpH4p4NH5cJmHhGn48t5DT7vTFWlXZZpMne75jsBxHWnqVatpX1EgS2pcEeeqeGcHnaK9wBrs+BZZNgYO2341UPHy/8RqndT07BvUNvxNDMmKrCLw1Ratuyr5qciBdKmSk2bk8K+bniH7GP+LOtq3wS8iCiWL6rC8MtWe+rl7VfjqJRhFKVGBi4M+cjlegmlguZtPiezmcmxZHGY9rou11b7mNEpfPl27M/NDgoQllNIv5sikOV6MAA27CN7VImS3JDxNxJjMPR6deQRu7lPscMQKXek/MJRmcn4AgjMsePEqvDd9b0xkzulS4kqpT/nIlDI+7AO/J1S+8tQ/tEH7omB1Ay2IAf6sNxmHxcnPWVtqoXErtXMpaN33r20ENKvLXtMjmCL+dq2SLOkXzdXMkcXEqZhHFsShLn8cJBgTIJkq/LS6nraznbomxdXsst/pPk1v7fQHdMBrxrNuCd0wHvngMANOrfDIKHn/cAAAAASUVORK5CYII=";
                noticias[i] = noticia;
              }
              return noticias;
            })
        );

        await deleteNoticiaWithSite(noticias[0].site);
        for (var noticia of noticias) {
          const data = await scrapePage(
            { url: noticia.link, page: page },
            async (page) => {
              return await page.evaluate(() => {
                return document.querySelector<HTMLTimeElement>(
                  ".content-publication-data__updated > time"
                ).dateTime;
              });
            }
          );

          noticia.data = moment(data).toDate().getTime().toString();

          await createNoticia(noticia);
        }
      }
    );
  } catch (e: unknown) {
    const message = `Exception ao tentar fazer scraping do Globo Esporte: `;
    if (e instanceof Error) {
      console.log(message + e.message, e.stack);
    } else {
      console.log(message + e);
    }
  }
}
