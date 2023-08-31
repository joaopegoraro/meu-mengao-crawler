import moment from "moment";
import { ElementHandle, Page } from "puppeteer";
import { scrapePage, convertImageUrlToBase64 } from "./utils";
import {
  createCampeonato,
  createPartida,
  createPosicao,
  deletePartidaWithCampeonatoId,
  deletePosicaoWithCampeonatoId,
  findAllCampeonatos,
  findCampeonatoById,
  findPartidaById,
  findPosicaoById,
  updateCampeonato,
  updateCampeonatoLastRound,
  updateCampeonatoPossuiClassificacao,
  updateCampeonatoRodadaAtual,
  updatePartida,
  updatePosicao,
} from "./db";

export async function scrapeCampeonatos() {
  await scrapePage({}, async (page) => {
    await scrapeCampeonatosUrlsFromUrl({
      url: "https://www.flashscore.com.br/equipe/flamengo/WjxY29qB/resultados/",
      page: page,
    });
    await scrapeCampeonatosUrlsFromUrl({
      url: "https://www.flashscore.com.br/equipe/flamengo/WjxY29qB/calendario/",
      page: page,
    });
    const campeonatos = await findAllCampeonatos();
    for (var campeonato of campeonatos) {
      await scrapeCampeonato({
        campeonatoToScrape: campeonato,
        page: page,
      });
      await updateCampeonatoLastRound(campeonato.id);
    }
  });
}

async function scrapeCampeonatosUrlsFromUrl(options: {
  page: Page;
  url: string;
}) {
  try {
    const campeonatosWithUrl = await scrapePage(
      { url: options.url, page: options.page },
      async (page) => {
        const cookieConsentButton = await options.page.$(
          "#onetrust-accept-btn-handler"
        );
        if (cookieConsentButton) {
          await Promise.all([
            options.page
              .evaluate(
                (consentButton: HTMLElement) => consentButton.click(),
                cookieConsentButton
              )
              .catch((e) => null),
            page
              .waitForNavigation({
                waitUntil: ["networkidle0", "domcontentloaded"],
              })
              .catch((e) => null),
          ]);
        }

        const campeonatosWithUrl = new Map<
          string,
          { id: string; url: string }
        >();
        let links = await (
          await page.$(".sportName")
        ).$$(".event__title--name");
        for (let i = 0; i < links.length; i++) {
          const link = links[i];

          const campeonato = (
            await (await link.getProperty("innerText")).jsonValue()
          ).toString();

          if (![...campeonatosWithUrl.keys()].includes(campeonato)) {
            await Promise.all([
              page.evaluate((el: HTMLSpanElement) => el.click(), link),
              page.waitForNavigation(),
            ]);

            const url = page.url();
            const regexp =
              /https:\/\/www\.flashscore\.com\.br\/futebol\/([\w-]+)\/([\w-]+)\/?.*/g;
            var myRegexp = new RegExp(regexp);
            var matches = myRegexp.exec(url);
            const id = matches[2];
            campeonatosWithUrl.set(campeonato, {
              id,
              url: `https://www.flashscore.com.br/futebol/${matches[1]}/${id}/`,
            });

            await Promise.all([page.goBack(), page.waitForNavigation()]);

            links = await (
              await page.$(".sportName")
            ).$$(".event__title--name");
          }
        }

        return campeonatosWithUrl;
      }
    );

    for (var campeonatoWithUrl of campeonatosWithUrl) {
      const campeonatoData = campeonatoWithUrl[1];
      const campeonatoNome = campeonatoWithUrl[0];
      const newCampeonato = {
        id: campeonatoData.id,
        link: campeonatoData.url,
        nome: campeonatoNome,
      };
      const saved = await findCampeonatoById(newCampeonato.id);
      if (saved) {
        await updateCampeonato(newCampeonato);
      } else {
        await createCampeonato(newCampeonato);
      }
    }
  } catch (e) {
    const message = `Erro ao tentar fazer scraping da url ${options.url}: `;
    if (e instanceof Error) {
      console.log(message + e.message, e.stack);
    } else {
      console.log(message + e);
    }
    throw e;
  }
}

