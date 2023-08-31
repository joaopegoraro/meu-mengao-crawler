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
  await new Promise((resolve) => {
    conn.connect(function (err) {
      if (err) throw err;
      resolve(null);
    });
  });
}

export function endConnection() {
  conn.end();
}

/*
 * NOTICIAS
 */

export async function createNoticia(noticia) {
  await new Promise((resolve) => {
    conn.query(
      `
    INSERT INTO 
        noticias(
            link, 
            titulo, 
            data, 
            site, 
            logo_site, 
            foto,
            foto_base_64
        )
    VALUES(
        '${noticia.link}', 
        '${noticia.titulo}', 
        ${noticia.data}, 
        '${noticia.site}', 
        '${noticia.logoSite}', 
        '${noticia.foto}',
        '${noticia.fotoBase64}'
    )
    `,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function deleteNoticiaWithSite(site) {
  await new Promise((resolve) => {
    conn.query(`DELETE FROM noticias WHERE site='${site}'`, function (err) {
      if (err) throw err;
      resolve(null);
    });
  });
}

/*
 * CAMPEONATOS
 */

export async function createCampeonato(campeonato) {
  await new Promise((resolve) => {
    conn.query(
      `
    INSERT INTO 
        campeonatos(
            id, 
            ano, 
            nome, 
            link, 
            possui_classificacao, 
            rodada_atual,
            rodada_final
        )
    VALUES(
        '${campeonato.id}', 
        ${campeonato.ano ?? null}, 
        ${campeonato.nome ? "'" + campeonato.nome + "'" : null}, 
        ${campeonato.link ? "'" + campeonato.link + "'" : null}, 
        ${campeonato.possuiClassificacao ?? false}, 
        ${campeonato.rodadaAtual ?? 0},
        ${campeonato.rodadaFinal ?? 100}
    )
    `,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function updateCampeonato(campeonato) {
  await new Promise((resolve) => {
    conn.query(
      `
    UPDATE 
      campeonatos
    SET
      id='${campeonato.id}', 
      ano=${campeonato.ano ?? null}, 
      nome=${campeonato.nome ? "'" + campeonato.nome + "'" : null}, 
      link=${campeonato.link ? "'" + campeonato.link + "'" : null}, 
      possui_classificacao=${campeonato.possuiClassificacao ?? false}, 
      rodada_atual=${campeonato.rodadaAtual ?? 0},
      rodada_final=${campeonato.rodadaFinal ?? 100}
    WHERE 
        id='${campeonato.id}'
    `,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function updateCampeonatoPossuiClassificacao(
  campeonatoId: string,
  possuiClassificacao: boolean
) {
  await new Promise((resolve) => {
    conn.query(
      `
    UPDATE campeonatos
    SET 
        possui_classificacao=${possuiClassificacao}
    WHERE 
        id='${campeonatoId}'
    `,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function updateCampeonatoRodadaAtual(
  campeonatoId: string,
  rodadaAtual: number
) {
  await new Promise((resolve) => {
    conn.query(
      `
    UPDATE campeonatos
    SET 
        rodada_atual=${rodadaAtual}
    WHERE 
        id='${campeonatoId}'
    `,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function findAllCampeonatos(): Promise<any[]> {
  return await new Promise((resolve) => {
    conn.query(`SELECT * FROM campeonatos`, function (err, results) {
      if (err) throw err;
      resolve(results);
    });
  });
}

export async function findCampeonatoById(id: string): Promise<any> {
  return await new Promise((resolve) => {
    conn.query(
      `SELECT * FROM campeonatos WHERE id='${id}' LIMIT 1`,
      function (err, results) {
        if (err) throw err;
        resolve(results.length > 0 ? results[0] : null);
      }
    );
  });
}

export async function updateCampeonatoLastRound(id: string): Promise<any> {
  return await new Promise((resolve) => {
    conn.query(
      `SELECT MAX(rodada_index) as rodada_final FROM partidas WHERE campeonato_id='${id}'`,
      function (err, results) {
        if (err) throw err;
        if (results.length > 0 && results[0].rodada_final) {
          conn.query(
            `
          UPDATE campeonatos
          SET 
              rodada_final=${results[0].rodada_final}
          WHERE 
              id='${id}'
          `,
            function (err) {
              if (err) throw err;
              resolve(null);
            }
          );
        } else {
          resolve(null);
        }
      }
    );
  });
}

/*
 * PARTIDA
 */

export async function createPartida(partida) {
  await new Promise((resolve) => {
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
        '${partida.golsCasa}',
        '${partida.golsFora}',
        '${partida.campeonato}',
        '${partida.campeonatoId}',
        ${partida.partidaFlamengo},
        '${partida.rodadaName}',
        ${partida.rodadaIndex}
    )
    `,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function updatePartida(partida) {
  await new Promise((resolve) => {
    conn.query(
      `
    UPDATE
      partidas
    SET
      id='${partida.id}', 
      data=${partida.data}, 
      time_casa='${partida.timeCasa}', 
      time_fora='${partida.timeFora}', 
      escudo_casa='${partida.escudoCasa}', 
      escudo_fora='${partida.escudoFora}',
      gols_casa='${partida.golsCasa}',
      gols_fora='${partida.golsFora}',
      campeonato='${partida.campeonato}',
      campeonato_id='${partida.campeonatoId}',
      partida_flamengo=${partida.partidaFlamengo},
      rodada_name='${partida.rodadaName}',
      rodada_index=${partida.rodadaIndex}
    WHERE
      id='${partida.id}'
    `,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function deletePartidaWithCampeonatoId(campeonatoId: string) {
  await new Promise((resolve) => {
    conn.query(
      `DELETE FROM partidas WHERE campeonato_id='${campeonatoId}'`,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function findPartidaById(id: string): Promise<any> {
  return await new Promise((resolve) => {
    conn.query(
      `SELECT * FROM partidas WHERE id='${id}' LIMIT 1`,
      function (err, results) {
        if (err) throw err;
        resolve(results.length > 0 ? results[0] : null);
      }
    );
  });
}

/*
 * POSICAO
 */

export async function createPosicao(posicao) {
  await new Promise((resolve) => {
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
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function updatePosicao(posicao) {
  await new Promise((resolve) => {
    conn.query(
      `
    UPDATE
      posicoes
    SET
      id='${posicao.id}', 
      posicao=${posicao.posicao}, 
      nome_time='${posicao.nomeTime}', 
      escudo_time='${posicao.escudoTime}', 
      pontos=${posicao.pontos}, 
      jogos=${posicao.jogos},
      vitorias=${posicao.vitorias},
      empates=${posicao.empates},
      derrotas=${posicao.derrotas},
      gols_feitos=${posicao.golsFeitos},
      gols_sofridos=${posicao.golsSofridos},
      saldo_gols=${posicao.saldoGols},
      campeonato_id='${posicao.campeonatoId}',
      classificacao_name='${posicao.classificacaoName}',
      classificacao_index=${posicao.classificacaoIndex}
    WHERE
      id='${posicao.id}'
    `,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function deletePosicaoWithCampeonatoId(campeonatoId: string) {
  await new Promise((resolve) => {
    conn.query(
      `DELETE FROM posicoes WHERE campeonato_id='${campeonatoId}'`,
      function (err) {
        if (err) throw err;
        resolve(null);
      }
    );
  });
}

export async function findPosicaoById(id: string): Promise<any> {
  return await new Promise((resolve) => {
    conn.query(
      `SELECT * FROM posicoes WHERE id='${id}' LIMIT 1`,
      function (err, results) {
        if (err) throw err;
        resolve(results.length > 0 ? results[0] : null);
      }
    );
  });
}
