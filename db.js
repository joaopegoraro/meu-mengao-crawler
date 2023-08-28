import { createConnection } from "mysql";
import "dotenv/config";

const NOTICIAS_TABLE = "noticias";
const CAMPEONATOS_TABLE = "campeonatos";

var conn = createConnection({
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

export default conn;

/*
 * NOTICIAS
 */

function createNoticia(noticia) {
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

function removeNoticiaWithSite(site) {
  conn.query(`DELETE FROM noticias WHERE site=${site}`, function (error) {
    if (error) throw error;
  });
}

/*
 * CAMPEONATOS
 */

function createCampeonato(campeonato) {
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

function updateCampeonato(campeonato) {
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

function findAllCampeonatos() {
  conn.query(`SELECT * FROM campeonatos`, function (error) {
    if (error) throw error;
  });
}

function findCampeonatoById(id) {
  conn.query(`SELECT * FROM campeonatos WHERE id=${id}`, function (error) {
    if (error) throw error;
  });
}

/*
 * PARTIDA
 */

function createPartida(partida) {
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
        ${campeonato.id}, 
        ${campeonato.data}, 
        ${campeonato.timeCasa}, 
        ${campeonato.timeFora}, 
        ${campeonato.escudoCasa}, 
        ${campeonato.escudoFora},
        ${campeonato.golsCasa},
        ${campeonato.golsFora},
        ${campeonato.campeonato},
        ${campeonato.campeonatoId},
        ${campeonato.partidaFlamengo},
        ${campeonato.rodadaName},
        ${campeonato.rodadaIndex}
    )
    `,
    function (error) {
      if (error) throw error;
    }
  );
}

function deletePartidaWithCampeonatoId(campeonatoId) {
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

function createPosicao(posicao) {
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
        ${campeonato.id}, 
        ${campeonato.posicao}, 
        ${campeonato.nomeTime}, 
        ${campeonato.escudoTime}, 
        ${campeonato.pontos}, 
        ${campeonato.jogos},
        ${campeonato.vitorias},
        ${campeonato.empates},
        ${campeonato.derrotas},
        ${campeonato.golsFeitos},
        ${campeonato.golsSofridos},
        ${campeonato.saldoGols},
        ${campeonato.campeonatoId},
        ${campeonato.classificacaoName},
        ${campeonato.classificacaoIndex}
    )
    `,
    function (error) {
      if (error) throw error;
    }
  );
}

function deletePosicaoWithCampeonatoId(campeonatoId) {
  conn.query(
    `DELETE FROM posicoes WHERE campeonato_id=${campeonatoId}`,
    function (error) {
      if (error) throw error;
    }
  );
}
