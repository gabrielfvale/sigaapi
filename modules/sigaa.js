const Browser = require('zombie');

const browser = new Browser({
    loadCSS: false,
    loadScripts: false,
    site: 'http://si3.ufc.br'
});

const sigaa = (username, password) => {
    return new Promise ((resolve, reject) => {
        browser.visit('/', (e) => {
        browser.fill('input[name="user.login"]', username);
        browser.fill('input[name="user.senha"]', password);
        browser.pressButton('input[value="Entrar"]', (res) => {
            if(res !== null && res.filename !== 'https://si3.ufc.br/sigaa/logar.do?dispatch=logOn:script') {
                browser.visit('/sigaa/paginaInicial.do', (e) => {
                    browser.visit('/sigaa/verPortalDiscente.do', (e) => {
                        resolve(browser.html());
                    })
                })
            } else {
                reject(res.filename);
            }
        });
    });
    }).catch(() => {});
}

module.exports = sigaa;
