const Browser = require('zombie');

describe('User visits signup page', function () {

  const browser = new Browser({
    loadCSS: false,
    loadScripts: false,
    site: 'http://si3.ufc.br'
  });

  before(() => {
    return browser.visit('/');
  });

  describe('submits form', function () {

    before(() => {
      browser
        .fill('input[name="user.login"]', "gabrielfvale")
        .fill('input[name="user.senha"]', "54935046gfv100600");
      return browser.pressButton('input[value="Entrar"]');
    });

    it('should be successful', () => {
      browser.assert.success();
    });

    it('should see welcome page', () => {
      browser.assert.text('title', 'SIGAA - Sistema Integrado de Gestão de Atividades Acadêmicas');
    });
  });

});
