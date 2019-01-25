const Browser = require('zombie');
const Xray = require('x-ray');
const browser = new Browser({
  loadCSS: false,
  loadScripts: false,
});
const x = Xray({
  filters: {
    trim: value => value.trim(),
    fulltrim: value => value.trim().replace(/\n/g, '').replace(/\t/g, ''),
    cardapio_empty: value => value === 'Bebidas' ? false : true
  }
});

module.exports = {
  access: access = (cartao, matricula) => {
    return new Promise((resolve, reject) => {
      browser.visit('https://si3.ufc.br/public/iniciarConsultaSaldo.do', (e) => {
        browser.fill('input[name="codigoCartao"]', cartao);
        browser.fill('input[name="matriculaAtreladaCartao"]', matricula);
        browser.pressButton('input[value="Consultar"', (res) => {
          if (browser.html('.listagem > caption') !== '') {
            resolve(browser.html());
          }
          else {
            reject(browser.html());
          }
        })
      })
    }).catch(() => { });
  },

  scrape: scrape = (html) => {
    return x(html, {
      creditos: 'tr.linhaImpar:nth-child(2) > td:nth-child(2)',
      historico: x('table.listagem:nth-child(8) > tbody:nth-child(3) tr', [{
        data: 'td:nth-child(1)',
        op: 'td:nth-child(2) | fulltrim',
        detalhes: 'td:nth-child(3) | fulltrim'
      }])
    });
  }
};
