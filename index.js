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
            if(res !== null && res.filename === 'https://si3.ufc.br/sigaa/telaAvisoLogon.jsf:script') {
                browser.visit('/sigaa/paginaInicial.do', (e) => {
                    browser.visit('/sigaa/verPortalDiscente.do', (e) => {
                        resolve(browser.document.documentElement.innerHTML)
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
    return x(html, {
        name: '.nome_usuario | trim',
        picture: '.foto img@src',
        profile: x('#agenda-docente table', ['tr td:last-child | fulltrim']),
        cadeiras: x('#turmas-portal table tbody', ['tr td.descricao a'])
    });
}

app.get('/', (req, res) => {
    const username = req.query.u;
    const pass = req.query.p;
    access(username, pass)
    .then(result => {
        if(result) {
            db.collection(config.mongoCollection).findOne({ username: { $eq: username}}, (err, qres) => {
                if (!qres) {
                    db.collection(config.mongoCollection).insertOne({ username: username, date: new Date().toUTCString()}, () => {
                        console.log(`Novo login de usuário! ${new Date()}`)
                    })};
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                scrape(result).write().pipe(res)
            })
        } else {
            res.send({ error: 'Nome de usuário ou senha inválidos'})
        }
    });
});

MongoClient.connect(config.mongoURI, { useNewUrlParser: true }, (err, client) => {
    db = client.db('sigaapi');
    app.listen(config.port, () =>{
        console.log(`API running on port ${config.port}`)
    });
});
