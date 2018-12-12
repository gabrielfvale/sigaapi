const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const Xray = require('x-ray');
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: false, waitTimeout: 2000 })

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

const access = (username, password) => {
    return new Promise ((resolve, reject) => {
    nightmare
        .goto('http://si3.ufc.br')
        .insert('input[name="user.login"]', username)
        .insert('input[name="user.senha"]', password)
        .click('input[value="Entrar"]')
        .wait('#info-usuario > div > div.nome_vinculo_deslogar_periodo > div.nome_vinculo_deslogar > div.nome_usuario > p')
        .goto('https://si3.ufc.br/sigaa/verPortalDiscente.do')
        .evaluate(() => document.querySelector('body').innerHTML)
        .end()
        .then((r) => resolve(r))
        .catch(error => {
            reject(error)
        })
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
