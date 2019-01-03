const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const Browser = require('zombie');
const Xray = require('x-ray');

const app = express();

const config = {
    port: 3000,
    mongoURI: 'mongodb://test:test123@ds163013.mlab.com:63013/sigaapi',
    mongoCollection: 'users'
}

const x = Xray({
    filters: {
        trim: (value) => {
            return value.trim();
        },
        fulltrim: (value) => {
            return value.trim().replace(/\n/g, '').replace(/\t/g, '');
        }
    }
});

const browser = new Browser({
    loadCSS: false,
    loadScripts: false,
    site: 'http://si3.ufc.br'
});

const access = (username, password) => {
    return new Promise ((resolve, reject) => {
        browser.visit('/', (e) => {
        browser.fill('input[name="user.login"]', username);
        browser.fill('input[name="user.senha"]', password);
        browser.pressButton('input[value="Entrar"]', (res) => {
            if(res !== null && res.filename !== 'https://si3.ufc.br/sigaa/logar.do?dispatch=logOn:script') {
                browser.visit('/sigaa/paginaInicial.do', (e) => {
                    browser.visit('/sigaa/verPortalDiscente.do', (e) => {
                        resolve(browser.html())
                    })
                })
            } else {
                reject(res.filename);
            }
        });
    });
    }).catch(() => {});
}

const scrape = (html) => {
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

app.get('/', (req, res) => {
    const username = req.query.u;
    const pass = req.query.p;
    const start = Math.round(new Date() / 1000);
    access(username, pass)
    .then(result => {
        if(result) {
            db.collection(config.mongoCollection).findOne({ username: { $eq: username}}, (err, qres) => {
                if (!qres) {
                    db.collection(config.mongoCollection).insertOne({ username: username, date: new Date().toUTCString()}, () => {
                        console.log(`Novo login de usuário! ${new Date()}`)
                    })};
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                scrape(result).write().pipe(res);
                console.log("Done in " + (Math.round(new Date() / 1000) - start) + "s");
            })
        } else {
            res.send({ error: 'Nome de usuário ou senha inválidos'})
            console.log("Done in " + (Math.round(new Date() / 1000) - start) + "s");
        }
    });
});

MongoClient.connect(config.mongoURI, { useNewUrlParser: true }, (err, client) => {
    db = client.db('sigaapi');
    app.listen(config.port, () =>{
        console.log(`API running on port ${config.port}`)
    });
});
