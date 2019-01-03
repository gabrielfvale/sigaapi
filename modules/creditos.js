const Browser = require('zombie');

const browser = new Browser({
    loadCSS: false,
    loadScripts: false,
});

const creditos = (cartao, matricula) => {
    return new Promise ((resolve, reject) => {
        browser.visit('https://si3.ufc.br/public/iniciarConsultaSaldo.do', (e) => {
            browser.fill('input[name="codigoCartao"]', cartao);
            browser.fill('input[name="matriculaAtreladaCartao"]', matricula);
            browser.pressButton('input[value="Consultar"', (res) => {
                if(browser.html('table.listagem:nth-child(6) > caption') !== null) {
                    resolve(browser.html());
                }
                else {
                    reject(browser.html());
                }
            })
        })
    }).catch(() => {});
}

module.exports = creditos;
