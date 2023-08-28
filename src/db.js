import { createConnection } from "mysql";
import "dotenv/config";

export const conn = createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
});

conn.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

/*
 * NOTICIAS
 */

export function createNoticia(noticia) {
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
        ${noticia.link}, 
        ${noticia.titulo}, 
        ${noticia.data}, 
        ${noticia.site}, 
        ${noticia.logoSite}, 
        ${noticia.foto}
    )
    `,
    function (error) {
      if (error) throw error;
    }
  );
}

export function removeNoticiaWithSite(site) {
  conn.query(`DELETE FROM noticias WHERE site=${site}`, function (error) {
    if (error) throw error;
  });
}

/*
 * CAMPEONATOS
 */

export function createCampeonato(campeonato) {
  conn.query(
    `
    INSERT INTO 
        campeonatos(
            id, 
            ano, 
            nome, 
            logo, 
            possui_classificacao, 
            rodada_atual,
            rodada_final
        )
    VALUES(
        ${campeonato.id}, 
        ${campeonato.ano}, 
        ${campeonato.nome}, 
        ${campeonato.logo}, 
        ${campeonato.possuiClassificacao}, 
        ${campeonato.rodadaAtual},
        ${campeonato.rodadaFinal}
    )
    `,
    function (error) {
      if (error) throw error;
    }
  );
}

export function updateCampeonato(campeonato) {
  conn.query(
    `
    UPDATE campeonatos
    SET 
        ano=${campeonato.ano}, 
        nome=${campeonato.nome}, 
        logo=${campeonato.logo}, 
        possui_classificacao=${campeonato.possuiClassificacao}, 
        rodada_atual=${campeonato.rodadaAtual},
        rodada_final=${campeonato.rodadaFinal},
    WHERE 
        id=${campeonato.id}
    `,
    function (error) {
      if (error) throw error;
    }
  );
}

export function findAllCampeonatos() {
  conn.query(`SELECT * FROM campeonatos`, function (error) {
    if (error) throw error;
  });
}

export function findCampeonatoById(id) {
  conn.query(`SELECT * FROM campeonatos WHERE id=${id}`, function (error) {
    if (error) throw error;
  });
}

/*
 * PARTIDA
 */

export function createPartida(partida) {
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
        ${partida.id}, 
        ${partida.data}, 
        ${partida.timeCasa}, 
        ${partida.timeFora}, 
        ${partida.escudoCasa}, 
        ${partida.escudoFora},
        ${partida.golsCasa},
        ${partida.golsFora},
        ${partida.campeonato},
        ${partida.campeonatoId},
        ${partida.partidaFlamengo},
        ${partida.rodadaName},
        ${partida.rodadaIndex}
    )
    `,
    function (error) {
      if (error) throw error;
    }
  );
}

export function deletePartidaWithCampeonatoId(campeonatoId) {
  conn.query(
    `DELETE FROM partidas WHERE campeonato_id=${campeonatoId}`,
    function (error) {
      if (error) throw error;
    }
  );
}

/*
 * POSICAO
 */

export function createPosicao(posicao) {
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
        ${posicao.id}, 
        ${posicao.posicao}, 
        ${posicao.nomeTime}, 
        ${posicao.escudoTime}, 
        ${posicao.pontos}, 
        ${posicao.jogos},
        ${posicao.vitorias},
        ${posicao.empates},
        ${posicao.derrotas},
        ${posicao.golsFeitos},
        ${posicao.golsSofridos},
        ${posicao.saldoGols},
        ${posicao.campeonatoId},
        ${posicao.classificacaoName},
        ${posicao.classificacaoIndex}
    )
    `,
    function (error) {
      if (error) throw error;
    }
  );
}

export function deletePosicaoWithCampeonatoId(campeonatoId) {
  conn.query(
    `DELETE FROM posicoes WHERE campeonato_id=${campeonatoId}`,
    function (error) {
      if (error) throw error;
    }
  );
}