async function scrapeCampeonato(options: {
  campeonatoToScrape: any;
  page: Page;
}) {
  try {
    await scrapePage(
      { url: options.campeonatoToScrape.link, page: options.page },
      async (page) => {
        const campeonato = await page
          .evaluate(() => {
            const nome = document.querySelector(".heading__name").textContent;
            const ano = document.querySelector(".heading__info").textContent;

            return {
              id: "",
              link: "",
              nome: nome,
              ano: ano,
            };
          })
          .then(async (scrapedCampeonato) => {
            scrapedCampeonato.id = options.campeonatoToScrape.id;
            scrapedCampeonato.link = options.campeonatoToScrape.link;
            return scrapedCampeonato;
          });

        const savedCampeonato = await findCampeonatoById(campeonato.id);
        if (
          savedCampeonato &&
          savedCampeonato.ano != null &&
          campeonato.ano > savedCampeonato.ano
        ) {
          await deletePosicaoWithCampeonatoId(campeonato.id);
          await deletePartidaWithCampeonatoId(campeonato.id);
        }

        if (savedCampeonato) {
          await updateCampeonato(campeonato);
        } else {
          await createCampeonato(campeonato);
        }

        await scrapePartidasForCampeonato({
          page: page,
          campeonatoId: campeonato.id,
          nomeCampeonato: campeonato.nome,
          linkCampeonato: campeonato.link,
        });
        await scrapeClassificacoesForCampeonato({
          page: page,
          campeonatoId: campeonato.id,
          campeonatoLink: campeonato.link,
        });
      }
    );
  } catch (e: unknown) {
    const message = `Exception ao tentar fazer scraping do campeonato ${options.campeonatoToScrape.id} (${options.campeonatoToScrape.nome}) - ${options.campeonatoToScrape.link}: `;
    if (e instanceof Error) {
      console.log(message + e.message, e.stack);
    } else {
      console.log(message + e);
    }
    throw e;
  }
}

