const request = require('request');
const cheerio = require('cheerio');
const format = require('../util/format');

module.exports = {
  access: access = (cartao, matricula) => {
    return new Promise((resolve, reject) => {
      request.post(
        'https://si3.ufc.br/public/restauranteConsultarSaldo.do',
        {form: {
            'codigoCartao': cartao,
            'matriculaAtreladaCartao': matricula
        },
        encoding: 'latin1'},
        (error, response, body) => {
          if (error) reject(error);
          resolve(body);
        });
    }).catch(() => {});
  },

  scrape: scrape = (html) => {
    if (typeof html === 'undefined') return {error: true}
    const $ = cheerio.load(html);
    let creditos = $('tr.linhaImpar:nth-child(2) > td:nth-child(2)').text();
    return {
      error: creditos == '' ? true : false,
      creditos: parseInt(creditos),
      historico: $('table.listagem:nth-child(8) > tbody:nth-child(3) tr').map((i, el) => {
        children = $(el).children().toArray();
        return {
          data: $(children[0]).text(),
          operacao: format.full($(children[1]).text()),
          detalhes: format.full($(children[2]).text())
        }
      }).get()
    }
  }
};
