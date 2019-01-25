const Browser = require('zombie');
const Xray = require('x-ray');
const browser = new Browser({
  loadCSS: false,
  loadScripts: false,
  site: 'http://si3.ufc.br'
});
const x = Xray({
  filters: {
    trim: value => value.trim(),
    fulltrim: value => value.trim().replace(/\n/g, '').replace(/\t/g, ''),
    cardapio_empty: value => value === 'Bebidas' ? false : true
  }
});

module.exports = {
  access: access = async (username, password) => {
    return new Promise((resolve, reject) => {
      browser.visit('/')
      .then(() => { },
        () => { // Rejection callback of '/'
          browser.fill('input[name="user.login"]', username);
          browser.fill('input[name="user.senha"]', password);
          browser.pressButton('input[value="Entrar"]')
          .then(() => { },
            (res) => { // Rejection callback of '/sigaa/paginaInicial.do'
              if (res.filename === 'https://si3.ufc.br/sigaa/logar.do?dispatch=logOn:script') reject();
              else {
                browser.visit('/sigaa/paginaInicial.do')
                .then(() => { },
                () => {
                  browser.visit('/sigaa/verPortalDiscente.do')
                  .then(() => { },
                  () => { // Rejection callback of '/sigaa/verPortalDiscente.do'
                    const data = browser.html();
                    browser.deleteCookies();
                    browser.tabs.closeAll();
                    resolve(data);
                  })
                })
              }
            })
      });
    }).catch(() => { });
  },

  scrape: scrape = (html) => {
    const _prefix = '#agenda-docente > table:nth-child(2) > tbody:nth-child(1) > ';
    const _suffix = ' > td:nth-child(2) | fulltrim';
    return x(html, {
      nome: '.nome_usuario | trim',
      URLfoto: '.foto img@src',
      perfil: {
        matricula: _prefix + 'tr:nth-child(1)' + _suffix,
        curso: _prefix + 'tr:nth-child(2)' + _suffix,
        nivel: _prefix + 'tr:nth-child(3)' + _suffix,
        status: _prefix + 'tr:nth-child(4)' + _suffix,
        entrada: _prefix + 'tr:nth-child(6)' + _suffix,
        ch: _prefix + 'tr:nth-child(7) > td:nth-child(1) > table:nth-child(4) > tbody:nth-child(1) > tr:nth-child(1)' + _suffix
      },
      cadeiras: x('#turmas-portal table tbody', ['tr td.descricao a'])
    });
  }
};
