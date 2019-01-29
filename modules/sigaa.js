const request = require('request');
const cheerio = require('cheerio');
const format = require('../util/format');

module.exports = {
  access: access = async (username, password) => {
    const baseURL = 'https://si3.ufc.br/sigaa/';
    let jar = request.jar();
    return new Promise((resolve, reject) => {
      request.get({ url: baseURL + 'verTelaLogin.do', jar: jar }, (err, response, html) => {
        const cookie = jar.getCookieString(baseURL + 'verTelaLogin.do');
        request.post(
          baseURL + 'logar.do?dispatch=logOn',
          {
            form: { 'user.login': username, 'user.senha': password },
            headers: {
              'Referer': baseURL + 'verTelaLogin.do',
              'Cookie': cookie
            },
            encoding: 'latin1'
          },
          (err, response, body) => {
            if(err) reject();
            const $ = cheerio.load(body);
            var error = $('#conteudo > table:nth-child(9) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > center:nth-child(3)').text();
            if (error) reject('<span class="error">errormsg</span>');
            request.get({ url: 'https://si3.ufc.br/sigaa/paginaInicial.do', jar: jar }, (err, response, html) => {
              request.get({
                url: 'https://si3.ufc.br/sigaa/verPortalDiscente.do',
                jar: jar
              }, (err, response, html) => {
                if(err) reject();
                resolve(html)
              });
            });
          });
      });
    }).catch(() => { });
  },

  scrape: scrape = (html) => {
    if (typeof html === 'undefined') return {error: true}
    const $ = cheerio.load(html);
    const profile = (index) => format.full($(
      `#agenda-docente > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(${index}) > td:nth-child(2)`
    ).text())
    return {
      error: false,
      perfil: {
        nome: format.full($('.nome_usuario').text()),
        foto: 'https://si3.ufc.br' + $('.foto img').attr('src'),
        matricula: profile(1),
        curso: profile(2),
        nivel: profile(3),
        status: profile(4),
        entrada: profile(6),
        semestre: $('.periodo p span').text()
      },
      cadeiras: $('#turmas-portal table tbody tr').map((i, c) => {
        children = $(c).children().toArray();
        if (children.length === 1) return;
        [codigo, componente] = format.full($(children[0]).text()).split(' - ');
        return {
          codigo: codigo,
          componente: componente,
          local: format.full($(children[2]).text()),
        }
      }).get()
    };
  }
};
