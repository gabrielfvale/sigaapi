var Browser = require("zombie");
var url = "http://si3.ufc.br";
var browser = new Browser();

describe("testing with zombie", function() {

    it("should have defined headless browser", (next) => {
        expect(typeof browser != "undefined").toBe(true);
        expect(browser instanceof Browser).toBe(true);
        next();
    });

    it("should visit the site and see the login form", (next) => {
        browser.visit(url, function(err) {
            expect(browser.success).toBe(true);
            expect(browser.query("input[value='Entrar']")).toBeDefined();
            next();
        })
    });

    it("should not be able to login with wrong credentials", (next) => {
        browser.fill('input[name="user.login"]', "wrongname");
        browser.fill('input[name="user.senha"]', "wrongpassword");
        browser.pressButton('input[value="Entrar"]', function() {
            expect(browser.html("body")).not.toContain("Insanely fast, headless full-stack testing using Node.js");
            expect(browser.query("input[value='Entrar']")).toBeDefined();
            next();
        });
    });

});
