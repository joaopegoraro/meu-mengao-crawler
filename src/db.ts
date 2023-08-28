import { createConnection } from "mysql";
import "dotenv/config";

const conn = createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
});

export async function startConnection() {
  await new Promise((resolve, reject) => {
    conn.connect(function (err) {
      err ? reject(err) : resolve("Connected!");
    });
  });
}

export function endConnection() {
  conn.end();
  console.log("Finished!");
}

/*
 * NOTICIAS
 */

export async function createNoticia(noticia) {
  await new Promise((resolve, reject) => {
    conn.query(
      `
    INSERT INTO 
        noticias(
            link, 
            titulo, 
            data, 
            site, 
            logo_site, 
            foto
        )
    VALUES(
        '${noticia.link}', 
        '${noticia.titulo}', 
        ${noticia.data}, 
        '${noticia.site}', 
        '${noticia.logoSite}', 
        '${noticia.foto}'
    )
    `,
      function (err) {
        err ? reject(err) : resolve(null);
      }
    );
  });
}

export async function deleteNoticiaWithSite(site) {
  await new Promise((resolve, reject) => {
    conn.query(`DELETE FROM noticias WHERE site='${site}'`, function (err) {
      err ? reject(err) : resolve(null);
    });
  });
}

/*
 * CAMPEONATOS
 */

export async function createCampeonato(campeonato) {
  await new Promise((resolve, reject) => {
    conn.query(
      `
    INSERT INTO 
        campeonatos(
            id, 
            ano, 
            nome, 
            logo, 
            link, 
            possui_classificacao, 
            rodada_atual,
            rodada_final
        )
    VALUES(
        '${campeonato.id}', 
        ${campeonato.ano ?? null}, 
        ${"'" + campeonato.nome + "'" ?? null}', 
        ${"'" + campeonato.logo + "'" ?? null}, 
        ${"'" + campeonato.link + "'" ?? null}, 
        ${campeonato.possuiClassificacao ?? false}, 
        ${campeonato.rodadaAtual ?? 0},
        ${campeonato.rodadaFinal ?? 100}
    )
    `,
      function (err) {
        err ? reject(err) : resolve(null);
      }
    );
  });
}

export async function updateCampeonato(campeonato) {
  await new Promise((resolve, reject) => {
    conn.query(
      `
    UPDATE 
      campeonatos
    SET
      id='${campeonato.id}', 
      ano=${campeonato.ano ?? null}, 
      nome=${"'" + campeonato.nome + "'" ?? null}, 
      logo=${"'" + campeonato.logo + "'" ?? null}, 
      link=${"'" + campeonato.link + "'" ?? null}, 
      possui_classificacao=${campeonato.possuiClassificacao ?? false}, 
      rodada_atual=${campeonato.rodadaAtual ?? 0},
      rodada_final=${campeonato.rodadaFinal ?? 100}
    WHERE 
        id='${campeonato.id}'
    `,
      function (err) {
        err ? reject(err) : resolve(null);
      }
    );
  });
}

export async function updateCampeonatoPossuiClassificacao(
  campeonatoId: string,
  possuiClassificacao: boolean
) {
  await new Promise((resolve, reject) => {
    conn.query(
      `
    UPDATE campeonatos
    SET 
        possui_classificacao=${possuiClassificacao}, 
    WHERE 
        id='${campeonatoId}'
    `,
      function (err) {
        err ? reject(err) : resolve(null);
      }
    );
  });
}

export async function updateCampeonatoRodadaAtual(
  campeonatoId: string,
  rodadaAtual: number
) {
  await new Promise((resolve, reject) => {
    conn.query(
      `
    UPDATE campeonatos
    SET 
        rodada_atual=${rodadaAtual}, 
    WHERE 
        id='${campeonatoId}'
    `,
      function (err) {
        err ? reject(err) : resolve(null);
      }
    );
  });
}

export async function findAllCampeonatos(): Promise<any[]> {
  return await new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM campeonatos`, function (err, results) {
      err ? reject(err) : resolve(results);
    });
  });
}

export async function findCampeonatoById(id: string): Promise<any> {
  return await new Promise((resolve, reject) => {
    conn.query(
      `SELECT * FROM campeonatos WHERE id='${id}'`,
      function (err, results) {
        err ? reject(err) : resolve(results);
      }
    );
  });
}

/*
 * PARTIDA
 */

export async function createPartida(partida) {
  await new Promise((resolve, reject) => {
    conn.query(
      `
    INSERT INTO 
        partidas(
            id, 
            data, 
            time_casa, 
            time_fora, 
            escudo_casa, 
            escudo_fora,
            gols_casa,
            gols_fora,
            campeonato,
            campeonato_id,
            partida_flamengo,
            rodada_name,
            rodada_index
        )
    VALUES(
        '${partida.id}', 
        ${partida.data}, 
        '${partida.timeCasa}', 
        '${partida.timeFora}', 
        '${partida.escudoCasa}', 
        '${partida.escudoFora}',
        ${partida.golsCasa},
        ${partida.golsFora},
        '${partida.campeonato}',
        '${partida.campeonatoId}',
        ${partida.partidaFlamengo},
        '${partida.rodadaName}',
        ${partida.rodadaIndex}
    )
    `,
      function (err) {
        err ? reject(err) : resolve(null);
      }
    );
  });
}

export async function deletePartidaWithCampeonatoId(campeonatoId: string) {
  await new Promise((resolve, reject) => {
    conn.query(
      `DELETE FROM partidas WHERE campeonato_id='${campeonatoId}'`,
      function (err) {
        err ? reject(err) : resolve(null);
      }
    );
  });
}

/*
 * POSICAO
 */

export async function createPosicao(posicao) {
  await new Promise((resolve, reject) => {
    conn.query(
      `
    INSERT INTO 
        posicoes(
            id, 
            posicao, 
            nome_time, 
            escudo_time, 
            pontos, 
            jogos,
            vitorias,
            empates,
            derrotas,
            gols_feitos,
            gols_sofridos,
            saldo_gols,
            campeonato_id,
            classificacao_name,
            classificacao_index
        )
    VALUES(
        '${posicao.id}', 
        ${posicao.posicao}, 
        '${posicao.nomeTime}', 
        '${posicao.escudoTime}', 
        ${posicao.pontos}, 
        ${posicao.jogos},
        ${posicao.vitorias},
        ${posicao.empates},
        ${posicao.derrotas},
        ${posicao.golsFeitos},
        ${posicao.golsSofridos},
        ${posicao.saldoGols},
        '${posicao.campeonatoId}',
        '${posicao.classificacaoName}',
        ${posicao.classificacaoIndex}
    )
    `,
      function (err) {
        err ? reject(err) : resolve(null);
      }
    );
  });
}

export async function deletePosicaoWithCampeonatoId(campeonatoId: string) {
  await new Promise((resolve, reject) => {
    conn.query(
      `DELETE FROM posicoes WHERE campeonato_id='${campeonatoId}'`,
      function (err) {
        err ? reject(err) : resolve(null);
      }
    );
  });
}
