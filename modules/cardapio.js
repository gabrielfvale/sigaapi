const request = require('request');
const cheerio = require('cheerio');
const format = require('../util/format');

module.exports = {
  access: access = (data = '') => {
    return new Promise((resolve, reject) => {
      const url = 'http://www.ufc.br/restaurante/cardapio/1-restaurante-universitario-de-fortaleza/' + data;
      request.get({url: url}, (error, response, body) => {
        if (error) reject();
        resolve(body);
      })
    })
  },

  scrape: scrape = (html) => {
    if (typeof html === 'undefined') return {error: true}
    const $ = cheerio.load(html);
    const emptyText = $('.c-cardapios > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(3) > tr:nth-child(1) > td:nth-child(1)').text();
    const mealBuilder = meal => {
      strbuilder = (type) => `table.${meal} td.${type} span[class="desc"]`;
      return {
        principal: $(strbuilder('principal')).map((i, el) => $(el).text()).get(),
        vegetariano: $(strbuilder('vegetariano')).text(),
        salada: $(strbuilder('salada')).text(),
        guarnicao: $(strbuilder('guarnicao')).text(),
        acompanhamento: $(strbuilder('acompanhamento')).map((i, el) => $(el).text()).get(),
        suco: $(strbuilder('suco')).text(),
        sobremesa: $(strbuilder('sobremesa')).map((i, el) => $(el).text()).get(),
      }
    }
    return {
      empty: emptyText ? true : false,
      cafe: {
        bebidas: $('td.bebidas span[class="desc"]').map((i, el) => $(el).text()).get(),
        paes: $('td.paes span[class="desc"]').map((i, el) => $(el).text()).get(),
        frutas: $('td.frutas span[class="desc"]').map((i, el) => $(el).text()).get(),
        especial: $('td.especial span[class="desc"]').map((i, el) => $(el).text()).get(),
      },
      almoco: mealBuilder('almoco'),
      jantar: mealBuilder('jantar')
    }
  }
}