async function scrapeClassificacoesForCampeonato(options: {
  page: Page;
  campeonatoLink: string;
  campeonatoId: string;
}) {
  const baseClassificacaoUrl = options.campeonatoLink + "classificacao";
  const classificacaoUrl = await scrapePage(
    { url: baseClassificacaoUrl, page: options.page },
    async (page) => {
      ".filter__group > a";

      let links = await page.$$(
        "#tournament-table > .tournamentTableDraw__filter > .filter__group > a"
      );
      for (let i = 0; i < links.length; i++) {
        const link = links[i];

        await Promise.all([
          page.waitForNavigation(),
          page.evaluate((el: HTMLSpanElement) => el.click(), link),
        ]);
        await page.waitForSelector("#tournament-table-tabs-and-content");

        const url = page.url();

        if (url.includes("table")) {
          return url;
        }

        await Promise.all([page.waitForNavigation(), page.goBack()]);

        links = await page.$$(
          "#tournament-table > .tournamentTableDraw__filter > .filter__group > a"
        );
      }

      return baseClassificacaoUrl;
    }
  );

  await scrapePage(
    { url: classificacaoUrl, page: options.page },
    async (page) => {
      const posicoes = await Promise.all(
        await page
          .evaluate(() => {
            return [
              ...document.querySelectorAll<HTMLDivElement>(".ui-table"),
            ].flatMap((tabela, index) => {
              const nomeTabela = tabela.querySelector(
                ".ui-table__header > .table__headerCell--participant"
              ).textContent;

              return [
                ...tabela.querySelectorAll(".ui-table__body > .ui-table__row"),
              ].map((element) => {
                const posicao =
                  element.querySelector(".tableCellRank").textContent;
                const nomeTime = element.querySelector(
                  ".tableCellParticipant__name"
                ).textContent;
                const escudoUrl = element.querySelector<HTMLImageElement>(
                  ".participant__image"
                ).src;

                const colunas = element.querySelectorAll(".table__cell--value");
                const jogos = colunas[0].textContent;
                const vitorias = colunas[1].textContent;
                const empates = colunas[2].textContent;
                const derrotas = colunas[3].textContent;
                const score = colunas[4].textContent.split(":");
                const golsFeitos = parseInt(score[0]) | 0;
                const golsSofridos = parseInt(score[1]) | 0;
                const saldoGols = golsFeitos - golsSofridos;
                const pontos = element.querySelector(
                  ".table__cell--value.table__cell--points"
                )?.textContent;

                return {
                  id: "",
                  posicao: posicao.replace(/\D/g, ""),
                  nomeTime: nomeTime.includes("Flamengo")
                    ? "Flamengo"
                    : nomeTime,
                  escudoTime: escudoUrl,
                  pontos: pontos,
                  jogos: jogos,
                  vitorias: vitorias,
                  empates: empates,
                  derrotas: derrotas,
                  golsFeitos: golsFeitos,
                  golsSofridos: golsSofridos,
                  saldoGols: saldoGols,
                  campeonatoId: "",
                  classificacaoName: nomeTabela,
                  classificacaoIndex: index,
                };
              });
            });
          })
          .then(async (posicoes) => {
            for (let i = 0; i < posicoes.length; i++) {
              const posicao = posicoes[i];
              posicao.campeonatoId = options.campeonatoId;
              posicao.id =
                posicao.nomeTime +
                posicao.classificacaoIndex +
                posicao.campeonatoId;
              posicao.escudoTime = await convertImageUrlToBase64(
                posicao.escudoTime,
                20,
                20
              );
              posicoes[i] = posicao;
            }
            return posicoes;
          })
      );

      if (posicoes.length > 0) {
        await updateCampeonatoPossuiClassificacao(options.campeonatoId, true);
      }

      for (var posicao of posicoes) {
        const saved = await findPosicaoById(posicao.id);
        if (saved) {
          await updatePosicao(posicao);
        } else {
          await createPosicao(posicao);
        }
      }
    }
  );
}

async function scrapePartidasForCampeonato(options: {
  linkCampeonato: string;
  campeonatoId: string;
  nomeCampeonato: string;
  page: Page;
}) {
  const resultadosUrl = options.linkCampeonato + "resultados";
  const calendarioUrl = options.linkCampeonato + "calendario";

  await scrapePage({ url: resultadosUrl, page: options.page });

  // Partidas da lista de resultados são dos mais recentes para os mais antigos, por isso é passado reverseRounds = true, para que a lista fique dos mais antigos para os mais novos.
  const roundLength = await scrapeRoundsFromPage({
    page: options.page,
    campeonatoId: options.campeonatoId,
    nomeCampeonato: options.nomeCampeonato,
    reverseRounds: true,
    startingRoundIndex: 0,
  });

  const currentRound = roundLength - 1;
  if (currentRound >= 0) {
    await updateCampeonatoRodadaAtual(options.campeonatoId, currentRound);
  }

  await scrapePage({ url: calendarioUrl, page: options.page });

  const finalRoundLenght = await scrapeRoundsFromPage({
    page: options.page,
    campeonatoId: options.campeonatoId,
    nomeCampeonato: options.nomeCampeonato,
    reverseRounds: false,
    startingRoundIndex: roundLength,
  });

  if (finalRoundLenght > 0) {
    await updateCampeonatoRodadaAtual(options.campeonatoId, currentRound + 1);
  }
}

/**
 * Faz o scrape das rodadas na página, e retorna o número de rodadas salvas
 */
