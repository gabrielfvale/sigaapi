const request = require('request');
const cheerio = require('cheerio');
const htmlToText = require('html-to-text');
const format = require('../util/format');

module.exports = {
  access: access = async (login, senha) => {
    const baseURL = 'https://si3.ufc.br/sigaa/';
    let jar = request.jar();
    return new Promise((resolve, reject) => {
      request.get({ url: baseURL + 'verTelaLogin.do', jar: jar }, (err, response, html) => {
        const cookie = jar.getCookieString(baseURL + 'verTelaLogin.do');
        request.post(
          baseURL + 'logar.do?dispatch=logOn',
          {
            form: { 
              'user.login': login, 
              'user.senha': senha 
            },
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
    }).catch(() => {});
  },

  scrape: scrape = (html, login) => {
    if (typeof html === 'undefined') return {error: true}
    const $ = cheerio.load(html);
    const profile = (index) => format.full(
      $(`#agenda-docente > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(${index}) > td:nth-child(2)`)
      .text());
    return {
      error: false,
      login: login,
      nome: format.full($('.nome_usuario').text()),
      foto: 'https://si3.ufc.br' + $('.foto img').attr('src'),
      matricula: profile(1),
      curso: profile(2),
      nivel: profile(3),
      status: profile(4),
      entrada: profile(6),
      semestre: $('.periodo p span').text(),
      cadeiras: $('#turmas-portal table tbody tr').map((i, c) => {
        children = $(c).children().toArray();
        if (children.length === 1) return;
        [codigo, componente] = format.full($(children[0]).text()).split(' - ');
        /* Crazy string manipulation starts here */
        const horario = htmlToText.fromString($(children[3]).html()).split('\n');
        var dias = horario.slice(0, -1); // Just the day and hour
        dias.map((e, i) => {dias[i] = e.split(' ')[0]}); // Replaces 'day hour' with 'day'
        dias = dias.join('/');
        /* End of string manipulation */
        return {
          codigo: codigo,
          componente: componente,
          carga_horaria: (horario.length - 1) * 32,
          local: format.full($(children[2]).text()),
          dias: dias,
          horario: horario[0].split(' ')[1]
        }
      }).get()
    };
  }
};
