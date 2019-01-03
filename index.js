const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const Browser = require('zombie');

const sigaa = require('./modules/sigaa');
const creditos = require('./modules/creditos');
const cardapio = require('./modules/cardapio');

const app = express();

const config = {
    port: 3000,
    mongoURI: 'mongodb://test:test123@ds163013.mlab.com:63013/sigaapi',
    mongoCollection: 'users'
}

app.get('/', (req, res) => {
    res.send('API para leitura remota de dados da Universidade Federal do Ceará');
})

app.get('/sigaa', (req, res) => {
    const username = req.query.login;
    const pass = req.query.senha;
    const start = Math.round(new Date() / 1000);
    sigaa.access(username, pass)
    .then(result => {
        if(result) {
            db.collection(config.mongoCollection).findOne({ username: { $eq: username}}, (err, qres) => {
                if (!qres) {
                    db.collection(config.mongoCollection).insertOne({ username: username, date: new Date().toUTCString()}, () => {
                        console.log(`Novo login de usuário! ${new Date()}`)
                    })};
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                sigaa.scrape(result).write().pipe(res);
                console.log("Done in " + (Math.round(new Date() / 1000) - start) + "s");
            })
        } else {
            res.send({ error: 'Nome de usuário ou senha inválidos'});
            console.log("Done in " + (Math.round(new Date() / 1000) - start) + "s");
        }
    });
});

app.get('/creditos', (req, res) => {
    const matricula = req.query.matricula;
    const cartao = req.query.cartao;
    creditos.access(cartao, matricula)
    .then(result => {
        if(result) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            creditos.scrape(result).write().pipe(res);
        } else {
            res.send({ error: 'Matrícula ou número do cartão inválidos'});
        }
    });
});

app.get('/cardapio/:data?', (req, res) => {
    const data = req.params.data;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    cardapio.scrape(data).write().pipe(res);
})

MongoClient.connect(config.mongoURI, { useNewUrlParser: true }, (err, client) => {
    db = client.db('sigaapi');
    app.listen(config.port, () => {
        console.log(`API running on port ${config.port}`)
    });
});