async function scrapeRoundsFromPage(options: {
  page: Page;
  campeonatoId: string;
  nomeCampeonato: string;
  reverseRounds: boolean;
  startingRoundIndex: number;
}): Promise<number> {
  const cookieConsentButton = await options.page.$(
    "#onetrust-accept-btn-handler"
  );
  if (cookieConsentButton) {
    await Promise.all([
      options.page
        .evaluate(
          (consentButton: HTMLElement) => consentButton.click(),
          cookieConsentButton
        )
        .catch((e) => null),
      options.page
        .waitForNavigation({
          waitUntil: ["networkidle0", "domcontentloaded"],
        })
        .catch((e) => null),
    ]);
  }

  for (
    var moreButton: ElementHandle<Element>;
    (moreButton = await options.page.$(".event__more"));

  ) {
    await Promise.all([
      options.page
        .evaluate(
          (moreButton: HTMLAnchorElement) => moreButton.click(),
          moreButton
        )
        .catch((e) => null),
      options.page
        .waitForNavigation({
          waitUntil: ["networkidle0", "domcontentloaded"],
        })
        .catch((e) => null),
    ]);
  }

  const partidasWithRounds = await options.page
    .evaluate(
      (reverseRounds, startingRoundIndex) => {
        const rounds = [
          ...document.querySelectorAll<HTMLDivElement>(".sportName > div"),
        ].reduce<HTMLDivElement[][]>((result, value) => {
          if (value.classList.contains("event__round")) {
            result.push([value]);
          } else if (value.classList.contains("event__match")) {
            result[result.length - 1].push(value);
          }

          return result;
        }, []);

        if (reverseRounds) rounds.reverse();

        const partidas = rounds.flatMap((chunk, index) => {
          const roundName = chunk[0].innerHTML;
          const roundIndex = index + startingRoundIndex;

          return chunk
            .filter((_, index) => index != 0)
            .map((element) => {
              const dataText =
                element.querySelector(".event__time").textContent;
              const timeCasa = element.querySelector(
                ".event__participant--home"
              ).textContent;
              const timeFora = element.querySelector(
                ".event__participant--away"
              ).textContent;
              const golsCasa =
                element.querySelector(".event__score--home")?.textContent ??
                "-";
              const golsFora =
                element.querySelector(".event__score--away")?.textContent ??
                "-";
              const escudoCasaUrl =
                element.querySelector<HTMLImageElement>(".event__logo--home")
                  ?.src ?? "";
              const escudoForaUrl =
                element.querySelector<HTMLImageElement>(".event__logo--away")
                  ?.src ?? "";

              return {
                id: element.id,
                data: dataText,
                timeCasa: timeCasa.includes("Flamengo") ? "Flamengo" : timeCasa,
                timeFora: timeFora.includes("Flamengo") ? "Flamengo" : timeFora,
                golsCasa: golsCasa,
                golsFora: golsFora,
                campeonato: "",
                campeonatoId: "",
                partidaFlamengo: [timeCasa, timeFora].some((time) =>
                  time.includes("Flamengo")
                ),
                escudoCasa: escudoCasaUrl,
                escudoFora: escudoForaUrl,
                rodadaName: roundName,
                rodadaIndex: roundIndex,
              };
            });
        });

        return {
          roundsSize: rounds.length,
          partidas: partidas,
        };
      },
      options.reverseRounds,
      options.startingRoundIndex
    )
    .then(async (partidasWithRounds) => {
      for (let i = 0; i < partidasWithRounds.partidas.length; i++) {
        const partida = partidasWithRounds.partidas[i];
        partida.campeonato = options.nomeCampeonato;
        partida.campeonatoId = options.campeonatoId;

        const data =
          moment(partida.data, "DD.MM. HH:mm").toDate() ||
          moment(partida.data, "DD.MM.YYYY").toDate();
        partida.data = data.getTime().toString();

        partida.escudoCasa = await convertImageUrlToBase64(
          partida.escudoCasa,
          30,
          30
        );
        partida.escudoFora = await convertImageUrlToBase64(
          partida.escudoFora,
          30,
          30
        );
        partidasWithRounds.partidas[i] = partida;
      }
      return partidasWithRounds;
    });

  for (var partida of partidasWithRounds.partidas) {
    const saved = await findPartidaById(partida.id);
    if (saved) {
      await updatePartida(partida);
    } else {
      await createPartida(partida);
    }
  }

  return partidasWithRounds.roundsSize;
}
